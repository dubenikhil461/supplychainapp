/**
 * filename: frontend/src/components/Navbar.jsx
 * purpose: Top navigation bar with wallet connection.
 * setup notes: Requires MetaMask for account connection.
 */
import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function Navbar() {
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not found. Please install it first.");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        toast.success("Wallet connected successfully.");
      }
    } catch (error) {
      toast.error(`Failed to connect wallet: ${error.message}`);
    }
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="text-lg font-bold">⛓ SupplyChain</div>
        <div className="flex items-center gap-4 text-sm md:text-base">
          <Link className="hover:text-cyan-300" to="/">
            Create Product
          </Link>
          <Link className="hover:text-cyan-300" to="/update">
            Update Status
          </Link>
          <Link className="hover:text-cyan-300" to="/product/scan">
            Scan QR
          </Link>
        </div>
        <button
          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400"
          onClick={connectWallet}
          type="button"
        >
          {walletAddress ? truncateAddress(walletAddress) : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
