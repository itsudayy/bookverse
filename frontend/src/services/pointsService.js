import api from "./api";

export async function fetchMyPoints() {
  const { data } = await api.get("/points/me");
  return data;
}

export async function fetchMyPurchases() {
  const { data } = await api.get("/points/purchases");
  return data;
}

export async function purchaseBook(bookId, shipping) {
  const { data } = await api.post(`/points/purchase/${bookId}`, shipping);
  return data;
}
