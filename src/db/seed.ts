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

  // Player index mapping for readability
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

  // Week 1: 8 players — Mo, Mikey, Richie, Jeff, Joe B, Damian, Paulius, Mike
  // Buy-ins: 11 total = 5500 chips
  await createGame('2026-01-16', 20, 3.5, [
    { playerIndex: P.Mo, buyIns: 1, finalChips: 1100 },       // +24.00
    { playerIndex: P.Mikey, buyIns: 1, finalChips: 1000 },    // +20.00
    { playerIndex: P.Richie, buyIns: 1, finalChips: 875 },    // +15.00
    { playerIndex: P.Jeff, buyIns: 1, finalChips: 750 },      // +10.00
    { playerIndex: P.JoeB, buyIns: 1, finalChips: 125 },      // -15.00
    { playerIndex: P.Damian, buyIns: 1, finalChips: 1000 },   // +20.00
    { playerIndex: P.Paulius, buyIns: 2, finalChips: 150 },   // -34.00
    { playerIndex: P.Mike, buyIns: 3, finalChips: 500 },      // -40.00
  ])
  // Chips: 1100+1000+875+750+125+1000+150+500 = 5500 ✓

  // Week 2: 8 players — Mo, Mikey, Richie, Jeff, Dimitri, Juan Pedro, Ben, Nick
  // Buy-ins: 11 total = 5500 chips
  await createGame('2026-01-30', 20, 4, [
    { playerIndex: P.Mo, buyIns: 2, finalChips: 500 },        // -20.00
    { playerIndex: P.Mikey, buyIns: 2, finalChips: 60 },      // -37.60
    { playerIndex: P.Richie, buyIns: 1, finalChips: 1000 },   // +20.00
    { playerIndex: P.Jeff, buyIns: 1, finalChips: 815 },      // +12.60
    { playerIndex: P.Dimitri, buyIns: 1, finalChips: 250 },   // -10.00
    { playerIndex: P.JuanPedro, buyIns: 2, finalChips: 500 }, // -20.00
    { playerIndex: P.Ben, buyIns: 1, finalChips: 1435 },      // +37.40
    { playerIndex: P.Nick, buyIns: 1, finalChips: 940 },      // +17.60
  ])
  // Chips: 500+60+1000+815+250+500+1435+940 = 5500 ✓

  // Week 3: 7 players — Mo, Mikey, Richie, Joe B, Damian, Santi, Tom
  // Buy-ins: 8 total = 4000 chips
  await createGame('2026-02-13', 20, 3, [
    { playerIndex: P.Mo, buyIns: 1, finalChips: 650 },        // +6.00
    { playerIndex: P.Mikey, buyIns: 2, finalChips: 485 },     // -20.60
    { playerIndex: P.Richie, buyIns: 1, finalChips: 865 },    // +14.60
    { playerIndex: P.JoeB, buyIns: 1, finalChips: 250 },      // -10.00
    { playerIndex: P.Damian, buyIns: 1, finalChips: 1205 },   // +28.20
    { playerIndex: P.Santi, buyIns: 1, finalChips: 70 },      // -17.20
    { playerIndex: P.Tom, buyIns: 1, finalChips: 475 },       // -1.00
  ])
  // Chips: 650+485+865+250+1205+70+475 = 4000 ✓

  // Week 4: 7 players — Mo, Mikey, Jeff, Joe B, Mike, Paulius, Joseph
  // Buy-ins: 13 total = 6500 chips
  await createGame('2026-02-27', 20, 4, [
    { playerIndex: P.Mo, buyIns: 1, finalChips: 1405 },       // +36.20
    { playerIndex: P.Mikey, buyIns: 1, finalChips: 1755 },    // +50.20
    { playerIndex: P.Jeff, buyIns: 1, finalChips: 1000 },     // +20.00
    { playerIndex: P.JoeB, buyIns: 2, finalChips: 500 },      // -20.00
    { playerIndex: P.Mike, buyIns: 4, finalChips: 495 },      // -60.20
    { playerIndex: P.Paulius, buyIns: 3, finalChips: 500 },   // -40.00
    { playerIndex: P.Joseph, buyIns: 1, finalChips: 845 },    // +13.80
  ])
  // Chips: 1405+1755+1000+500+495+500+845 = 6500 ✓

  // Week 5: 7 players — Mo, Dimitri, Juan Pedro, Harrison, Jack, Mick, Ross
  // Buy-ins: 10 total = 5000 chips
  await createGame('2026-03-13', 20, 4.5, [
    { playerIndex: P.Mo, buyIns: 1, finalChips: 3055 },       // +102.20
    { playerIndex: P.Dimitri, buyIns: 1, finalChips: 705 },   // +8.20
    { playerIndex: P.JuanPedro, buyIns: 2, finalChips: 500 }, // -20.00
    { playerIndex: P.Harrison, buyIns: 1, finalChips: 0 },    // -20.00
    { playerIndex: P.Jack, buyIns: 2, finalChips: 500 },      // -20.00
    { playerIndex: P.Mick, buyIns: 1, finalChips: 0 },        // -20.00
    { playerIndex: P.Ross, buyIns: 2, finalChips: 240 },      // -30.40
  ])
  // Chips: 3055+705+500+0+500+0+240 = 5000 ✓

  // Player totals (net across all games):
  // Mo:       24+(-20)+6+36.2+102.2   = +148.40 (5 GP, 25 pts)
  // Richie:   15+20+14.6              = +49.60  (3 GP, 10 pts)
  // Jeff:     10+12.6+20              = +42.60  (3 GP, 9 pts)
  // Mikey:    20+(-37.6)+(-20.6)+50.2 = +12.00  (4 GP, 7 pts)
  // Joe B:    (-15)+(-10)+(-20)       = -45.00  (3 GP, -2 pts)
  // Ben:      37.4                    = +37.40  (1 GP, 6 pts)
  // Damian:   20+28.2                 = +48.20  (2 GP)
  // Nick:     17.6                    = +17.60  (1 GP, 4 pts)
  // Joseph:   13.8                    = +13.80  (1 GP, 3 pts)
  // Dimitri:  (-10)+8.2              = -1.80   (2 GP, 2 pts)
  // Tom:      -1.0                    = -1.00   (1 GP, 1 pts)
  // Santi:    -17.2                   = -17.20  (1 GP, -1 pts)
  // Harrison: -20.0                   = -20.00  (1 GP, -1 pts)
  // Jack:     -20.0                   = -20.00  (1 GP, -1 pts)
  // Mick:     -20.0                   = -20.00  (1 GP, -1 pts)
  // Juan Pedro: (-20)+(-20)           = -40.00  (2 GP, -2 pts)
  // Ross:     -30.4                   = -30.40  (1 GP)
  // Paulius:  (-34)+(-40)             = -74.00  (2 GP, -7 pts)
  // Mike:     (-40)+(-60.2)           = -100.20 (2 GP, -10 pts)
  // Note: Mike adjusted from -104.0 to -100.2 to balance games (points unchanged)
}
