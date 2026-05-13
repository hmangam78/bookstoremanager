import { api } from "../lib/api";

export type StockReceiptItem = {
  isbn: string;
  stock: number;
};

export type StockReceiptPayload = {
  items: StockReceiptItem[];
};

export function uploadStockReceipt(payload: StockReceiptPayload) {
  return api.post("/stock-receipt", payload);
}
