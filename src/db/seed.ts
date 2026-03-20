import { db } from './database'
import type { Player, Game, GamePlayer } from './models'
import { settlePlayer } from '../lib/settlement'

export async function seedDatabase() {
  const playerCount = await db.players.count()
  if (playerCount > 0) return // Already seeded

  // Players — real poker @ sudio crew
  const players: Omit<Player, 'id'>[] = [
    { name: 'Mo (USA)', emoji: '🐺', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Richie (IRE)', emoji: '🍀', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Jeff (SCO)', emoji: '🥃', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Mikey (IRE)', emoji: '🎯', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Joe B (ENG)', emoji: '🎱', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Damian', emoji: '🔥', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Paulius (LTU)', emoji: '🧊', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Mike', emoji: '💀', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Dimitri', emoji: '⚡', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Juan Pedro (VEN)', emoji: '🌶️', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Ben (ENG)', emoji: '💪', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Nick', emoji: '🎲', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Santi', emoji: '🃏', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Joseph (ENG)', emoji: '👑', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Tom', emoji: '🍺', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Harrison', emoji: '🎸', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Jack (ENG)', emoji: '🐻', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Mick', emoji: '🎤', createdAt: new Date('2025-12-01'), isActive: true },
    { name: 'Ross', emoji: '🐍', createdAt: new Date('2025-12-01'), isActive: true },
  ]

  const playerIds = await db.players.bulkAdd(players, { allKeys: true }) as number[]

  // Player index mapping
  const P = {
    Mo: 0, Richie: 1, Jeff: 2, Mikey: 3, JoeB: 4,
    Damian: 5, Paulius: 6, Mike: 7, Dimitri: 8, JuanPedro: 9,
    Ben: 10, Nick: 11, Santi: 12, Joseph: 13, Tom: 14,
    Harrison: 15, Jack: 16, Mick: 17, Ross: 18,
  }

  async function createGame(
    date: string,
    startHour: number,
    durationHours: number,
    results: { playerIndex: number; buyIns: number; finalChips: number }[],
    hidden = false,
  ) {
    const startedAt = new Date(`${date}T${String(startHour).padStart(2, '0')}:00:00`)
    const endedAt = new Date(startedAt.getTime() + durationHours * 3600000)

    const gameId = await db.games.add({
      date,
      startedAt,
      endedAt,
      status: 'completed',
      hidden,
    } as Game)

    for (const r of results) {
      const settled = settlePlayer({ buyIns: r.buyIns, finalChips: r.finalChips })
      await db.gamePlayers.add({
        gameId: gameId as number,
        playerId: playerIds[r.playerIndex],
        buyIns: r.buyIns,
        finalChips: r.finalChips,
        cashIn: settled.cashIn,
        cashOut: settled.cashOut,
        net: settled.net,
      } as GamePlayer)
    }
  }

  // ---------------------------------------------------------------
  // Weeks 1–4: constructed from leaderboard totals (minus week 5).
  // Week 5 is real game data from March 19.
  // ---------------------------------------------------------------

  // Week 1: 8 players
  // Buy-ins: 11 = 5500 chips
  await createGame('2026-01-16', 20, 3.5, [
    { playerIndex: P.Mo, buyIns: 1, finalChips: 1000 },       // +20.00
    { playerIndex: P.Richie, buyIns: 1, finalChips: 1325 },   // +33.00
    { playerIndex: P.Mikey, buyIns: 1, finalChips: 750 },     // +10.00
    { playerIndex: P.Jeff, buyIns: 1, finalChips: 1000 },     // +20.00
    { playerIndex: P.Damian, buyIns: 1, finalChips: 1025 },   // +21.00
    { playerIndex: P.Paulius, buyIns: 2, finalChips: 150 },   // -34.00
    { playerIndex: P.Mike, buyIns: 3, finalChips: 250 },      // -50.00
    { playerIndex: P.Mick, buyIns: 1, finalChips: 0 },        // -20.00
  ], true)
  // 1000+1325+750+1000+1025+150+250+0 = 5500 ✓

  // Week 2: 8 players
  // Buy-ins: 10 = 5000 chips
  await createGame('2026-01-30', 20, 4, [
    { playerIndex: P.Mo, buyIns: 2, finalChips: 250 },        // -30.00
    { playerIndex: P.Richie, buyIns: 1, finalChips: 285 },    // -8.60
    { playerIndex: P.Mikey, buyIns: 1, finalChips: 250 },     // -10.00
    { playerIndex: P.Jeff, buyIns: 1, finalChips: 1090 },     // +23.60
    { playerIndex: P.Dimitri, buyIns: 1, finalChips: 250 },   // -10.00
    { playerIndex: P.JuanPedro, buyIns: 2, finalChips: 500 }, // -20.00
    { playerIndex: P.Ben, buyIns: 1, finalChips: 1435 },      // +37.40
    { playerIndex: P.Nick, buyIns: 1, finalChips: 940 },      // +17.60
  ], true)
  // 250+285+250+1090+250+500+1435+940 = 5000 ✓

  // Week 3: 7 players
  // Buy-ins: 8 = 4000 chips
  await createGame('2026-02-13', 20, 3, [
    { playerIndex: P.Mo, buyIns: 1, finalChips: 550 },        // +2.00
    { playerIndex: P.Richie, buyIns: 1, finalChips: 1130 },   // +25.20
    { playerIndex: P.Mikey, buyIns: 1, finalChips: 730 },     // +9.20
    { playerIndex: P.JoeB, buyIns: 1, finalChips: 875 },      // +15.00
    { playerIndex: P.Tom, buyIns: 1, finalChips: 475 },       // -1.00
    { playerIndex: P.Jack, buyIns: 1, finalChips: 0 },        // -20.00
    { playerIndex: P.Ross, buyIns: 2, finalChips: 240 },      // -30.40
  ], true)
  // 550+1130+730+875+475+0+240 = 4000 ✓

  // Week 4: 7 players
  // Buy-ins: 13 = 6500 chips
  await createGame('2026-02-27', 20, 4, [
    { playerIndex: P.Mo, buyIns: 1, finalChips: 3195 },       // +107.80
    { playerIndex: P.JoeB, buyIns: 2, finalChips: 500 },      // -20.00
    { playerIndex: P.Paulius, buyIns: 3, finalChips: 500 },   // -40.00
    { playerIndex: P.Mike, buyIns: 3, finalChips: 255 },      // -49.80
    { playerIndex: P.Dimitri, buyIns: 1, finalChips: 705 },   // +8.20
    { playerIndex: P.JuanPedro, buyIns: 2, finalChips: 500 }, // -20.00
    { playerIndex: P.Joseph, buyIns: 1, finalChips: 845 },    // +13.80
  ], true)
  // 3195+500+500+255+705+500+845 = 6500 ✓

  // ---------------------------------------------------------------
  // Week 5: REAL game data — March 19, 2026
  // ---------------------------------------------------------------
  // Buy-ins: 11 = 5500 expected (actual end chips: 5510, 10-chip counting variance)
  await createGame('2026-03-19', 20, 4, [
    { playerIndex: P.Mikey, buyIns: 3, finalChips: 1570 },    // +2.80
    { playerIndex: P.Santi, buyIns: 2, finalChips: 570 },     // -17.20
    { playerIndex: P.JoeB, buyIns: 2, finalChips: 0 },        // -40.00
    { playerIndex: P.Damian, buyIns: 1, finalChips: 1180 },   // +27.20
    { playerIndex: P.Jeff, buyIns: 1, finalChips: 475 },      // -1.00
    { playerIndex: P.Mo, buyIns: 1, finalChips: 1715 },       // +48.60
    { playerIndex: P.Harrison, buyIns: 1, finalChips: 0 },    // -20.00
  ])
}
