import type { GamePlayer } from '../../db/models'
import { calculateTotalPot } from '../../lib/settlement'

interface GameSummaryBarProps {
  gamePlayers: GamePlayer[]
}

export function GameSummaryBar({ gamePlayers }: GameSummaryBarProps) {
  const totalPot = calculateTotalPot(gamePlayers)
  const totalBuyIns = gamePlayers.reduce((sum, gp) => sum + gp.buyIns, 0)

  return (
    <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
      <div>
        <div className="text-xs text-slate-500 tracking-wider">players</div>
        <div className="text-lg font-bold text-slate-200">{gamePlayers.length}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-slate-500 tracking-wider">buy-ins</div>
        <div className="text-lg font-bold text-slate-200">{totalBuyIns}</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-500 tracking-wider">pot</div>
        <div className="text-lg font-bold text-emerald-400">€{totalPot}</div>
      </div>
    </div>
  )
}
