import { NET_DIVISOR, GAMES_MULTIPLIER, MIN_GAMES_FOR_RANKING } from './constants'
import type { GamePlayer, Player } from '../db/models'

export interface LeaderboardEntry {
  player: Player
  points: number
  gamesPlayed: number
  totalNet: number
  avgNet: number
  rank?: number
}

export function calculatePoints(totalNet: number, gamesPlayed: number): number {
  return Math.round(totalNet / NET_DIVISOR + GAMES_MULTIPLIER * gamesPlayed)
}

export function buildLeaderboard(
  players: Player[],
  completedGamePlayers: GamePlayer[]
): { ranked: LeaderboardEntry[]; unranked: LeaderboardEntry[] } {
  const playerMap = new Map(players.map((p) => [p.id!, p]))

  // Aggregate stats per player
  const statsMap = new Map<number, { totalNet: number; gamesPlayed: number }>()

  for (const gp of completedGamePlayers) {
    if (gp.net === undefined) continue
    const existing = statsMap.get(gp.playerId)
    if (existing) {
      existing.totalNet += gp.net
      existing.gamesPlayed += 1
    } else {
      statsMap.set(gp.playerId, { totalNet: gp.net, gamesPlayed: 1 })
    }
  }

  // Build entries
  const entries: LeaderboardEntry[] = []
  for (const [playerId, stats] of statsMap) {
    const player = playerMap.get(playerId)
    if (!player) continue

    entries.push({
      player,
      points: calculatePoints(stats.totalNet, stats.gamesPlayed),
      gamesPlayed: stats.gamesPlayed,
      totalNet: stats.totalNet,
      avgNet: stats.totalNet / stats.gamesPlayed,
    })
  }

  // Sort: points DESC → games DESC → net DESC
  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed
    return b.totalNet - a.totalNet
  })

  // Split ranked / unranked
  const ranked: LeaderboardEntry[] = []
  const unranked: LeaderboardEntry[] = []

  for (const entry of entries) {
    if (entry.gamesPlayed >= MIN_GAMES_FOR_RANKING) {
      entry.rank = ranked.length + 1
      ranked.push(entry)
    } else {
      unranked.push(entry)
    }
  }

  return { ranked, unranked }
}
