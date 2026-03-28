import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore'
import { firestore, isFirebaseEnabled } from './firebase'
import { db } from '../db/database'
import type { Player, Game, GamePlayer } from '../db/models'

// Flag to prevent Firestore → Dexie → Firestore loops
let isSyncWrite = false

// Whether the current session is scorekeeper
let scorekeeperActive = false

export function setScorekeeper(active: boolean) {
  scorekeeperActive = active
}

// --- Helpers ---

function serializeForFirestore(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date) {
      result[key] = value.toISOString()
    } else {
      result[key] = value
    }
  }
  return result
}

function deserializeFromFirestore<T>(data: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) &&
      (key === 'createdAt' || key === 'startedAt' || key === 'endedAt')
    ) {
      result[key] = new Date(value)
    } else {
      result[key] = value
    }
  }
  return result as T
}

function pushDoc(tableName: string, id: number, data: Record<string, unknown>) {
  if (!firestore) return
  const serialized = serializeForFirestore(data)
  setDoc(doc(firestore, tableName, String(id)), serialized).catch(console.error)
}

function removeDoc(tableName: string, id: number) {
  if (!firestore) return
  deleteDoc(doc(firestore, tableName, String(id))).catch(console.error)
}

function shouldPush() {
  return !isSyncWrite && scorekeeperActive && firestore
}

// --- Dexie hooks: auto-push to Firestore when scorekeeper writes locally ---

function setupHooks() {
  // Players
  db.players.hook('creating', function (_primKey, obj) {
    if (!shouldPush()) return
    this.onsuccess = (key) => {
      pushDoc('players', key as number, { ...(obj as unknown as Record<string, unknown>), id: key })
    }
  })
  db.players.hook('updating', function (modifications, primKey, obj) {
    if (!shouldPush()) return
    this.onsuccess = () => {
      const updated = { ...(obj as unknown as Record<string, unknown>), ...modifications }
      pushDoc('players', primKey as number, updated)
    }
  })
  db.players.hook('deleting', function (primKey) {
    if (!shouldPush()) return
    removeDoc('players', primKey as number)
  })

  // Games
  db.games.hook('creating', function (_primKey, obj) {
    if (!shouldPush()) return
    this.onsuccess = (key) => {
      pushDoc('games', key as number, { ...(obj as unknown as Record<string, unknown>), id: key })
    }
  })
  db.games.hook('updating', function (modifications, primKey, obj) {
    if (!shouldPush()) return
    this.onsuccess = () => {
      const updated = { ...(obj as unknown as Record<string, unknown>), ...modifications }
      pushDoc('games', primKey as number, updated)
    }
  })
  db.games.hook('deleting', function (primKey) {
    if (!shouldPush()) return
    removeDoc('games', primKey as number)
  })

  // GamePlayers
  db.gamePlayers.hook('creating', function (_primKey, obj) {
    if (!shouldPush()) return
    this.onsuccess = (key) => {
      pushDoc('gamePlayers', key as number, { ...(obj as unknown as Record<string, unknown>), id: key })
    }
  })
  db.gamePlayers.hook('updating', function (modifications, primKey, obj) {
    if (!shouldPush()) return
    this.onsuccess = () => {
      const updated = { ...(obj as unknown as Record<string, unknown>), ...modifications }
      pushDoc('gamePlayers', primKey as number, updated)
    }
  })
  db.gamePlayers.hook('deleting', function (primKey) {
    if (!shouldPush()) return
    removeDoc('gamePlayers', primKey as number)
  })
}

// --- Firestore listeners: sync to Dexie for all users ---

