import { useState, useEffect } from "react";
import { X, BookOpen } from "lucide-react";
import { getUncatalogued, type UncataloguedItem } from "../services/stockReceipt";

type Props = {
  onSelect: (item: UncataloguedItem) => void;
  onClose: () => void;
};

export function UncataloguedListModal({ onSelect, onClose }: Props) {
  const [items, setItems] = useState<UncataloguedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUncatalogued()
      .then(({ data }) => setItems(data))
      .catch(() => alert("Error al cargar artículos sin catalogar."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">
              Artículos sin Catalogar
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Selecciona un artículo para completar sus datos
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-zinc-400 hover:text-zinc-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-sm text-zinc-500 text-center py-8">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">
            No hay artículos sin catalogar.
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="
                  flex items-center justify-between
                  w-full rounded-xl border border-zinc-200
                  px-4 py-3 text-left
                  transition hover:bg-zinc-50 hover:border-zinc-300
                  cursor-pointer
                "
              >
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-medium text-zinc-900">
                    {item.isbn}
                  </span>
                  <span className="text-xs text-zinc-500 mt-0.5">
                    Stock: {item.stock} unidades
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <BookOpen size={16} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
