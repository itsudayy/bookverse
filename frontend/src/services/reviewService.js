import api from "./api";

export async function fetchReviews(source, bookId) {
  const { data } = await api.get(`/reviews/${source}/${bookId}`);
  return data;
}

export async function addReview(source, bookId, payload) {
  const { data } = await api.post(`/reviews/${source}/${bookId}`, payload);
  return data;
}
