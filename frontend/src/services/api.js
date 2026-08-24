import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050/api",
});

api.interceptors.request.use(async (config) => {
  // On a hard page load, Firebase hasn't yet restored the persisted session
  // at the moment a mounting component's first request fires — reading
  // auth.currentUser synchronously here would silently send the request
  // unauthenticated. authStateReady() waits for that initial restore.
  if (auth) await auth.authStateReady();

  const user = auth?.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
