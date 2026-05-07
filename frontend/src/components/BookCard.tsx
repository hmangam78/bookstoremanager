import { ShoppingCart } from "lucide-react";
import { useState } from "react";

type Book = {
  id: number;
  isbn: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  genre: string[];
  imageUrl?: string;
};

type BookCardProps = {
  book: Book;
  onAddToBasket: (bookId: number, quantity: number) => void;
  onViewDetails?: (bookId: number) => void;
};

export function BookCard({ book, onAddToBasket, onViewDetails }: BookCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [coverFallback, setCoverFallback] = useState(false);

  const handleAddToBasket = async () => {
    if (book.stock <= 0) return;
    
    setIsAdding(true);
    try {
      onAddToBasket(book.id, 1);
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = book.stock <= 0;

  // Use manual imageUrl if provided, otherwise try Open Library, then placeholder
  const coverUrl = book.imageUrl 
    ? book.imageUrl 
    : (coverFallback 
      ? "https://placehold.co/400x600?text=No+Cover"
      : `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`);


  return (
    <article
      onClick={() => onViewDetails?.(book.id)}
      className="
        rounded-2xl
        border border-zinc-200
        bg-white
        p-4
        shadow-sm
        transition
        hover:shadow-md
        cursor-pointer
      "
    >
      <div className="mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
        <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-white to-zinc-100 p-3">
          <img
            src={coverUrl}
            alt={`Portada de ${book.title}`}
            className="max-h-full max-w-full object-contain"
            onError={() => {
              if (!coverFallback) setCoverFallback(true);
            }}
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold">
        {book.title}
      </h3>

      <p className="mt-1 text-sm text-zinc-500">
        {book.author}
      </p>

      <div className="mt-2 flex flex-wrap gap-1">
        {book.genre.map((g) => (
          <span
            key={g}
            className="inline-block rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600"
          >
            {g}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="font-bold text-lg">
            €{book.price.toFixed(2)}
          </span>
          <p className="text-xs text-zinc-500">
            {book.stock > 0 ? `${book.stock} disponibles` : "Sin stock"}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToBasket();
          }}
          disabled={isOutOfStock || isAdding}
          className="
            rounded-xl
            bg-zinc-900
            px-3
            py-2
            text-sm
            text-white
            transition
            hover:bg-zinc-700
            disabled:opacity-50
            disabled:cursor-not-allowed
            flex
            items-center
            gap-2
          "
        >
          <ShoppingCart size={16} />
          {isAdding ? "..." : "Añadir"}
        </button>
      </div>
    </article>
  );
}