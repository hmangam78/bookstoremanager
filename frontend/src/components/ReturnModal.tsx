import { useState } from "react";
import { X, RotateCcw, AlertTriangle, Lock, CheckCircle2 } from "lucide-react";
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

  const [step, setStep] = useState<"select" | "confirm" | "password" | "done">("select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const selectedItems = Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = ticket.items.find((i) => i.id === Number(id))!;
      return { ...item, returnQty: qty };
    });

  const totalRefund = selectedItems.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.returnQty,
    0
  );

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
      setStep("done");
      // Now proceed with the return
      await doReturn();
    } catch {
      setPasswordError("Contraseña incorrecta");
    } finally {
      setPasswordLoading(false);
    }
  };

  const doReturn = async () => {
    const items = selectedItems.map((item) => ({
      ticketItemId: item.id,
      quantity: item.returnQty,
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
      setStep("select");
    } finally {
      setLoading(false);
    }
  };

  const goToConfirm = () => {
    setError("");
    setStep("confirm");
  };

  const goToPassword = () => {
    setStep("password");
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleBack = () => {
    if (step === "confirm") setStep("select");
    if (step === "password") setStep("confirm");
  };

  const modalTitle = () => {
    switch (step) {
      case "select": return "Devolución";
      case "confirm": return "Confirmar devolución";
      case "password": return "Autorización requerida";
      case "done": return "Devolución completada";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Main modal */}
      {(step === "select" || step === "confirm" || step === "done") && (
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-200">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">{modalTitle()}</h2>
              <p className="text-sm text-zinc-500 mt-1">
                Ticket #{ticket.ticketNo}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
              disabled={loading}
            >
              <X size={20} className="text-zinc-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Step: select quantities */}
            {step === "select" && ticket.items.map((item) => {
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

            {step === "select" && !hasSelection && (
              <p className="text-center text-sm text-zinc-400 py-4">
                Selecciona las cantidades a devolver
              </p>
            )}

            {/* Step: confirm summary */}
            {step === "confirm" && (
              <>
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-900 truncate">{item.book.title}</p>
                        <p className="text-xs text-zinc-500 font-mono">{item.book.isbn}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        <span className="text-zinc-600">×{item.returnQty}</span>
                        <span className="font-semibold text-zinc-900 w-20 text-right">
                          €{(Number(item.unitPrice) * item.returnQty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-base">
                  <span className="font-semibold text-zinc-900">Total a devolver</span>
                  <span className="text-xl font-bold text-emerald-600">€{totalRefund.toFixed(2)}</span>
                </div>
              </>
            )}

            {/* Step: done */}
            {step === "done" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="rounded-full bg-emerald-100 p-3">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <p className="text-lg font-semibold text-zinc-900">Devolución procesada</p>
                <p className="text-sm text-zinc-500 text-center">
                  Se ha procesado la devolución del ticket #{ticket.ticketNo}.
                  {totalRefund > 0 && (
                    <> Se han devuelto <strong>€{totalRefund.toFixed(2)}</strong>.</>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200">
            {step === "select" && (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={goToConfirm}
                  disabled={!hasSelection || loading}
                  className="
                    flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white
                    bg-red-600 hover:bg-red-700 transition
                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                  "
                >
                  <RotateCcw size={18} />
                  Continuar
                </button>
              </>
            )}

            {step === "confirm" && (
              <>
                <button
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 transition cursor-pointer"
                >
                  Atrás
                </button>
                <button
                  onClick={goToPassword}
                  className="
                    flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white
                    bg-red-600 hover:bg-red-700 transition cursor-pointer
                  "
                >
                  <Lock size={18} />
                  Confirmar devolución
                </button>
              </>
            )}

            {step === "done" && (
              <button
                onClick={onClose}
                className="
                  px-6 py-2.5 rounded-xl font-medium text-white
                  bg-zinc-900 hover:bg-zinc-800 transition cursor-pointer
                "
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Password prompt overlay (renders over the main modal) */}
      {step === "password" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={handleBack}>
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
                  onClick={handleBack}
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
