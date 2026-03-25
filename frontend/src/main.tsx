import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { msalInstance } from './auth/msalConfig'

// MSAL 3.x requires the instance to be initialized before use
msalInstance.initialize().then(() => {
  // Handle any returning redirect responses before React springs to life
  return msalInstance.handleRedirectPromise();
}).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch(console.error);
