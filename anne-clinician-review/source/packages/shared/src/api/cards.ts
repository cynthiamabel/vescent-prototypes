import { apiRequest } from "./client";
import type { Card, CardCreate, CardUpdate, UpNextResponse } from "../types/card";

export const getUpNext = (): Promise<UpNextResponse> =>
  apiRequest<UpNextResponse>("/api/v1/cards/up_next");

export const dismissCard = (id: string): Promise<void> =>
  apiRequest<void>(`/api/v1/cards/${id}/dismiss`, { method: "POST" });

export const listCards = (): Promise<Card[]> =>
  apiRequest<Card[]>("/api/v1/cards/");

export const createCard = (data: CardCreate): Promise<Card> =>
  apiRequest<Card>("/api/v1/cards/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateCard = (id: string, data: CardUpdate): Promise<Card> =>
  apiRequest<Card>(`/api/v1/cards/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const toggleCard = (id: string, isActive: boolean): Promise<Card> =>
  apiRequest<Card>(`/api/v1/cards/${id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });

export const deleteCard = (id: string): Promise<void> =>
  apiRequest<void>(`/api/v1/cards/${id}`, { method: "DELETE" });
