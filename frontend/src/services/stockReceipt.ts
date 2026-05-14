import { api } from "../lib/api";

export const getBookByISBN = (isbn: string) => api.get(`/books/isbn/${isbn}`);

export type StockReceiptItem = {
  isbn: string;
  title?: string;
  stock: number;
};

export type StockReceiptPayload = {
  orderNo: string;
  items: StockReceiptItem[];
};

export type UncataloguedItem = {
  id: number;
  isbn: string;
  stock: number;
};

export function uploadStockReceipt(payload: StockReceiptPayload) {
  return api.post("/stock-receipt", payload);
}

export function getUncatalogued() {
  return api.get<UncataloguedItem[]>("/stock-receipt");
}

export function getUncataloguedByISBN(isbn: string) {
  return api.get<UncataloguedItem | null>(`/stock-receipt/isbn/${isbn}`);
}

