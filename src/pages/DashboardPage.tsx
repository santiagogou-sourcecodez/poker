import { useLocation } from 'wouter'
import { PageHeader, PageContent } from '../components/layout/Shell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PlayerAvatar } from '../components/ui/PlayerAvatar'
import { useActiveGame } from '../hooks/useActiveGame'
import { useGameHistory } from '../hooks/useGameHistory'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { formatDate } from '../lib/format'

export function DashboardPage() {
  const [, setLocation] = useLocation()
  const activeGame = useActiveGame()
  const history = useGameHistory()
  const leaderboard = useLeaderboard()

  const hasActiveGame = activeGame !== null && activeGame !== undefined

  return (
    <>
      <PageHeader
        title="Poker Night"
        right={
          <button
            onClick={() => setLocation('/players')}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Manage players"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        }
      />
      <PageContent>
        {/* CTA */}
        <div className="mb-6">
          {hasActiveGame ? (
            <Button
              size="lg"
              fullWidth
              onClick={() => setLocation('/game')}
            >
              Continue Game Night →
            </Button>
          ) : (
            <Button
              size="lg"
              fullWidth
              onClick={() => setLocation('/game')}
            >
              Start Game Night 🃏
            </Button>
          )}
        </div>

        {/* Top 3 leaderboard preview */}
        {leaderboard && leaderboard.ranked.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-slate-500 uppercase tracking-wider">Season Leaders</h2>
              <button
                onClick={() => setLocation('/leaderboard')}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                View all →
              </button>
            </div>
            <Card>
              {leaderboard.ranked.slice(0, 3).map((entry) => {
                const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
                return (
                  <div
                    key={entry.player.id}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0"
                  >
                    <span className="text-sm w-6 text-center">{medals[entry.rank!] ?? entry.rank}</span>
                    <PlayerAvatar name={entry.player.name} emoji={entry.player.emoji} size="sm" />
                    <span className="flex-1 text-sm font-medium text-slate-200">{entry.player.name}</span>
                    <span className="text-sm font-bold text-slate-300">{entry.points} pts</span>
                  </div>
                )
              })}
            </Card>
          </div>
        )}

        {/* Latest game results */}
        {history && history.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-slate-500 uppercase tracking-wider">Latest Game</h2>
              <button
                onClick={() => setLocation('/history')}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                All history →
              </button>
            </div>
            <Card onClick={() => setLocation(`/history/${history[0].game.id}`)}>
              <div className="text-sm text-slate-400 mb-2">
                {formatDate(history[0].game.date)}
              </div>
              {[...history[0].gamePlayers]
                .sort((a, b) => (b.net ?? 0) - (a.net ?? 0))
                .slice(0, 3)
                .map((gp) => (
                  <div key={gp.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar name={gp.player.name} emoji={gp.player.emoji} size="sm" />
                      <span className="text-sm text-slate-300">{gp.player.name}</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${(gp.net ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {(gp.net ?? 0) >= 0 ? '+' : ''}€{(gp.net ?? 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              {history[0].gamePlayers.length > 3 && (
                <div className="text-xs text-slate-500 mt-1">
                  +{history[0].gamePlayers.length - 3} more
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Empty state when no data at all */}
        {(!history || history.length === 0) && (!leaderboard || leaderboard.ranked.length === 0) && (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">
              No games played yet. Start a game night to get going.
            </p>
          </div>
        )}
      </PageContent>
    </>
  )
}
