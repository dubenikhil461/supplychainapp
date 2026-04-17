/**
 * filename: frontend/src/components/Navbar.jsx
 * purpose: Top navigation bar with wallet connection.
 * setup notes: Requires MetaMask for account connection.
 */
import React from "react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
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

  const navLinkClass = ({ isActive }) =>
    [
      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-white/10 text-white shadow-inner shadow-black/20"
        : "text-slate-300 hover:bg-white/5 hover:text-cyan-200",
    ].join(" ");

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link className="group flex items-center gap-2 text-lg font-bold tracking-tight" to="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-lg shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
            ⛓
          </span>
          <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
            SupplyChain
          </span>
        </Link>
        <div className="order-3 flex w-full flex-wrap items-center justify-center gap-1 sm:order-none sm:w-auto sm:justify-end">
          <NavLink className={navLinkClass} end to="/">
            Create
          </NavLink>
          <NavLink className={navLinkClass} to="/update">
            Update
          </NavLink>
          <NavLink className={navLinkClass} to="/product/scan">
            Scan
          </NavLink>
          <NavLink className={navLinkClass} to="/admin">
            Admin
          </NavLink>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {walletAddress ? (
            <span
              className={`hidden max-w-[8rem] truncate rounded-full px-2.5 py-1 text-xs font-semibold shadow sm:inline-flex sm:max-w-none ${roleBadgeClasses(roleName)}`}
            >
              {roleName}
            </span>
          ) : null}
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:from-cyan-300 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
            onClick={connectWallet}
            type="button"
          >
            <span className="font-mono text-xs opacity-90">
              {walletAddress ? truncateAddress(walletAddress) : "Connect wallet"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
