import React from 'react';
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
import PrivacyPage from './pages/privacy/PrivacyPage';
import TermsPage from './pages/terms/TermsPage';

// Import context provider
import { AppProvider } from './contexts/AppContext';

/**
 * Main App component
 * Sets up routing and global context with sticky header/footer layout
 */
const App: React.FC = () => {
  return (
    <AppProvider>
      {/* App layout with sticky header and footer */}
      <div className="app-container">
        <Header />
        <main className="app-content">
          <div className="app-content-inner">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/intake" element={<IntakePage />} />
              <Route path="/drinks" element={<DrinksPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
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
