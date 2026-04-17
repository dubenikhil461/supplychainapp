/**
 * filename: backend/index.js
 * purpose: Express server bootstrap for supply chain APIs.
 * setup notes: Start this file after deploying and configuring contract address.
 */
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors());
app.use(express.json());
app.use("/api", productRoutes);

app.get("/", async (req, res) => {
  try {
    return res.json({ message: "Supply Chain API running" });
  } catch (error) {
    return res.status(500).json({ message: `Unexpected server error: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
