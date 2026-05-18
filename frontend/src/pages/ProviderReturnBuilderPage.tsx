import { useEffect, useMemo, useState } from "react";
import { Search, RotateCcw, Trash2, Send, PackageSearch, CheckCircle2, AlertCircle, Inbox, X, ClipboardList } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { Hero } from "../components/Hero";
import { getBooks, type Book } from "../services/books";
import {
  createProviderReturn,
  getActiveProviderReturns,
  sendProviderReturn,
  type ProviderReturnResponse,
} from "../services/providerReturns";

type ReturnLine = {
  book: Book;
  quantity: number;
};

export default function ProviderReturnBuilderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingActiveReturns, setLoadingActiveReturns] = useState(false);
  const [sendingReturnId, setSendingReturnId] = useState<number | null>(null);
  const [showActiveReturns, setShowActiveReturns] = useState(false);
  const [activeReturns, setActiveReturns] = useState<ProviderReturnResponse[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<ProviderReturnResponse | null>(null);
  const [error, setError] = useState("");
  const [lineQuantities, setLineQuantities] = useState<Record<number, number>>({});
  const [requestLines, setRequestLines] = useState<ReturnLine[]>([]);
  const [result, setResult] = useState<ProviderReturnResponse[] | null>(null);

  useEffect(() => {
    setLoadingBooks(true);
    const timer = setTimeout(() => {
      getBooks(searchQuery || undefined)
        .then(({ data }) => {
          setBooks(data || []);
          setError("");
        })
        .catch((err) => {
          console.error("Error loading books for return builder:", err);
          setError("No se pudieron cargar los libros");
          setBooks([]);
        })
        .finally(() => setLoadingBooks(false));
    }, searchQuery ? 250 : 0);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectedIsbns = useMemo(() => new Set(requestLines.map((line) => line.book.isbn)), [requestLines]);

  const totalItems = requestLines.reduce((sum, line) => sum + line.quantity, 0);

  const handleAddBook = (book: Book) => {
    const quantity = Math.max(1, Math.min(lineQuantities[book.id] ?? 1, book.stock));

    setRequestLines((current) => {
      const existingIndex = current.findIndex((line) => line.book.id === book.id);

      if (existingIndex >= 0) {
        const next = [...current];
        const updatedQuantity = Math.min(next[existingIndex].quantity + quantity, book.stock);
        next[existingIndex] = { ...next[existingIndex], quantity: updatedQuantity };
        return next;
      }

      return [...current, { book, quantity }];
    });

    setLineQuantities((current) => ({
      ...current,
      [book.id]: 1,
    }));
  };

  const handleUpdateQuantity = (bookId: number, quantity: number) => {
    setRequestLines((current) =>
      current.map((line) =>
        line.book.id === bookId
          ? { ...line, quantity: Math.max(1, Math.min(quantity, line.book.stock)) }
          : line
      )
    );
  };

  const handleRemoveLine = (bookId: number) => {
    setRequestLines((current) => current.filter((line) => line.book.id !== bookId));
  };

  const handleSubmit = async () => {
    if (requestLines.length === 0) return;

    setLoadingSubmit(true);
    setError("");
    setResult(null);

    try {
      const { data } = await createProviderReturn(
        requestLines.map((line) => ({
          isbn: line.book.isbn,
          quantity: line.quantity,
        }))
      );

      setResult(data);
      setRequestLines([]);
    } catch (err) {
      console.error("Error creating provider return:", err);
      setError("No se pudo crear la devolución a proveedor");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const clearRequest = () => {
    setRequestLines([]);
    setResult(null);
    setError("");
  };

  const loadActiveReturns = async () => {
    setLoadingActiveReturns(true);
    setError("");

    try {
      const { data } = await getActiveProviderReturns();
      setActiveReturns(data || []);
      setShowActiveReturns(true);
      if (data?.length) {
        setSelectedReturn((current) => current ?? data[0]);
      } else {
        setSelectedReturn(null);
      }
    } catch (err) {
      console.error("Error loading active provider returns:", err);
      setError("No se pudieron cargar las devoluciones activas");
    } finally {
      setLoadingActiveReturns(false);
    }
  };

  const handleSendSelectedReturn = async () => {
    if (!selectedReturn) return;

    setSendingReturnId(selectedReturn.id);
    setError("");

    try {
      const { data } = await sendProviderReturn(selectedReturn.id);
      setActiveReturns((current) =>
        current.map((item) => (item.id === data.id ? data : item)).filter((item) => item.status === "pending")
      );
      setSelectedReturn(data);
      setResult((current) => current);
      if (data.status !== "pending") {
        setActiveReturns((current) => current.filter((item) => item.id !== data.id));
      }
    } catch (err) {
      console.error("Error sending provider return:", err);
      setError("No se pudo enviar la devolución");
    } finally {
      setSendingReturnId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <Hero />

      <main className="grid grid-cols-12 gap-4 lg:gap-6 p-4 lg:p-6">
        <aside className="col-span-1 lg:col-span-2 self-start">
          <Sidebar />
        </aside>

        <section className="col-span-11 lg:col-span-10 flex flex-col gap-4 lg:gap-6">
          <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                  <RotateCcw size={14} />
                  Devolución a proveedor
                </div>
                <h1 className="mt-3 text-3xl font-bold text-zinc-900">Builder de devolución</h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                  Busca libros, añade cantidades y deja que el backend los separe automáticamente por editorial y proveedor.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
                <PackageSearch size={18} className="text-zinc-500" />
                {requestLines.length} línea(s) seleccionada(s) · {totalItems} unidad(es)
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadActiveReturns}
                disabled={loadingActiveReturns}
                className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Inbox size={16} />
                {loadingActiveReturns ? "Cargando..." : "Ver devoluciones activas"}
              </button>
              {showActiveReturns && (
                <button
                  onClick={() => {
                    setShowActiveReturns(false);
                    setSelectedReturn(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  <X size={16} />
                  Cerrar revisión
                </button>
              )}
            </div>

            <div className="relative max-w-2xl">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, autor o ISBN"
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {result && result.length > 0 && (
            <div className="grid gap-4 xl:grid-cols-2">
              {result.map((entry) => (
                <div key={entry.id} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 size={14} />
                        Creada
                      </div>
                      <h2 className="mt-3 text-xl font-bold text-zinc-900">{entry.publisher.publisherName}</h2>
                      <p className="mt-1 text-sm text-zinc-600">
                        Proveedor: {entry.provider?.name ?? "Sin proveedor asignado"}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                      #{entry.id}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {entry.items.map((item) => (
                      <div key={item.isbn} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm">
                        <span className="font-mono text-zinc-500">{item.isbn}</span>
                        <span className="font-semibold text-zinc-900">{item.quantity} ud.</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showActiveReturns && (
            <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
              <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-zinc-200 px-5 py-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">Devoluciones activas</h2>
                    <p className="text-sm text-zinc-500">Pendientes de enviar al distribuidor</p>
                  </div>
                  <ClipboardList size={18} className="text-zinc-400" />
                </div>

                <div className="max-h-[45vh] overflow-auto p-3 space-y-2">
                  {activeReturns.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
                      No hay devoluciones activas.
                    </div>
                  ) : (
                    activeReturns.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => setSelectedReturn(entry)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          selectedReturn?.id === entry.id
                            ? "border-zinc-900 bg-zinc-50"
                            : "border-zinc-200 bg-white hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-zinc-900">{entry.publisher.publisherName}</p>
                            <p className="text-xs text-zinc-500">
                              {entry.provider?.name ?? "Sin proveedor asignado"}
                            </p>
                          </div>
                          <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
                            #{entry.id}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-zinc-500">{entry.items.length} item(s)</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">Revisión</h2>
                    <p className="text-sm text-zinc-500">Inspecciona y confirma el envío</p>
                  </div>
                  {selectedReturn && (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedReturn.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {selectedReturn.status}
                    </span>
                  )}
                </div>

                {!selectedReturn ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                    Selecciona una devolución activa para revisarla.
                  </div>
                ) : (
                  <>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-zinc-50 p-4">
                        <p className="text-xs font-medium uppercase text-zinc-500">Editorial</p>
                        <p className="mt-1 font-semibold text-zinc-900">{selectedReturn.publisher.publisherName}</p>
                      </div>
                      <div className="rounded-2xl bg-zinc-50 p-4">
                        <p className="text-xs font-medium uppercase text-zinc-500">Distribuidor</p>
                        <p className="mt-1 font-semibold text-zinc-900">{selectedReturn.provider?.name ?? "Sin proveedor asignado"}</p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 max-h-[35vh] overflow-auto pr-1">
                      {selectedReturn.items.map((item) => (
                        <div key={item.isbn} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                          <span className="font-mono text-zinc-500">{item.isbn}</span>
                          <span className="font-semibold text-zinc-900">{item.quantity} ud.</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-zinc-200 pt-4">
                      <button
                        onClick={() => setShowActiveReturns(false)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                      >
                        <X size={16} />
                        Cerrar
                      </button>
                      <button
                        onClick={handleSendSelectedReturn}
                        disabled={selectedReturn.status !== "pending" || sendingReturnId === selectedReturn.id}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send size={16} />
                        {sendingReturnId === selectedReturn.id ? "Enviando..." : "Enviar al distribuidor"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
            <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-zinc-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-zinc-900">Libros disponibles</h2>
                <p className="text-sm text-zinc-500">Selecciona libros para agregarlos a la devolución</p>
              </div>

              <div className="max-h-[65vh] overflow-auto">
                {loadingBooks ? (
                  <div className="p-8 text-center text-sm text-zinc-500">Cargando libros...</div>
                ) : books.length === 0 ? (
                  <div className="p-8 text-center text-sm text-zinc-500">No se encontraron libros</div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-zinc-50 text-xs uppercase text-zinc-500">
                      <tr>
                        <th className="px-5 py-3">Libro</th>
                        <th className="px-5 py-3">ISBN</th>
                        <th className="px-5 py-3 text-right">Stock</th>
                        <th className="px-5 py-3 text-right">Cantidad</th>
                        <th className="px-5 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => {
                        const available = Math.max(1, book.stock);
                        const selected = selectedIsbns.has(book.isbn);

                        return (
                          <tr key={book.id} className="border-t border-zinc-100 hover:bg-zinc-50/70">
                            <td className="px-5 py-4">
                              <div className="max-w-[280px]">
                                <p className="font-medium text-zinc-900 truncate">{book.title}</p>
                                <p className="text-xs text-zinc-500 truncate">{book.author}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-mono text-xs text-zinc-500">{book.isbn}</td>
                            <td className="px-5 py-4 text-right text-zinc-700">{book.stock}</td>
                            <td className="px-5 py-4 text-right">
                              <input
                                type="number"
                                min={1}
                                max={available}
                                value={lineQuantities[book.id] ?? 1}
                                onChange={(e) =>
                                  setLineQuantities((current) => ({
                                    ...current,
                                    [book.id]: Number(e.target.value),
                                  }))
                                }
                                className="w-20 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-right text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                              />
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() => handleAddBook(book)}
                                disabled={book.stock <= 0}
                                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {selected ? "Sumar" : "Añadir"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm self-start">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Solicitud</h2>
                  <p className="text-sm text-zinc-500">Revisa antes de enviar</p>
                </div>

                <button
                  onClick={clearRequest}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
                >
                  <Trash2 size={14} />
                  Limpiar
                </button>
              </div>

              <div className="mt-5 space-y-3 max-h-[52vh] overflow-auto pr-1">
                {requestLines.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
                    Aún no has añadido libros.
                  </div>
                ) : (
                  requestLines.map((line) => (
                    <div key={line.book.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 truncate">{line.book.title}</p>
                          <p className="mt-1 text-xs font-mono text-zinc-500">{line.book.isbn}</p>
                          <p className="mt-1 text-xs text-zinc-500">Stock disponible: {line.book.stock}</p>
                        </div>

                        <button
                          onClick={() => handleRemoveLine(line.book.id)}
                          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white hover:text-red-600"
                          title="Eliminar línea"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <label className="text-xs font-medium text-zinc-600">Cantidad</label>
                        <input
                          type="number"
                          min={1}
                          max={line.book.stock}
                          value={line.quantity}
                          onChange={(e) => handleUpdateQuantity(line.book.id, Number(e.target.value))}
                          className="w-24 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-right text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 border-t border-zinc-200 pt-5">
                <div className="flex items-center justify-between text-sm text-zinc-600">
                  <span>Líneas</span>
                  <span className="font-medium text-zinc-900">{requestLines.length}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-zinc-600">
                  <span>Unidades</span>
                  <span className="font-medium text-zinc-900">{totalItems}</span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loadingSubmit || requestLines.length === 0}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={16} />
                  {loadingSubmit ? "Creando devoluciones..." : "Enviar devolución"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}