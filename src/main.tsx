import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Performance from './performance'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Performance />
  </StrictMode>,
)
