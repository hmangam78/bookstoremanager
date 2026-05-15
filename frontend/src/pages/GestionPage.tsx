import { useState, useEffect } from "react";
import { BookForm } from "../components/BookForm";
import { BooksList } from "../components/BooksList";
import { Sidebar } from "../components/Sidebar";
import { Hero } from "../components/Hero";
import { Plus, PackageSearch, AlertTriangle } from "lucide-react";
import { StockReceiptModal } from "../components/StockReceiptModal";
import { UncataloguedListModal } from "../components/UncataloguedListModal";
import { getUncatalogued, type UncataloguedItem } from "../services/stockReceipt";
import type { CreateBookInput } from "../services/books";

export default function GestionPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState<number | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showStockReceipt, setShowStockReceipt] = useState(false);
  const [uncataloguedCount, setUncataloguedCount] = useState<number | null>(null);
  const [showUncataloguedList, setShowUncataloguedList] = useState(false);
  const [bookFormPrefill, setBookFormPrefill] = useState<Partial<CreateBookInput> | undefined>(undefined);

  useEffect(() => {
    getUncatalogued()
      .then(({ data }) => setUncataloguedCount(data.length))
      .catch(() => setUncataloguedCount(null));
  }, [refreshTrigger]);

  const handleOpenForm = () => {
    setEditingBookId(undefined);
    setShowForm(true);
    setBookFormPrefill(undefined);
  };

  const handleEditBook = (bookId: number) => {
    setEditingBookId(bookId);
    setShowForm(true);
    setBookFormPrefill(undefined);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingBookId(undefined);
    setBookFormPrefill(undefined);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBookId(undefined);
    setBookFormPrefill(undefined);
  };

  const handleSelectUncatalogued = (item: UncataloguedItem) => {
    setShowUncataloguedList(false);
    setBookFormPrefill({ isbn: item.isbn, stock: item.stock });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <Hero />
      <main className="grid grid-cols-12 gap-4 lg:gap-6 p-4 lg:p-6">
        <aside className="col-span-1 lg:col-span-2 self-start">
          <Sidebar />
        </aside>

        <section className="col-span-11 lg:col-span-10 flex flex-col gap-4 lg:gap-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">
                Gestión de Libros
              </h1>
              <p className="mt-2 text-zinc-600">
                Añade, edita y elimina libros del catálogo
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {uncataloguedCount !== null && uncataloguedCount > 0 && (
                <button
                  onClick={() => setShowUncataloguedList(true)}
                  className="
                    flex items-center gap-2
                    rounded-xl
                    border border-amber-300 bg-amber-50
                    px-4 py-3
                    font-medium text-amber-700
                    transition hover:bg-amber-100
                    cursor-pointer
                  "
                >
                  <AlertTriangle size={20} />
                  {uncataloguedCount} sin catalogar
                </button>
              )}

              <button
                onClick={() => setShowStockReceipt(true)}
                className="
                  flex items-center gap-2
                  rounded-xl
                  border border-zinc-300
                  bg-white
                  px-4 py-3
                  font-medium
                  text-zinc-700
                  transition
                  hover:bg-zinc-50
                  cursor-pointer
                "
              >
                <PackageSearch size={20} />
                Recepción de Stock
              </button>

              <button
                onClick={handleOpenForm}
                className="
                  flex items-center gap-2
                  rounded-xl
                  bg-zinc-900
                  px-4 py-3
                  font-medium
                  text-white
                  transition
                  hover:bg-zinc-800
                  cursor-pointer
                "
              >
                <Plus size={20} />
                Nuevo Libro
              </button>
            </div>
          </div>

          {/* Content */}
          <BooksList
            onEditBook={handleEditBook}
            refreshTrigger={refreshTrigger}
          />

          {/* Form Modal */}
          {showForm && (
            <BookForm
              bookId={editingBookId}
              initialData={bookFormPrefill}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          )}

          {/* Stock Receipt Modal */}
          {showStockReceipt && (
            <StockReceiptModal onClose={() => {
              setShowStockReceipt(false);
              setRefreshTrigger((prev) => prev + 1);
            }} />
          )}

          {/* Uncatalogued List Modal */}
          {showUncataloguedList && (
            <UncataloguedListModal
              onSelect={handleSelectUncatalogued}
              onClose={() => setShowUncataloguedList(false)}
            />
          )}
        </section>
      </main>
    </div>
  );
}

