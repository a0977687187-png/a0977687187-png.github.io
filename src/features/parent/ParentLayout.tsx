import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useParentAuth } from "../../state/ParentAuthContext";

const NAV_ITEMS = [
  { to: "/parent", label: "快速給點", end: true },
  { to: "/parent/tasks", label: "任務管理" },
  { to: "/parent/monsters", label: "怪獸管理" },
  { to: "/parent/heroes", label: "英雄商店" },
  { to: "/parent/quiz", label: "題庫管理" },
  { to: "/parent/prizes", label: "獎品管理" },
  { to: "/parent/children", label: "孩子管理" },
  { to: "/parent/stats", label: "統計報表" },
  { to: "/parent/settings", label: "設定" },
  { to: "/parent/about", label: "關於" },
];

export function ParentLayout() {
  const { lock } = useParentAuth();
  const navigate = useNavigate();

  function exitParentMode() {
    lock();
    navigate("/");
  }

  return (
    <div className="screen">
      <div className="row">
        <h2 style={{ flex: 1 }}>👨‍👩‍👧 家長模式</h2>
        <button className="link-btn" onClick={exitParentMode}>
          離開
        </button>
      </div>
      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="secondary-btn"
            style={({ isActive }) => ({
              background: isActive ? "var(--color-primary)" : "white",
              color: isActive ? "white" : "var(--color-text)",
              flex: "1 1 auto",
              textAlign: "center",
              textDecoration: "none",
              fontSize: 14,
              padding: "10px 8px",
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