export function startFirestoreSync(): Unsubscribe {
  if (!firestore) return () => {}

  const fs = firestore
  const unsubs: Unsubscribe[] = []

  unsubs.push(
    onSnapshot(collection(fs, 'players'), async (snapshot) => {
      isSyncWrite = true
      try {
        for (const change of snapshot.docChanges()) {
          const data = deserializeFromFirestore<Player>(change.doc.data())
          if (change.type === 'added' || change.type === 'modified') {
            await db.players.put(data)
          } else if (change.type === 'removed') {
            await db.players.delete(data.id!)
          }
        }
      } finally {
        isSyncWrite = false
      }
    }),
  )

  unsubs.push(
    onSnapshot(collection(fs, 'games'), async (snapshot) => {
      isSyncWrite = true
      try {
        for (const change of snapshot.docChanges()) {
          const data = deserializeFromFirestore<Game>(change.doc.data())
          if (change.type === 'added' || change.type === 'modified') {
            await db.games.put(data)
          } else if (change.type === 'removed') {
            await db.games.delete(data.id!)
          }
        }
      } finally {
        isSyncWrite = false
      }
    }),
  )

  unsubs.push(
    onSnapshot(collection(fs, 'gamePlayers'), async (snapshot) => {
      isSyncWrite = true
      try {
        for (const change of snapshot.docChanges()) {
          const data = deserializeFromFirestore<GamePlayer>(change.doc.data())
          if (change.type === 'added' || change.type === 'modified') {
            // Don't let stale sync data overwrite settlement results
            const existing = data.id ? await db.gamePlayers.get(data.id) : undefined
            if (existing?.net !== undefined && data.net === undefined) {
              await db.gamePlayers.update(data.id!, {
                ...data,
                cashIn: existing.cashIn,
                cashOut: existing.cashOut,
                net: existing.net,
              })
            } else {
              await db.gamePlayers.put(data)
            }
          } else if (change.type === 'removed') {
            await db.gamePlayers.delete(data.id!)
          }
        }
      } finally {
        isSyncWrite = false
      }
    }),
  )

  return () => unsubs.forEach((fn) => fn())
}

// --- PIN management ---

export async function getPin(): Promise<string | null> {
  if (!firestore) return null
  const snap = await getDoc(doc(firestore, 'config', 'app'))
  if (snap.exists()) {
    return snap.data().pin ?? null
  }
  return null
}

export async function setPin(pin: string): Promise<void> {
  if (!firestore) return
  await setDoc(doc(firestore, 'config', 'app'), { pin })
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await getPin()
  if (stored === null) {
    // No PIN set yet — first-time setup, save it
    await setPin(pin)
    return true
  }
  return stored === pin
}

export async function changePin(currentPin: string, newPin: string): Promise<boolean> {
  const valid = await verifyPin(currentPin)
  if (!valid) return false
  await setPin(newPin)
  return true
}

// --- Data version: bump this when seed data changes ---

const DATA_VERSION = 8

async function clearFirestoreCollection(collName: string) {
  if (!firestore) return
  const snap = await getDocs(collection(firestore, collName))
  for (const d of snap.docs) {
    await deleteDoc(d.ref)
  }
}

export async function syncDataVersion(): Promise<void> {
  if (!firestore) return

  const configSnap = await getDoc(doc(firestore, 'config', 'app'))
  const currentVersion = configSnap.exists() ? configSnap.data().dataVersion ?? 0 : 0

  if (currentVersion < DATA_VERSION) {
    // Clear stale Firestore data
    await clearFirestoreCollection('players')
    await clearFirestoreCollection('games')
    await clearFirestoreCollection('gamePlayers')

    // Push fresh local data
    await pushAllToFirestore()

    // Update version (preserve existing config like PIN)
    const existing = configSnap.exists() ? configSnap.data() : {}
    await setDoc(doc(firestore, 'config', 'app'), { ...existing, dataVersion: DATA_VERSION })
  }
}

// --- Push all local data to Firestore ---

async function pushDocAwait(tableName: string, id: number, data: Record<string, unknown>) {
  if (!firestore) return
  const serialized = serializeForFirestore(data)
  await setDoc(doc(firestore, tableName, String(id)), serialized)
}

export async function pushAllToFirestore(): Promise<void> {
  if (!firestore) return

  const players = await db.players.toArray()
  const games = await db.games.toArray()
  const gamePlayers = await db.gamePlayers.toArray()

  for (const p of players) {
    await pushDocAwait('players', p.id!, p as unknown as Record<string, unknown>)
  }
  for (const g of games) {
    await pushDocAwait('games', g.id!, g as unknown as Record<string, unknown>)
  }
  for (const gp of gamePlayers) {
    await pushDocAwait('gamePlayers', gp.id!, gp as unknown as Record<string, unknown>)
  }
}

// --- Initialize hooks (call once at app start) ---

export function initSync() {
  if (!isFirebaseEnabled) return
  setupHooks()
}
