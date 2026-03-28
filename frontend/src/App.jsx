import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Phase1 from "./pages/Phase1.jsx";
import Phase2 from "./pages/Phase2.jsx";
import Phase3 from "./pages/Phase3.jsx";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "1.25rem 1.5rem", maxWidth: 1200 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/phase1" element={<Phase1 />} />
          <Route path="/phase2" element={<Phase2 />} />
          <Route path="/phase3" element={<Phase3 />} />
        </Routes>
      </main>
    </div>
  );
}
