import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { seedDatabase } from './db/seed'

// Seed real league data if local DB is empty.
// When scorekeeper first connects, pushAllToFirestore() syncs it to Firestore.
seedDatabase()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
