/**
 * filename: backend/routes/productRoutes.js
 * purpose: Product read APIs plus QR helpers for the frontend.
 * setup notes: Writes (create/add/assignRole) are performed via MetaMask in the frontend.
 */
const express = require("express");
const QRCode = require("qrcode");
const { getContract } = require("../contract");

const router = express.Router();

/** Smallest positive integer not yet used as a product id (sequential scan; fine for local Ganache). */
const MAX_PRODUCT_ID_SCAN = 10_000;

const ROLE_NAMES = {
  0: "None",
  1: "Manufacturer",
  2: "Distributor",
  3: "Retailer"
};

function formatContractError(error, fallbackMessage) {
  const info = error?.info?.error;
  const nestedMessage = info?.message || error?.info?.message;
  const revertData = error?.data || info?.data;

  if (error?.reason) return error.reason;
  if (nestedMessage && nestedMessage !== "missing revert data") return nestedMessage;
  if (revertData) return `Contract call failed (revert data present): ${String(revertData)}`;

  const base = error?.shortMessage || error?.message || fallbackMessage;
  if (String(base).includes("missing revert data")) {
    return (
      `${fallbackMessage}: missing revert data from RPC. ` +
      "Common causes: Ganache not running / wrong RPC port, wrong contract address for this chain, or a revert without reason data. " +
      "If you enabled RBAC: ensure MetaMask is on the correct Ganache network and the connected wallet has the required on-chain role."
    );
  }

  return base;
}

router.get("/next-product-id", async (req, res) => {
  try {
    const contract = await getContract();
    for (let i = 1; i <= MAX_PRODUCT_ID_SCAN; i++) {
      const row = await contract.products(i);
      if (!row.isCreated) {
        return res.json({ success: true, nextId: i });
      }
    }
    return res.status(500).json({
      success: false,
      message: `No free product id found in range 1..${MAX_PRODUCT_ID_SCAN}`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: formatContractError(error, "Failed to compute next product id")
    });
  }
});

router.post("/product-qr", async (req, res) => {
  try {
    const { id } = req.body;
    if (id === undefined) {
      return res.status(400).json({ success: false, message: "id is required" });
    }

    const qrCode = await QRCode.toDataURL(`http://localhost:5173/product/${id}`);
    return res.json({ success: true, qrCode });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate QR code"
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
      message: formatContractError(error, "Failed to fetch product")
    });
  }
});

router.get("/get-role/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const contract = await getContract();
    const role = Number(await contract.getRole(address));
    return res.json({ address, role, roleName: ROLE_NAMES[role] || "None" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: formatContractError(error, "Failed to fetch role")
    });
  }
});

module.exports = router;
