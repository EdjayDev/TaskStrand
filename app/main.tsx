import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import Page from "./page.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
