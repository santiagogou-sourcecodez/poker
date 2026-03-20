import Dexie, { type Table } from 'dexie'
import type { Player, Game, GamePlayer } from './models'

export class PokerDB extends Dexie {
  players!: Table<Player>
  games!: Table<Game>
  gamePlayers!: Table<GamePlayer>

  constructor() {
    super('PokerNight')
    this.version(1).stores({
      players: '++id, name, isActive',
      games: '++id, date, status',
      gamePlayers: '++id, gameId, playerId, [gameId+playerId]',
    })
    // v2: add paymentMethod + paymentDetails to players (no index changes needed)
    this.version(2).stores({
      players: '++id, name, isActive',
      games: '++id, date, status',
      gamePlayers: '++id, gameId, playerId, [gameId+playerId]',
    })
    // v3: clear old demo data so real league data can be seeded
    this.version(3).stores({
      players: '++id, name, isActive',
      games: '++id, date, status',
      gamePlayers: '++id, gameId, playerId, [gameId+playerId]',
    }).upgrade(async (tx) => {
      await tx.table('players').clear()
      await tx.table('games').clear()
      await tx.table('gamePlayers').clear()
    })
    // v4: fix double-counted week 5 data
    this.version(4).stores({
      players: '++id, name, isActive',
      games: '++id, date, status',
      gamePlayers: '++id, gameId, playerId, [gameId+playerId]',
    }).upgrade(async (tx) => {
      await tx.table('players').clear()
      await tx.table('games').clear()
      await tx.table('gamePlayers').clear()
    })
  }
}

export const db = new PokerDB()
