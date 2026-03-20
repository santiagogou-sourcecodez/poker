import { PlayerAvatar } from '../ui/PlayerAvatar'
import type { GamePlayer, Player } from '../../db/models'

interface ResultCardProps {
  gamePlayer: GamePlayer & { player: Player }
  rank: number
}

export function ResultCard({ gamePlayer, rank }: ResultCardProps) {
  const net = gamePlayer.net ?? 0

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
      <span className="text-sm text-slate-500 w-6 text-center font-mono">{rank}</span>
      <PlayerAvatar name={gamePlayer.player.name} emoji={gamePlayer.player.emoji} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200 text-sm truncate">
          {gamePlayer.player.name}
        </div>
        <div className="text-xs text-slate-500">
          €{gamePlayer.cashIn?.toFixed(2)} in &middot; €{gamePlayer.cashOut?.toFixed(2)} out
        </div>
      </div>
      <div
        className={`text-sm font-bold ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
      >
        {net >= 0 ? '+' : ''}€{net.toFixed(2)}
      </div>
    </div>
  )
}
