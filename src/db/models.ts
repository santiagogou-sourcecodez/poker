export interface Player {
  id?: number
  name: string
  emoji?: string
  createdAt: Date
  isActive: boolean
  paymentMethod?: string
  paymentDetails?: string
}

export type GameStatus = 'active' | 'settling' | 'completed'

export interface Game {
  id?: number
  date: string // YYYY-MM-DD
  startedAt: Date
  endedAt?: Date
  status: GameStatus
  notes?: string
}

export interface GamePlayer {
  id?: number
  gameId: number
  playerId: number
  buyIns: number
  finalChips?: number
  cashIn?: number
  cashOut?: number
  net?: number
}
