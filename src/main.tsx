import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Performance from './performance'
import Upload from './upload'

const Screen = window.location.pathname.startsWith('/upload')
  ? Upload
  : Performance

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Screen />
  </StrictMode>,
)
