import { useEffect, useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import { getBookById } from "../services/books";
import { addToBasket } from "../services/basket";
import type { Book } from "../services/books";

type BookDetailsModalProps = {
  bookId: number;
  onClose: () => void;
  onAddToBasket?: () => void;
};

export function BookDetailsModal({ bookId, onClose, onAddToBasket }: BookDetailsModalProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    getBookById(bookId)
      .then((res) => {
        setBook(res.data);
      })
      .catch((err) => {
        setError("Error cargando detalles del libro");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [bookId]);

  const handleAddToBasket = async () => {
    if (!book) return;
    setIsAdding(true);
    try {
      await addToBasket(book.id, 1);
      if (onAddToBasket) {
        onAddToBasket();
      }
    } catch (err) {
      console.error("Error agregando a cesta:", err);
      alert("Error al agregar a la cesta");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
          <p className="text-zinc-500">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
          <p className="text-red-700">{error || "Libro no encontrado"}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-zinc-200">
          <h2 className="text-2xl font-bold">{book.title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Imagen y datos principales */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="rounded-xl overflow-hidden bg-zinc-50 flex items-center justify-center h-80 border border-zinc-200">
                <img
                  src={
                    book.imageUrl ||
                    `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`
                  }
                  alt={`Portada de ${book.title}`}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/300x450?text=Sin+Imagen";
                  }}
                />
              </div>
            </div>

            <div className="col-span-2 space-y-4">
              <div>
                <p className="text-sm text-zinc-600 font-medium">Autor</p>
                <p className="text-lg text-zinc-900">{book.author}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-600 font-medium">Precio</p>
                <p className="text-2xl font-bold text-emerald-600">
                  €{book.price.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-600 font-medium">Stock</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      book.stock > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {book.stock > 0 ? `${book.stock} disponibles` : "Sin stock"}
                  </span>
                </div>
              </div>

              {book.stock > 0 && (
                <button
                  onClick={handleAddToBasket}
                  disabled={isAdding}
                  className="
                    w-full
                    rounded-xl
                    bg-zinc-900
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-zinc-700
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    flex
                    items-center
                    justify-center
                    gap-2
                    mt-2
                  "
                >
                  <ShoppingCart size={18} />
                  {isAdding ? "Añadiendo..." : "Añadir a la cesta"}
                </button>
              )}

              <div>
                <p className="text-sm text-zinc-600 font-medium">ISBN</p>
                <p className="text-zinc-900 font-mono">{book.isbn}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-600 font-medium">Formato</p>
                <p className="text-zinc-900">{book.format}</p>
              </div>
            </div>
          </div>

          {/* Géneros */}
          {book.genre && book.genre.length > 0 && (
            <div>
              <p className="text-sm text-zinc-600 font-medium mb-2">Géneros</p>
              <div className="flex flex-wrap gap-2">
                {book.genre.map((g) => (
                  <span
                    key={g}
                    className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Descripción */}
          {book.description && (
            <div>
              <p className="text-sm text-zinc-600 font-medium mb-2">
                Descripción
              </p>
              <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {book.description}
              </p>
            </div>
          )}

          {/* Botón cerrar */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
