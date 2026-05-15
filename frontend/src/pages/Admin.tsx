import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Sidebar } from "../components/Sidebar";
import { Hero } from "../components/Hero";
import { Search, Calendar, BookText, Activity, Package, Archive, ListPlus, RotateCcw, Trash2 } from "lucide-react";
import { getBooks, type Book } from "../services/books";
import { getMovementsByISBN, type StockMovement, getUncatalogued, type UncataloguedItem } from "../services/stockReceipt";
import { api } from "../lib/api";

function formatDateFromISO(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function Admin() {
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

  const datePickerClass = `
    w-full rounded-xl border border-zinc-200
    bg-zinc-50 pl-10 pr-4 py-3 text-sm
    focus:outline-none focus:ring-2 focus:ring-zinc-400
  `;

  return (
    <div className="min-h-screen bg-zinc-100">
      <Hero />
      <main className="grid grid-cols-12 gap-6 p-6">
        <aside className="col-span-2">
          <Sidebar />
        </aside>

        <section className="col-span-10 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">Administración</h1>
              <p className="mt-2 text-zinc-600">
                Trazabilidad de movimientos de stock
              </p>
            </div>
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
                            {mov.reference || "—"}
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
                <div className="flex gap-6 text-sm mb-6">
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
        </section>
      </main>
    </div>
  );
}
