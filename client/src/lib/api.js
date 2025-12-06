const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // Important for cookies
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const auth = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (name, email, password) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }),
};
