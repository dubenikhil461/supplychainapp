/**
 * filename: backend/routes/productRoutes.js
 * purpose: Product creation, tracking updates, and product retrieval API routes.
 * setup notes: Expects deployed contract address in backend/contract.js.
 */
const express = require("express");
const QRCode = require("qrcode");
const { getContract } = require("../contract");

const router = express.Router();

router.post("/create-product", async (req, res) => {
  try {
    const { id, name } = req.body;
    if (id === undefined || !name) {
      return res.status(400).json({ success: false, message: "id and name are required" });
    }

    const contract = await getContract();
    const tx = await contract.createProduct(id, name);
    await tx.wait();
    const qrCode = await QRCode.toDataURL(`http://localhost:5173/product/${id}`);

    return res.json({ success: true, txHash: tx.hash, qrCode });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.reason || error.shortMessage || error.message || "Failed to create product"
    });
  }
});

router.post("/add-step", async (req, res) => {
  try {
    const { productId, location, status } = req.body;
    if (productId === undefined || !location || !status) {
      return res.status(400).json({
        success: false,
        message: "productId, location, and status are required"
      });
    }

    const contract = await getContract();
    const tx = await contract.addStep(productId, location, status);
    await tx.wait();

    return res.json({ success: true, txHash: tx.hash });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.reason || error.shortMessage || error.message || "Failed to add step"
    });
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await getContract();
    const product = await contract.getProduct(id);
    const historyRaw = await contract.getProductHistory(id);

    const history = historyRaw.map((step) => ({
      location: step.location,
      status: step.status,
      timestamp: new Date(Number(step.timestamp) * 1000).toISOString(),
      updatedBy: step.updatedBy
    }));

    return res.json({
      product: {
        id: Number(product.id),
        name: product.name,
        currentOwner: product.currentOwner,
        isCreated: product.isCreated
      },
      history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.reason || error.shortMessage || error.message || "Failed to fetch product"
    });
  }
});

module.exports = router;
