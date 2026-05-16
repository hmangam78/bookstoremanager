import { api } from "../lib/api";
import type { Customer } from "./customers";

export type CustomerOrderPayload = {
  isbn: string;
  quantity: number;
  customerId: number;
};

export type CustomerOrder = {
  id: number;
  isbn: string;
  quantity: number;
  customerId: number;
  customer: Customer;
  bookTitle: string | null;
  bookStock: number | null;
};

export function createCustomerOrder(data: CustomerOrderPayload[]) {
  return api.post("/customer-order", data);
}

export function getAllCustomerOrders() {
  return api.get<CustomerOrder[]>("/customer-order");
}

export function deleteCustomerOrder(orderId: number) {
  return api.delete(`/customer-order/${orderId}`);
}
