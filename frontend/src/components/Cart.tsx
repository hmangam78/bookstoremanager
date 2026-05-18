import { useEffect, useState } from "react";
import { CartItem } from "./CartItem";
import { ShoppingCart, Trash2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { getBasket, clearBasket, checkoutBasket } from "../services/basket";

type BasketItem = {
  bookId: number;
  isbn: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type CartProps = {
  refreshTrigger?: number;
  onCheckoutSuccess?: () => void;
};

export function Cart({ refreshTrigger, onCheckoutSuccess }: CartProps) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    loadBasket();
  }, [refreshTrigger]);

  const loadBasket = async () => {
    setLoading(true);
    try {
      const res = await getBasket();
      setItems(res.data || []);
    } catch (error) {
      console.error("Error cargando carrito:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleClear = async () => {
    if (confirm("¿Vaciar la cesta?")) {
      try {
        await clearBasket();
        setItems([]);
      } catch (error) {
        console.error("Error vaciando cesta:", error);
      }
    }
  };

  const openCheckoutConfirm = () => {
    setCheckoutError(null);
    setCheckoutSuccess(false);
    setShowConfirmModal(true);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      await checkoutBasket();
      setCheckoutSuccess(true);
      setItems([]);
      if (onCheckoutSuccess) {
        onCheckoutSuccess();
      }
    } catch (error: any) {
      console.error("Error en compra:", error);
      setCheckoutError(error?.response?.data?.message || "Error al finalizar la compra");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setCheckoutSuccess(false);
    setCheckoutError(null);
  };

  return (
    <>
      <div
        className="
          sticky top-6
          rounded-2xl
          border border-zinc-200
          bg-white
          p-5
          shadow-sm
        "
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart size={22} />
            <h2 className="text-lg font-semibold">
              Cesta ({items.length})
            </h2>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="text-zinc-400 hover:text-red-600 transition"
              title="Vaciar cesta"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-zinc-500">Cargando carrito...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-zinc-500">Cesta vacía</p>
          ) : (
            items.map((item) => (
              <CartItem
                key={item.bookId}
                item={item}
                onUpdate={loadBasket}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <>
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">
                  €{total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={openCheckoutConfirm}
                disabled={isCheckingOut || items.length === 0}
                className="
                  mt-4
                  w-full
                  rounded-xl
                  bg-emerald-600
                  px-4 py-3
                  font-medium
                  text-white
                  transition
                  hover:bg-emerald-500
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {isCheckingOut ? "Procesando..." : "Finalizar compra"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Checkout confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-zinc-200 max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Confirmar compra</h3>
                <p className="text-sm text-zinc-500">Revisa los artículos antes de continuar</p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition cursor-pointer"
                disabled={isCheckingOut}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-auto p-6 space-y-4 flex-1">
              {/* Success message */}
              {checkoutSuccess && (
                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <span>Compra realizada exitosamente</span>
                </div>
              )}

              {/* Error message */}
              {checkoutError && (
                <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Items list */}
              {!checkoutSuccess && (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.bookId} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-900 truncate">{item.title}</p>
                        <p className="text-xs text-zinc-500 font-mono">{item.isbn}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        <span className="text-zinc-600">×{item.quantity}</span>
                        <span className="font-semibold text-zinc-900 w-20 text-right">
                          €{item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              {!checkoutSuccess && (
                <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-base">
                  <span className="font-semibold text-zinc-900">Total</span>
                  <span className="text-xl font-bold text-zinc-900">€{total.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Modal footer */}
            {!checkoutSuccess && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 bg-zinc-50 rounded-b-2xl">
                <button
                  onClick={closeModal}
                  disabled={isCheckingOut}
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCheckingOut ? (
                    <>Procesando...</>
                  ) : (
                    <>Confirmar compra — €{total.toFixed(2)}</>
                  )}
                </button>
              </div>
            )}

            {/* Success footer */}
            {checkoutSuccess && (
              <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-200 bg-zinc-50 rounded-b-2xl">
                <button
                  onClick={closeModal}
                  className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
