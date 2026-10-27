import { WEEKDAYS } from './dates'
import type { AfterSchoolCourse } from './types'

export function courseTime(c: Pick<AfterSchoolCourse, 'weekday' | 'start_time' | 'end_time'>) {
  return `${WEEKDAYS[c.weekday]} ${c.start_time}~${c.end_time}`
}

export function signed(n: number) {
  return n > 0 ? `+${n}` : String(n)
}
