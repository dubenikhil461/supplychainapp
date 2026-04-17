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
→ Runs on <http://localhost:5001> by default (avoids macOS using port `5000` for AirPlay).  
Override with `PORT=...` if needed; if you change it, update `frontend/vite.config.js` proxy `target` to match.

## Step 5 — Run Frontend
```bash
cd frontend && npm install && npm run dev
```
→ Runs on <http://localhost:5173>

## Step 6 — Connect MetaMask
- Add network: RPC http://127.0.0.1:7545, Chain ID 1337
- Import a Ganache private key account

## API Reference

### 1) `POST /api/product-qr`
Request body:
```json
{
  "id": 101
}
```
Response:
- `success`: boolean
- `qrCode`: base64 PNG data URL for `http://localhost:5173/product/<id>`

### 2) `GET /api/product/:id`
Example:
```bash
GET /api/product/101
```
Response includes:
- `product`: `{ id, name, currentOwner, isCreated }`
- `history`: array of `{ location, status, timestamp, updatedBy }`

### 3) `GET /api/get-role/:address`
Example:
```bash
GET /api/get-role/0xYourAddressHere
```
Response:
- `address`, `role` (0-3), `roleName` (`None|Manufacturer|Distributor|Retailer`)

## How QR Code Works
- After a product is created on-chain via MetaMask, the frontend requests `POST /api/product-qr` to generate a QR code containing `http://localhost:5173/product/<id>`.
- Backend returns that QR image as a base64 PNG data URL, and frontend renders it immediately.
- Any user scans the QR with the built-in scanner, which decodes the URL and opens the product tracking page.
- The tracking page reads the product id, fetches immutable blockchain history through API, and displays a timeline.

## Enhancements Added

### Role Setup (do this after deployment)
1. Open AdminPanel at http://localhost:5173/admin
2. Connect MetaMask as the **deployer/admin** wallet (the `admin` address on-chain)
3. Assign roles **to the three participant wallets** you will use in MetaMask:
   - Manufacturer wallet → **Manufacturer**
   - Distributor wallet → **Distributor**
   - Retailer wallet → **Retailer**
4. Switch MetaMask to the **Manufacturer** wallet and create products on `/`
5. Switch MetaMask to **Distributor** or **Retailer** and add steps on `/update`

### AI Fraud Detection Setup
- The backend uses Google Gemini via `@google/generative-ai`
- API key is read from `GEMINI_API_KEY` in `backend/.env`
- Create `backend/.env` and add: `GEMINI_API_KEY=your_key_here`
- Get a key at [aistudio.google.com](https://aistudio.google.com)

### Testing the Full Demo Flow
1. Admin assigns roles (AdminPanel)
2. Manufacturer creates product (MetaMask manufacturer wallet)
3. Distributor adds "Shipped from Mumbai" (MetaMask distributor wallet)
4. Retailer adds "Delivered to Delhi" (MetaMask retailer wallet)
5. Scan QR → see map, timeline, fraud report
6. Download certificate PDF
