import { PlayerAvatar } from '../ui/PlayerAvatar'
import type { LeaderboardEntry } from '../../lib/leaderboard'

interface RankRowProps {
  entry: LeaderboardEntry
}

const medalColors: Record<number, string> = {
  1: 'text-gold',
  2: 'text-silver',
  3: 'text-bronze',
}

const medals: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export function RankRow({ entry }: RankRowProps) {
  const { player, rank, points, gamesPlayed, totalNet, avgNet } = entry

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
      <span className={`text-sm w-8 text-center font-bold ${medalColors[rank ?? 0] ?? 'text-slate-500'}`}>
        {rank && rank <= 3 ? medals[rank] : rank ?? '–'}
      </span>
      <PlayerAvatar name={player.name} emoji={player.emoji} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200 text-sm truncate">{player.name}</div>
        <div className="text-xs text-slate-500">
          {gamesPlayed} game{gamesPlayed !== 1 ? 's' : ''} &middot;{' '}
          <span className={totalNet >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {totalNet >= 0 ? '+' : ''}€{totalNet.toFixed(2)}
          </span>
          {' '}total &middot;{' '}
          {avgNet >= 0 ? '+' : ''}€{avgNet.toFixed(2)} avg
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-slate-200">{points}</div>
        <div className="text-xs text-slate-500">pts</div>
      </div>
    </div>
  )
}
