<!--
filename: README.md
purpose: End-to-end setup and usage guide for the supply chain blockchain app.
setup notes: Follow steps in order to deploy and run full stack locally.
-->
# Supply Chain Tracking System (Blockchain)

## Prerequisites
- Node.js v18+, MetaMask browser extension, Ganache desktop or CLI

## Step 1 — Start Ganache
```bash
ganache-cli --port 7545 --chainId 1337
```
(or open Ganache desktop and set port 7545)

## Step 2 — Deploy Smart Contract
```bash
cd supply-chain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network ganache
```
→ Copy the printed contract address

## Step 3 — Configure Contract Address
Paste address in:
- `backend/contract.js`  (`CONTRACT_ADDRESS`)
- `frontend/src/contractConfig.js`  (`CONTRACT_ADDRESS`)

## Step 4 — Run Backend
```bash
cd backend && npm install && node index.js
```
→ Runs on <http://localhost:5000>

## Step 5 — Run Frontend
```bash
cd frontend && npm install && npm run dev
```
→ Runs on <http://localhost:5173>

## Step 6 — Connect MetaMask
- Add network: RPC http://127.0.0.1:7545, Chain ID 1337
- Import a Ganache private key account

## API Reference

### 1) `POST /api/create-product`
Request body:
```json
{
  "id": 101,
  "name": "Medicine Batch A1"
}
```
Response:
- `success`: boolean
- `txHash`: blockchain transaction hash
- `qrCode`: base64 PNG data URL

### 2) `POST /api/add-step`
Request body:
```json
{
  "productId": 101,
  "location": "Warehouse Hub 2",
  "status": "In Transit"
}
```
Response:
- `success`: boolean
- `txHash`: blockchain transaction hash

### 3) `GET /api/product/:id`
Example:
```bash
GET /api/product/101
```
Response includes:
- `product`: `{ id, name, currentOwner, isCreated }`
- `history`: array of `{ location, status, timestamp, updatedBy }`

## How QR Code Works
- When a product is created, backend stores product data on-chain and generates a QR code containing `http://localhost:5173/product/<id>`.
- Backend returns that QR image as a base64 PNG data URL, and frontend renders it immediately.
- Any user scans the QR with the built-in scanner, which decodes the URL and opens the product tracking page.
- The tracking page reads the product id, fetches immutable blockchain history through API, and displays a timeline.
