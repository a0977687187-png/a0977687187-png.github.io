import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./App.css";
import App from "./App.tsx";
import { AppDataProvider } from "./state/AppDataContext";
import { ParentAuthProvider } from "./state/ParentAuthContext";
import { SyncGate } from "./features/sync/SyncGate";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SyncGate>
        <AppDataProvider>
          <ParentAuthProvider>
            <App />
          </ParentAuthProvider>
        </AppDataProvider>
      </SyncGate>
    </BrowserRouter>
  </StrictMode>
);
