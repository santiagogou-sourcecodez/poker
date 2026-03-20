import { PlayerAvatar } from '../ui/PlayerAvatar'
import { Button } from '../ui/Button'
import { BUYIN_EUROS } from '../../lib/constants'
import type { GamePlayer, Player } from '../../db/models'

interface PlayerRowProps {
  gamePlayer: GamePlayer & { player: Player }
  onRebuy: (gpId: number) => void
  onRemove?: (gpId: number) => void
}

export function PlayerRow({ gamePlayer, onRebuy, onRemove }: PlayerRowProps) {
  const totalInvested = gamePlayer.buyIns * BUYIN_EUROS

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
      <PlayerAvatar name={gamePlayer.player.name} emoji={gamePlayer.player.emoji} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200 truncate">
          {gamePlayer.player.name}
        </div>
        <div className="text-xs text-slate-500">
          {gamePlayer.buyIns} buy-in{gamePlayer.buyIns !== 1 ? 's' : ''} &middot; €{totalInvested}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onRemove && gamePlayer.buyIns === 1 && (
          <Button variant="ghost" size="sm" onClick={() => onRemove(gamePlayer.id!)}>
            ✕
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={() => onRebuy(gamePlayer.id!)}>
          Rebuy
        </Button>
      </div>
    </div>
  )
}
