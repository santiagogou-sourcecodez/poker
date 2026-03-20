import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { isFirebaseEnabled } from '../lib/firebase'
import {
  initSync,
  startFirestoreSync,
  setScorekeeper,
  verifyPin,
  changePin as changePinSync,
  pushAllToFirestore,
  syncDataVersion,
} from '../lib/sync'

interface SyncContextValue {
  isOnline: boolean // Firebase is connected
  isScorekeeper: boolean
  enterScorekeeper: (pin: string) => Promise<boolean>
  exitScorekeeper: () => void
  changePin: (currentPin: string, newPin: string) => Promise<boolean>
}

const SyncContext = createContext<SyncContextValue>({
  isOnline: false,
  isScorekeeper: false,
  enterScorekeeper: async () => false,
  exitScorekeeper: () => {},
  changePin: async () => false,
})

export function useSyncContext() {
  return useContext(SyncContext)
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isScorekeep, setIsScorekeep] = useState(() => {
    return sessionStorage.getItem('scorekeeper') === 'true'
  })

  useEffect(() => {
    if (!isFirebaseEnabled) return

    // Set up Dexie hooks (once)
    initSync()

    // Restore scorekeeper state from session
    if (isScorekeep) {
      setScorekeeper(true)
    }

    // Check if Firestore data needs to be refreshed (seed version changed)
    syncDataVersion().catch(console.error)

    // Start listening to Firestore
    const unsub = startFirestoreSync()
    return unsub
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep scorekeeper state in sync
  useEffect(() => {
    setScorekeeper(isScorekeep)
  }, [isScorekeep])

  const enterScorekeeper = useCallback(async (pin: string) => {
    const valid = await verifyPin(pin)
    if (valid) {
      setIsScorekeep(true)
      sessionStorage.setItem('scorekeeper', 'true')
      setScorekeeper(true)
      // Push local data to Firestore on first scorekeeper session
      await pushAllToFirestore()
      return true
    }
    return false
  }, [])

  const exitScorekeeper = useCallback(() => {
    setIsScorekeep(false)
    sessionStorage.removeItem('scorekeeper')
    setScorekeeper(false)
  }, [])

  const changePin = useCallback(async (currentPin: string, newPin: string) => {
    return changePinSync(currentPin, newPin)
  }, [])

  return (
    <SyncContext.Provider
      value={{
        isOnline: isFirebaseEnabled,
        isScorekeeper: isScorekeep,
        enterScorekeeper,
        exitScorekeeper,
        changePin,
      }}
    >
      {children}
    </SyncContext.Provider>
  )
}
