import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { Game, GamePlayer, Player } from '../db/models'

export interface GameHistoryEntry {
  game: Game
  gamePlayers: (GamePlayer & { player: Player })[]
}

export function useGameHistory(): GameHistoryEntry[] | undefined {
  return useLiveQuery(async () => {
    const allGames = await db.games
      .where('status')
      .equals('completed')
      .reverse()
      .sortBy('date')

    const games = allGames.filter((g) => !g.hidden)

    const results: GameHistoryEntry[] = []

    for (const game of games) {
      const gps = await db.gamePlayers
        .where('gameId')
        .equals(game.id!)
        .toArray()

      const playerIds = gps.map((gp) => gp.playerId)
      const players = await db.players.where('id').anyOf(playerIds).toArray()
      const playerMap = new Map(players.map((p) => [p.id!, p]))

      results.push({
        game,
        gamePlayers: gps.map((gp) => ({
          ...gp,
          player: playerMap.get(gp.playerId)!,
        })),
      })
    }

    return results
  })
}
