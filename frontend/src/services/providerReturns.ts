import { api } from "../lib/api";
import type { ProviderSummary, PublisherSummary } from "./books";

export type ProviderReturnItemInput = {
  isbn: string;
  quantity: number;
};

export type ProviderReturnResponse = {
  id: number;
  reference: string | null;
  providerId: number | null;
  provider: ProviderSummary | null;
  publisherId: number;
  publisher: PublisherSummary;
  items: ProviderReturnItemInput[];
  status: "pending" | "sent" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export function createProviderReturn(items: ProviderReturnItemInput[], reference?: string) {
  return api.post<ProviderReturnResponse[]>("/provider-return", {
    reference: reference || undefined,
    items,
  });
}

export function getProviderReturns() {
  return api.get<ProviderReturnResponse[]>("/provider-return");
}

export function getActiveProviderReturns() {
  return api.get<ProviderReturnResponse[]>("/provider-return/active");
}

export function getFinishedProviderReturns() {
  return api.get<ProviderReturnResponse[]>("/provider-return/finished");
}

export function getProviderReturnById(id: number) {
  return api.get<ProviderReturnResponse>(`/provider-return/${id}`);
}

export function sendProviderReturn(id: number) {
  return api.patch<ProviderReturnResponse>(`/provider-return/${id}/send`);
}