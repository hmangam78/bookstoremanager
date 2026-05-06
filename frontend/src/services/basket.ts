import { api } from "../lib/api";

export function getBasket() {
    return api.get("/basket");
}

export function addToBasket(bookId: number, quantity: number) {
    return api.post("/basket", { bookId, quantity });
}

export function setBasketItemQuantity(bookId: number, newQuantity: number) {
    return api.patch(`/basket/${bookId}`, newQuantity);
}

export function removeBasketItem(bookId: number) {
    return api.delete(`/basket/${bookId}`);
}

export function clearBasket() {
    return api.delete("/basket");
}

export function checkoutBasket() {
    return api.post("/basket/checkout");
}