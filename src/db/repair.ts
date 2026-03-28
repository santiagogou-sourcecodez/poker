import { db } from './database'
import { settlePlayer } from '../lib/settlement'

/**
 * Recalculate settlement data for any completed-game players
 * that have buyIns/finalChips but are missing cashIn/cashOut/net.
 * Fixes data lost by the Firestore sync race condition.
 */
export async function repairSettlementData() {
  const completedGames = await db.games.where('status').equals('completed').toArray()
  const gameIds = completedGames.map((g) => g.id!)

  for (const gameId of gameIds) {
    const gps = await db.gamePlayers.where('gameId').equals(gameId).toArray()
    for (const gp of gps) {
      if (gp.net === undefined && gp.finalChips !== undefined) {
        const result = settlePlayer(gp)
        await db.gamePlayers.update(gp.id!, {
          cashIn: result.cashIn,
          cashOut: result.cashOut,
          net: result.net,
        })
      }
    }
  }
}
