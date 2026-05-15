import { useState } from "react";
import { X, RotateCcw, AlertTriangle, Lock } from "lucide-react";
import { processReturn, type Ticket } from "../services/tickets";
import { login } from "../services/auth";

type Props = {
  ticket: Ticket;
  onClose: () => void;
  onSuccess: (updatedTicket: Ticket) => void;
};

export function ReturnModal({ ticket, onClose, onSuccess }: Props) {
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    ticket.items.forEach((item) => {
      const available = item.quantity - item.returnedQuantity;
      if (available > 0) {
        initial[item.id] = 0;
      }
    });
    return initial;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const hasSelection = Object.values(quantities).some((q) => q > 0);

  const handleQuantityChange = (itemId: number, value: number) => {
    const item = ticket.items.find((i) => i.id === itemId);
    if (!item) return;
    const available = item.quantity - item.returnedQuantity;
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(value, available)),
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setPasswordLoading(true);
    setPasswordError("");

    try {
      await login(password);
      setShowPasswordPrompt(false);
      setPassword("");
      // Now proceed with the return
      await doReturn();
    } catch {
      setPasswordError("Contraseña incorrecta");
    } finally {
      setPasswordLoading(false);
    }
  };

  const doReturn = async () => {
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({
        ticketItemId: Number(id),
        quantity: qty,
      }));

    if (items.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await processReturn({
        ticketNo: ticket.ticketNo,
        items,
      });
      onSuccess(data);
    } catch (err) {
      console.error("Error al procesar devolución:", err);
      setError("Error al procesar la devolución. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    // First, show password prompt
    setShowPasswordPrompt(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Devolución</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Ticket #{ticket.ticketNo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Items */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {ticket.items.map((item) => {
            const available = item.quantity - item.returnedQuantity;
            if (available <= 0) return null;

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 bg-zinc-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 truncate">
                    {item.book.title}
                  </p>
                  <p className="text-sm text-zinc-500">
                    ISBN: {item.book.isbn} · {Number(item.unitPrice).toFixed(2)} €
                  </p>
                  <p className="text-sm text-zinc-400">
                    Disponible: {available} de {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, (quantities[item.id] || 0) - 1)
                    }
                    disabled={(quantities[item.id] || 0) <= 0}
                    className="w-8 h-8 rounded-lg border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantities[item.id] || 0}
                    onChange={(e) =>
                      handleQuantityChange(item.id, parseInt(e.target.value) || 0)
                    }
                    min={0}
                    max={available}
                    className="w-16 text-center rounded-lg border border-zinc-300 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  />
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, (quantities[item.id] || 0) + 1)
                    }
                    disabled={(quantities[item.id] || 0) >= available}
                    className="w-8 h-8 rounded-lg border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}

          {!hasSelection && (
            <p className="text-center text-sm text-zinc-400 py-4">
              Selecciona las cantidades a devolver
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!hasSelection || loading}
            className="
              flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white
              bg-red-600 hover:bg-red-700 transition
              disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
            "
          >
            <RotateCcw size={18} />
            {loading ? "Procesando..." : "Confirmar Devolución"}
          </button>
        </div>
      </div>

      {/* Password prompt overlay */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowPasswordPrompt(false)}>
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-6">
              <Lock size={20} className="text-zinc-600" />
              <h2 className="text-lg font-semibold text-zinc-900">Autorización requerida</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Introduce tu contraseña para confirmar la devolución
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  autoFocus
                  className="
                    w-full rounded-xl border border-zinc-200
                    bg-zinc-50 px-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-zinc-400
                  "
                />
              </div>

              {passwordError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-700">{passwordError}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowPasswordPrompt(false); setPassword(""); setPasswordError(""); }}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!password.trim() || passwordLoading}
                  className="
                    flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white
                    bg-zinc-900 hover:bg-zinc-800 transition
                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                  "
                >
                  <Lock size={18} />
                  {passwordLoading ? "Verificando..." : "Autorizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
