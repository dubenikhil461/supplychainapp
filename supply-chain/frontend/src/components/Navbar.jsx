/**
 * filename: frontend/src/components/Navbar.jsx
 * purpose: Top navigation bar with wallet connection.
 * setup notes: Requires MetaMask for account connection.
 */
import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function roleBadgeClasses(roleName) {
  if (roleName === "Manufacturer") return "bg-emerald-600 text-white";
  if (roleName === "Distributor") return "bg-blue-600 text-white";
  if (roleName === "Retailer") return "bg-orange-500 text-white";
  return "bg-slate-500 text-white";
}

function Navbar() {
  const [walletAddress, setWalletAddress] = useState("");
  const [roleName, setRoleName] = useState("None");

  const fetchRole = async (address) => {
    try {
      const response = await axios.get(`/api/get-role/${address}`);
      setRoleName(response.data.roleName || "None");
    } catch (error) {
      setRoleName("None");
      toast.error(error.response?.data?.message || "Failed to fetch role");
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not found. Please install it first.");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        await fetchRole(accounts[0]);
        toast.success("Wallet connected successfully.");
      }
    } catch (error) {
      toast.error(`Failed to connect wallet: ${error.message}`);
    }
  };

  useEffect(() => {
    const syncAccount = async () => {
      try {
        if (!window.ethereum) return;
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts[0]) {
          setWalletAddress(accounts[0]);
          await fetchRole(accounts[0]);
        }
      } catch (error) {
        toast.error(`Failed to sync wallet: ${error.message}`);
      }
    };

    syncAccount();
  }, []);

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
          <Link className="hover:text-cyan-300" to="/admin">
            Admin
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {walletAddress ? (
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${roleBadgeClasses(roleName)}`}>
              {roleName}
            </span>
          ) : null}
          <button
            className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400"
            onClick={connectWallet}
            type="button"
          >
            {walletAddress ? truncateAddress(walletAddress) : "Connect Wallet"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
