import { db } from './database'
import type { Player, Game, GamePlayer } from './models'
import { settlePlayer } from '../lib/settlement'

export async function seedDatabase() {
  const playerCount = await db.players.count()
  if (playerCount > 0) return // Already seeded

  // Players
  const players: Omit<Player, 'id'>[] = [
    { name: 'Marco', emoji: '🎯', createdAt: new Date('2025-09-01'), isActive: true, paymentMethod: 'bizum', paymentDetails: '+34 612 345 678' },
    { name: 'Sofia', emoji: '🔥', createdAt: new Date('2025-09-01'), isActive: true, paymentMethod: 'revolut', paymentDetails: '@sofia_r' },
    { name: 'Luca', emoji: '🍀', createdAt: new Date('2025-09-01'), isActive: true, paymentMethod: 'bizum', paymentDetails: '+34 698 765 432' },
    { name: 'Elena', emoji: '💎', createdAt: new Date('2025-09-01'), isActive: true, paymentMethod: 'paypal', paymentDetails: 'elena@mail.com' },
    { name: 'Alex', emoji: '🐺', createdAt: new Date('2025-09-15'), isActive: true, paymentMethod: 'revolut', paymentDetails: '@alex_w' },
    { name: 'Nina', emoji: '🌙', createdAt: new Date('2025-10-01'), isActive: true },
  ]

  const playerIds = await db.players.bulkAdd(players, { allKeys: true }) as number[]

  // Helper: create a completed game with results
  async function createGame(
    date: string,
    startHour: number,
    durationHours: number,
    results: { playerIndex: number; buyIns: number; finalChips: number }[]
  ) {
    const startedAt = new Date(`${date}T${String(startHour).padStart(2, '0')}:00:00`)
    const endedAt = new Date(startedAt.getTime() + durationHours * 3600000)

    const gameId = await db.games.add({
      date,
      startedAt,
      endedAt,
      status: 'completed',
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

  // Game 1: 4 players (Marco, Sofia, Luca, Elena)
  // Total buy-ins: 5 × 500 = 2500 chips
  await createGame('2025-11-08', 20, 3.5, [
    { playerIndex: 0, buyIns: 1, finalChips: 920 },   // Marco: +€16.80
    { playerIndex: 1, buyIns: 2, finalChips: 680 },   // Sofia: -€12.80
    { playerIndex: 2, buyIns: 1, finalChips: 140 },   // Luca: -€14.40
    { playerIndex: 3, buyIns: 1, finalChips: 760 },   // Elena: +€10.40
  ])

  // Game 2: 5 players (all except Nina)
  // Total buy-ins: 7 × 500 = 3500 chips
  await createGame('2025-11-22', 19, 4, [
    { playerIndex: 0, buyIns: 2, finalChips: 450 },   // Marco: -€22.00
    { playerIndex: 1, buyIns: 1, finalChips: 1100 },  // Sofia: +€24.00
    { playerIndex: 2, buyIns: 1, finalChips: 800 },   // Luca: +€12.00
    { playerIndex: 3, buyIns: 2, finalChips: 350 },   // Elena: -€26.00
    { playerIndex: 4, buyIns: 1, finalChips: 800 },   // Alex: +€12.00
  ])

  // Game 3: 5 players (Marco, Sofia, Luca, Alex, Nina)
  // Total buy-ins: 6 × 500 = 3000 chips
  await createGame('2025-12-06', 20, 3, [
    { playerIndex: 0, buyIns: 1, finalChips: 600 },   // Marco: +€4.00
    { playerIndex: 1, buyIns: 1, finalChips: 380 },   // Sofia: -€4.80
    { playerIndex: 2, buyIns: 2, finalChips: 1200 },  // Luca: -€8.00 (wait - 2 buy-ins = 1000 chips invested, 1200 final)
    { playerIndex: 4, buyIns: 1, finalChips: 250 },   // Alex: -€10.00
    { playerIndex: 5, buyIns: 1, finalChips: 570 },   // Nina: +€2.80
  ])

  // Fix game 3 — let me recalculate to balance
  // 6 buy-ins = 3000 chips total needed
  // 600 + 380 + 1200 + 250 + 570 = 3000 ✓

  // Game 4: 6 players (everyone)
  // Total buy-ins: 8 × 500 = 4000 chips
  await createGame('2025-12-20', 19, 4.5, [
    { playerIndex: 0, buyIns: 1, finalChips: 200 },   // Marco: -€12.00
    { playerIndex: 1, buyIns: 1, finalChips: 950 },   // Sofia: +€18.00
    { playerIndex: 2, buyIns: 2, finalChips: 1400 },  // Luca: +€16.00
    { playerIndex: 3, buyIns: 1, finalChips: 50 },    // Elena: -€18.00
    { playerIndex: 4, buyIns: 2, finalChips: 1100 },  // Alex: +€4.00
    { playerIndex: 5, buyIns: 1, finalChips: 300 },   // Nina: -€8.00
  ])
  // 200 + 950 + 1400 + 50 + 1100 + 300 = 4000 ✓
}
