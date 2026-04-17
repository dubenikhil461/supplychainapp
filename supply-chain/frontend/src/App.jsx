/**
 * filename: frontend/src/App.jsx
 * purpose: Main router and page layout for the frontend app.
 * setup notes: Ensure backend runs on port 5001 for API proxy (see vite.config.js).
 */
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import CreateProduct from "./pages/CreateProduct";
import UpdateProduct from "./pages/UpdateProduct";
import ViewProduct from "./pages/ViewProduct";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen overflow-x-hidden bg-slate-950">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(34,211,238,0.14),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(139,92,246,0.12),transparent_50%),radial-gradient(ellipse_60%_40%_at_0%_100%,rgba(6,182,212,0.08),transparent_45%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed -left-32 top-24 h-[28rem] w-[28rem] animate-float rounded-full bg-cyan-500/20 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed -right-24 bottom-0 h-[24rem] w-[24rem] animate-float rounded-full bg-violet-500/15 blur-[90px] [animation-delay:-6s]"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <Navbar />
        <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
          <Routes>
            <Route path="/" element={<CreateProduct />} />
            <Route path="/update" element={<UpdateProduct />} />
            <Route path="/product/:id" element={<ViewProduct />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            className: "!bg-slate-900/95 !text-slate-100 !border !border-white/10 !shadow-2xl !backdrop-blur-md",
            duration: 3800,
            style: { fontSize: "0.9rem" },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
