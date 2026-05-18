import { useState, useEffect } from "react";
import { X, ClipboardList, Search, BookOpen, User, Trash2, ShoppingCart } from "lucide-react";
import { getAllCustomerOrders, deleteCustomerOrder, type CustomerOrder } from "../services/customerOrders";
import { getBookByISBN } from "../services/stockReceipt";
import { addToBasket } from "../services/basket";

type Props = {
  onClose: () => void;
};

export function CustomerOrdersListModal({ onClose }: Props) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    setError("");
    getAllCustomerOrders()
      .then(({ data }) => setOrders(data || []))
      .catch((err) => {
        console.error("Error fetching customer orders:", err);
        setError("Error al cargar los pedidos de cliente");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (orderId: number) => {
    setDeletingId(orderId);
    try {
      await deleteCustomerOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Error al eliminar el pedido");
    } finally {
      setDeletingId(null);
    }
  };

  const handleComplete = async (order: CustomerOrder) => {
    setCompletingId(order.id);
    try {
      const { data: book } = await getBookByISBN(order.isbn);
      if (!book || !book.id) {
        alert("No se encontró el libro en el catálogo");
        return;
      }
      await addToBasket(book.id, order.quantity);
      await deleteCustomerOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err) {
      console.error("Error completing order:", err);
      alert("Error al completar el pedido");
    } finally {
      setCompletingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.customer?.name?.toLowerCase().includes(q) ||
      order.customer?.phone?.toLowerCase().includes(q) ||
      order.customer?.email?.toLowerCase().includes(q) ||
      order.isbn.toLowerCase().includes(q) ||
      (order.bookTitle?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
              <ClipboardList size={22} />
              Pedidos de Cliente
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {loading ? "Cargando..." : `${orders.length} pedido(s) registrado(s)`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-zinc-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por cliente, teléfono, email o ISBN..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 border-t-zinc-600" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 py-12 text-zinc-400">
              <ClipboardList size={40} />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12 text-zinc-400">
              <ClipboardList size={40} />
              <p className="text-sm">
                {searchQuery.trim()
                  ? "No se encontraron pedidos con ese filtro"
                  : "No hay pedidos de cliente registrados"}
              </p>
            </div>
          )}

          {!loading && !error && filteredOrders.length > 0 && (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Customer info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                        <User size={14} />
                        <span className="font-medium text-zinc-900 truncate">
                          {order.customer?.name || "Cliente desconocido"}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-zinc-500 ml-6">
                        {order.customer?.phone && (
                          <p>Tel: {order.customer.phone}</p>
                        )}
                        {order.customer?.email && (
                          <p>Email: {order.customer.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Book info */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1 justify-end">
                        <BookOpen size={14} />
                        <span className="font-medium text-zinc-900 truncate max-w-[180px] inline-block">
                          {order.bookTitle || "Libro no encontrado"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mb-1">
                        {order.isbn}
                      </p>
                      <p className="text-lg font-bold text-zinc-900">
                        {order.quantity} ud.
                      </p>
                      <p className={`text-xs mt-1 ${
                        order.bookStock !== null && order.bookStock > 0
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}>
                        Stock: {order.bookStock !== null ? order.bookStock : "N/A"}
                      </p>
                    </div>

                    {/* Delete button */}
                    <div className="shrink-0 flex flex-col items-end gap-2 pt-1">
                      {/* Complete order button */}
                      {order.bookStock !== null && order.bookStock >= order.quantity && (
                        <button
                          onClick={() => handleComplete(order)}
                          disabled={completingId === order.id}
                          className="
                            flex items-center gap-1.5
                            px-3 py-1.5 rounded-lg
                            bg-emerald-600 text-white text-xs font-medium
                            hover:bg-emerald-700 transition
                            cursor-pointer disabled:opacity-50
                          "
                        >
                          <ShoppingCart size={14} />
                          {completingId === order.id ? "Procesando..." : "Completar pedido"}
                        </button>
                      )}

                      {confirmDeleteId === order.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(order.id)}
                            disabled={deletingId === order.id || completingId === order.id}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === order.id ? "Eliminando..." : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={deletingId === order.id || completingId === order.id}
                            className="px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-600 text-xs font-medium hover:bg-zinc-100 transition cursor-pointer disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(order.id)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Eliminar pedido"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-zinc-200">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
