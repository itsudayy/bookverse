import api from "./api";

export async function fetchStoreBooks(params) {
  const { data } = await api.get("/store/books", { params });
  return data;
}

export async function fetchStoreBook(id) {
  const { data } = await api.get(`/store/books/${id}`);
  return data;
}

export async function fetchStoreCategories() {
  const { data } = await api.get("/store/categories");
  return data;
}
