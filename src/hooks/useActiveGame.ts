import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { Game, GamePlayer, Player } from '../db/models'

export interface ActiveGameData {
  game: Game
  gamePlayers: (GamePlayer & { player: Player })[]
}

export function useActiveGame(): ActiveGameData | null | undefined {
  return useLiveQuery(async () => {
    const game = await db.games
      .where('status')
      .anyOf('active', 'settling')
      .first()

    if (!game) return null

    const gps = await db.gamePlayers
      .where('gameId')
      .equals(game.id!)
      .toArray()

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
  })
}
