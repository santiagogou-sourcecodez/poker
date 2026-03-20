import { PlayerAvatar } from '../ui/PlayerAvatar'
import { Card } from '../ui/Card'
import type { Transfer } from '../../lib/settlement'
import type { Player } from '../../db/models'

interface TransferListProps {
  transfers: Transfer[]
  playerMap: Map<number, Player>
}

export function TransferList({ transfers, playerMap }: TransferListProps) {
  if (transfers.length === 0) return null

  return (
    <div className="mt-6">
      <h3 className="text-sm text-slate-500 tracking-wider mb-2">
        transfers ({transfers.length})
      </h3>
      <Card>
        {transfers.map((t, i) => {
          const from = playerMap.get(t.fromId)
          const to = playerMap.get(t.toId)
          if (!from || !to) return null

          return (
            <div
              key={i}
              className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0"
            >
              <PlayerAvatar name={from.name} emoji={from.emoji} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-medium text-slate-200 truncate">{from.name}</span>
                  <span className="text-slate-600">→</span>
                  <span className="font-medium text-slate-200 truncate">{to.name}</span>
                </div>
                {to.paymentMethod && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    {to.paymentMethod}{to.paymentDetails ? ` · ${to.paymentDetails}` : ''}
                  </div>
                )}
              </div>
              <div className="text-sm font-bold text-amber-400 shrink-0">
                €{t.amount.toFixed(2)}
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
