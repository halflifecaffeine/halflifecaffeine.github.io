import React, { useState, useRef, useEffect } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlusSquare, faGlassWhiskey, faGear } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';
import SettingsPanel from '../settings/SettingsPanel';

/**
 * Application header component with navigation and settings
 */
const Header: React.FC = () => {
  const { theme } = useAppContext();
  const [showSettings, setShowSettings] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Helper to close the mobile menu
  const closeNavMenu = (): void => {
    setExpanded(false);
  };

  const handleSettingsClick = (): void => {
    setShowSettings(true);
    closeNavMenu();
  };
  
  const handleSettingsClose = (): void => {
    setShowSettings(false);
  };

  return (
    <Navbar 
      bg="primary" 
      variant="dark" 
      expand="lg" 
      expanded={expanded}
      onToggle={setExpanded}
      className={`app-header theme-${theme}`}
    >
      <Container fluid>
        <LinkContainer to="/">
          <Navbar.Brand>
            <img
              src="/images/logo.png"
              height="30"
              className="d-inline-block align-top me-2"
              alt="Half-Life Caffeine Logo"
            />
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/" onClick={closeNavMenu}>
              <Nav.Link><FontAwesomeIcon icon={faHome} className="me-1" /> Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/intake" onClick={closeNavMenu}>
              <Nav.Link><FontAwesomeIcon icon={faPlusSquare} className="me-1" /> Intake</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/drinks" onClick={closeNavMenu}>
              <Nav.Link><FontAwesomeIcon icon={faGlassWhiskey} className="me-1" /> Drinks</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav>
            {/* Only show separator in mobile view */}
            <div 
              className="d-lg-none my-2 w-100" 
              style={{ 
                height: '1px', 
                backgroundColor: 'rgba(255, 255, 255, 0.3)' 
              }}
            ></div>
            
            <Nav.Link onClick={handleSettingsClick} aria-label="Open Settings">
              <FontAwesomeIcon icon={faGear} className="me-1" /> Settings
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
      
      {/* Settings panel with controlled visibility */}
      <SettingsPanel 
        show={showSettings}
        onClose={handleSettingsClose}
      />
    </Navbar>
  );
};

export default Header;