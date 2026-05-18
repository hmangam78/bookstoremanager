import { useEffect, useState } from "react";
import { BookCard } from "./BookCard";
import { getBooksPaginated } from "../services/books";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Book = {
  id: number;
  isbn: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  genre: string[];
};

type BookGridProps = {
  searchQuery?: string;
  onAddToBasket: (bookId: number, quantity: number) => void;
  refreshTrigger?: number;
  onViewDetails?: (bookId: number) => void;
};

const LIMIT = 20;

export function BookGrid({ searchQuery = "", onAddToBasket, refreshTrigger = 0, onViewDetails }: BookGridProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Reset to page 1 on new search or refresh
  useEffect(() => {
    setPage(1);
  }, [searchQuery, refreshTrigger]);

  // Load books whenever page, searchQuery, or refreshTrigger changes
  useEffect(() => {
    setLoading(true);
    getBooksPaginated(page, LIMIT, searchQuery || undefined)
      .then((res) => {
        setBooks(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
        setError("");
      })
      .catch(() => {
        setError("Error cargando libros");
        setBooks([]);
      })
      .finally(() => setLoading(false));
  }, [page, searchQuery, refreshTrigger]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500">Cargando libros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500">No se encontraron libros</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-4
          3xl:grid-cols-5
        "
      >
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onAddToBasket={onAddToBasket}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
      )}
    </div>
  );
}