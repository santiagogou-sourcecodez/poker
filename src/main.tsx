import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { isFirebaseEnabled } from './lib/firebase'
import { seedDatabase } from './db/seed'

// Only seed demo data when Firebase is not connected (local-only mode)
if (!isFirebaseEnabled) {
  seedDatabase()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
