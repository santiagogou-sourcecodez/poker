import { useParams, useLocation } from 'wouter'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader, PageContent } from '../components/layout/Shell'
import { Card } from '../components/ui/Card'
import { ResultCard } from '../components/settlement/ResultCard'
import { TransferList } from '../components/settlement/TransferList'
import { db } from '../db/database'
import { formatDateLong, formatDuration } from '../lib/format'
import { calculateTotalPot, calculateMinTransfers } from '../lib/settlement'

export function GameDetailPage() {
  const params = useParams<{ id: string }>()
  const [, setLocation] = useLocation()
  const gameId = Number(params.id)

  const data = useLiveQuery(async () => {
    const game = await db.games.get(gameId)
    if (!game) return null

    const gps = await db.gamePlayers.where('gameId').equals(gameId).toArray()
    const playerIds = gps.map((gp) => gp.playerId)
    const players = await db.players.where('id').anyOf(playerIds).toArray()
    const playerMap = new Map(players.map((p) => [p.id!, p]))

    const gamePlayers = gps
      .filter((gp) => playerMap.has(gp.playerId))
      .map((gp) => ({
        ...gp,
        player: playerMap.get(gp.playerId)!,
      }))

    return { game, gamePlayers }
  }, [gameId])

  if (data === undefined) return null
  if (data === null) {
    setLocation('/history')
    return null
  }

  const { game, gamePlayers } = data
  const sorted = [...gamePlayers].sort((a, b) => (b.net ?? 0) - (a.net ?? 0))
  const totalPot = calculateTotalPot(gamePlayers)

  return (
    <>
      <PageHeader
        title="game details"
        right={
          <button
            onClick={() => setLocation('/history')}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            ← back
          </button>
        }
      />
      <PageContent>
        <div className="space-y-2 mb-4">
          <div className="text-slate-300 font-medium">{formatDateLong(game.date)}</div>
          <div className="flex gap-4 text-sm text-slate-500">
            <span>{gamePlayers.length} players</span>
            <span>€{totalPot} pot</span>
            {game.startedAt && (
              <span>{formatDuration(game.startedAt, game.endedAt)}</span>
            )}
          </div>
        </div>

        <Card>
          {sorted.map((gp, i) => (
            <ResultCard key={gp.id} gamePlayer={gp} rank={i + 1} />
          ))}
        </Card>

        {(() => {
          const settled = gamePlayers
            .filter((gp) => gp.net !== undefined)
            .map((gp) => ({ playerId: gp.playerId, net: gp.net! }))
          const transfers = calculateMinTransfers(settled)
          const playerMap = new Map(gamePlayers.map((gp) => [gp.playerId, gp.player]))
          return <TransferList transfers={transfers} playerMap={playerMap} />
        })()}

        {game.notes && (
          <div className="mt-4 p-3 bg-slate-800/50 rounded-xl">
            <div className="text-xs text-slate-500 mb-1">notes</div>
            <div className="text-sm text-slate-300">{game.notes}</div>
          </div>
        )}
      </PageContent>
    </>
  )
}
