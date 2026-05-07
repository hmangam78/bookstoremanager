import { useEffect, useState } from "react";
import { CartItem } from "./CartItem";
import { ShoppingCart, Trash2 } from "lucide-react";
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

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await checkoutBasket();
      alert("Compra realizada exitosamente");
      setItems([]);
      if (onCheckoutSuccess) {
        onCheckoutSuccess();
      }
    } catch (error) {
      console.error("Error en compra:", error);
      alert("Error al finalizar la compra");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
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
              onClick={handleCheckout}
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
  );
}
