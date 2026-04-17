/**
 * filename: frontend/src/pages/AdminPanel.jsx
 * purpose: Admin role assignment and role lookup interface.
 * setup notes: Visible to contract deployer/admin wallet only.
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { ABI, CONTRACT_ADDRESS } from "../contractConfig";
import { formatEthersError } from "../utils/ethersError";

const ROLE_OPTIONS = [
  { value: 1, label: "Manufacturer" },
  { value: 2, label: "Distributor" },
  { value: 3, label: "Retailer" }
];

function roleBadge(role) {
  if (role === "Manufacturer") return "bg-emerald-600";
  if (role === "Distributor") return "bg-blue-600";
  if (role === "Retailer") return "bg-orange-500";
  return "bg-slate-500";
}

function AdminPanel() {
  const [connectedAddress, setConnectedAddress] = useState("");
  const [adminAddress, setAdminAddress] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState(1);
  const [lookupAddress, setLookupAddress] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = connectedAddress && adminAddress && connectedAddress.toLowerCase() === adminAddress.toLowerCase();

  const fetchAdminAndWallet = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      if (accounts[0]) {
        setConnectedAddress(accounts[0]);
      }
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const admin = await contract.admin();
      setAdminAddress(admin);
    } catch (error) {
      toast.error(error.message || "Failed to fetch admin details");
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not found.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts[0]) {
        setConnectedAddress(accounts[0]);
      }
      await fetchAdminAndWallet();
    } catch (error) {
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  const assignRole = async (event) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      if (!window.ethereum) {
        toast.error("MetaMask not found.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.assignRole(targetAddress, Number(selectedRole));
      await tx.wait();

      toast.success(`Role assigned. Tx: ${tx.hash}`);
    } catch (error) {
      toast.error(formatEthersError(error, "Failed to assign role"));
    } finally {
      setIsLoading(false);
    }
  };

  const getRole = async () => {
    try {
      if (!lookupAddress) {
        toast.error("Enter wallet address to check role");
        return;
      }
      const response = await axios.get(`/api/get-role/${lookupAddress}`);
      setLookupResult(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to fetch role");
    }
  };

  useEffect(() => {
    fetchAdminAndWallet();
  }, []);

  if (!connectedAddress || !isAdmin) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl shadow-black/30 backdrop-blur-md sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">Access</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Admin panel</h1>
        <p className="mt-3 text-sm text-slate-400">Only the contract deployer can assign roles.</p>
        <div className="mt-5 space-y-2 rounded-xl border border-white/5 bg-slate-950/50 p-4 font-mono text-xs text-slate-400">
          <p>
            <span className="text-slate-500">Connected:</span> {connectedAddress || "Not connected"}
          </p>
          <p>
            <span className="text-slate-500">Admin:</span> {adminAddress || "Loading…"}
          </p>
        </div>
        <button
          className="mt-6 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:from-cyan-300 hover:to-teal-300"
          onClick={connectWallet}
          type="button"
        >
          Connect admin wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl shadow-black/30 backdrop-blur-md sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">Roles</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Assign access</h1>
        <p className="mt-2 text-sm text-slate-400">Manufacturer, distributor, and retailer roles for the contract.</p>
        <form className="mt-6 space-y-4" onSubmit={assignRole}>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-cyan-100 placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            onChange={(event) => setTargetAddress(event.target.value)}
            placeholder="0x wallet address"
            required
            value={targetAddress}
          />
          <select
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            onChange={(event) => setSelectedRole(Number(event.target.value))}
            value={selectedRole}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} className="bg-slate-900" value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <button
            className="w-full rounded-xl bg-white/10 px-4 py-3 font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:opacity-60 sm:w-auto"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Assigning…" : "Assign role"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl shadow-black/30 backdrop-blur-md sm:p-8">
        <h2 className="text-xl font-semibold text-white">Check role</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-cyan-100 placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            onChange={(event) => setLookupAddress(event.target.value)}
            placeholder="Wallet address"
            value={lookupAddress}
          />
          <button
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-teal-300"
            onClick={getRole}
            type="button"
          >
            Get role
          </button>
        </div>
        {lookupResult ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <p className="font-mono text-xs text-slate-400">Address: {lookupResult.address}</p>
            <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${roleBadge(lookupResult.roleName)}`}>
              {lookupResult.roleName}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AdminPanel;
