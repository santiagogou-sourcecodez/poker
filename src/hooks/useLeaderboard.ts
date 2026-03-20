import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { buildLeaderboard, type LeaderboardEntry } from '../lib/leaderboard'

export function useLeaderboard(): { ranked: LeaderboardEntry[]; unranked: LeaderboardEntry[] } | undefined {
  return useLiveQuery(async () => {
    const players = await db.players.toArray()
    const completedGames = await db.games.where('status').equals('completed').toArray()
    const gameIds = completedGames.map((g) => g.id!)
    const gamePlayers = await db.gamePlayers
      .where('gameId')
      .anyOf(gameIds)
      .toArray()

    return buildLeaderboard(players, gamePlayers)
  })
}
