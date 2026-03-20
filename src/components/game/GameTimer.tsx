import { useState, useEffect } from 'react'
import { formatDuration } from '../../lib/format'

interface GameTimerProps {
  startedAt: Date
}

export function GameTimer({ startedAt }: GameTimerProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="text-sm text-slate-500 font-mono">
      {formatDuration(startedAt)}
    </span>
  )
}
