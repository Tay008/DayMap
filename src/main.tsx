import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/tokens.css'
import './ui/themes.css'
import './ui/base.css'
import './styles/dm-base.css'
import './styles/dm-charts.css'
import App from './App.tsx'

if (navigator.storage?.persist) {
  void navigator.storage.persist()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
