import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Hero } from "../components/Hero";
import { Search, Calendar, Hash } from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState<"period" | "article">("period");

  // Campos para reporte por período
  const [periodDesde, setPeriodDesde] = useState("");
  const [periodHasta, setPeriodHasta] = useState("");

  // Campos para reporte por artículo + período
  const [articleId, setArticleId] = useState("");
  const [articleDesde, setArticleDesde] = useState("");
  const [articleHasta, setArticleHasta] = useState("");

  const handleSearchPeriod = () => {
    // Placeholder: aquí iría la llamada al backend
    console.log("Buscar ventas por período:", { desde: periodDesde, hasta: periodHasta });
    alert(`Buscando ventas desde ${periodDesde} hasta ${periodHasta}...`);
  };

  const handleSearchArticle = () => {
    // Placeholder: aquí iría la llamada al backend
    console.log("Buscar ventas de artículo:", { id: articleId, desde: articleDesde, hasta: articleHasta });
    alert(`Buscando ventas del artículo #${articleId} desde ${articleDesde} hasta ${articleHasta}...`);
  };

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Desde
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="date"
                      value={periodDesde}
                      onChange={(e) => setPeriodDesde(e.target.value)}
                      className="
                        w-full rounded-xl border border-zinc-200
                        bg-zinc-50 px-10 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-zinc-400
                      "
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Hasta
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="date"
                      value={periodHasta}
                      onChange={(e) => setPeriodHasta(e.target.value)}
                      className="
                        w-full rounded-xl border border-zinc-200
                        bg-zinc-50 px-10 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-zinc-400
                      "
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
                Ventas de un artículo en un período
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    ID del Artículo
                  </label>
                  <div className="relative">
                    <Hash
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="number"
                      value={articleId}
                      onChange={(e) => setArticleId(e.target.value)}
                      placeholder="Ej: 101"
                      className="
                        w-full rounded-xl border border-zinc-200
                        bg-zinc-50 px-10 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-zinc-400
                      "
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Desde
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="date"
                      value={articleDesde}
                      onChange={(e) => setArticleDesde(e.target.value)}
                      className="
                        w-full rounded-xl border border-zinc-200
                        bg-zinc-50 px-10 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-zinc-400
                      "
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Hasta
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="date"
                      value={articleHasta}
                      onChange={(e) => setArticleHasta(e.target.value)}
                      className="
                        w-full rounded-xl border border-zinc-200
                        bg-zinc-50 px-10 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-zinc-400
                      "
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSearchArticle}
                disabled={!articleId || !articleDesde || !articleHasta}
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
                Buscar Ventas del Artículo
              </button>
            </div>
          )}

          {/* Placeholder de resultados */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Resultados
            </h3>
            <p className="text-zinc-500 text-sm">
              Realiza una búsqueda para ver los resultados aquí.
            </p>
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
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                      Sin datos para mostrar
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
