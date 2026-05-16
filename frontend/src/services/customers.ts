import { api } from "../lib/api";

export type Customer = {
  id: number;
  name: string;
  phone: string;
  email?: string;
};

export type CreateCustomerInput = {
  name: string;
  phone: string;
  email?: string;
};

export function searchCustomers(query: string) {
  return api.get<Customer[]>("/customer/by-name", {
    params: { name: query },
  });
}

export function getCustomerByEmail(email: string) {
  return api.get<Customer>("/customer/by-email", {
    params: { email },
  });
}

export function getCustomerByPhone(phone: string) {
  return api.get<Customer>("/customer/by-phone", {
    params: { phone },
  });
}

export function createCustomer(data: CreateCustomerInput) {
  return api.post<Customer>("/customer", data);
}
