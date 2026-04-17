/**
 * filename: frontend/src/main.jsx
 * purpose: React app entry point for Vite.
 * setup notes: Renders App component into #root.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
