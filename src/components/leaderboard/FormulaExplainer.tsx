import { useState } from 'react'
import { NET_DIVISOR, GAMES_MULTIPLIER, MIN_GAMES_FOR_RANKING } from '../../lib/constants'

export function FormulaExplainer() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1"
      >
        <span>{open ? '▾' : '▸'}</span>
        how are points calculated?
      </button>
      {open && (
        <div className="mt-2 p-3 bg-slate-800/50 rounded-xl text-xs text-slate-400 space-y-2">
          <p className="font-mono text-slate-300">
            points = round(totalNet / {NET_DIVISOR} + {GAMES_MULTIPLIER} × gamesPlayed)
          </p>
          <p>
            rewards both profit and consistency. playing more games earns base points even if you break even.
          </p>
          <p>
            minimum {MIN_GAMES_FOR_RANKING} games to appear in the ranked section.
          </p>
        </div>
      )}
    </div>
  )
}
