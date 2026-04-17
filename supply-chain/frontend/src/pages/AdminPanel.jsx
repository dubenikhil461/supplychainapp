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
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
        <p className="mt-3 text-sm text-slate-600">Only the contract deployer can assign roles.</p>
        <p className="mt-2 text-sm text-slate-600">Connected: {connectedAddress || "Not connected"}</p>
        <p className="text-sm text-slate-600">Admin: {adminAddress || "Loading..."}</p>
        <button
          className="mt-4 rounded-md bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400"
          onClick={connectWallet}
          type="button"
        >
          Connect Admin Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
        <p className="mt-2 text-sm text-slate-600">Assign Manufacturer, Distributor, and Retailer roles.</p>
        <form className="mt-4 space-y-4" onSubmit={assignRole}>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setTargetAddress(event.target.value)}
            placeholder="Wallet address"
            required
            value={targetAddress}
          />
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setSelectedRole(Number(event.target.value))}
            value={selectedRole}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <button
            className="rounded-md bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Assigning..." : "Assign Role"}
          </button>
        </form>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-slate-800">Check Current Role</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="flex-1 rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setLookupAddress(event.target.value)}
            placeholder="Wallet address"
            value={lookupAddress}
          />
          <button
            className="rounded-md bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400"
            onClick={getRole}
            type="button"
          >
            Get Role
          </button>
        </div>
        {lookupResult ? (
          <div className="mt-4 rounded-md border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Address: {lookupResult.address}</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${roleBadge(lookupResult.roleName)}`}>
              {lookupResult.roleName}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AdminPanel;
