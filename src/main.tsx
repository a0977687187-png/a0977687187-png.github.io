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
    {/* basename 跟著建置時的 base 走：主站是 "/"，朋友的本機版部署在 /yuzu-local/ 子路徑 */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
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
