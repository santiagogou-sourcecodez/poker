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
