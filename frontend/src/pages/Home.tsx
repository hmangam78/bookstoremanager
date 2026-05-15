import { useState, useCallback } from "react";
import { Hero } from "../components/Hero";
import { Sidebar } from "../components/Sidebar";
import { SearchBar } from "../components/SearchBar";
import { BookGrid } from "../components/BookGrid";
import { Cart } from "../components/Cart";
import { BookDetailsModal } from "../components/BookDetailsModal";
import { addToBasket } from "../services/basket";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartRefresh, setCartRefresh] = useState(0);
  const [bookRefresh, setBookRefresh] = useState(0);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleAddToBasket = useCallback(
    async (bookId: number, quantity: number) => {
      try {
        await addToBasket(bookId, quantity);
        setCartRefresh((prev) => prev + 1);
        // Aquí podrías agregar un toast de éxito
      } catch (error) {
        console.error("Error agregando a cesta:", error);
        alert("Error al agregar a la cesta");
      }
    },
    []
  );

  const handleCheckoutSuccess = useCallback(() => {
    setBookRefresh((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100">
      <Hero />

      <main className="grid grid-cols-12 gap-4 lg:gap-6 p-4 lg:p-6">
        <aside className="col-span-1 lg:col-span-2 self-start">
          <Sidebar />
        </aside>

        <section className="col-span-8 lg:col-span-7 flex flex-col gap-4 lg:gap-6">
          <SearchBar onSearch={handleSearch} />
          <BookGrid
            searchQuery={searchQuery}
            onAddToBasket={handleAddToBasket}
            refreshTrigger={bookRefresh}
            onViewDetails={setSelectedBookId}
          />
        </section>

        <aside className="col-span-3 lg:col-span-3">
          <Cart refreshTrigger={cartRefresh} onCheckoutSuccess={handleCheckoutSuccess} />
        </aside>
      </main>

      {selectedBookId && (
        <BookDetailsModal
          bookId={selectedBookId}
          onClose={() => setSelectedBookId(null)}
          onAddToBasket={() => setCartRefresh((prev) => prev + 1)}
        />
      )}
    </div>
  );
}