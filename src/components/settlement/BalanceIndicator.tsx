interface BalanceIndicatorProps {
  difference: number
  allEntered: boolean
}

export function BalanceIndicator({ difference, allEntered }: BalanceIndicatorProps) {
  if (!allEntered) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 rounded-xl">
        <div className="w-2 h-2 rounded-full bg-slate-500" />
        <span className="text-sm text-slate-400">enter all chip counts to settle</span>
      </div>
    )
  }

  if (difference === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-900/30 border border-emerald-500/30 rounded-xl">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-sm text-emerald-400 font-medium">balanced — ready to save</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-xl">
      <div className="w-2 h-2 rounded-full bg-red-400" />
      <span className="text-sm text-red-400 font-medium">
        off by {Math.abs(difference)} chips ({difference > 0 ? 'too many' : 'too few'})
      </span>
    </div>
  )
}
