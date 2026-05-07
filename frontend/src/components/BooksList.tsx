import { useEffect, useState } from "react";
import type { Book } from "../services/books";
import { getBooks } from "../services/books";
import { AlertCircle } from "lucide-react";

type BooksListProps = {
  onEditBook: (bookId: number) => void;
  refreshTrigger?: number;
};

export function BooksList({ onEditBook, refreshTrigger }: BooksListProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, refreshTrigger]);

  const loadBooks = async (query: string = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getBooks(query || undefined);
      setBooks(res.data);
    } catch (err) {
      setError("Error cargando libros");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books;

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
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm">
            {searchQuery ? "No se encontraron libros" : "No hay libros"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">Título</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">Autor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">ISBN</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-600">Precio</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-600">Stock</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-600">Géneros</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
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
      )}
    </div>
  );
}
