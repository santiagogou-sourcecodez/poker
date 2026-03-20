import { db } from './database'
import type { Player } from './models'
import { settlePlayer } from '../lib/settlement'

const SEED_VERSION = '7'

export async function seedDatabase() {
  const currentVersion = localStorage.getItem('seedVersion')
  if (currentVersion === SEED_VERSION) {
    const playerCount = await db.players.count()
    if (playerCount > 0) return
  }

  // Clear all tables (keeps DB open, no race conditions)
  await db.transaction('rw', db.players, db.games, db.gamePlayers, async () => {
    await db.gamePlayers.clear()
    await db.games.clear()
    await db.players.clear()
  })

  // Players — explicit IDs to avoid auto-increment drift
  const players: Player[] = [
    { id: 1, name: 'Mo (USA)', emoji: '🐺', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 2, name: 'Richie (IRE)', emoji: '🍀', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 3, name: 'Jeff (SCO)', emoji: '🥃', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 4, name: 'Mikey (IRE)', emoji: '🎯', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 5, name: 'Joe B (ENG)', emoji: '🎱', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 6, name: 'Damian', emoji: '🔥', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 7, name: 'Paulius (LTU)', emoji: '🧊', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 8, name: 'Mike', emoji: '💀', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 9, name: 'Dimitri', emoji: '⚡', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 10, name: 'Juan Pedro (VEN)', emoji: '🌶️', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 11, name: 'Ben (ENG)', emoji: '💪', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 12, name: 'Nick', emoji: '🎲', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 13, name: 'Santi', emoji: '🃏', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 14, name: 'Joseph (ENG)', emoji: '👑', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 15, name: 'Tom', emoji: '🍺', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 16, name: 'Harrison', emoji: '🎸', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 17, name: 'Jack (ENG)', emoji: '🐻', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 18, name: 'Mick', emoji: '🎤', createdAt: new Date('2025-12-01'), isActive: true },
    { id: 19, name: 'Ross', emoji: '🐍', createdAt: new Date('2025-12-01'), isActive: true },
  ]

  await db.players.bulkPut(players)

  // Player ID mapping
  const P = {
    Mo: 1, Richie: 2, Jeff: 3, Mikey: 4, JoeB: 5,
    Damian: 6, Paulius: 7, Mike: 8, Dimitri: 9, JuanPedro: 10,
    Ben: 11, Nick: 12, Santi: 13, Joseph: 14, Tom: 15,
    Harrison: 16, Jack: 17, Mick: 18, Ross: 19,
  }

  let gameIdCounter = 1
  let gpIdCounter = 1

  async function createGame(
    date: string,
    startHour: number,
    durationHours: number,
    results: { playerId: number; buyIns: number; finalChips: number }[],
    hidden = false,
  ) {
    const startedAt = new Date(`${date}T${String(startHour).padStart(2, '0')}:00:00`)
    const endedAt = new Date(startedAt.getTime() + durationHours * 3600000)
    const gameId = gameIdCounter++

    await db.games.put({
      id: gameId,
      date,
      startedAt,
      endedAt,
      status: 'completed',
      hidden,
    })

    for (const r of results) {
      const settled = settlePlayer({ buyIns: r.buyIns, finalChips: r.finalChips })
      await db.gamePlayers.put({
        id: gpIdCounter++,
        gameId,
        playerId: r.playerId,
        buyIns: r.buyIns,
        finalChips: r.finalChips,
        cashIn: settled.cashIn,
        cashOut: settled.cashOut,
        net: settled.net,
      })
    }
  }

  // ---------------------------------------------------------------
  // Weeks 1–4: constructed from leaderboard totals (minus week 5).
  // Week 5 is real game data from March 19.
  // ---------------------------------------------------------------

  // Week 1: 8 players — 11 buy-ins = 5500 chips
  await createGame('2026-01-16', 20, 3.5, [
    { playerId: P.Mo, buyIns: 1, finalChips: 1000 },
    { playerId: P.Richie, buyIns: 1, finalChips: 1325 },
    { playerId: P.Mikey, buyIns: 1, finalChips: 750 },
    { playerId: P.Jeff, buyIns: 1, finalChips: 1000 },
    { playerId: P.Damian, buyIns: 1, finalChips: 1025 },
    { playerId: P.Paulius, buyIns: 2, finalChips: 150 },
    { playerId: P.Mike, buyIns: 3, finalChips: 250 },
    { playerId: P.Mick, buyIns: 1, finalChips: 0 },
  ], true)

  // Week 2: 8 players — 10 buy-ins = 5000 chips
  await createGame('2026-01-30', 20, 4, [
    { playerId: P.Mo, buyIns: 2, finalChips: 250 },
    { playerId: P.Richie, buyIns: 1, finalChips: 285 },
    { playerId: P.Mikey, buyIns: 1, finalChips: 250 },
    { playerId: P.Jeff, buyIns: 1, finalChips: 1090 },
    { playerId: P.Dimitri, buyIns: 1, finalChips: 250 },
    { playerId: P.JuanPedro, buyIns: 2, finalChips: 500 },
    { playerId: P.Ben, buyIns: 1, finalChips: 1435 },
    { playerId: P.Nick, buyIns: 1, finalChips: 940 },
  ], true)

  // Week 3: 7 players — 8 buy-ins = 4000 chips
  await createGame('2026-02-13', 20, 3, [
    { playerId: P.Mo, buyIns: 1, finalChips: 550 },
    { playerId: P.Richie, buyIns: 1, finalChips: 1130 },
    { playerId: P.Mikey, buyIns: 1, finalChips: 730 },
    { playerId: P.JoeB, buyIns: 1, finalChips: 875 },
    { playerId: P.Tom, buyIns: 1, finalChips: 475 },
    { playerId: P.Jack, buyIns: 1, finalChips: 0 },
    { playerId: P.Ross, buyIns: 2, finalChips: 240 },
  ], true)

  // Week 4: 7 players — 13 buy-ins = 6500 chips
  await createGame('2026-02-27', 20, 4, [
    { playerId: P.Mo, buyIns: 1, finalChips: 3195 },
    { playerId: P.JoeB, buyIns: 2, finalChips: 500 },
    { playerId: P.Paulius, buyIns: 3, finalChips: 500 },
    { playerId: P.Mike, buyIns: 3, finalChips: 255 },
    { playerId: P.Dimitri, buyIns: 1, finalChips: 705 },
    { playerId: P.JuanPedro, buyIns: 2, finalChips: 500 },
    { playerId: P.Joseph, buyIns: 1, finalChips: 845 },
  ], true)

  // ---------------------------------------------------------------
  // Week 5: REAL game data — March 19, 2026
  // ---------------------------------------------------------------
  await createGame('2026-03-19', 20, 4, [
    { playerId: P.Mikey, buyIns: 3, finalChips: 1570 },
    { playerId: P.Santi, buyIns: 2, finalChips: 570 },
    { playerId: P.JoeB, buyIns: 2, finalChips: 0 },
    { playerId: P.Damian, buyIns: 1, finalChips: 1180 },
    { playerId: P.Jeff, buyIns: 1, finalChips: 475 },
    { playerId: P.Mo, buyIns: 1, finalChips: 1715 },
    { playerId: P.Harrison, buyIns: 1, finalChips: 0 },
  ])

  localStorage.setItem('seedVersion', SEED_VERSION)
}
