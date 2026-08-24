import api from "./api";

export async function fetchWishlist() {
  const { data } = await api.get("/wishlist");
  return data;
}

export async function addToWishlist(book) {
  const { data } = await api.post("/wishlist", book);
  return data;
}

export async function removeFromWishlist(source, bookId) {
  const { data } = await api.delete(`/wishlist/${source}/${bookId}`);
  return data;
}
