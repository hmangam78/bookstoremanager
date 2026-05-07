import Home from "./pages/Home.tsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GestionPage from "./pages/GestionPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gestion" element={<GestionPage />} />
      </Routes>
    </Router>
  );
}