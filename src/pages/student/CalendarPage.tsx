import { PageHeader } from '../../layouts/PageHeader'
import { SchoolCalendar } from '../shared/SchoolCalendar'

export function CalendarPage() {
  return (
    <>
      <PageHeader title="학사일정" />
      <SchoolCalendar />
    </>
  )
}
