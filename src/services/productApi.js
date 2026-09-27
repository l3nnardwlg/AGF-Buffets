const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || `API request failed (${response.status})`)
  return payload
}

export const productApi = {
  health: () => request('/api/health'),
  search: (query, source = 'openfoodfacts') =>
    request(`/api/products/search?q=${encodeURIComponent(query)}&source=${encodeURIComponent(source)}`),
  barcode: (code) => request(`/api/products/barcode?code=${encodeURIComponent(code)}`),
  createOrder: (order) => request('/api/orders', { method: 'POST', body: JSON.stringify(order) }),
}
