import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toYmd, WEEKDAYS, weekRange } from '../../api/dates'
import { mealApi } from '../../api/endpoints'
import { Card, Empty, ErrorState, Loading } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import styles from './MealPage.module.css'

const MEAL_TYPES = ['조식', '중식', '석식'] as const

export function MealPage() {
  const [base, setBase] = useState(() => new Date())
  const [monday, friday] = weekRange(base)
  const start = toYmd(monday)
  const end = toYmd(friday)
  const { data, isLoading, error } = useQuery({ queryKey: ['meals', start, end], queryFn: () => mealApi.list(start, end) })

  const move = (weeks: number) => setBase(new Date(base.getFullYear(), base.getMonth(), base.getDate() + weeks * 7))
  const days = WEEKDAYS.map((name, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    return { name, date: toYmd(d), label: `${d.getMonth() + 1}/${d.getDate()}` }
  })
  const today = toYmd(new Date())

  return (
    <>
      <PageHeader
        title="급식"
        actions={
          <div className={styles.weekNav}>
            <button aria-label="이전 주" onClick={() => move(-1)}>
              <ChevronLeft size={20} />
            </button>
            <span>
              {days[0].label} ~ {days[4].label}
            </span>
            <button aria-label="다음 주" onClick={() => move(1)}>
              <ChevronRight size={20} />
            </button>
          </div>
        }
      />
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <div className={styles.grid}>
          {days.map((day) => (
            <Card key={day.date} className={day.date === today ? styles.today : undefined}>
              <div className={styles.dayHead}>
                <span className="text-h3">{day.name}</span>
                <span className={styles.dayDate}>{day.label}</span>
              </div>
              {MEAL_TYPES.map((type) => {
                const meal = data?.find((m) => m.date === day.date && m.type === type)
                if (!meal) return null
                return (
                  <section key={type} className={styles.meal}>
                    <h3>{type}</h3>
                    <ul>
                      {meal.dishes.map((dish) => (
                        <li key={dish.name}>{dish.name}</li>
                      ))}
                    </ul>
                    {meal.calories && <p className={styles.kcal}>{meal.calories}</p>}
                  </section>
                )
              })}
              {!data?.some((m) => m.date === day.date) && <Empty>급식 없음</Empty>}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
