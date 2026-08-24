import api from "./api";

export async function fetchUsedBooks(params) {
  const { data } = await api.get("/community/books", { params });
  return data;
}

export async function fetchUsedBook(id) {
  const { data } = await api.get(`/community/books/${id}`);
  return data;
}

export async function fetchMyUsedBooks() {
  const { data } = await api.get("/community/books/mine");
  return data;
}

export async function addUsedBook(payload) {
  const { data } = await api.post("/community/books", payload);
  return data;
}

export async function removeUsedBook(id) {
  const { data } = await api.delete(`/community/books/${id}`);
  return data;
}

export async function requestBorrow(id, shipping) {
  const { data } = await api.post(`/community/books/${id}/request`, shipping);
  return data;
}

export async function fetchRequests() {
  const { data } = await api.get("/community/requests");
  return data;
}

export async function respondToRequest(id, action) {
  const { data } = await api.post(`/community/requests/${id}/respond`, { action });
  return data;
}

export async function returnUsedBook(id) {
  const { data } = await api.post(`/community/requests/${id}/return`);
  return data;
}
