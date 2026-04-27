import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { PrivacyView } from './components/PrivacyView.tsx'

const isPrivacy = window.location.pathname.replace(/\/+$/, '') === '/privacy'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPrivacy ? <PrivacyView /> : <App />}
  </StrictMode>,
)
