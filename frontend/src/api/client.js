const tokenKey = "token";

export const saveToken = (token) => localStorage.setItem(tokenKey, token);
export const getToken = () => localStorage.getItem(tokenKey);
export const clearToken = () => localStorage.removeItem(tokenKey);

export const apiRequest = async (
  path,
  { method = "GET", body, isForm = false } = {},
) => {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body && !isForm ? JSON.stringify(body) : body,
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    // Respons bukan JSON, biasanya backend mati atau port proxy salah.
  }

  if (!response.ok) {
    const error = new Error(
      data.message || "Server tidak dapat dihubungi. Pastikan backend berjalan",
    );
    error.status = response.status;
    error.details = data.errors || [];
    throw error;
  }
  return data;
};
