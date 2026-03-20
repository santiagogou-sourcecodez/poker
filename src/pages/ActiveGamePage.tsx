import { useState, useCallback, useEffect } from 'react'
import { useLocation } from 'wouter'
import { PageHeader, PageContent } from '../components/layout/Shell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { PlayerRow } from '../components/game/PlayerRow'
import { AddPlayerSheet } from '../components/game/AddPlayerSheet'
import { GameSummaryBar } from '../components/game/GameSummaryBar'
import { GameTimer } from '../components/game/GameTimer'
import { useActiveGame } from '../hooks/useActiveGame'
import { usePlayers } from '../hooks/usePlayers'
import { db } from '../db/database'

export function ActiveGamePage() {
  const [, setLocation] = useLocation()
  const activeGame = useActiveGame()
  const { players } = usePlayers()
  const [showAddPlayers, setShowAddPlayers] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [undoId, setUndoId] = useState<number | null>(null)
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  // Clear undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimer) clearTimeout(undoTimer)
    }
  }, [undoTimer])

  const startGame = async () => {
    const now = new Date()
    await db.games.add({
      date: now.toISOString().split('T')[0],
      startedAt: now,
      status: 'active',
    })
    // Open add players sheet
    setShowAddPlayers(true)
  }

  const addPlayers = async (playerIds: number[]) => {
    if (!activeGame?.game.id) return
    const adds = playerIds.map((playerId) => ({
      gameId: activeGame.game.id!,
      playerId,
      buyIns: 1,
    }))
    await db.gamePlayers.bulkAdd(adds)
  }

  const handleRebuy = useCallback(async (gpId: number) => {
    // Clear any existing undo
    if (undoTimer) clearTimeout(undoTimer)
    setUndoId(null)

    await db.gamePlayers.where('id').equals(gpId).modify((gp) => {
      gp.buyIns += 1
    })

    setUndoId(gpId)
    const timer = setTimeout(() => {
      setUndoId(null)
      setUndoTimer(null)
    }, 4000)
    setUndoTimer(timer)
  }, [undoTimer])

  const undoRebuy = async () => {
    if (!undoId) return
    if (undoTimer) clearTimeout(undoTimer)
    await db.gamePlayers.where('id').equals(undoId).modify((gp) => {
      gp.buyIns = Math.max(1, gp.buyIns - 1)
    })
    setUndoId(null)
    setUndoTimer(null)
  }

  const removePlayer = async (gpId: number) => {
    await db.gamePlayers.delete(gpId)
  }

  const endGame = async () => {
    if (!activeGame?.game.id) return
    await db.games.update(activeGame.game.id, { status: 'settling' })
    setShowEndConfirm(false)
    setLocation('/game/settle')
  }

  // Loading state
  if (activeGame === undefined) {
    return null
  }

  // No active game
  if (activeGame === null) {
    return (
      <>
        <PageHeader title="Game Night" />
        <PageContent className="flex items-center justify-center">
          <EmptyState
            icon="🃏"
            title="No game running"
            description="Start a new game night and add your players."
            action={
              <Button size="lg" onClick={startGame}>
                Start Game Night
              </Button>
            }
          />
        </PageContent>
      </>
    )
  }

  // If game is in settling state, redirect
  if (activeGame.game.status === 'settling') {
    setLocation('/game/settle')
    return null
  }

  const existingPlayerIds = activeGame.gamePlayers.map((gp) => gp.playerId)

  return (
    <>
      <PageHeader
        title="Game Night"
        right={<GameTimer startedAt={activeGame.game.startedAt} />}
      />
      <PageContent>
        <GameSummaryBar gamePlayers={activeGame.gamePlayers} />

        <div className="mt-4">
          {activeGame.gamePlayers.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No players yet"
              description="Add players to start tracking buy-ins."
              action={
                <Button onClick={() => setShowAddPlayers(true)}>
                  Add Players
                </Button>
              }
            />
          ) : (
            <Card>
              {activeGame.gamePlayers.map((gp) => (
                <PlayerRow
                  key={gp.id}
                  gamePlayer={gp}
                  onRebuy={handleRebuy}
                  onRemove={removePlayer}
                />
              ))}
            </Card>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowAddPlayers(true)}
          >
            Add Players
          </Button>
          {activeGame.gamePlayers.length >= 2 && (
            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowEndConfirm(true)}
            >
              End Game & Settle
            </Button>
          )}
        </div>

        {/* Undo toast */}
        {undoId && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
            <span className="text-sm text-slate-300">Rebuy added</span>
            <button
              onClick={undoRebuy}
              className="text-sm font-semibold text-amber-400 hover:text-amber-300"
            >
              Undo
            </button>
          </div>
        )}
      </PageContent>

      <AddPlayerSheet
        open={showAddPlayers}
        players={players}
        existingPlayerIds={existingPlayerIds}
        onAdd={addPlayers}
        onClose={() => setShowAddPlayers(false)}
      />

      <ConfirmDialog
        open={showEndConfirm}
        title="End Game?"
        message="This will move to settlement. You'll enter final chip counts to calculate results."
        confirmLabel="End & Settle"
        variant="primary"
        onConfirm={endGame}
        onCancel={() => setShowEndConfirm(false)}
      />
    </>
  )
}
