import { api } from "../lib/api";

export type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  stock: number;
  genre: string[];
  description: string;
  isbn: string;
  format: string;
  imageUrl?: string;
};

export type Sale = {
  id: number;
  book: Book;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string; // ISO date string
};

export type TotalSalesByArticle = {
  bookId: number;
  title: string;
  totalQuantity: number;
  totalRevenue: number;
};

export type TotalSalesByPeriod = {
  totalRevenue: number;
  totalQuantity: number;
};

export function getSalesReportByPeriod(startDate: string, endDate: string) {
  return api.get<Sale[]>(`/reports/sales?start=${startDate}&end=${endDate}`);
}

export function getSalesReportByArticle() {
  return api.get<{ bookId: number; title: string; totalQuantity: number; totalRevenue: number }[]>(`/reports/sales-by-article`);
}

export function getTotalSalesByPeriod(startDate: string, endDate: string) {
  return api.get<TotalSalesByPeriod>(`/reports/total-sales?start=${startDate}&end=${endDate}`);
}

export function getTotalSalesByArticle() {
  return api.get<TotalSalesByArticle[]>(`/reports/total-sales-by-article`);
}