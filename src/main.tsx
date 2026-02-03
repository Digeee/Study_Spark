import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add debugging
console.log("main.tsx loading...");

const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (rootElement) {
  console.log("Creating React root...");
  createRoot(rootElement).render(<App />);
  console.log("App rendered successfully");
} else {
  console.error("Root element not found!");
}