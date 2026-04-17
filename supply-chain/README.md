# Supply chain tracker (blockchain)

End-to-end demo: a **Hardhat**-deployed `SupplyChain` contract on **Ganache**, a **React (Vite)** front end with **MetaMask** for writes, and an **Express** API that reads the chain, serves QR/certificate/fraud features, and proxies from the dev server.

## What it does

- **On-chain:** Create products, assign **Manufacturer / Distributor / Retailer** roles (admin only), and append **location + status** steps to a product’s history.
- **Off-chain UI:** Dark-theme app with **wallet connect**, **suggested next product ID**, **QR generation and download**, **in-browser QR scan** to open a product page, **timeline** and **journey map** (when enough locations exist), **PDF authenticity certificate**, and optional **local Ollama** “fraud analysis” over the on-chain history.

## Repository layout

| Path | Role |
|------|------|
| `contracts/SupplyChain.sol` | Solidity contract (Solidity **0.8.20**) |
| `scripts/deploy.js` | Deploy script for the `ganache` network |
| `hardhat.config.js` | Compiler + Ganache RPC (`127.0.0.1:7545`, chain ID **1337**) |
| `backend/` | Express API (`index.js`, `contract.js`, `routes/`) |
| `frontend/` | Vite + React app (`src/App.jsx`, pages, components) |

State-changing calls (`createProduct`, `addStep`, `assignRole`) are sent **from the browser via ethers + MetaMask**. The backend uses a **read-only JsonRpcProvider** plus the contract ABI to fetch products, history, and roles.

## Prerequisites

- **Node.js** 18+
- **MetaMask** (or compatible injected wallet)
- **Ganache** (CLI or desktop) on port **7545** with chain ID **1337**
- Optional: **[Ollama](https://ollama.com)** for fraud analysis (`ollama pull llama3.2` or another model you configure)

## 1. Start Ganache

```bash
ganache-cli --port 7545 --chainId 1337
```

Or use Ganache GUI with the same port and network ID.

## 2. Install and deploy the contract

From the `supply-chain` folder:

```bash
cd supply-chain
npm install
npm run compile
npm run deploy:ganache
```

Copy the printed **contract address** into **both**:

- `backend/contract.js` → `CONTRACT_ADDRESS`
- `frontend/src/contractConfig.js` → `CONTRACT_ADDRESS`

The ABI in those files should match `SupplyChain.sol` after compile; after major contract changes, recompile and refresh the ABI in both places if needed.

## 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

- **`PORT`** — must match the **Vite proxy** target in `frontend/vite.config.js` (`server.proxy["/api"].target`). If you omit `PORT`, `backend/index.js` defaults to **5008**.
- **`OLLAMA_URL`** — default `http://localhost:11434` if unset.
- **`OLLAMA_MODEL`** — optional; defaults in code to **`llama3.2`** (see `routes/fraudRoutes.js`).

The backend’s JSON-RPC URL for Ganache is set in `backend/contract.js` (`http://127.0.0.1:7545`). Change it if your node runs elsewhere.

Start the API:

```bash
npm install
npm start
```

(`npm start` runs `node --watch index.js`.)

## 4. Configure and run the frontend

Ensure `frontend/vite.config.js` proxies `/api` to the same host/port as the backend (e.g. `http://localhost:5008`).

```bash
cd frontend
npm install
npm run dev
```

App: **http://localhost:5173**

## 5. MetaMask

Add a custom network:

- **RPC URL:** `http://127.0.0.1:7545`
- **Chain ID:** `1337`

Import at least one test account from Ganache (private key). The **deployer** account is the on-chain **`admin`** and can use **Admin** in the UI to assign roles.

## Frontend routes

| Route | Purpose |
|-------|---------|
| `/` | Create product (on-chain); suggests next free ID via API |
| `/update` | Add a supply-chain step; can be prefilled with `?productId=` |
| `/product/:id` | Product details, map, timeline, certificate, fraud (when loaded) |
| `/product/scan` | QR scanner flow |
| `/admin` | Role assignment (deployer wallet only) |

## API overview

Base URL in development: proxied as **`/api`** from Vite → your backend origin.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/next-product-id` | Next unused product id (sequential scan up to 10 000) |
| POST | `/api/product-qr` | Body `{ "id": number }` → `{ success, qrCode }` (PNG data URL; encodes `http://localhost:5173/product/<id>`) |
| GET | `/api/product/:id` | Product + history from chain |
| GET | `/api/get-role/:address` | Role enum + name |
| GET | `/api/fraud/health` | Confirms Ollama settings (`engine`, URL, model) |
| POST | `/api/fraud/analyse-product` | Body `{ "productId": number }` → AI-style report (requires Ollama) |
| GET | `/api/certificate/certificate/:productId` | PDF certificate download |

## Typical demo flow

1. Deploy contract; paste **`CONTRACT_ADDRESS`** into `backend/contract.js` and `frontend/src/contractConfig.js`.
2. Start Ganache, backend, and frontend; align **ports** between `.env`, `vite.config.js`, and defaults.
3. Open **`/admin`** with the **deployer** wallet; assign Manufacturer / Distributor / Retailer to three addresses.
4. Switch MetaMask to **Manufacturer** → **`/`** → create a product (note suggested ID).
5. Switch to **Distributor** or **Retailer** → **`/update`** → add steps with location and status.
6. Open **`/product/<id>`** (or scan the generated QR on **`/product/scan`**) → timeline, map (if enough locations), optional fraud check, certificate PDF.

## Fraud analysis (optional)

1. Install and run **Ollama**; pull a model, e.g. `ollama pull llama3.2`.
2. Set `OLLAMA_URL` / `OLLAMA_MODEL` in `backend/.env` if you do not use the defaults.
3. Call **`GET /api/fraud/health`** on your backend port; responses are tagged so you can confirm this stack uses **Ollama**, not cloud Gemini.

## Tech stack

- **Smart contract:** Solidity, Hardhat  
- **Frontend:** React 18, Vite 5, React Router, ethers v6, Tailwind (CDN in `index.html`), Leaflet / react-leaflet, ZXing QR scanner  
- **Backend:** Express, ethers v6, qrcode, pdfkit  
- **Chain:** Local Ganache; browser wallet for transactions

## License / status

Educational / demo project. Replace placeholder contract addresses and ports for your environment before any real deployment.
