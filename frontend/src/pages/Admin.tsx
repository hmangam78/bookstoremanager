import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Sidebar } from "../components/Sidebar";
import { Hero } from "../components/Hero";
import { Search, Calendar, BookText, Activity, Package, Archive, ListPlus, RotateCcw, Trash2, LogOut, Lock, Send, Inbox, CheckCircle2, AlertCircle, X, ClipboardList, Plus } from "lucide-react";
import { getBooks, type Book } from "../services/books";
import { getMovementsByISBN, type StockMovement, getUncatalogued, type UncataloguedItem, getBookByISBN } from "../services/stockReceipt";
import { api } from "../lib/api";
import { LoginModal } from "../components/LoginModal";
import { checkSession, logout, isAuthenticated, isAdmin } from "../services/auth";
import { useNavigate } from "react-router-dom";
import {
  createProviderReturn,
  getActiveProviderReturns,
  getFinishedProviderReturns,
  getProviderReturnById,
  sendProviderReturn,
  type ProviderReturnResponse,
} from "../services/providerReturns";

function formatDateFromISO(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function returnIdLabel(entry: { id: number; reference?: string | null }): string {
  if (entry.reference) return `#${entry.id} · ${entry.reference}`;
  return `#${entry.id}`;
}

export default function Admin() {
  const navigate = useNavigate();
  const [movementQuery, setMovementQuery] = useState("");
  const [movementDesde, setMovementDesde] = useState<Date | null>(null);
  const [movementHasta, setMovementHasta] = useState<Date | null>(null);
  const [movements, setMovements] = useState<StockMovement[] | null>(null);
  const [movementBook, setMovementBook] = useState<Book | null>(null);
  const [movementLoading, setMovementLoading] = useState(false);
  const [movementError, setMovementError] = useState("");

  // Inventory state
  const [cataloguedBooks, setCataloguedBooks] = useState<Book[] | null>(null);
  const [uncataloguedItems, setUncataloguedItems] = useState<UncataloguedItem[] | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);

  // Stock adjustment state
  const [adjustQuery, setAdjustQuery] = useState("");
  const [adjustSearchResult, setAdjustSearchResult] = useState<Book | null>(null);
  const [actualStock, setActualStock] = useState("");
  const [adjustItems, setAdjustItems] = useState<Array<{ isbn: string; title: string; theoreticalStock: number; actualStock: number }>>([]);
  const [adjustSearchLoading, setAdjustSearchLoading] = useState(false);
  const [adjustSearchError, setAdjustSearchError] = useState("");
  const [adjustConfirming, setAdjustConfirming] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  // Provider return state
  const [returnLoadingSubmit, setReturnLoadingSubmit] = useState(false);
  const [returnLoadingActive, setReturnLoadingActive] = useState(false);
  const [returnSendingId, setReturnSendingId] = useState<number | null>(null);
  const [returnShowActive, setReturnShowActive] = useState(false);
  const [returnShowNewModal, setReturnShowNewModal] = useState(false);
  const [returnShowFinished, setReturnShowFinished] = useState(false);
  const [returnActiveList, setReturnActiveList] = useState<ProviderReturnResponse[]>([]);
  const [returnFinishedList, setReturnFinishedList] = useState<ProviderReturnResponse[]>([]);
  const [returnSelected, setReturnSelected] = useState<ProviderReturnResponse | null>(null);
  const [returnError, setReturnError] = useState("");

  // New return modal state
  const [newReturnISBN, setNewReturnISBN] = useState("");
  const [newReturnQty, setNewReturnQty] = useState(1);
  const [newReturnBook, setNewReturnBook] = useState<Book | null>(null);
  const [newReturnBookLoading, setNewReturnBookLoading] = useState(false);
  const [newReturnBookError, setNewReturnBookError] = useState("");
  const [newReturnItems, setNewReturnItems] = useState<Array<{ isbn: string; title: string; quantity: number }>>([]);
  const [newReturnReference, setNewReturnReference] = useState("");
  const [newReturnResult, setNewReturnResult] = useState<ProviderReturnResponse[] | null>(null);

  // Auth state
  const [showLogin, setShowLogin] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      setAuthorized(true);
    } else {
      setShowLogin(true);
    }
  }, []);

  const handleLoginSuccess = (level: string) => {
    setAuthorized(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCloseLogin = () => {
    navigate("/");
  };

  const handleLoadInventory = async () => {
    setInventoryLoading(true);
    setInventoryLoaded(false);
    setCataloguedBooks(null);
    setUncataloguedItems(null);

    try {
      const [{ data: books }, { data: uncats }] = await Promise.all([
        getBooks(),
        getUncatalogued(),
      ]);
      setCataloguedBooks(books);
      setUncataloguedItems(uncats);
      setInventoryLoaded(true);
    } catch (error) {
      console.error("Error al cargar el inventario:", error);
      alert("Error al cargar el inventario.");
    } finally {
      setInventoryLoading(false);
    }
  };


  const handleSearchMovements = async () => {
    const query = movementQuery.trim();
    if (!query) return;

    setMovementLoading(true);
    setMovements(null);
    setMovementBook(null);
    setMovementError("");

    try {
      const { data: books } = await getBooks(query);
      if (books.length === 0) {
        setMovementError("No se encontró ningún libro con ese criterio.");
        return;
      }

      const book = books[0];
      setMovementBook(book);
      setMovementError("");

      const { data: movementsData } = await getMovementsByISBN(book.isbn);

      let filtered = movementsData;
      if (movementDesde) {
        const fromDate = new Date(movementDesde);
        fromDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(m => new Date(m.createdAt) >= fromDate);
      }
      if (movementHasta) {
        const toDate = new Date(movementHasta);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(m => new Date(m.createdAt) <= toDate);
      }

      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      setMovements(filtered);
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
      setMovementError("Error al buscar movimientos.");
    } finally {
      setMovementLoading(false);
    }
  };

  const handleSearchForAdjust = async () => {
    const query = adjustQuery.trim();
    if (!query) return;

    setAdjustSearchLoading(true);
    setAdjustSearchResult(null);
    setActualStock("");
    setAdjustSearchError("");

    try {
      const { data: books } = await getBooks(query);
      if (books.length === 0) {
        setAdjustSearchError("No se encontró ningún libro con ese criterio.");
        return;
      }

      const book = books[0];
      setAdjustSearchResult(book);
    } catch (error) {
      console.error("Error al buscar libro:", error);
      setAdjustSearchError("Error al buscar el libro.");
    } finally {
      setAdjustSearchLoading(false);
    }
  };

  const handleAddToAdjustList = () => {
    if (!adjustSearchResult) return;

    const parsedActualStock = parseInt(actualStock, 10);
    if (isNaN(parsedActualStock) || parsedActualStock < 0) {
      setAdjustSearchError("El stock real debe ser un número entero no negativo.");
      return;
    }

    if (adjustItems.some(item => item.isbn === adjustSearchResult.isbn)) {
      setAdjustSearchError("Este ISBN ya está en la lista de ajuste.");
      return;
    }

    setAdjustItems(prev => [
      ...prev,
      {
        isbn: adjustSearchResult.isbn,
        title: adjustSearchResult.title,
        theoreticalStock: adjustSearchResult.stock,
        actualStock: parsedActualStock,
      },
    ]);

    setAdjustQuery("");
    setAdjustSearchResult(null);
    setActualStock("");
    setAdjustSearchError("");
  };

  const handleRemoveAdjustItem = (isbn: string) => {
    setAdjustItems(prev => prev.filter(item => item.isbn !== isbn));
  };

  const handleConfirmAdjustments = async () => {
    if (adjustItems.length === 0) return;

    setAdjustConfirming(true);
    setAdjustSuccess(false);

    try {
      const payload = adjustItems.map(item => ({
        isbn: item.isbn,
        quantity: item.actualStock - item.theoreticalStock,
      }));

      await api.post("/inventory-adjustment/adjustStock", payload);

      setAdjustSuccess(true);
      setAdjustItems([]);
    } catch (error) {
      console.error("Error al confirmar ajustes:", error);
      alert("Error al realizar los ajustes de stock.");
    } finally {
      setAdjustConfirming(false);
    }
  };

  // New return modal handlers
  const handleNewReturnSearchBook = async () => {
    const isbn = newReturnISBN.trim().replace(/-/g, "");
    if (!isbn) return;
    setNewReturnBookLoading(true);
    setNewReturnBook(null);
    setNewReturnBookError("");
    try {
      const response = await getBookByISBN(isbn);
      console.log("[Admin] getBookByISBN response:", response);
      const book = response.data;
      console.log("[Admin] book from response.data:", book);
      if (book === null || book === undefined) {
        setNewReturnBookError("No se encontró un libro con ese ISBN.");
        return;
      }
      if (!book.isbn) {
        console.warn("[Admin] Book found but has no isbn property:", book);
        setNewReturnBookError("No se encontró un libro con ese ISBN.");
        return;
      }
      setNewReturnBook(book as Book);
    } catch (err) {
      console.error("[Admin] Error al buscar libro por ISBN:", err);
      const axiosErr = err as { response?: { status?: number; data?: unknown }; message?: string };
      if (axiosErr.response) {
        console.error("[Admin] Error response:", axiosErr.response.status, axiosErr.response.data);
      }
      setNewReturnBookError(`Error al buscar el libro: ${axiosErr.message || "Verifica el ISBN."}`);
    } finally {
      setNewReturnBookLoading(false);
    }
  };

  const handleNewReturnAddItem = () => {
    if (!newReturnBook) return;
    setNewReturnItems((prev) => {
      const existing = prev.find((i) => i.isbn === newReturnBook.isbn);
      if (existing) {
        return prev.map((i) =>
          i.isbn === newReturnBook.isbn
            ? { ...i, quantity: Math.min(i.quantity + newReturnQty, newReturnBook.stock) }
            : i
        );
      }
      return [...prev, { isbn: newReturnBook.isbn, title: newReturnBook.title, quantity: newReturnQty }];
    });
    setNewReturnBook(null);
    setNewReturnISBN("");
    setNewReturnQty(1);
  };

  const handleNewReturnRemoveItem = (isbn: string) => {
    setNewReturnItems((prev) => prev.filter((i) => i.isbn !== isbn));
  };

  const handleNewReturnSubmit = async () => {
    if (newReturnItems.length === 0) return;
    setReturnLoadingSubmit(true);
    setReturnError("");
    setNewReturnResult(null);
    try {
      const { data } = await createProviderReturn(
        newReturnItems.map((i) => ({ isbn: i.isbn, quantity: i.quantity })),
        newReturnReference.trim() || undefined
      );
      setNewReturnResult(data);
      setNewReturnItems([]);
      setReturnShowNewModal(false);
    } catch (err) {
      console.error("Error creating provider return:", err);
      setReturnError("No se pudo crear la devolución a proveedor");
    } finally {
      setReturnLoadingSubmit(false);
    }
  };

  const handleNewReturnModalClose = () => {
    setReturnShowNewModal(false);
    setNewReturnISBN("");
    setNewReturnQty(1);
    setNewReturnBook(null);
    setNewReturnBookError("");
    setNewReturnItems([]);
    setNewReturnReference("");
    setNewReturnResult(null);
  };

  const handleReturnLoadActive = async () => {
    setReturnLoadingActive(true);
    setReturnError("");
    try {
      const { data } = await getActiveProviderReturns();
      setReturnActiveList(data || []);
      setReturnShowActive(true);
      setReturnShowFinished(false);
      setReturnSelected((current) => current ?? (data?.length ? data[0] : null));
    } catch (err) {
      console.error("Error loading active provider returns:", err);
      setReturnError("No se pudieron cargar las devoluciones activas");
    } finally {
      setReturnLoadingActive(false);
    }
  };

  const handleReturnLoadFinished = async () => {
    setReturnLoadingActive(true);
    setReturnError("");
    try {
      const { data } = await getFinishedProviderReturns();
      setReturnFinishedList(data || []);
      setReturnShowFinished(true);
      setReturnShowActive(false);
      setReturnSelected((current) => current ?? (data?.length ? data[0] : null));
    } catch (err) {
      console.error("Error loading finished provider returns:", err);
      setReturnError("No se pudieron cargar las devoluciones finalizadas");
    } finally {
      setReturnLoadingActive(false);
    }
  };

  const handleReturnSelect = async (entry: ProviderReturnResponse) => {
    setReturnSelected(entry);
    // If we have a finished return and need full details, fetch by id
    if (returnShowFinished) {
      try {
        const { data } = await getProviderReturnById(entry.id);
        setReturnSelected(data);
      } catch {
        // fallback to what we have
      }
    }
  };

  const handleReturnSend = async () => {
    if (!returnSelected) return;
    setReturnSendingId(returnSelected.id);
    setReturnError("");
    try {
      const { data } = await sendProviderReturn(returnSelected.id);
      setReturnActiveList((current) =>
        current.map((item) => (item.id === data.id ? data : item)).filter((item) => item.status === "pending")
      );
      setReturnSelected(data);
      if (data.status !== "pending") {
        setReturnActiveList((current) => current.filter((item) => item.id !== data.id));
      }
    } catch (err) {
      console.error("Error sending provider return:", err);
      setReturnError("No se pudo enviar la devolución");
    } finally {
      setReturnSendingId(null);
    }
  };

  const datePickerClass = `
    w-full rounded-xl border border-zinc-200
    bg-zinc-50 pl-10 pr-4 py-3 text-sm
    focus:outline-none focus:ring-2 focus:ring-zinc-400
  `;

  return (
    <div className="min-h-screen bg-zinc-100">
      <Hero />
      <main className="grid grid-cols-12 gap-4 lg:gap-6 p-4 lg:p-6">
        <aside className="col-span-1 lg:col-span-2 self-start">
          <Sidebar />
        </aside>

        <section className="col-span-11 lg:col-span-10 flex flex-col gap-4 lg:gap-6">
          {/* Login modal */}
          {showLogin && (
            <LoginModal
              onSuccess={handleLoginSuccess}
              onClose={handleCloseLogin}
              title="Acceso de Administrador"
            />
          )}

          {!authorized && !showLogin && (
            <div className="rounded-2xl bg-white p-12 shadow-sm border border-zinc-200 flex flex-col items-center justify-center gap-4">
              <Lock size={48} className="text-zinc-300" />
              <h2 className="text-xl font-semibold text-zinc-500">Acceso restringido</h2>
              <p className="text-zinc-400 text-sm">Debes iniciar sesión como administrador para acceder a esta página.</p>
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition hover:bg-zinc-800 cursor-pointer"
              >
                <Lock size={18} />
                Iniciar sesión
              </button>
            </div>
          )}

          {authorized && (
          <>
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">Administración</h1>
              <p className="mt-2 text-zinc-600">
                Trazabilidad de stock, ajustes, inventario y devoluciones a proveedor
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>

          {/* Movimientos de Stock */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <Activity size={22} className="text-zinc-500" />
              Movimientos de Stock
            </h2>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-[2] min-w-[200px]">
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  ISBN, Título o Autor
                </label>
                <div className="relative">
                  <BookText
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="text"
                    value={movementQuery}
                    onChange={(e) => setMovementQuery(e.target.value)}
                    placeholder="Ej: 978-84... / El Quijote"
                    className="
                      w-full rounded-xl border border-zinc-200
                      bg-zinc-50 pl-10 pr-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-zinc-400
                    "
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Desde <span className="text-zinc-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10"
                  />
                  <DatePicker
                    selected={movementDesde}
                    onChange={(date) => setMovementDesde(date)}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="DD-MM-YYYY"
                    className={datePickerClass}
                    isClearable
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Hasta <span className="text-zinc-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10"
                  />
                  <DatePicker
                    selected={movementHasta}
                    onChange={(date) => setMovementHasta(date)}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="DD-MM-YYYY"
                    className={datePickerClass}
                    isClearable
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearchMovements}
                  disabled={!movementQuery.trim() || movementLoading}
                  className="
                    flex items-center gap-2
                    rounded-xl bg-zinc-900 px-6 py-3
                    font-medium text-white
                    transition hover:bg-zinc-800
                    disabled:opacity-50 disabled:cursor-not-allowed
                    cursor-pointer
                  "
                >
                  <Search size={20} />
                  {movementLoading ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </div>

            {/* Error */}
            {movementError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
                <p className="text-sm text-red-700">{movementError}</p>
              </div>
            )}

            {/* No movements found */}
            {movements !== null && movements.length === 0 && (
              <p className="text-zinc-500 text-sm">No se encontraron movimientos para este artículo.</p>
            )}

            {/* Results */}
            {movements !== null && movements.length > 0 && movementBook && (
              <>
                {/* Summary card */}
                <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-5 mb-6">
                  <h3 className="text-base font-semibold text-zinc-900 mb-3">{movementBook.title}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500">Autor</span>
                      <p className="font-medium text-zinc-900">{movementBook.author}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">ISBN</span>
                      <p className="font-mono text-sm text-zinc-700">{movementBook.isbn}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Stock Actual</span>
                      <p className="font-semibold text-zinc-900">{movementBook.stock}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Primer Movimiento</span>
                      <p className="font-medium text-zinc-900">{formatDateFromISO(movements[0].createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Último Movimiento</span>
                      <p className="font-medium text-zinc-900">{formatDateFromISO(movements[movements.length - 1].createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Movements table */}
                <div className="overflow-hidden rounded-xl border border-zinc-200">
                  <table className="w-full text-sm text-left text-zinc-700">
                    <thead className="text-xs uppercase bg-zinc-100 text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">Fecha</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Cantidad</th>
                        <th className="px-4 py-3 rounded-r-xl">Referencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((mov) => (
                        <tr key={mov.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                          <td className="px-4 py-3 whitespace-nowrap">{formatDateFromISO(mov.createdAt)}</td>
                          <td className="px-4 py-3">
                            {mov.type === 'stock captured' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Entrada
                              </span>
                            ) : mov.type === 'sale' || mov.type === 'Sale' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Venta
                              </span>
                            ) : mov.type === 'return' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                Devolución
                              </span>
                            ) : mov.type === 'Devolución a proveedor' || mov.type === 'provider return' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                Dev. proveedor
                              </span>
                            ) : mov.type === 'Inventory adjustment' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Ajuste
                              </span>
                            ) : (
                              <span className="text-zinc-500">{mov.type}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={mov.quantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                            {mov.type === 'Devolución a proveedor' || mov.type === 'provider return' ? (
                              <span title={`Albarán devolución #${mov.reference}`}>
                                #{mov.reference}
                              </span>
                            ) : (
                              mov.reference || "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Ajuste de Stock */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <RotateCcw size={22} className="text-zinc-500" />
              Ajuste de Stock
            </h2>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-[2] min-w-[200px]">
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  ISBN, Título o Autor
                </label>
                <div className="relative">
                  <BookText
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="text"
                    value={adjustQuery}
                    onChange={(e) => setAdjustQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearchForAdjust(); }}
                    placeholder="Ej: 978-84... / El Quijote"
                    className="
                      w-full rounded-xl border border-zinc-200
                      bg-zinc-50 pl-10 pr-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-zinc-400
                    "
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearchForAdjust}
                  disabled={!adjustQuery.trim() || adjustSearchLoading}
                  className="
                    flex items-center gap-2
                    rounded-xl bg-zinc-900 px-6 py-3
                    font-medium text-white
                    transition hover:bg-zinc-800
                    disabled:opacity-50 disabled:cursor-not-allowed
                    cursor-pointer
                  "
                >
                  <Search size={20} />
                  {adjustSearchLoading ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </div>

            {/* Search error */}
            {adjustSearchError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
                <p className="text-sm text-red-700">{adjustSearchError}</p>
              </div>
            )}

            {/* Search result */}
            {adjustSearchResult && (
              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm items-end">
                  <div>
                    <span className="text-zinc-500 text-xs">ISBN</span>
                    <p className="font-mono text-sm text-zinc-700">{adjustSearchResult.isbn}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs">Título</span>
                    <p className="font-medium text-zinc-900">{adjustSearchResult.title}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs">Stock Teórico (BD)</span>
                    <p className="font-semibold text-zinc-900">{adjustSearchResult.stock}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Stock Real
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={actualStock}
                      onChange={(e) => setActualStock(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddToAdjustList(); }}
                      placeholder="Ej: 25"
                      className="
                        w-full rounded-lg border border-zinc-300
                        bg-white px-3 py-2 text-sm
                        focus:outline-none focus:ring-2 focus:ring-zinc-400
                      "
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAddToAdjustList}
                    disabled={!actualStock.trim()}
                    className="
                      flex items-center gap-2
                      rounded-xl bg-zinc-800 px-5 py-2.5
                      text-sm font-medium text-white
                      transition hover:bg-zinc-700
                      disabled:opacity-50 disabled:cursor-not-allowed
                      cursor-pointer
                    "
                  >
                    <ListPlus size={18} />
                    Añadir a la lista
                  </button>
                </div>
              </div>
            )}

            {/* Adjustments list */}
            {adjustItems.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-zinc-700 mb-2">
                  Elementos a ajustar ({adjustItems.length})
                </h3>
                <div className="overflow-hidden rounded-xl border border-zinc-200">
                  <table className="w-full text-sm text-left text-zinc-700">
                    <thead className="text-xs uppercase bg-zinc-100 text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">ISBN</th>
                        <th className="px-4 py-3">Título</th>
                        <th className="px-4 py-3">Stock Teórico</th>
                        <th className="px-4 py-3">Stock Real</th>
                        <th className="px-4 py-3">Diferencia</th>
                        <th className="px-4 py-3 rounded-r-xl"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustItems.map((item) => (
                        <tr key={item.isbn} className="border-t border-zinc-100 hover:bg-zinc-50">
                          <td className="px-4 py-3 font-mono text-xs text-zinc-500">{item.isbn}</td>
                          <td className="px-4 py-3 font-medium">{item.title}</td>
                          <td className="px-4 py-3">{item.theoreticalStock}</td>
                          <td className="px-4 py-3 font-semibold">{item.actualStock}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${item.actualStock - item.theoreticalStock > 0 ? 'text-green-600' : item.actualStock - item.theoreticalStock < 0 ? 'text-red-600' : 'text-zinc-500'}`}>
                              {item.actualStock - item.theoreticalStock > 0 ? `+${item.actualStock - item.theoreticalStock}` : item.actualStock - item.theoreticalStock}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleRemoveAdjustItem(item.isbn)}
                              className="text-zinc-400 hover:text-red-600 transition cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleConfirmAdjustments}
                    disabled={adjustConfirming}
                    className="
                      flex items-center gap-2
                      rounded-xl bg-zinc-900 px-6 py-3
                      font-medium text-white
                      transition hover:bg-zinc-800
                      disabled:opacity-50 disabled:cursor-not-allowed
                      cursor-pointer
                    "
                  >
                    <RotateCcw size={20} />
                    {adjustConfirming ? "Ajustando..." : "Confirmar Ajustes"}
                  </button>
                </div>
              </div>
            )}

            {adjustSuccess && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-sm text-green-700">Ajustes de stock realizados correctamente.</p>
              </div>
            )}
          </div>

          {/* Inventario General */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
                <Package size={22} className="text-zinc-500" />
                Inventario General
              </h2>
              <button
                onClick={handleLoadInventory}
                disabled={inventoryLoading}
                className="
                  flex items-center gap-2
                  rounded-xl bg-zinc-900 px-6 py-3
                  font-medium text-white
                  transition hover:bg-zinc-800
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer
                "
              >
                <Archive size={20} />
                {inventoryLoading ? "Cargando..." : "Cargar Inventario"}
              </button>
            </div>

            {inventoryLoaded && cataloguedBooks !== null && (
              <>
                {/* Summary */}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-6">
                  <div>
                    <span className="text-zinc-500">Libros catalogados: </span>
                    <span className="font-semibold">{cataloguedBooks.length}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Unidades totales: </span>
                    <span className="font-semibold">
                      {cataloguedBooks.reduce((sum, b) => sum + b.stock, 0)}
                    </span>
                  </div>
                  {uncataloguedItems && uncataloguedItems.length > 0 && (
                    <div>
                      <span className="text-zinc-500">Sin catalogar: </span>
                      <span className="font-semibold text-amber-600">{uncataloguedItems.length} referencias</span>
                    </div>
                  )}
                </div>

                {/* Catalogued books table */}
                <h3 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-1">
                  <BookText size={16} />
                  Libros Catalogados
                </h3>
                <div className="overflow-hidden rounded-xl border border-zinc-200 mb-6">
                  <table className="w-full text-sm text-left text-zinc-700">
                    <thead className="text-xs uppercase bg-zinc-100 text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">ISBN</th>
                        <th className="px-4 py-3">Título</th>
                        <th className="px-4 py-3">Autor</th>
                        <th className="px-4 py-3 rounded-r-xl">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cataloguedBooks.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                            No hay libros catalogados.
                          </td>
                        </tr>
                      ) : (
                        cataloguedBooks.map((book) => (
                          <tr key={book.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                            <td className="px-4 py-3 font-mono text-xs text-zinc-500">{book.isbn}</td>
                            <td className="px-4 py-3 font-medium">{book.title}</td>
                            <td className="px-4 py-3 text-zinc-600">{book.author}</td>
                            <td className="px-4 py-3">
                              <span className={`font-semibold ${book.stock === 0 ? 'text-red-500' : 'text-zinc-900'}`}>
                                {book.stock}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Uncatalogued items table */}
                {uncataloguedItems && uncataloguedItems.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-1">
                      <Archive size={16} className="text-amber-500" />
                      Sin Catalogar
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-amber-200">
                      <table className="w-full text-sm text-left text-zinc-700">
                        <thead className="text-xs uppercase bg-amber-50 text-amber-700">
                          <tr>
                            <th className="px-4 py-3 rounded-l-xl">ISBN</th>
                            <th className="px-4 py-3 rounded-r-xl">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uncataloguedItems.map((item) => (
                            <tr key={item.id} className="border-t border-amber-100 hover:bg-amber-50">
                              <td className="px-4 py-3 font-mono text-xs text-zinc-500">{item.isbn}</td>
                              <td className="px-4 py-3 font-semibold">{item.stock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}

            {!inventoryLoaded && !inventoryLoading && (
              <p className="text-zinc-500 text-sm">
                Presiona "Cargar Inventario" para ver todos los libros y referencias sin catalogar.
              </p>
            )}
          </div>

          {/* Devoluciones a Proveedor */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
                <RotateCcw size={22} className="text-zinc-500" />
                Devoluciones a Proveedor
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => {
                    setReturnShowNewModal(true);
                    setNewReturnResult(null);
                    setReturnError("");
                  }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 cursor-pointer"
                >
                  <Plus size={16} />
                  Nueva devolución
                </button>
                <button
                  onClick={handleReturnLoadActive}
                  disabled={returnLoadingActive}
                  className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Inbox size={16} />
                  {returnLoadingActive ? "Cargando..." : "Ver devoluciones activas"}
                </button>
                {returnShowActive && (
                  <button
                    onClick={() => { setReturnShowActive(false); setReturnSelected(null); }}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 cursor-pointer"
                  >
                    <X size={16} />
                    Cerrar revisión
                  </button>
                )}
                <button
                  onClick={handleReturnLoadFinished}
                  disabled={returnLoadingActive}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ClipboardList size={16} />
                  {returnLoadingActive ? "Cargando..." : "Ver finalizadas"}
                </button>
                {returnShowFinished && (
                  <button
                    onClick={() => { setReturnShowFinished(false); setReturnSelected(null); }}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 cursor-pointer"
                  >
                    <X size={16} />
                    Cerrar finalizadas
                  </button>
                )}
              </div>
            </div>

            {returnError && (
              <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 mb-4 text-sm text-red-700">
                <AlertCircle size={18} />
                {returnError}
              </div>
            )}

            {/* Success result */}
            {newReturnResult && newReturnResult.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 mb-4">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <p className="text-sm text-emerald-700">
                    Devolución creada correctamente. Se generaron {newReturnResult.length} albarán(es).
                  </p>
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  {newReturnResult.map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900">{entry.publisher.publisherName}</h3>
                          <p className="text-sm text-zinc-600">
                            Proveedor: {entry.provider?.name ?? "Sin proveedor asignado"}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">{returnIdLabel(entry)}</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {entry.items.map((item) => (
                          <div key={item.isbn} className="flex items-center justify-between rounded-xl bg-white px-4 py-2 text-sm">
                            <span className="font-mono text-zinc-500">{item.isbn}</span>
                            <span className="font-semibold text-zinc-900">{item.quantity} ud.</span>
                          </div>
                        ))}
                      </div>
                    </div>
                ))}
                </div>
              </div>
            )}

            {/* Active returns review */}
            {returnShowActive && (
              <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)] mb-6">
                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-zinc-200 px-5 py-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">Devoluciones activas</h3>
                      <p className="text-sm text-zinc-500">Pendientes de enviar al distribuidor</p>
                    </div>
                    <ClipboardList size={18} className="text-zinc-400" />
                  </div>
                  <div className="max-h-[45vh] overflow-auto p-3 space-y-2">
                    {returnActiveList.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
                        No hay devoluciones activas.
                      </div>
                    ) : (
                      returnActiveList.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => setReturnSelected(entry)}
                          className={`w-full rounded-xl border px-4 py-3 text-left transition cursor-pointer ${
                            returnSelected?.id === entry.id
                              ? "border-zinc-900 bg-zinc-50"
                              : "border-zinc-200 bg-white hover:bg-zinc-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-zinc-900">{entry.publisher.publisherName}</p>
                              <p className="text-xs text-zinc-500">{entry.provider?.name ?? "Sin proveedor asignado"}</p>
                            </div>
                            <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">{returnIdLabel(entry)}</span>
                          </div>
                          <p className="mt-2 text-xs text-zinc-500">{entry.items.length} item(s)</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">Revisión</h3>
                      <p className="text-sm text-zinc-500">Inspecciona y confirma el envío</p>
                    </div>
                    {returnSelected && (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${returnSelected.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {returnSelected.status}
                      </span>
                    )}
                  </div>

                  {!returnSelected ? (
                    <div className="mt-6 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                      Selecciona una devolución activa para revisarla.
                    </div>
                  ) : (
                    <>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-zinc-50 p-4">
                          <p className="text-xs font-medium uppercase text-zinc-500">Albarán / Ref.</p>
                          <p className="mt-1 font-semibold text-zinc-900">{returnIdLabel(returnSelected)}</p>
                        </div>
                        <div className="rounded-xl bg-zinc-50 p-4">
                          <p className="text-xs font-medium uppercase text-zinc-500">Editorial</p>
                          <p className="mt-1 font-semibold text-zinc-900">{returnSelected.publisher.publisherName}</p>
                        </div>
                        <div className="rounded-xl bg-zinc-50 p-4">
                          <p className="text-xs font-medium uppercase text-zinc-500">Distribuidor</p>
                          <p className="mt-1 font-semibold text-zinc-900">{returnSelected.provider?.name ?? "Sin proveedor asignado"}</p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2 max-h-[35vh] overflow-auto pr-1">
                        {returnSelected.items.map((item) => (
                          <div key={item.isbn} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                            <span className="font-mono text-zinc-500">{item.isbn}</span>
                            <span className="font-semibold text-zinc-900">{item.quantity} ud.</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-zinc-200 pt-4">
                        <button
                          onClick={handleReturnSend}
                          disabled={!returnSelected || returnSelected.status !== "pending" || returnSendingId === returnSelected.id}
                          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Send size={16} />
                          {returnSendingId === returnSelected.id ? "Enviando..." : "Enviar al distribuidor"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Finished returns review */}
            {returnShowFinished && (
              <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)] mb-6">
                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-zinc-200 px-5 py-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">Devoluciones finalizadas</h3>
                      <p className="text-sm text-zinc-500">Enviadas, completadas o canceladas</p>
                    </div>
                    <ClipboardList size={18} className="text-zinc-400" />
                  </div>
                  <div className="max-h-[45vh] overflow-auto p-3 space-y-2">
                    {returnFinishedList.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
                        No hay devoluciones finalizadas.
                      </div>
                    ) : (
                      returnFinishedList.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => handleReturnSelect(entry)}
                          className={`w-full rounded-xl border px-4 py-3 text-left transition cursor-pointer ${
                            returnSelected?.id === entry.id
                              ? "border-zinc-900 bg-zinc-50"
                              : "border-zinc-200 bg-white hover:bg-zinc-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-zinc-900">{entry.publisher.publisherName}</p>
                              <p className="text-xs text-zinc-500">{entry.provider?.name ?? "Sin proveedor asignado"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">{returnIdLabel(entry)}</span>
                              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                entry.status === "sent" ? "bg-blue-100 text-blue-700" :
                                entry.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {entry.status === "sent" ? "Enviada" :
                                 entry.status === "completed" ? "Completada" :
                                 "Cancelada"}
                              </span>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-zinc-500">{entry.items.length} item(s)</p>
                          <p className="mt-1 text-xs text-zinc-400">Creada: {formatDateFromISO(entry.createdAt)}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">Detalle</h3>
                      <p className="text-sm text-zinc-500">Información completa de la devolución</p>
                    </div>
                    {returnSelected && (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        returnSelected.status === "sent" ? "bg-blue-100 text-blue-700" :
                        returnSelected.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {returnSelected.status === "sent" ? "Enviada" :
                         returnSelected.status === "completed" ? "Completada" :
                         "Cancelada"}
                      </span>
                    )}
                  </div>

                  {!returnSelected ? (
                    <div className="mt-6 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                      Selecciona una devolución finalizada para ver sus detalles.
                    </div>
                  ) : (
                    <>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-zinc-50 p-4">
                          <p className="text-xs font-medium uppercase text-zinc-500">Albarán / Ref.</p>
                          <p className="mt-1 font-semibold text-zinc-900">{returnIdLabel(returnSelected)}</p>
                        </div>
                        <div className="rounded-xl bg-zinc-50 p-4">
                          <p className="text-xs font-medium uppercase text-zinc-500">Editorial</p>
                          <p className="mt-1 font-semibold text-zinc-900">{returnSelected.publisher.publisherName}</p>
                        </div>
                        <div className="rounded-xl bg-zinc-50 p-4">
                          <p className="text-xs font-medium uppercase text-zinc-500">Distribuidor</p>
                          <p className="mt-1 font-semibold text-zinc-900">{returnSelected.provider?.name ?? "Sin proveedor asignado"}</p>
                        </div>
                        <div className="rounded-xl bg-zinc-50 p-4">
                          <p className="text-xs font-medium uppercase text-zinc-500">Fecha de creación</p>
                          <p className="mt-1 font-semibold text-zinc-900">{formatDateFromISO(returnSelected.createdAt)}</p>
                        </div>
                        <div className="rounded-xl bg-zinc-50 p-4">
                          <p className="text-xs font-medium uppercase text-zinc-500">Última actualización</p>
                          <p className="mt-1 font-semibold text-zinc-900">{formatDateFromISO(returnSelected.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <h4 className="text-sm font-semibold text-zinc-700 mb-3">Artículos devueltos</h4>
                        <div className="space-y-2 max-h-[30vh] overflow-auto pr-1">
                          {returnSelected.items.map((item) => (
                            <div key={item.isbn} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                              <span className="font-mono text-zinc-500">{item.isbn}</span>
                              <span className="font-semibold text-zinc-900">{item.quantity} ud.</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Nueva devolución modal */}
          {returnShowNewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-zinc-200 max-h-[90vh] flex flex-col">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900">Nueva devolución a proveedor</h3>
                    <p className="text-sm text-zinc-500">Introduce ISBN y cantidad para cada libro</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Referencia / Albarán</label>
                    <input
                      type="text"
                      value={newReturnReference}
                      onChange={(e) => setNewReturnReference(e.target.value)}
                      placeholder="Opcional..."
                      className="w-52 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    />
                  </div>
                  <button
                    onClick={handleNewReturnModalClose}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal body */}
                <div className="overflow-auto p-6 space-y-6 flex-1">
                  {/* ISBN input and search */}
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-[3] min-w-[200px]">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">ISBN</label>
                      <input
                        type="text"
                        value={newReturnISBN}
                        onChange={(e) => {
                          setNewReturnISBN(e.target.value);
                          setNewReturnBook(null);
                          setNewReturnBookError("");
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleNewReturnSearchBook(); }}
                        placeholder="Ej: 978-84..."
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                      />
                    </div>
                    <button
                      onClick={handleNewReturnSearchBook}
                      disabled={!newReturnISBN.trim() || newReturnBookLoading}
                      className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Search size={18} />
                      {newReturnBookLoading ? "Buscando..." : "Buscar"}
                    </button>
                  </div>

                  {/* Book found card */}
                  {newReturnBookError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      {newReturnBookError}
                    </div>
                  )}

                  {newReturnBook && (
                    <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-5">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                          <span className="text-zinc-500">Título</span>
                          <p className="font-medium text-zinc-900">{newReturnBook.title}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500">ISBN</span>
                          <p className="font-mono text-sm text-zinc-700">{newReturnBook.isbn}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Editorial</span>
                          <p className="font-medium text-zinc-900">
                            {typeof newReturnBook.publisher === "object" && newReturnBook.publisher
                              ? newReturnBook.publisher.publisherName
                              : newReturnBook.publisher || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Proveedor</span>
                          <p className="font-medium text-zinc-900">
                            {typeof newReturnBook.distributor === "object" && newReturnBook.distributor
                              ? newReturnBook.distributor.name
                              : newReturnBook.distributor || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Stock actual</span>
                          <p className="font-semibold text-zinc-900">{newReturnBook.stock}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-zinc-700">Cantidad a devolver:</label>
                          <input
                            type="number"
                            min={1}
                            max={newReturnBook.stock}
                            value={newReturnQty}
                            onChange={(e) => setNewReturnQty(Math.max(1, Math.min(Number(e.target.value), newReturnBook.stock)))}
                            className="w-24 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                          />
                        </div>
                        <button
                          onClick={handleNewReturnAddItem}
                          disabled={newReturnBook.stock <= 0}
                          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Plus size={18} />
                          Añadir a la lista
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Items list */}
                  {newReturnItems.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-700 mb-3">
                        Libros a devolver ({newReturnItems.length})
                      </h4>
                      <div className="space-y-2">
                        {newReturnItems.map((item) => (
                          <div key={item.isbn} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm">
                            <div className="flex items-center gap-4 min-w-0">
                              <span className="font-mono text-xs text-zinc-500 shrink-0">{item.isbn}</span>
                              <span className="font-medium text-zinc-900 truncate">{item.title}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-semibold text-zinc-900">{item.quantity} ud.</span>
                              <button
                                onClick={() => handleNewReturnRemoveItem(item.isbn)}
                                className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 bg-zinc-50 rounded-b-2xl">
                  <button
                    onClick={handleNewReturnModalClose}
                    className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleNewReturnSubmit}
                    disabled={returnLoadingSubmit || newReturnItems.length === 0}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send size={16} />
                    {returnLoadingSubmit ? "Creando..." : "Confirmar devolución"}
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
          )} {/* end authorized */}
        </section>
      </main>
    </div>
  );
}
