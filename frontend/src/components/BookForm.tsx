import { useEffect, useState, useRef } from "react";
import type { CreateBookInput } from "../services/books";
import { createBook, updateBook, getBookById, deleteBook } from "../services/books";
import { getUncataloguedByISBN } from "../services/stockReceipt";
import { X, ChevronDown, Trash2, Info } from "lucide-react";

type BookFormProps = {
  bookId?: number;
  onSave: () => void;
  onCancel: () => void;
  initialData?: Partial<CreateBookInput>;
};

const genreOptions = [
  "Acción",
  "Aventura",
  "Arte",
  "Autoayuda",
  "Biografía",
  "Ciencia",
  "Ciencia Ficción",
  "Cómic",
  "Cocina",
  "Contemporánea",
  "Cyberpunk",
  "Deportes",
  "Desarrollo Personal",
  "Distopía",
  "Drama",
  "Economía",
  "Educación",
  "Ensayo",
  "Espiritualidad",
  "Fantasía",
  "Fantasía Épica",
  "Fantasía Urbana",
  "Ficción",
  "Ficción Histórica",
  "Filosofía",
  "Historia",
  "Humor",
  "Infantil",
  "Juvenil",
  "Literatura",
  "Manga",
  "Manualidades",
  "Medicina",
  "Misterio",
  "Mitología",
  "Música",
  "Naturaleza",
  "Negocios",
  "No-Ficción",
  "Novela",
  "Novela Negra",
  "Novela Romántica",
  "Ocio",
  "Poesía",
  "Policíaca",
  "Política",
  "Práctico",
  "Programación",
  "Psicología",
  "Realismo Mágico",
  "Religión",
  "Romance",
  "Shojo",
  "Shonen",
  "Seinen",
  "Josei",
  "Space Opera",
  "Suspense",
  "Tecnología",
  "Terror",
  "Thriller",
  "Viajes",
  "Young Adult"
];
const formatOptions = ["Tapa Dura", "Tapa Blanda", "Bolsillo"];

