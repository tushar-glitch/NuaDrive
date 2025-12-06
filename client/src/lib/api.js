const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Remove Content-Type if body is FormData (let browser handle boundary)
  // OR if explicitly set to null (to allow manual override)
  if (options.body instanceof FormData || options.headers?.['Content-Type'] === null) {
      delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Important for cookies
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || 'Something went wrong');
    error.status = response.status;
    throw error;
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
  logout: () => request('/auth/logout', { method: 'POST' }),
};
export const files = {
  list: () => request('/files'),
  upload: (formData) => {
    // We use a custom request here because we need to NOT set Content-Type
    // so the browser can set the boundary for the FormData
    return request('/files/upload', {
      method: 'POST',
      body: formData,
      // The request helper typically adds Content-Type: application/json
      // We need to override headers to exclude Content-Type for FormData
      headers: {
        'Content-Type': null
      }, 
    });
  },
  getDownloadLink: (id) => request(`/files/${id}/download`),
  listShared: () => request('/files/shared-with-me'),
  updateSettings: (id, settings) => request(`/files/${id}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  }),
};
