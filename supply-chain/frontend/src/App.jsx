/**
 * filename: frontend/src/App.jsx
 * purpose: Main router and page layout for the frontend app.
 * setup notes: Ensure backend runs on port 5000 for API proxy.
 */
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import CreateProduct from "./pages/CreateProduct";
import UpdateProduct from "./pages/UpdateProduct";
import ViewProduct from "./pages/ViewProduct";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <Routes>
            <Route path="/" element={<CreateProduct />} />
            <Route path="/update" element={<UpdateProduct />} />
            <Route path="/product/:id" element={<ViewProduct />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
