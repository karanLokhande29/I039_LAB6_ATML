import { NavLink } from "react-router-dom";

const link = ({ isActive }) => ({
  display: "block",
  padding: "10px 14px",
  borderRadius: 8,
  textDecoration: "none",
  color: isActive ? "#5b21b6" : "#374151",
  background: isActive ? "#ede9fe" : "transparent",
  fontWeight: isActive ? 700 : 500,
  marginBottom: 6,
});

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        borderRight: "1px solid #e5e7eb",
        padding: "1rem",
        background: "#fafafa",
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Navigation
      </div>
      <NavLink to="/" end style={link}>
        Dashboard
      </NavLink>
      <NavLink to="/phase1" style={link}>
        Phase 1: Eng → Hindi
      </NavLink>
      <NavLink to="/phase2" style={link}>
        Phase 2: Analysis
      </NavLink>
      <NavLink to="/phase3" style={link}>
        Phase 3: Eng → Spanish
      </NavLink>
    </aside>
  );
}
