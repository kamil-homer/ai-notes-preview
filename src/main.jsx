import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/400-italic.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/700-italic.css";

import "./index.css";

import { App } from "./App.jsx";

const root = document.getElementById("root");

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/:id?" element={<App />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
