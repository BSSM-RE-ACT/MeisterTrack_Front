import type { BadgeTone } from './Badge'

// 의미 색: 대기=amber / 승인=blue / 반려·결석=red / 카테고리·긍정=teal
export const statusTone = {
  대기: 'amber',
  승인: 'blue',
  반려: 'red',
  출석: 'blue',
  지각: 'amber',
  조퇴: 'gray',
  결석: 'red',
} as const satisfies Record<string, BadgeTone>
