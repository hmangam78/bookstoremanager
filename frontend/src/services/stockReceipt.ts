import { api } from "../lib/api";

export type StockReceiptItem = {
  isbn: string;
  stock: number;
};

export type StockReceiptPayload = {
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
