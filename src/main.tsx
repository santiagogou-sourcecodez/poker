import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { seedDatabase } from './db/seed'
import { repairSettlementData } from './db/repair'

// Await seed before rendering — sync depends on local data existing
seedDatabase()
  .then(() => repairSettlementData())
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
