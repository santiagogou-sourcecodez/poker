import type { ReactNode } from 'react'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-900/50 text-emerald-400 border-emerald-500/20',
  danger: 'bg-red-900/50 text-red-400 border-red-500/20',
  warning: 'bg-amber-900/50 text-amber-400 border-amber-500/20',
  info: 'bg-sky-900/50 text-sky-400 border-sky-500/20',
  neutral: 'bg-slate-800 text-slate-400 border-slate-700',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border
        ${variantClasses[variant]}
      `}
    >
      {children}
    </span>
  )
}
