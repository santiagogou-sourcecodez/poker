import { useLocation } from 'wouter'
import { PageHeader, PageContent } from '../components/layout/Shell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ChipEntryRow } from '../components/settlement/ChipEntryRow'
import { BalanceIndicator } from '../components/settlement/BalanceIndicator'
import { TransferList } from '../components/settlement/TransferList'
import { useActiveGame } from '../hooks/useActiveGame'
import { useSyncContext } from '../contexts/SyncContext'
import { db } from '../db/database'
import {
  isBalanced,
  allChipsEntered,
  calculateChipDifference,
  settlePlayer,
  calculateTotalPot,
  calculateMinTransfers,
} from '../lib/settlement'

export function SettlementPage() {
  const [, setLocation] = useLocation()
  const activeGame = useActiveGame()
  const { isScorekeeper } = useSyncContext()

  if (activeGame === undefined) return null
  if (activeGame === null) {
    setLocation('/game')
    return null
  }

  const difference = calculateChipDifference(activeGame.gamePlayers)
  const allEntered = allChipsEntered(activeGame.gamePlayers)
  const balanced = allEntered && isBalanced(activeGame.gamePlayers)
  const totalPot = calculateTotalPot(activeGame.gamePlayers)

  const handleChipsChange = async (gpId: number, chips: number | undefined) => {
    await db.gamePlayers.update(gpId, { finalChips: chips })
  }

  const handleSave = async () => {
    if (!balanced || !activeGame.game.id) return

    // Calculate and store results for each player
    for (const gp of activeGame.gamePlayers) {
      const result = settlePlayer(gp)
      await db.gamePlayers.update(gp.id!, {
        cashIn: result.cashIn,
        cashOut: result.cashOut,
        net: result.net,
      })
    }

    // Mark game as completed
    await db.games.update(activeGame.game.id, {
      status: 'completed',
      endedAt: new Date(),
    })

    setLocation(`/history/${activeGame.game.id}`)
  }

  const handleBack = () => {
    // Go back to active game (revert to active status)
    if (activeGame.game.id) {
      db.games.update(activeGame.game.id, { status: 'active' })
    }
    setLocation('/game')
  }

  return (
    <>
      <PageHeader
        title="settlement"
        right={
          <button onClick={handleBack} className="text-sm text-slate-400 hover:text-slate-200">
            ← back
          </button>
        }
      />
      <PageContent>
        <div className="flex items-center justify-between mb-4 text-sm text-slate-400">
          <span>{activeGame.gamePlayers.length} players</span>
          <span>total pot: €{totalPot}</span>
        </div>

        <BalanceIndicator difference={difference} allEntered={allEntered} />

        <Card className="mt-4">
          {activeGame.gamePlayers.map((gp) => (
            <ChipEntryRow
              key={gp.id}
              gamePlayer={gp}
              onChipsChange={isScorekeeper ? handleChipsChange : undefined}
            />
          ))}
        </Card>

        {balanced && (() => {
          const settled = activeGame.gamePlayers.map((gp) => ({
            playerId: gp.playerId,
            net: settlePlayer(gp).net,
          }))
          const transfers = calculateMinTransfers(settled)
          const playerMap = new Map(
            activeGame.gamePlayers.map((gp) => [gp.playerId, gp.player])
          )
          return <TransferList transfers={transfers} playerMap={playerMap} />
        })()}

        {isScorekeeper && (
          <div className="mt-6">
            <Button fullWidth size="lg" disabled={!balanced} onClick={handleSave}>
              {balanced ? 'save results' : 'balance chips to save'}
            </Button>
          </div>
        )}
      </PageContent>
    </>
  )
}
