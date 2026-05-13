import { useState } from "react";
import { BookForm } from "../components/BookForm";
import { BooksList } from "../components/BooksList";
import { Sidebar } from "../components/Sidebar";
import { Hero } from "../components/Hero";
import { Plus, PackageSearch } from "lucide-react";
import { StockReceiptModal } from "../components/StockReceiptModal";

export default function GestionPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState<number | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showStockReceipt, setShowStockReceipt] = useState(false);

  const handleOpenForm = () => {
    setEditingBookId(undefined);
    setShowForm(true);
  };

  const handleEditBook = (bookId: number) => {
    setEditingBookId(bookId);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingBookId(undefined);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBookId(undefined);
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <Hero />
      <main className="grid grid-cols-12 gap-6 p-6">
        <aside className="col-span-2">
          <Sidebar />
        </aside>

        <section className="col-span-10 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">
                Gestión de Libros
              </h1>
              <p className="mt-2 text-zinc-600">
                Añade, edita y elimina libros del catálogo
              </p>
            </div>

            <div className="flex items-center gap-3">
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
        </section>
      </main>
    </div>
  );
}

