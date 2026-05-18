import { useEffect, useState } from "react";
import type { Book } from "../services/books";
import { getBooksPaginated } from "../services/books";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

type BooksListProps = {
  onEditBook: (bookId: number) => void;
  refreshTrigger?: number;
};

export function BooksList({ onEditBook, refreshTrigger }: BooksListProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, refreshTrigger]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks(page, searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [page, searchQuery, refreshTrigger]);

  const loadBooks = async (pageNum: number, query: string = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getBooksPaginated(pageNum, limit, query || undefined);
      setBooks(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      setError("Error cargando libros");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-white rounded-lg border border-zinc-200 px-4 py-3">
        <input
          type="text"
          placeholder="Buscar por título, autor o ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      {/* Loading state shown under the search input so the input remains mounted */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-zinc-500">Cargando libros...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm">
            {searchQuery ? "No se encontraron libros" : "No hay libros"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 whitespace-nowrap">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 whitespace-nowrap">Autor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 whitespace-nowrap">ISBN</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-600 whitespace-nowrap">Precio</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-600 whitespace-nowrap">Stock</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-600 whitespace-nowrap">Géneros</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr
                    key={book.id}
                    onClick={() => onEditBook(book.id)}
                    className="border-b border-zinc-200 hover:bg-zinc-50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-zinc-900">{book.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600">{book.author}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600 font-mono">{book.isbn}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-right">€{book.price.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-right">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            book.stock > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {book.stock}
                        </span>
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {book.genre.map((g) => (
                          <span key={g} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded">
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-2 py-2">
            <p className="text-sm text-zinc-500">
              {total} libro{total !== 1 ? "s" : ""} — Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                // Show pages around current page
                const start = Math.max(1, page - 3);
                const pageNum = start + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition cursor-pointer ${
                      pageNum === page
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
