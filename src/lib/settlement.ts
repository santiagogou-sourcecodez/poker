import { BUYIN_EUROS, CHIPS_PER_BUYIN, EUROS_PER_CHIP } from './constants'
import type { GamePlayer } from '../db/models'

export function calculateCashIn(buyIns: number): number {
  return buyIns * BUYIN_EUROS
}

export function calculateCashOut(finalChips: number): number {
  return Math.round(finalChips * EUROS_PER_CHIP * 100) / 100
}

export function calculateNet(buyIns: number, finalChips: number): number {
  return calculateCashOut(finalChips) - calculateCashIn(buyIns)
}

export function calculateExpectedChips(players: Pick<GamePlayer, 'buyIns'>[]): number {
  return players.reduce((sum, p) => sum + p.buyIns * CHIPS_PER_BUYIN, 0)
}

export function calculateTotalChips(players: Pick<GamePlayer, 'finalChips'>[]): number {
  return players.reduce((sum, p) => sum + (p.finalChips ?? 0), 0)
}

export function calculateChipDifference(
  players: Pick<GamePlayer, 'buyIns' | 'finalChips'>[]
): number {
  return calculateTotalChips(players) - calculateExpectedChips(players)
}

export function isBalanced(players: Pick<GamePlayer, 'buyIns' | 'finalChips'>[]): boolean {
  return calculateChipDifference(players) === 0
}

export function allChipsEntered(players: Pick<GamePlayer, 'finalChips'>[]): boolean {
  return players.every((p) => p.finalChips !== undefined && p.finalChips !== null)
}

export function settlePlayer(
  gp: Pick<GamePlayer, 'buyIns' | 'finalChips'>
): { cashIn: number; cashOut: number; net: number } {
  const cashIn = calculateCashIn(gp.buyIns)
  const cashOut = calculateCashOut(gp.finalChips ?? 0)
  const net = cashOut - cashIn
  return { cashIn, cashOut, net }
}

export function calculateTotalPot(players: Pick<GamePlayer, 'buyIns'>[]): number {
  return players.reduce((sum, p) => sum + calculateCashIn(p.buyIns), 0)
}

export interface Transfer {
  fromId: number
  toId: number
  amount: number // euros, positive
}

/**
 * Greedy algorithm to minimize the number of transfers needed to settle all debts.
 * Takes players with their net results and returns the minimum set of transfers.
 */
export function calculateMinTransfers(
  players: { playerId: number; net: number }[]
): Transfer[] {
  // Build list of debtors (negative net) and creditors (positive net)
  // Use cents internally to avoid floating-point drift
  const debtors: { id: number; owes: number }[] = []
  const creditors: { id: number; owed: number }[] = []

  for (const p of players) {
    const cents = Math.round(p.net * 100)
    if (cents < 0) {
      debtors.push({ id: p.playerId, owes: -cents })
    } else if (cents > 0) {
      creditors.push({ id: p.playerId, owed: cents })
    }
  }

  // Sort both descending so largest amounts settle first
  debtors.sort((a, b) => b.owes - a.owes)
  creditors.sort((a, b) => b.owed - a.owed)

  const transfers: Transfer[] = []
  let di = 0
  let ci = 0

  while (di < debtors.length && ci < creditors.length) {
    const amount = Math.min(debtors[di].owes, creditors[ci].owed)
    transfers.push({
      fromId: debtors[di].id,
      toId: creditors[ci].id,
      amount: amount / 100,
    })
    debtors[di].owes -= amount
    creditors[ci].owed -= amount

    if (debtors[di].owes === 0) di++
    if (creditors[ci].owed === 0) ci++
  }

  return transfers
}
