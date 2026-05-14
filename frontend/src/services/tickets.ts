import { api } from "../lib/api";

export type TicketItem = {
  id: number;
  saleId: number;
  bookId: number;
  quantity: number;
  unitPrice: number;
  total: number;
  returnedQuantity: number;
  book: {
    id: number;
    title: string;
    author: string;
    isbn: string;
  }
};

export type Ticket = {
  id: number;
  ticketNo: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items: TicketItem[];
};

export function getTicketByNumber(ticketNo: string) {
  return api.get<Ticket>(`/ticket/${ticketNo}`);
}
