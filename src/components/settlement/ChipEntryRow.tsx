import { PlayerAvatar } from '../ui/PlayerAvatar'
import { ChipInput } from '../ui/ChipInput'
import { calculateCashIn, calculateNet, calculateCashOut } from '../../lib/settlement'
import type { GamePlayer, Player } from '../../db/models'

interface ChipEntryRowProps {
  gamePlayer: GamePlayer & { player: Player }
  onChipsChange: (gpId: number, chips: number | undefined) => void
}

export function ChipEntryRow({ gamePlayer, onChipsChange }: ChipEntryRowProps) {
  const cashIn = calculateCashIn(gamePlayer.buyIns)
  const hasChips = gamePlayer.finalChips !== undefined && gamePlayer.finalChips !== null
  const net = hasChips ? calculateNet(gamePlayer.buyIns, gamePlayer.finalChips!) : null
  const cashOut = hasChips ? calculateCashOut(gamePlayer.finalChips!) : null

  return (
    <div className="py-3 border-b border-slate-800 last:border-0">
      <div className="flex items-center gap-3">
        <PlayerAvatar name={gamePlayer.player.name} emoji={gamePlayer.player.emoji} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-200 text-sm truncate">
            {gamePlayer.player.name}
          </div>
          <div className="text-xs text-slate-500">
            {gamePlayer.buyIns} buy-in{gamePlayer.buyIns !== 1 ? 's' : ''} &middot; €{cashIn} in
          </div>
        </div>
        <ChipInput
          value={gamePlayer.finalChips}
          onChange={(v) => onChipsChange(gamePlayer.id!, v)}
        />
      </div>
      {net !== null && (
        <div className="flex justify-end mt-1 gap-3 text-xs">
          <span className="text-slate-500">€{cashOut!.toFixed(2)} out</span>
          <span className={net >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
            {net >= 0 ? '+' : ''}€{net.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}
