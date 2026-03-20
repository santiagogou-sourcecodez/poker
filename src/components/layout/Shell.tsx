import type { ReactNode } from 'react'

interface ShellProps {
  children: ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto w-full">
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  right?: ReactNode
}

export function PageHeader({ title, right }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <h1 className="text-xl font-bold text-slate-200">{title}</h1>
      {right}
    </div>
  )
}

interface PageContentProps {
  children: ReactNode
  className?: string
}

export function PageContent({ children, className = '' }: PageContentProps) {
  return (
    <div className={`flex-1 overflow-y-auto px-4 pb-24 ${className}`}>
      {children}
    </div>
  )
}
