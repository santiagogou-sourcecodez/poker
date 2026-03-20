import { useState, useRef, useEffect } from 'react'
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
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentDetails, setPaymentDetails] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deactivateId, setDeactivateId] = useState<number | null>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const EMOJI_OPTIONS = [
    // poker & games
    '🃏', '♠️', '♥️', '♦️', '♣️', '🎲', '🎰', '🎯',
    '🎱', '🎳', '🎮', '🕹️', '🏆', '🥇', '🥈', '🥉',
    // money & luck
    '💰', '💵', '💸', '💎', '🍀', '🔮', '🧿', '✨',
    '⭐', '🌟', '💫', '⚡', '🔥', '❤️‍🔥', '🌈', '🎪',
    // animals
    '🐺', '🦊', '🐻', '🦁', '🐯', '🐸', '🦅', '🐉',
    '🦈', '🐍', '🦂', '🐝', '🦋', '🐙', '🦎', '🐧',
    '🐨', '🐼', '🦄', '🐬', '🦩', '🦜', '🐊', '🐢',
    '🐎', '🐾', '🦉', '🦇', '🐈', '🐕', '🐖', '🐘',
    // faces & people
    '😎', '🤠', '🥷', '🧙', '🧛', '🤖', '👻', '💀',
    '🎃', '👽', '🤡', '🦸', '🦹', '🧜', '🧞', '🧚',
    '😈', '👹', '👺', '🤑', '🤓', '🧐', '🥸', '😏',
    // food & drink
    '🍺', '🍻', '🥃', '🍷', '🍸', '🍹', '☕', '🧉',
    '🍕', '🌮', '🍔', '🌶️', '🍣', '🍩', '🧁', '🍿',
    // nature & weather
    '🌙', '🌞', '🌊', '🏔️', '🌋', '🌵', '🍄', '🌸',
    '🌺', '🌻', '🍁', '❄️', '☀️', '⛈️', '🌪️', '💧',
    // objects & symbols
    '🎭', '🎨', '🎸', '🎺', '🎻', '🥁', '🎤', '🎬',
    '📸', '🔑', '🗝️', '🧲', '💣', '🧨', '🪓', '⚔️',
    '🛡️', '🏹', '🔱', '👑', '💍', '📿', '🧊', '🪩',
    // sports & activities
    '⚽', '🏀', '🏈', '🎾', '🏐', '🎳', '🏄', '🏂',
    '🚴', '🏋️', '🤺', '🥊', '🧗', '🏇', '🎣', '🤿',
    // travel & places
    '🚀', '🛸', '🏰', '🗽', '🎡', '🎢', '🏝️', '⛩️',
    // flags & misc
    '🏴‍☠️', '🚩', '🏁', '🎌', '⚓', '🧭', '🪐', '🌍',
    // hands & gestures
    '🤙', '✌️', '🤘', '👊', '🫡', '🫶', '💪', '🙌',
  ]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    if (editingId) {
      await db.players.update(editingId, {
        name: trimmed,
        emoji: emoji || undefined,
        paymentMethod: paymentMethod.trim() || undefined,
        paymentDetails: paymentDetails.trim() || undefined,
      })
      setEditingId(null)
    } else {
      await db.players.add({
        name: trimmed,
        emoji: emoji || undefined,
        paymentMethod: paymentMethod.trim() || undefined,
        paymentDetails: paymentDetails.trim() || undefined,
        createdAt: new Date(),
        isActive: true,
      })
    }
    setName('')
    setEmoji('')
    setPaymentMethod('')
    setPaymentDetails('')
  }

  const startEdit = (id: number) => {
    const player = players.find((p) => p.id === id)
    if (player) {
      setEditingId(id)
      setName(player.name)
      setEmoji(player.emoji ?? '')
      setPaymentMethod(player.paymentMethod ?? '')
      setPaymentDetails(player.paymentDetails ?? '')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setEmoji('')
    setPaymentMethod('')
    setPaymentDetails('')
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
      <PageHeader title="players" />
      <PageContent>
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <div className="flex gap-2">
            <div className="relative" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-12 h-11 bg-slate-800 border border-slate-700 rounded-xl text-center text-lg focus:outline-none focus:border-emerald-500 hover:border-slate-600"
              >
                {emoji || '😎'}
              </button>
              {showEmojiPicker && (
                <div className="absolute top-12 left-0 z-50 bg-slate-900 border border-slate-700 rounded-xl p-2 grid grid-cols-8 gap-1 w-72 max-h-64 overflow-y-auto shadow-lg">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setEmoji(e)
                        setShowEmojiPicker(false)
                      }}
                      className={`w-8 h-8 text-lg rounded-lg flex items-center justify-center hover:bg-slate-700 ${emoji === e ? 'bg-slate-700 ring-1 ring-emerald-500' : ''}`}
                    >
                      {e}
                    </button>
                  ))}
                  {emoji && (
                    <button
                      type="button"
                      onClick={() => {
                        setEmoji('')
                        setShowEmojiPicker(false)
                      }}
                      className="col-span-8 mt-1 text-xs text-slate-500 hover:text-slate-300 py-1"
                    >
                      clear
                    </button>
                  )}
                </div>
              )}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="player name"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">payment method</option>
              <option value="bizum">bizum</option>
              <option value="revolut">revolut</option>
              <option value="paypal">paypal</option>
              <option value="bank transfer">bank transfer</option>
              <option value="cash">cash</option>
              <option value="other">other</option>
            </select>
            <input
              type="text"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              placeholder="phone, @username, etc."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" fullWidth disabled={!name.trim()}>
              {editingId ? 'save' : 'add player'}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={cancelEdit}>
                cancel
              </Button>
            )}
          </div>
        </form>

        {players.length === 0 ? (
          <EmptyState
            icon="👥"
            title="no players yet"
            description="add your poker crew above to get started."
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
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200">{player.name}</div>
                      {player.paymentMethod && (
                        <div className="text-xs text-slate-500">
                          {player.paymentMethod}{player.paymentDetails ? ` · ${player.paymentDetails}` : ''}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(player.id!)}>
                      edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeactivateId(player.id!)}>
                      deactivate
                    </Button>
                  </div>
                ))}
              </Card>
            )}

            {inactive.length > 0 && (
              <>
                <h3 className="text-sm text-slate-500 tracking-wider mb-2 mt-6">
                  inactive
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
                        reactivate
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
        title="deactivate player?"
        message="they won't show up when starting new games. their history is preserved."
        confirmLabel="deactivate"
        onConfirm={toggleActive}
        onCancel={() => setDeactivateId(null)}
      />
    </>
  )
}
