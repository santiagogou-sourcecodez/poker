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
        How are points calculated?
      </button>
      {open && (
        <div className="mt-2 p-3 bg-slate-800/50 rounded-xl text-xs text-slate-400 space-y-2">
          <p className="font-mono text-slate-300">
            Points = round(totalNet / {NET_DIVISOR} + {GAMES_MULTIPLIER} × gamesPlayed)
          </p>
          <p>
            Rewards both profit and consistency. Playing more games earns base points even if you break even.
          </p>
          <p>
            Minimum {MIN_GAMES_FOR_RANKING} games to appear in the ranked section.
          </p>
        </div>
      )}
    </div>
  )
}
