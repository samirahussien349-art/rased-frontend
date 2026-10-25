import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Performance from './performance'
import Upload from './upload'

// The upload flow is the app's entry screen. Keep the report available at /performance.
const Screen = window.location.pathname === '/performance'
  ? Performance
  : Upload

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Screen />
  </StrictMode>,
)
