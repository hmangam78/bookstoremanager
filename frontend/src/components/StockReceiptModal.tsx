import { useState } from "react";
import { X, Plus, Trash2, PackageSearch, AlertTriangle } from "lucide-react";
import { uploadStockReceipt, type StockReceiptItem, getBookByISBN } from "../services/stockReceipt";

type Props = {
  onClose: () => void;
};

export function StockReceiptModal({ onClose }: Props) {
  const [items, setItems] = useState<StockReceiptItem[]>([]);
  const [orderNo, setOrderNo] = useState("");
  const [currentIsbn, setCurrentIsbn] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const addLine = () => {
    const isbn = currentIsbn.trim();
    const stock = parseInt(currentStock, 10);
    
    if (!isbn) return;
    if (isNaN(stock) || stock <= 0) return;
    
    // Check for duplicate ISBN
    if (items.some((item) => item.isbn === isbn)) {
      alert("El ISBN ya está en la lista.");
      return;
    }
    
    // Fetch title if book exists in database
    const doAdd = async () => {
      try {
        const book = await getBookByISBN(isbn);
        const title = book?.data?.title || '(No catalogado)';
        setItems(prev => [...prev, { isbn, title, stock }]);
      } catch {
        setItems(prev => [...prev, { isbn, title: '(No catalogado)', stock }]);
      }
    };
    doAdd();
    
    setCurrentIsbn("");
    setCurrentStock("");
  };

  const removeLine = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addLine();
    }
  };

  const handleReview = () => {
    if (items.length === 0) return;
    setShowReview(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);

    try {
      const { data } = await uploadStockReceipt({
        orderNo,
        items: items.map(({ isbn, stock }) => ({ isbn, stock }))
      });
      setResult({
        success: true,
        message: `Recepción de stock completada con éxito. Pedido "${orderNo}" — ${items.length} líneas procesadas.`,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setResult({
        success: false,
        message: err.response?.data?.message || "Error al procesar la recepción de stock.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  // If result is shown, show a final confirmation screen
  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            {result.success ? (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <PackageSearch size={28} className="text-green-600" />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle size={28} className="text-red-600" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-zinc-900">
              {result.success ? "Recepción Exitosa" : "Error"}
            </h3>
            <p className="text-sm text-zinc-600">{result.message}</p>
            <button
              onClick={onClose}
              className="
                mt-2 rounded-xl bg-zinc-900 px-6 py-3
                font-medium text-white transition hover:bg-zinc-800
                cursor-pointer
              "
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Review popup
  if (showReview) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900">
              Revisar Recepción de Stock
            </h3>
            <button
              onClick={() => setShowReview(false)}
              disabled={submitting}
              className="cursor-pointer text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-zinc-500 mb-4">
            Pedido: <strong>{orderNo}</strong> — se van a procesar <strong>{items.length}</strong> líneas. Revisa los datos antes de confirmar.
          </p>

          <div className="max-h-60 overflow-y-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-100 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">ISBN</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Stock</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-t border-zinc-100">
                    <td className="px-4 py-3 text-zinc-400">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-medium">{item.isbn}</td>
                    <td className="px-4 py-3 text-sm">{item.title}</td>
                    <td className="px-4 py-3">{item.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowReview(false)}
              disabled={submitting}
              className="
                rounded-xl border border-zinc-200 px-6 py-3
                font-medium text-zinc-700 transition hover:bg-zinc-50
                cursor-pointer disabled:opacity-50
              "
            >
              Volver
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="
                flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3
                font-medium text-white transition hover:bg-zinc-800
                cursor-pointer disabled:opacity-50
              "
            >
              {submitting ? "Procesando..." : "Confirmar Recepción"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main modal — line entry
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">Recepción de Stock</h3>
            <p className="text-sm text-zinc-500 mt-1">
              Introduce el número de pedido y añade los productos recibidos
            </p>
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer text-zinc-400 hover:text-zinc-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Order number */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-600 mb-1">Nº de Pedido *</label>
          <input
            type="text"
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            placeholder="ALB-20250413-001"
            className="
              w-full rounded-xl border border-zinc-200 bg-zinc-50
              px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400
            "
          />
        </div>

        {/* Input line */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-600 mb-1">ISBN</label>
            <input
              type="text"
              value={currentIsbn}
              onChange={(e) => setCurrentIsbn(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="978-84-xxx-xxxx-x"
              className="
                w-full rounded-xl border border-zinc-200 bg-zinc-50
                px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400
              "
            />
          </div>
          <div className="w-28">
            <label className="block text-xs font-medium text-zinc-600 mb-1">Stock</label>
            <input
              type="number"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              onKeyDown={handleKeyDown}
              min="1"
              placeholder="0"
              className="
                w-full rounded-xl border border-zinc-200 bg-zinc-50
                px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400
              "
            />
          </div>
          <button
            onClick={addLine}
            disabled={!currentIsbn.trim() || !currentStock.trim()}
            className="
              self-end flex items-center gap-2 rounded-xl bg-zinc-900
              px-4 py-3 font-medium text-white transition hover:bg-zinc-800
              cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Plus size={18} />
            Añadir
          </button>
        </div>

        {/* Lines table */}
        {items.length > 0 ? (
          <div className="max-h-60 overflow-y-auto rounded-xl border border-zinc-200 mb-6">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-100 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">ISBN</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-t border-zinc-100">
                    <td className="px-4 py-3 text-zinc-400">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-medium">{item.isbn}</td>
                    <td className="px-4 py-3 font-mono text-xs font-medium">{item.title}</td>
                    <td className="px-4 py-3">{item.stock}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeLine(i)}
                        className="cursor-pointer text-zinc-400 hover:text-red-500 transition"
                        title="Eliminar línea"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-zinc-400">
            <PackageSearch size={36} />
            <p className="text-sm">Aún no hay líneas añadidas</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="
              rounded-xl border border-zinc-200 px-6 py-3
              font-medium text-zinc-700 transition hover:bg-zinc-50
              cursor-pointer
            "
          >
            Cancelar
          </button>
          <button
            onClick={handleReview}
            disabled={items.length === 0 || !orderNo.trim()}
            className="
              flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3
              font-medium text-white transition hover:bg-zinc-800
              cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <PackageSearch size={18} />
            Revisar y Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
