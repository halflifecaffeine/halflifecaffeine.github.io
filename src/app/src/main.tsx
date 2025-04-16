import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import UpdateNotification from './components/common/displays/UpdateNotification.tsx';

/**
 * Root application wrapper that includes Router and handles PWA updates
 */
const Root: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // Register service worker with enhanced update handling
    const sw = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
        console.log('App ready to work offline');
      }
    });
    
    setUpdateSW(() => sw);
  }, []);

  // Handle update acceptance - reload the page to get the new version
  const handleUpdateAccept = () => {
    if (updateSW) {
      // This initiates the update process and will reload the page
      updateSW(true);
    }
  };

  // Handle update dismissal - user will continue with current version
  const handleUpdateDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <Router>
      <App />
      
      {/* Show update notification when new version is available */}
      {needRefresh && (
        <UpdateNotification 
          onAccept={handleUpdateAccept} 
          onDismiss={handleUpdateDismiss} 
        />
      )}
    </Router>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
