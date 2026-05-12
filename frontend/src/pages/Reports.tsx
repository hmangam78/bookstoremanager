import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Sidebar } from "../components/Sidebar";
import { Hero } from "../components/Hero";
import { Search, Calendar, BookText, ChevronRight, FileText, Clock } from "lucide-react";
import { getBooks, type Book } from "../services/books";
import { getSalesByBook, getTodaySales, type Sale } from "../services/sales";

function formatDateFromISO(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDateObj(date: Date | null): string {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function toISODate(date: Date | null): string {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

export default function Reports() {
  const [reportType, setReportType] = useState<"period" | "article">("period");

  // Campos para reporte por período
  const [periodDesde, setPeriodDesde] = useState<Date | null>(null);
  const [periodHasta, setPeriodHasta] = useState<Date | null>(null);

  // Campos para reporte por artículo + período
  const [articleQuery, setArticleQuery] = useState("");
  const [articleDesde, setArticleDesde] = useState<Date | null>(null);
  const [articleHasta, setArticleHasta] = useState<Date | null>(null);

  // Resultados de búsqueda de libros
  const [bookResults, setBookResults] = useState<Book[] | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);

  // Resultados de ventas
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);

  // Ventas del día
  const [dailySales, setDailySales] = useState<Sale[] | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);

  const handleSearchPeriod = () => {
    if (!periodDesde || !periodHasta) return;
    console.log("Buscar ventas por período:", { desde: periodDesde, hasta: periodHasta });
    alert(`Buscando ventas desde ${formatDateObj(periodDesde)} hasta ${formatDateObj(periodHasta)}...`);
  };

  const handleSearchBooks = async () => {
    if (!articleQuery) return;

    setLoading(true);
    setBookResults(null);
    setSelectedBook(null);
    setSales([]);
    setDailySales(null);

    try {
      const { data: books } = await getBooks(articleQuery);

      if (books.length === 0) {
        alert("No se encontraron libros con ese criterio de búsqueda.");
        return;
      }

      setBookResults(books);
    } catch (error) {
      console.error("Error al buscar libros:", error);
      alert("Error al buscar libros. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = async (book: Book) => {
    setSelectedBook(book);
    setSalesLoading(true);
    setSales([]);
    setDailySales(null);

    try {
      const desde = toISODate(articleDesde);
      const hasta = toISODate(articleHasta);
      const { data: salesData } = await getSalesByBook(book.id, desde, hasta);
      setSales(salesData);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
      alert("Error al obtener ventas. Revisa la consola para más detalles.");
    } finally {
      setSalesLoading(false);
    }
  };

  const handleDailySales = async () => {
    setDailyLoading(true);
    setDailySales(null);
    setSelectedBook(null);
    setSales([]);

    try {
      const { data } = await getTodaySales();
      setDailySales(data);
    } catch (error) {
      console.error("Error al obtener ventas del día:", error);
      alert("Error al obtener ventas del día.");
    } finally {
      setDailyLoading(false);
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
              <h1 className="text-3xl font-bold text-zinc-900">Informes de Ventas</h1>
              <p className="mt-2 text-zinc-600">
                Consulta las ventas por período o por artículo
              </p>
            </div>

            <button
              onClick={handleDailySales}
              disabled={dailyLoading}
              className="
                flex items-center gap-2
                rounded-xl bg-zinc-900 px-4 py-3
                font-medium text-white
                transition hover:bg-zinc-800
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer
              "
            >
              <Clock size={20} />
              {dailyLoading ? "Cargando..." : "Ventas del Día"}
            </button>
          </div>

          {/* Selector de tipo de reporte */}
          <div className="flex gap-4">
            <button
              onClick={() => setReportType("period")}
              className={`
                rounded-xl px-6 py-3 font-medium transition cursor-pointer
                ${
                  reportType === "period"
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                }
              `}
            >
              Ventas por Período
            </button>
            <button
              onClick={() => setReportType("article")}
              className={`
                rounded-xl px-6 py-3 font-medium transition cursor-pointer
                ${
                  reportType === "article"
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                }
              `}
            >
              Ventas de un Artículo
            </button>
          </div>

          {/* Formularios según tipo de reporte */}
          {reportType === "period" ? (
            /* Reporte por período */
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200">
              <h2 className="text-xl font-semibold text-zinc-900 mb-4">
                Buscar ventas en un período
              </h2>

              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Desde
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10"
                    />
                    <DatePicker
                      selected={periodDesde}
                      onChange={(date) => setPeriodDesde(date)}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="DD-MM-YYYY"
                      className={datePickerClass}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Hasta
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10"
                    />
                    <DatePicker
                      selected={periodHasta}
                      onChange={(date) => setPeriodHasta(date)}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="DD-MM-YYYY"
                      className={datePickerClass}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSearchPeriod}
                disabled={!periodDesde || !periodHasta}
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
                Buscar Ventas
              </button>
            </div>
          ) : (
            /* Reporte por artículo + período */
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200">
              <h2 className="text-xl font-semibold text-zinc-900 mb-4">
                Ventas de un artículo
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
                      value={articleQuery}
                      onChange={(e) => setArticleQuery(e.target.value)}
                      placeholder="Ej: 978-84... / El Quijote / Cervantes"
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
                      selected={articleDesde}
                      onChange={(date) => setArticleDesde(date)}
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
                      selected={articleHasta}
                      onChange={(date) => setArticleHasta(date)}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="DD-MM-YYYY"
                      className={datePickerClass}
                      isClearable
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSearchBooks}
                disabled={!articleQuery || loading}
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
                {loading ? "Buscando..." : "Buscar Libro"}
              </button>

              {/* Lista de resultados de libros */}
              {bookResults && bookResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-zinc-700 mb-3">
                    Selecciona un libro para ver sus ventas:
                  </h3>
                  <div className="flex flex-col gap-2">
                    {bookResults.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => handleSelectBook(book)}
                        className={`
                          flex items-center justify-between
                          w-full rounded-xl border px-4 py-3 text-left
                          transition cursor-pointer
                          ${
                            selectedBook?.id === book.id
                              ? "border-zinc-900 bg-zinc-100"
                              : "border-zinc-200 bg-white hover:bg-zinc-50"
                          }
                        `}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900">{book.title}</span>
                          <span className="text-sm text-zinc-500">
                            {book.author} · ISBN: {book.isbn}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <FileText size={16} />
                          <ChevronRight size={16} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ventas del día */}
          {dailySales !== null && (
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                Ventas del Día · {formatDateObj(new Date())}
              </h3>

              {dailySales.length === 0 ? (
                <p className="text-zinc-500 text-sm">
                  No hay ventas registradas hoy.
                </p>
              ) : (
                <>
                  <div className="flex gap-6 text-sm mb-6">
                    <div>
                      <span className="text-zinc-500">Total transacciones: </span>
                      <span className="font-semibold">{dailySales.length}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Total unidades vendidas: </span>
                      <span className="font-semibold">
                        {dailySales.reduce((sum, s) => sum + s.quantity, 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Total ingresos: </span>
                      <span className="font-semibold">
                        {dailySales.reduce((sum, s) => sum + Number(s.total), 0).toFixed(2)} €
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-zinc-700 mb-3">
                      Artículos vendidos (por unidades)
                    </h4>
                    <table className="w-full text-sm text-left text-zinc-700">
                      <thead className="text-xs uppercase bg-zinc-100 text-zinc-500">
                        <tr>
                          <th className="px-4 py-3 rounded-l-xl">Unidades</th>
                          <th className="px-4 py-3">Artículo</th>
                          <th className="px-4 py-3">Autor</th>
                          <th className="px-4 py-3">ISBN</th>
                          <th className="px-4 py-3">Precio Medio</th>
                          <th className="px-4 py-3 rounded-r-xl">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(
                          dailySales.reduce((acc, sale) => {
                            const existing = acc.get(sale.book.id);
                            if (existing) {
                              existing.unidades += sale.quantity;
                              existing.total += Number(sale.total);
                            } else {
                              acc.set(sale.book.id, {
                                id: sale.book.id,
                                title: sale.book.title,
                                author: sale.book.author,
                                isbn: sale.book.isbn,
                                unidades: sale.quantity,
                                total: Number(sale.total),
                              });
                            }
                            return acc;
                          }, new Map<number, { id: number; title: string; author: string; isbn: string; unidades: number; total: number }>())
                        )
                          .sort(([, a], [, b]) => b.unidades - a.unidades)
                          .map(([, item]) => (
                            <tr key={item.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                              <td className="px-4 py-3">{item.unidades}</td>
                              <td className="px-4 py-3 font-medium">{item.title}</td>
                              <td className="px-4 py-3 text-zinc-600">{item.author}</td>
                              <td className="px-4 py-3 font-mono text-xs text-zinc-500">{item.isbn}</td>
                              <td className="px-4 py-3">
                                {(item.total / item.unidades).toFixed(2)} €
                              </td>
                              <td className="px-4 py-3">{item.total.toFixed(2)} €</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Resultados de ventas de artículo */}
          {dailySales === null && (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Resultados
              {selectedBook && (
                <span className="text-sm font-normal text-zinc-500 ml-2">
                  · {selectedBook.title}
                </span>
              )}
            </h3>

            {selectedBook && (articleDesde || articleHasta) && (
              <div className="text-sm text-zinc-500 mb-4 space-y-1">
                <p>
                  Período: <span className="font-medium text-zinc-700">{formatDateObj(articleDesde)}</span>
                  {" — "}
                  <span className="font-medium text-zinc-700">{formatDateObj(articleHasta)}</span>
                </p>
                <p>
                  Artículo:{" "}
                  <span className="font-medium text-zinc-700">{selectedBook.title}</span>
                  {" · "}
                  <span className="text-zinc-500">{selectedBook.author}</span>
                  {" · ISBN: "}
                  <span className="text-zinc-500">{selectedBook.isbn}</span>
                </p>
              </div>
            )}

            {selectedBook && !articleDesde && !articleHasta && (
              <div className="text-sm text-zinc-500 mb-4">
                <p>
                  Artículo:{" "}
                  <span className="font-medium text-zinc-700">{selectedBook.title}</span>
                  {" · "}
                  <span className="text-zinc-500">{selectedBook.author}</span>
                  {" · ISBN: "}
                  <span className="text-zinc-500">{selectedBook.isbn}</span>
                  {" · "}
                  <span className="text-zinc-400">Todas las ventas</span>
                </p>
              </div>
            )}

            {!selectedBook ? (
              <p className="text-zinc-500 text-sm">
                Busca un libro para ver sus ventas.
              </p>
            ) : salesLoading ? (
              <p className="text-zinc-500 text-sm">Cargando ventas...</p>
            ) : sales.length === 0 ? (
              <p className="text-zinc-500 text-sm">
                No se encontraron ventas de este artículo
                {articleDesde || articleHasta ? " en el período seleccionado." : "."}
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm text-left text-zinc-700">
                  <thead className="text-xs uppercase bg-zinc-100 text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl"># Venta</th>
                      <th className="px-4 py-3">Artículo</th>
                      <th className="px-4 py-3">Cantidad</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3 rounded-r-xl">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                        <td className="px-4 py-3 font-medium">{sale.id}</td>
                        <td className="px-4 py-3">{sale.book.title}</td>
                        <td className="px-4 py-3">{sale.quantity}</td>
                        <td className="px-4 py-3">{sale.total} €</td>
                        <td className="px-4 py-3">
                          {formatDateFromISO(sale.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 pt-4 border-t border-zinc-200 flex gap-6 text-sm">
                  <div>
                    <span className="text-zinc-500">Total transacciones: </span>
                    <span className="font-semibold">{sales.length}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Total unidades vendidas: </span>
                    <span className="font-semibold">
                      {sales.reduce((sum, s) => sum + s.quantity, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Total ingresos: </span>
                    <span className="font-semibold">
                      {sales.reduce((sum, s) => sum + Number(s.total), 0).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}
        </section>
      </main>
    </div>
  );
}
