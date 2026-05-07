import { Trash2, Minus, Plus } from "lucide-react";
import { removeBasketItem, setBasketItemQuantity } from "../services/basket";
import { useState } from "react";

type BasketItem = {
  bookId: number;
  isbn: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type CartItemProps = {
  item: BasketItem;
  onUpdate: () => void;
};

export function CartItem({ item, onUpdate }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeBasketItem(item.bookId);
      onUpdate();
    } catch (error) {
      console.error("Error removiendo item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemove();
      return;
    }

    setIsUpdating(true);
    try {
      await setBasketItemQuantity(item.bookId, newQuantity);
      onUpdate();
    } catch (error) {
      console.error("Error actualizando cantidad:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-sm">{item.title}</p>
          <p className="text-xs text-zinc-500">{item.isbn}</p>
        </div>

        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="text-zinc-400 hover:text-red-600 transition ml-2"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating}
            className="p-1 text-zinc-500 hover:bg-zinc-200 rounded transition disabled:opacity-50"
          >
            <Minus size={14} />
          </button>
          <span className="text-sm font-medium w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating}
            className="p-1 text-zinc-500 hover:bg-zinc-200 rounded transition disabled:opacity-50"
          >
            <Plus size={14} />
          </button>
        </div>

        <span className="font-semibold text-sm">
          €{item.totalPrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
}