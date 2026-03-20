import Dexie, { type Table } from 'dexie'
import type { Player, Game, GamePlayer } from './models'

export class PokerDB extends Dexie {
  players!: Table<Player>
  games!: Table<Game>
  gamePlayers!: Table<GamePlayer>

  constructor() {
    super('PokerNight')
    // Keep version high enough so browsers with old versions can upgrade
    this.version(5).stores({
      players: '++id, name, isActive',
      games: '++id, date, status',
      gamePlayers: '++id, gameId, playerId, [gameId+playerId]',
    })
  }
}

export const db = new PokerDB()
