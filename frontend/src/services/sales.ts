import { api } from "../lib/api";

export type Sale = {
  id: number;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
  book: {
    id: number;
    title: string;
    author: string;
    isbn: string;
  };
};

export function getSalesByPeriod(desde: string, hasta: string) {
  return api.get<Sale[]>("/sales", {
    params: { from: desde, to: hasta },
  });
}

export function getSalesByBook(bookId: number, desde: string, hasta: string) {
  if (desde && hasta) {
  return api.get<Sale[]>(`/sales/book/${bookId}/sales`, {
    params: { from: desde, to: hasta },
  });
}
  // Sin fechas: obtiene todo el histórico del libro
  return api.get<Sale[]>(`/sales/book/${bookId}`);
}

export function getTodaySales() {
  return api.get<Sale[]>("/sales/today");
}

