import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`
        bg-slate-900 rounded-2xl border border-slate-800 p-4
        ${onClick ? 'cursor-pointer hover:border-slate-700 active:bg-slate-800/80 transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
