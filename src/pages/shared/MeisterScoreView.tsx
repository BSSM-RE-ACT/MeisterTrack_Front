import type { StudentScore } from '../../api/types'
import { Badge, Card } from '../../components'
import styles from './MeisterScoreView.module.css'

/** 마역량 정보 카드: 종합 점수 + 카테고리 세로 5줄 (카테고리 → 세부 항목 → 상세) */
export function MeisterScoreView({ score }: { score: StudentScore }) {
  return (
    <Card className={styles.card}>
      <div className={styles.total}>
        <span className="text-h2">종합 점수</span>
        <span className={styles.totalValue}>{score.total}</span>
      </div>
      {score.categories.map((c) => {
        // 세부 항목별로 묶는다
        const byItem = new Map<string, typeof c.items>()
        for (const s of c.items) byItem.set(s.item, [...(byItem.get(s.item) ?? []), s])
        return (
          <section key={c.category} className={styles.category}>
            <header className={styles.categoryHead}>
              <span className="text-h3">{c.category}</span>
              <Badge tone="teal">{c.score}점</Badge>
              <span className={styles.grade}>{c.grade ?? '등급 산정 전'}</span>
            </header>
            {byItem.size === 0 ? (
              <p className={styles.empty}>승인된 항목이 없습니다</p>
            ) : (
              <ul className={styles.items}>
                {[...byItem.entries()].map(([item, subs]) => (
                  <li key={item}>
                    <div className={styles.itemHead}>
                      <span>{item}</span>
                      <span>{subs.reduce((sum, s) => sum + (s.score ?? 0), 0)}점</span>
                    </div>
                    <ul className={styles.details}>
                      {subs.map((s) => (
                        <li key={s.id}>
                          {s.title}
                          {s.acquired_at && <span> · {s.acquired_at.slice(0, 10)}</span>}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </Card>
  )
}
