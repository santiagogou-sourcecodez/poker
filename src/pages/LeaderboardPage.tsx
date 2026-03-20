import { PageHeader, PageContent } from '../components/layout/Shell'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { RankRow } from '../components/leaderboard/RankRow'
import { FormulaExplainer } from '../components/leaderboard/FormulaExplainer'
import { useLeaderboard } from '../hooks/useLeaderboard'

export function LeaderboardPage() {
  const data = useLeaderboard()

  if (data === undefined) return null

  const { ranked, unranked } = data
  const hasData = ranked.length > 0 || unranked.length > 0

  return (
    <>
      <PageHeader title="Leaderboard" />
      <PageContent>
        {!hasData ? (
          <EmptyState
            icon="🏆"
            title="No results yet"
            description="Complete some games to see the leaderboard."
          />
        ) : (
          <>
            {ranked.length > 0 && (
              <Card className="mb-4">
                {ranked.map((entry) => (
                  <RankRow key={entry.player.id} entry={entry} />
                ))}
              </Card>
            )}

            {unranked.length > 0 && (
              <>
                <h3 className="text-sm text-slate-500 uppercase tracking-wider mb-2 mt-6">
                  Unranked (need 3+ games)
                </h3>
                <Card>
                  {unranked.map((entry) => (
                    <RankRow key={entry.player.id} entry={entry} />
                  ))}
                </Card>
              </>
            )}

            <FormulaExplainer />
          </>
        )}
      </PageContent>
    </>
  )
}
