import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from '../roi_dashboard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>,
)
