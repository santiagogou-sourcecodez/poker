import { useLocation } from 'wouter'
import { PageHeader, PageContent } from '../components/layout/Shell'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { useGameHistory } from '../hooks/useGameHistory'
import { formatDate } from '../lib/format'

export function HistoryPage() {
  const [, setLocation] = useLocation()
  const games = useGameHistory()

  if (games === undefined) return null

  return (
    <>
      <PageHeader title="History" />
      <PageContent>
        {games.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No games yet"
            description="Completed games will show up here."
          />
        ) : (
          <div className="space-y-3">
            {games.map(({ game, gamePlayers }) => {
              const sorted = [...gamePlayers].sort((a, b) => (b.net ?? 0) - (a.net ?? 0))
              const winner = sorted[0]

              return (
                <Card
                  key={game.id}
                  onClick={() => setLocation(`/history/${game.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-200">
                        {formatDate(game.date)}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {gamePlayers.length} players
                      </div>
                    </div>
                    {winner && (
                      <div className="text-right">
                        <div className="text-sm text-slate-300">
                          {winner.player.emoji ?? '👑'} {winner.player.name}
                        </div>
                        <div className="text-xs text-emerald-400 font-medium">
                          +€{(winner.net ?? 0).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </PageContent>
    </>
  )
}
