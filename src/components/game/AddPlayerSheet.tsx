import { useState } from 'react'
import type { Player } from '../../db/models'
import { PlayerAvatar } from '../ui/PlayerAvatar'
import { Button } from '../ui/Button'

interface AddPlayerSheetProps {
  open: boolean
  players: Player[]
  existingPlayerIds: number[]
  onAdd: (playerIds: number[]) => void
  onClose: () => void
}

export function AddPlayerSheet({
  open,
  players,
  existingPlayerIds,
  onAdd,
  onClose,
}: AddPlayerSheetProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  if (!open) return null

  const available = players.filter((p) => p.isActive && !existingPlayerIds.includes(p.id!))

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAdd = () => {
    onAdd(Array.from(selected))
    setSelected(new Set())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border-t border-slate-800 rounded-t-2xl p-4 w-full max-w-lg max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">add players</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl">
            ✕
          </button>
        </div>

        {available.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            all active players are already in the game.
          </p>
        ) : (
          <div className="space-y-1">
            {available.map((player) => (
              <button
                key={player.id}
                onClick={() => toggle(player.id!)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl transition-colors
                  ${selected.has(player.id!)
                    ? 'bg-emerald-900/30 border border-emerald-500/30'
                    : 'hover:bg-slate-800 border border-transparent'}
                `}
              >
                <PlayerAvatar name={player.name} emoji={player.emoji} size="sm" />
                <span className="text-slate-200 font-medium">{player.name}</span>
                {selected.has(player.id!) && (
                  <span className="ml-auto text-emerald-400">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        {available.length > 0 && (
          <div className="mt-4">
            <Button
              fullWidth
              disabled={selected.size === 0}
              onClick={handleAdd}
            >
              add {selected.size > 0 ? `${selected.size} player${selected.size > 1 ? 's' : ''}` : 'players'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
