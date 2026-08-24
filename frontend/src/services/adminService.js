import api from "./api";

// One-time self-promotion: the secret is sent once, and every admin action
// afterwards is authorised by the account's role, not by the secret.
export async function bootstrapAdmin(secret) {
  const { data } = await api.post(
    "/auth/bootstrap-admin",
    {},
    { headers: { "x-admin-secret": secret } }
  );
  return data;
}

export const booksAdmin = {
  create: async (payload) => (await api.post("/books", payload)).data,
  update: async (id, payload) => (await api.put(`/books/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/books/${id}`)).data,
};
