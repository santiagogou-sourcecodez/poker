import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'

export function usePlayers() {
  const players = useLiveQuery(() => db.players.toArray()) ?? []
  const activePlayers = players.filter((p) => p.isActive)
  return { players, activePlayers }
}
