import { clearToken, getToken } from "../api/client";

// Payload JWT backend: { idPengguna, role, iat, exp }.
const decodePayload = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const getSession = () => {
  const token = getToken();
  if (!token) return null;
  const payload = decodePayload(token);
  if (!payload || payload.exp * 1000 < Date.now()) {
    clearToken();
    return null;
  }
  return { idPengguna: payload.idPengguna, role: payload.role };
};