export function BookForm({ bookId, onSave, onCancel, initialData }: BookFormProps) {
  const [formData, setFormData] = useState<CreateBookInput>({
    title: initialData?.title || "",
    author: initialData?.author || "",
    description: initialData?.description || "",
    isbn: initialData?.isbn || "",
    price: initialData?.price ?? 0,
    stock: 0,
    format: initialData?.format || "",
    genre: initialData?.genre || [],
    imageUrl: initialData?.imageUrl || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing] = useState(!!bookId);
  const [genreSearch, setGenreSearch] = useState("");
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uncataloguedInfo, setUncataloguedInfo] = useState<{ isbn: string; stock: number } | null>(null);
  const genreDropdownRef = useRef<HTMLDivElement>(null);

  // Detect if the ISBN belongs to an uncatalogued item and autocomplete stock
  useEffect(() => {
    const isbn = formData.isbn.trim();
    if (!isbn || isEditing) return;

    const timer = setTimeout(async () => {
      try {
        const res = await getUncataloguedByISBN(isbn);
        if (res.data) {
          setUncataloguedInfo({ isbn: res.data.isbn, stock: res.data.stock });
          setFormData(prev => ({ ...prev, stock: res.data.stock }));
        } else {
          setUncataloguedInfo(null);
        }
      } catch {
        setUncataloguedInfo(null);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(timer);
  }, [formData.isbn, isEditing]);

  useEffect(() => {
    if (bookId) {
      setLoading(true);
      getBookById(bookId)
        .then((res) => {
          const { id, ...bookData } = res.data;
          setFormData(bookData);
        })
        .catch((err) => {
          setError("Error cargando libro");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [bookId]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        genreDropdownRef.current &&
        !genreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGenreDropdownOpen(false);
      }
    };

    if (isGenreDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isGenreDropdownOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!Number.isFinite(formData.price) || formData.price <= 0) {
      setError("El precio debe ser un número mayor que 0");
      setLoading(false);
      return;
    }

    try {
      if (bookId) {
        const { stock, format, imageUrl, ...updateData } = formData;
        const dataToSend = imageUrl ? { ...updateData, imageUrl } : updateData;
        await updateBook(bookId, dataToSend);
      } else {
        const dataToSend = formData.imageUrl 
          ? formData 
          : { ...formData, imageUrl: undefined };
        await createBook(dataToSend as CreateBookInput);
      }
      onSave();
    } catch (err) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string[] | string } } };
        const message = axiosError.response?.data?.message;

        if (Array.isArray(message)) {
          setError(message.join(" · "));
        } else if (typeof message === "string") {
          setError(message);
        } else {
          setError("Error al guardar libro");
        }
      } else {
        setError(err instanceof Error ? err.message : "Error al guardar libro");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bookId) return;
    if (confirm(`¿Estás seguro de que quieres eliminar "${formData.title}"? Esta acción no se puede deshacer.`)) {
      setIsDeleting(true);
      setError("");
      try {
        await deleteBook(bookId);
        onSave();
      } catch (err) {
        setError("Error al eliminar libro");
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 pb-8">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold">
            {isEditing ? "Editar Libro" : "Nuevo Libro"}
          </h2>
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-zinc-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex-shrink-0">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {uncataloguedInfo && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2 flex-shrink-0">
            <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              Este ISBN existe en la tabla de <strong>no catalogados</strong> con stock <strong>{uncataloguedInfo.stock}</strong>.
              El stock se ha autocompletado. Al crear el libro, la entrada en no catalogados se eliminará automáticamente.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 space-y-4 pb-4">
          <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="Título del libro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Autor *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="Nombre del autor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ISBN *</label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="ISBN del libro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Formato *</label>
              <select
                name="format"
                value={formData.format}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="">Selecciona formato</option>
                {formatOptions.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Precio (€) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="Descripción del libro"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL de la Portada</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="https://ejemplo.com/imagen.jpg (opcional)"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Géneros</label>
            <div ref={genreDropdownRef} className="relative">
              {/* Input con búsqueda */}
              <div
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 cursor-pointer hover:border-zinc-400 transition flex items-center justify-between bg-white"
              >
                <div className="flex flex-wrap gap-1 flex-1">
                  {formData.genre.length === 0 ? (
                    <span className="text-zinc-400 text-sm">Selecciona géneros...</span>
                  ) : (
                    formData.genre.map((g) => (
                      <span
                        key={g}
                        className="inline-flex items-center gap-1 bg-zinc-900 text-white text-xs px-2 py-1 rounded"
                      >
                        {g}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenreToggle(g);
                          }}
                          className="hover:opacity-70"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 transition ${
                    isGenreDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Dropdown con opciones */}
              {isGenreDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {/* Búsqueda dentro del dropdown */}
                  <div className="sticky top-0 bg-white border-b border-zinc-200 p-2">
                    <input
                      type="text"
                      placeholder="Buscar géneros..."
                      value={genreSearch}
                      onChange={(e) => setGenreSearch(e.target.value)}
                      className="w-full px-2 py-1 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Lista de géneros filtrados */}
                  <div className="p-2 space-y-1">
                    {genreOptions
                      .filter((g) =>
                        g.toLowerCase().includes(genreSearch.toLowerCase())
                      )
                      .map((genre) => (
                        <label
                          key={genre}
                          className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-100 cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={formData.genre.includes(genre)}
                            onChange={() => handleGenreToggle(genre)}
                            className="w-4 h-4 rounded border-zinc-300 cursor-pointer"
                          />
                          <span className="text-sm">{genre}</span>
                        </label>
                      ))}
                    {genreOptions.filter((g) =>
                      g.toLowerCase().includes(genreSearch.toLowerCase())
                    ).length === 0 && (
                      <p className="text-center text-sm text-zinc-400 py-4">
                        No hay géneros que coincidan
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>

          <div className="flex gap-3 justify-between pt-4 border-t flex-shrink-0">
            <div>
              {isEditing && !loading && formData.title && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition"
              >
                {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
