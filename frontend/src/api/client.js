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
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Terjadi kesalahan");
    error.status = response.status;
    error.details = data.errors || [];
    throw error;
  }
  return data;
};
