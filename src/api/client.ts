// FastAPI 백엔드 연동. 주소는 .env의 VITE_API_BASE_URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) throw new ApiError(res.status, await res.text())
  return res.status === 204 ? (undefined as T) : res.json()
}
