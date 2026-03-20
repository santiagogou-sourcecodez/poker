export function formatCurrency(euros: number): string {
  const sign = euros >= 0 ? '+' : ''
  return `${sign}€${Math.abs(euros).toFixed(2)}`
}

export function formatCurrencyShort(euros: number): string {
  const sign = euros >= 0 ? '+' : '-'
  const abs = Math.abs(euros)
  if (abs === Math.floor(abs)) {
    return `${sign}€${abs}`
  }
  return `${sign}€${abs.toFixed(2)}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDuration(startedAt: Date, endedAt?: Date): string {
  const end = endedAt ?? new Date()
  const ms = end.getTime() - startedAt.getTime()
  const hours = Math.floor(ms / 3600000)
  const mins = Math.floor((ms % 3600000) / 60000)
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins}m`
}

export function formatChips(chips: number): string {
  return chips.toLocaleString()
}
