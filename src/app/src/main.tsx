import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA functionality
const updateSW = registerSW({
  onNeedRefresh() {
    // We could show a UI notification here if we want users to manually update
    console.log('New content available, please refresh.')
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router> { /* Wrap App with Router here */ }
      <App />
    </Router>
  </React.StrictMode>,
)
