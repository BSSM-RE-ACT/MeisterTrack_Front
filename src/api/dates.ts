// 날짜는 로컬 기준 YYYY-MM-DD 문자열로 주고받는다 (toISOString은 UTC라 하루 밀릴 수 있음)
export function toYmd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function toYm(d: Date): string {
  return toYmd(d).slice(0, 7)
}

/** 이번 주 월요일 ~ 금요일 */
export function weekRange(base = new Date()): [Date, Date] {
  const monday = new Date(base)
  monday.setDate(base.getDate() - ((base.getDay() + 6) % 7))
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return [monday, friday]
}

/** 0=월 ~ 4=금, 주말이면 null */
export function weekdayIndex(d = new Date()): number | null {
  const i = (d.getDay() + 6) % 7
  return i < 5 ? i : null
}

export const WEEKDAYS = ['월', '화', '수', '목', '금']

/** 현재 학기 (예: "2026-2"). 8월부터 2학기 */
export function currentSemester(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1 >= 8 ? 2 : 1}`
}

export function monthRange(month: Date): [string, string] {
  const start = new Date(month.getFullYear(), month.getMonth(), 1)
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  return [toYmd(start), toYmd(end)]
}
