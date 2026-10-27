import type { ReactNode } from 'react'

const style = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 } as const

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div style={style}>
      <h1 className="text-h1" style={{ margin: 0 }}>
        {title}
      </h1>
      {actions}
    </div>
  )
}
