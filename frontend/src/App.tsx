import Home from "./pages/Home.tsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GestionPage from "./pages/GestionPage";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gestion" element={<GestionPage />} />
        <Route path="/informes" element={<Reports />} />
      </Routes>
    </Router>
  );
}