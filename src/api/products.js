export const API_BASE = 'https://dummyjson.com/products'


export async function fetchProducts({ page, limit, signal }) {
    const skip = (page - 1) * limit
    const url = `${API_BASE}?limit=${limit}&skip=${skip}`
    const res = await fetch(url, { signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
}