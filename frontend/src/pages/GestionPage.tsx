import { useState } from "react";
import { BookForm } from "../components/BookForm";
import { BooksList } from "../components/BooksList";
import { Sidebar } from "../components/Sidebar";
import { Hero } from "../components/Hero";
import { Plus } from "lucide-react";

export default function GestionPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState<number | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
              "
            >
              <Plus size={20} />
              Nuevo Libro
            </button>
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
        </section>
      </main>
    </div>
  );
}
