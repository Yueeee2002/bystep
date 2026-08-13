import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { useConfigStore } from '@/store/configStore'
import { resolveViewport } from '@/utils/viewport'
import './index.css'

document.documentElement.dataset.viewport = resolveViewport(useConfigStore.getState().viewportPreference)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
