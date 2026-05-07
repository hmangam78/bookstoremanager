import { Search } from "lucide-react";
import { useState, useRef } from "react";

type SearchBarProps = {
  onSearch: (query: string) => void;
};

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    // Mantener el foco en la barra tras limpiar
    inputRef.current?.focus();
  };

  return (
    <div
      className="
        flex items-center gap-3
        rounded-2xl
        border border-zinc-200
        bg-white
        px-4 py-3
        shadow-sm
      "
    >
      <Search className="text-zinc-500" size={18} />

      <input
        type="text"
        placeholder="Buscar libros por título, autor, género, tag, isbn..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        ref={inputRef}
        className="
          w-full
          bg-transparent
          outline-none
          placeholder:text-zinc-400
        "
      />

      {query && (
        <button
          onClick={handleClear}
          className="
            text-xs
            font-medium
            text-zinc-500
            transition
            hover:text-zinc-700
          "
        >
          Limpiar
        </button>
      )}
    </div>
  );
}