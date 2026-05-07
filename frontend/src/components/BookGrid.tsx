import { useEffect, useState } from "react";
import { BookCard } from "./BookCard";
import { getBooks } from "../services/books";

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

export function BookGrid({ searchQuery = "", onAddToBasket, refreshTrigger = 0, onViewDetails }: BookGridProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initial load without debounce and reload on refreshTrigger
  useEffect(() => {
    setLoading(true);
    getBooks()
      .then((res) => {
        setBooks(res.data);
        setError("");
      })
      .catch(() => {
        setError("Error cargando libros");
        setBooks([]);
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  // Search queries: immediate reload when cleared, debounce when typing
  useEffect(() => {
    if (searchQuery === "") {
      setLoading(true);
      getBooks()
        .then((res) => {
          setBooks(res.data);
          setError("");
        })
        .catch(() => {
          setError("Error cargando libros");
          setBooks([]);
        })
        .finally(() => setLoading(false));
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      getBooks(searchQuery)
        .then((res) => {
          console.log("Search results:", res.data);
          setBooks(res.data);
          setError("");
        })
        .catch((err) => {
          console.error("Error searching books:", err);
          setError("Error cargando libros");
          setBooks([]);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredBooks = books;

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

  if (filteredBooks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500">No se encontraron libros</p>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {filteredBooks.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onAddToBasket={onAddToBasket}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}