import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { getCriblBasePath } from './criblEnv'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={getCriblBasePath()}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
