import api from "./api";

export async function fetchCart() {
  const { data } = await api.get("/cart");
  return data;
}

export async function addToCart(bookId, quantity = 1) {
  const { data } = await api.post("/cart", { bookId, quantity });
  return data;
}

export async function updateCartItem(bookId, quantity) {
  const { data } = await api.patch(`/cart/${bookId}`, { quantity });
  return data;
}

export async function removeFromCart(bookId) {
  const { data } = await api.delete(`/cart/${bookId}`);
  return data;
}

export async function clearCart() {
  const { data } = await api.delete("/cart");
  return data;
}

export async function startCheckout() {
  const { data } = await api.post("/checkout/session");
  return data;
}

export async function confirmCheckout(sessionId) {
  const { data } = await api.get(`/checkout/confirm/${sessionId}`);
  return data;
}

export async function fetchOrders() {
  const { data } = await api.get("/checkout/orders");
  return data;
}
