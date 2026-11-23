import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Design system (tokens + componentes) e layout das telas, no lugar do index.css antigo.
import './styles/tokens.css'
import './styles/bundle.css'
import './styles/telas.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
