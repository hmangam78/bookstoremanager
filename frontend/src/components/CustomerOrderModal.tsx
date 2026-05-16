import { useState, useEffect, useRef } from "react";
import { X, Search, UserPlus, ShoppingCart, AlertTriangle, CheckCircle, User, Mail, Phone } from "lucide-react";
import { searchCustomers, getCustomerByEmail, getCustomerByPhone, createCustomer, type Customer, type CreateCustomerInput } from "../services/customers";
import { createCustomerOrder } from "../services/customerOrders";

type Step = "search" | "create-customer" | "order";

type Props = {
  isbn: string;
  bookTitle: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function CustomerOrderModal({ isbn, bookTitle, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("search");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create customer state
  const [newCustomer, setNewCustomer] = useState<CreateCustomerInput>({
    name: "",
    phone: "",
    email: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Order state
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Search by email or phone
  const [searchBy, setSearchBy] = useState<"name" | "email" | "phone">("name");
  const [quickSearchResult, setQuickSearchResult] = useState<Customer | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setNoResults(false);
    setQuickSearchResult(null);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    searchTimeout.current = setTimeout(async () => {
      try {
        if (searchBy === "email") {
          const { data } = await getCustomerByEmail(query.trim());
          if (data) {
            setQuickSearchResult(data);
            setNoResults(false);
          } else {
            setQuickSearchResult(null);
            setNoResults(true);
          }
          setSearchResults([]);
        } else if (searchBy === "phone") {
          const { data } = await getCustomerByPhone(query.trim());
          if (data) {
            setQuickSearchResult(data);
            setNoResults(false);
          } else {
            setQuickSearchResult(null);
            setNoResults(true);
          }
          setSearchResults([]);
        } else {
          const { data } = await searchCustomers(query.trim());
          if (data && data.length > 0) {
            setSearchResults(data);
            setNoResults(false);
          } else {
            setSearchResults([]);
            setNoResults(true);
          }
          setQuickSearchResult(null);
        }
      } catch {
        setSearchResults([]);
        setQuickSearchResult(null);
        setNoResults(true);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStep("order");
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      setCreateError("Nombre y teléfono son obligatorios");
      return;
    }

    setCreating(true);
    setCreateError("");

    try {
      const { data } = await createCustomer(newCustomer);
      setSelectedCustomer(data);
      setStep("order");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setCreateError(error.response?.data?.message || "Error al crear el cliente");
    } finally {
      setCreating(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (quantity <= 0 || !selectedCustomer) return;

    setSubmitting(true);
    try {
      await createCustomerOrder([
        {
          isbn,
          quantity,
          customerId: selectedCustomer.id,
        },
      ]);
      setResult({
        success: true,
        message: `Pedido realizado correctamente. Se han solicitado ${quantity} unidad(es) de "${bookTitle}" para ${selectedCustomer.name}.`,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setResult({
        success: false,
        message: error.response?.data?.message || "Error al realizar el pedido",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting || creating) return;
    onClose();
  };

  // Result screen
  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            {result.success ? (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={28} className="text-green-600" />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle size={28} className="text-red-600" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-zinc-900">
              {result.success ? "Pedido Realizado" : "Error"}
            </h3>
            <p className="text-sm text-zinc-600">{result.message}</p>
            <button
              onClick={() => {
                if (result.success) onSuccess();
                onClose();
              }}
              className="mt-2 rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition hover:bg-zinc-800 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              {step === "search" && "Seleccionar Cliente"}
              {step === "create-customer" && "Nuevo Cliente"}
              {step === "order" && "Realizar Pedido"}
            </h2>
            <p className="text-sm text-zinc-500 mt-1 truncate max-w-xs">{bookTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Step: Search Customer */}
        {step === "search" && (
          <div className="p-6 space-y-4">
            {/* Search by type selector */}
            <div className="flex gap-2">
              {(["name", "email", "phone"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSearchBy(type);
                    setSearchQuery("");
                    setSearchResults([]);
                    setQuickSearchResult(null);
                    setNoResults(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                    searchBy === type
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {type === "name" && <><User size={14} className="inline mr-1" />Nombre</>}
                  {type === "email" && <><Mail size={14} className="inline mr-1" />Email</>}
                  {type === "phone" && <><Phone size={14} className="inline mr-1" />Teléfono</>}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={
                  searchBy === "name"
                    ? "Buscar por nombre..."
                    : searchBy === "email"
                    ? "Buscar por email..."
                    : "Buscar por teléfono..."
                }
                autoFocus
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>

            {/* Quick search result (email/phone) */}
            {quickSearchResult && (
              <div
                onClick={() => handleSelectCustomer(quickSearchResult)}
                className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition cursor-pointer"
              >
                <p className="font-medium text-zinc-900">{quickSearchResult.name}</p>
                <p className="text-sm text-zinc-500">{quickSearchResult.phone}{quickSearchResult.email ? ` · ${quickSearchResult.email}` : ""}</p>
              </div>
            )}

            {/* Search results */}
            {searching && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-300 border-t-zinc-600" />
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <p className="font-medium text-zinc-900">{customer.name}</p>
                    <p className="text-sm text-zinc-500">{customer.phone}{customer.email ? ` · ${customer.email}` : ""}</p>
                  </div>
                ))}
              </div>
            )}

            {!searching && noResults && searchQuery.trim() && (
              <div className="text-center py-6 space-y-4">
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  <UserPlus size={36} />
                  <p className="text-sm">Cliente no encontrado</p>
                </div>
                <button
                  onClick={() => {
                    setNewCustomer({
                      name: searchBy === "name" ? searchQuery.trim() : "",
                      phone: searchBy === "phone" ? searchQuery.trim() : "",
                      email: searchBy === "email" ? searchQuery.trim() : "",
                    });
                    setStep("create-customer");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition hover:bg-zinc-800 cursor-pointer"
                >
                  <UserPlus size={18} />
                  Crear nuevo cliente
                </button>
              </div>
            )}

            {!searching && !searchQuery.trim() && (
              <div className="flex flex-col items-center gap-2 py-8 text-zinc-400">
                <User size={36} />
                <p className="text-sm">Busca un cliente para continuar</p>
              </div>
            )}

            {/* Cancel button */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 transition cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Step: Create Customer */}
        {step === "create-customer" && (
          <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Nombre *</label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del cliente"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Teléfono *</label>
              <input
                type="text"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Número de teléfono"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Email</label>
              <input
                type="email"
                value={newCustomer.email || ""}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>

            {createError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{createError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setStep("search")}
                disabled={creating}
                className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 transition cursor-pointer disabled:opacity-50"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={creating || !newCustomer.name.trim() || !newCustomer.phone.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
              >
                <UserPlus size={18} />
                {creating ? "Creando..." : "Crear y seleccionar"}
              </button>
            </div>
          </form>
        )}

        {/* Step: Place Order */}
        {step === "order" && selectedCustomer && (
          <div className="p-6 space-y-6">
            {/* Selected customer info */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-emerald-50">
              <p className="text-xs font-medium text-zinc-500 mb-1">Cliente seleccionado</p>
              <p className="font-medium text-zinc-900">{selectedCustomer.name}</p>
              <p className="text-sm text-zinc-500">{selectedCustomer.phone}{selectedCustomer.email ? ` · ${selectedCustomer.email}` : ""}</p>
            </div>

            {/* Quantity selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Cantidad a pedir
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className="w-20 text-center rounded-lg border border-zinc-300 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setStep("search");
                }}
                disabled={submitting}
                className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 transition cursor-pointer disabled:opacity-50"
              >
                Cambiar cliente
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || quantity <= 0}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {submitting ? "Procesando..." : "Realizar pedido"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
