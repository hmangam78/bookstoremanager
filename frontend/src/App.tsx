import Home from "./pages/Home.tsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GestionPage from "./pages/GestionPage";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gestion" element={<GestionPage />} />
        <Route path="/informes" element={<Reports />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}