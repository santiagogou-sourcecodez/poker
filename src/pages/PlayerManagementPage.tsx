import { useState } from 'react'
import { PageHeader, PageContent } from '../components/layout/Shell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PlayerAvatar } from '../components/ui/PlayerAvatar'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { usePlayers } from '../hooks/usePlayers'
import { db } from '../db/database'

export function PlayerManagementPage() {
  const { players } = usePlayers()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deactivateId, setDeactivateId] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    if (editingId) {
      await db.players.update(editingId, { name: trimmed, emoji: emoji || undefined })
      setEditingId(null)
    } else {
      await db.players.add({
        name: trimmed,
        emoji: emoji || undefined,
        createdAt: new Date(),
        isActive: true,
      })
    }
    setName('')
    setEmoji('')
  }

  const startEdit = (id: number) => {
    const player = players.find((p) => p.id === id)
    if (player) {
      setEditingId(id)
      setName(player.name)
      setEmoji(player.emoji ?? '')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setEmoji('')
  }

  const toggleActive = async () => {
    if (deactivateId === null) return
    const player = players.find((p) => p.id === deactivateId)
    if (player) {
      await db.players.update(deactivateId, { isActive: !player.isActive })
    }
    setDeactivateId(null)
  }

  const active = players.filter((p) => p.isActive)
  const inactive = players.filter((p) => !p.isActive)

  return (
    <>
      <PageHeader title="Players" />
      <PageContent>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="😎"
            className="w-12 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2.5 text-center text-lg focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <Button type="submit" disabled={!name.trim()}>
            {editingId ? 'Save' : 'Add'}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={cancelEdit}>
              ✕
            </Button>
          )}
        </form>

        {players.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No players yet"
            description="Add your poker crew above to get started."
          />
        ) : (
          <>
            {active.length > 0 && (
              <Card className="mb-4">
                {active.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0"
                  >
                    <PlayerAvatar name={player.name} emoji={player.emoji} />
                    <span className="flex-1 font-medium text-slate-200">{player.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(player.id!)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeactivateId(player.id!)}>
                      Deactivate
                    </Button>
                  </div>
                ))}
              </Card>
            )}

            {inactive.length > 0 && (
              <>
                <h3 className="text-sm text-slate-500 uppercase tracking-wider mb-2 mt-6">
                  Inactive
                </h3>
                <Card>
                  {inactive.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0 opacity-60"
                    >
                      <PlayerAvatar name={player.name} emoji={player.emoji} />
                      <span className="flex-1 font-medium text-slate-400">{player.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          db.players.update(player.id!, { isActive: true })
                        }}
                      >
                        Reactivate
                      </Button>
                    </div>
                  ))}
                </Card>
              </>
            )}
          </>
        )}
      </PageContent>

      <ConfirmDialog
        open={deactivateId !== null}
        title="Deactivate Player"
        message="They won't show up when starting new games. Their history is preserved."
        confirmLabel="Deactivate"
        onConfirm={toggleActive}
        onCancel={() => setDeactivateId(null)}
      />
    </>
  )
}
