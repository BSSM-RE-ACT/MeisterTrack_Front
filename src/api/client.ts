// FastAPI 백엔드 연동. 주소는 .env의 VITE_API_BASE_URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const TOKEN_KEY = 'accessToken'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

let onUnauthorized: () => void = () => {}

/** 토큰 만료(401) 시 로그아웃 처리를 등록한다 */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

// FastAPI 오류 응답({detail: string | string[] | {msg}[]})을 사람이 읽을 문장으로 바꾼다
function errorMessage(body: unknown, status: number): string {
  const detail = (body as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => (typeof d === 'string' ? d : (d as { msg?: string }).msg ?? '')).join('\n')
  }
  return `요청에 실패했습니다 (${status})`
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized()
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, errorMessage(body, res.status))
  }
  return res.status === 204 ? (undefined as T) : res.json()
}
