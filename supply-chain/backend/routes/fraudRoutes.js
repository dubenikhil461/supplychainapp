/**
 * filename: backend/routes/fraudRoutes.js
 * purpose: AI-powered fraud analysis for product journeys via local Ollama.
 * setup notes: Set OLLAMA_URL in backend/.env (default http://localhost:11434). Pull model e.g. ollama pull llama3.2
 */
const express = require("express");
const { getContract } = require("../contract");

const router = express.Router();

/** Every fraud-route response includes this so DevTools can prove which backend answered (not Gemini). */
const FRAUD_ENGINE = { engine: "ollama", fraudBackend: "ollama-only" };

router.use((req, res, next) => {
  res.setHeader("X-SupplyChain-Fraud-Engine", "ollama");
  next();
});

console.info(
  "[fraudRoutes] Fraud analysis uses local Ollama only (Gemini removed). GET /api/fraud/health to verify this server."
);

router.get("/health", (req, res) => {
  const ollamaBase = (process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/$/, "");
  res.json({ ...FRAUD_ENGINE, ollamaUrl: ollamaBase });
});

router.post("/analyse-product", async (req, res) => {
  try {
    const { productId } = req.body;
    if (productId === undefined) {
      return res.status(400).json({ ...FRAUD_ENGINE, success: false, message: "productId is required" });
    }

    const ollamaBase = (process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/$/, "");

    const contract = await getContract();
    const history = await contract.getProductHistory(productId);
    const formattedHistoryString = history
      .map((step, index) => {
        const time = new Date(Number(step.timestamp) * 1000).toISOString();
        return `Step ${index + 1}: Location=${step.location}, Status=${step.status}, Time=${time}, By=${step.updatedBy}`;
      })
      .join("\n");

    const formattedHistory =
      formattedHistoryString || `Product ID: ${productId}\nNo history available.`;

    const response = await fetch(`${ollamaBase}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt: `You are a supply chain fraud detection AI.
Analyse these blockchain product steps and return ONLY raw JSON.
No markdown, no backticks, no explanation. Just the JSON object.

Return exactly this structure:
{
  "riskScore": number between 0 and 100,
  "riskLevel": "Low" or "Medium" or "High" or "Critical",
  "flags": [
    { "issue": string, "severity": "Low" or "Medium" or "High", "detail": string }
  ],
  "summary": "2 to 3 sentence summary of findings"
}

Product History to analyse:
${formattedHistory}`,
        stream: false,
        format: "json"
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return res.status(502).json({
        ...FRAUD_ENGINE,
        success: false,
        message: `Ollama request failed (${response.status}): ${errText.slice(0, 500)}`
      });
    }

    const data = await response.json();
    const text = data.response;
    const clean = String(text).replace(/```json|```/g, "").trim();
    let report;
    try {
      report = JSON.parse(clean);
    } catch (parseErr) {
      return res.status(500).json({
        ...FRAUD_ENGINE,
        success: false,
        message: "AI response was not valid JSON. Try again or check the model output.",
        snippet: clean.slice(0, 280)
      });
    }

    return res.json({ ...FRAUD_ENGINE, success: true, report });
  } catch (error) {
    const cause = error?.cause;
    const causeDetail =
      cause && typeof cause === "object" && "message" in cause ? cause.message : cause ? String(cause) : undefined;
    return res.status(500).json({
      ...FRAUD_ENGINE,
      success: false,
      message: error.message || "Failed to analyse product journey",
      ...(causeDetail && { cause: causeDetail })
    });
  }
});

module.exports = router;
