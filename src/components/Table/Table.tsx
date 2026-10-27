import type { ReactNode } from 'react'
import styles from './Table.module.css'

export interface Column<T> {
  key: string
  header: string
  width?: number
  align?: 'left' | 'center'
  render: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  empty?: ReactNode
}

// 헤더 40 / 행 48 / 구분선 1px gray-100. 컬럼 간격은 셀 좌우 패딩 12px.
export function Table<T>({ columns, rows, rowKey, onRowClick, empty = '데이터가 없습니다' }: TableProps<T>) {
  return (
    <table className={styles.table}>
      <colgroup>
        {columns.map((col) => (
          <col key={col.key} style={col.width ? { width: col.width } : undefined} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className={col.align === 'center' ? styles.center : undefined}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className={styles.empty}>
              {empty}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={onRowClick ? styles.clickable : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className={col.align === 'center' ? styles.center : undefined}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

// 32×32, 선택 시 blue-500, 카드 하단 중앙
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <nav className={styles.pagination}>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          className={`${styles.pageButton} ${p === page ? styles.pageActive : ''}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
    </nav>
  )
}
