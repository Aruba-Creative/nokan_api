import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import initializeDefaultUser from './utils/setupDefaultUser'

// Initialize default admin user
initializeDefaultUser()
  .then(() => console.log('Default user initialization complete'))
  .catch(error => console.error('Failed to initialize default user:', error));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
