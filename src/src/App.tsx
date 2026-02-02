import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Import App.css for sticky layout styles

// Import components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer'; // Import Footer

// Import pages
import HomePage from './pages/home/HomePage';
import IntakePage from './pages/intake/IntakePage';
import DrinksPage from './pages/drinks/DrinksPage';
import MyDataPage from './pages/mydata/MyDataPage'; // Import the new MyDataPage
import PrivacyPage from './pages/privacy/PrivacyPage';
import TermsPage from './pages/terms/TermsPage';
import FAQPage from './pages/faq/FAQPage';

// Import context provider
import { AppProvider } from './contexts/AppContext';

/**
 * Main App component
 * Sets up routing and global context with sticky header/footer layout
 */
const App: React.FC = () => {
  // Add CSS for skip link that's visually hidden but appears on focus
  useEffect(() => {
    // Add skip link styles to the document
    const skipLinkStyle = document.createElement('style');
    skipLinkStyle.innerHTML = `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #2A7486;
        color: white;
        padding: 8px;
        z-index: 9999;
        transition: top 0.3s;
      }
      .skip-link:focus {
        top: 0;
      }
    `;
    document.head.appendChild(skipLinkStyle);
    
    return () => {
      document.head.removeChild(skipLinkStyle);
    };
  }, []);

  return (
    <AppProvider>
      {/* Skip to content link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {/* App layout with sticky header and footer */}
      <div className="app-container">
        <Header />
        <main id="main-content" className="app-content">
          <div className="app-content-inner">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/intake" element={<IntakePage />} />
              <Route path="/drinks" element={<DrinksPage />} />
              <Route path="/mydata" element={<MyDataPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/faq" element={<FAQPage />} />
              {/* Add other routes as needed */}
              {/* Add other routes as needed, e.g., a 404 page */}
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
};

export default App;
