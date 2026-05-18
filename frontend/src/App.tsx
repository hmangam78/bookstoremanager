import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import GestionPage from "./pages/GestionPage";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import { FirstRunSetup } from "./components/FirstRunSetup";
import { getSetupState } from "./services/auth";

export default function App() {
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getSetupState()
      .then((state) => {
        if (!cancelled) {
          setNeedsSetup(state.needsSetup);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNeedsSetup(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSetup(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadingSetup) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center text-zinc-500">
        Comprobando configuración inicial...
      </div>
    );
  }

  if (needsSetup) {
    return <FirstRunSetup onComplete={() => setNeedsSetup(false)} />;
  }

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