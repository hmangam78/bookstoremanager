import { useState } from "react";
import { KeyRound, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { setupInitialPasswords } from "../services/auth";

type FirstRunSetupProps = {
  onComplete: () => void;
};

export function FirstRunSetup({ onComplete }: FirstRunSetupProps) {
  const [adminPassword, setAdminPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (adminPassword.trim().length < 8 || userPassword.trim().length < 8) {
      setError("Las dos contraseñas deben tener al menos 8 caracteres.");
      return;
    }

    if (adminPassword !== confirmPassword) {
      setError("La contraseña de administrador no coincide con la confirmación.");
      return;
    }

    if (adminPassword === userPassword) {
      setError("La contraseña de administrador y la de usuario deben ser diferentes.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await setupInitialPasswords(adminPassword, userPassword);
      onComplete();
    } catch (err) {
      const response = err as { response?: { data?: { message?: string } } };
      setError(response.response?.data?.message || "No se pudo completar la configuración inicial.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start gap-4">
          <div className="rounded-2xl bg-zinc-900 p-3 text-white">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Configuración inicial</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Crea las contraseñas de administrador y usuario para empezar a usar la aplicación.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Contraseña de administrador</span>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Contraseña de usuario</span>
              <div className="relative">
                <KeyRound size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  value={userPassword}
                  onChange={(event) => setUserPassword(event.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-zinc-700">Confirmar contraseña de administrador</span>
            <div className="relative">
              <ShieldCheck size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repite la contraseña de administrador"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
          </label>

          <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
            Las contraseñas se guardan cifradas en la base de datos y no se mostrarán de nuevo.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar configuración"}
          </button>
        </form>
      </div>
    </div>
  );
}