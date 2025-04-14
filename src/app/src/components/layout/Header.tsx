import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap'; // Import Nav
import { LinkContainer } from 'react-router-bootstrap'; // Use LinkContainer for react-bootstrap integration
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlusSquare, faGlassWhiskey, faFileContract, faUserSecret } from '@fortawesome/free-solid-svg-icons'; // Add icons
import SettingsPanel from './SettingsPanel';
import { useAppContext } from '../../contexts/AppContext'; // Import context to get theme

const Header: React.FC = () => {
  const { theme } = useAppContext(); // Get theme for potential styling

  return (
    // Update Navbar to use sticky layout classes and remove margin bottom
    <Navbar bg="primary" variant="dark" expand="lg" className={`app-header theme-${theme}`}>
      <Container>
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
            <LinkContainer to="/">
              <Nav.Link><FontAwesomeIcon icon={faHome} className="me-1" /> Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/intake">
              <Nav.Link><FontAwesomeIcon icon={faPlusSquare} className="me-1" /> Intake</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/drinks">
              <Nav.Link><FontAwesomeIcon icon={faGlassWhiskey} className="me-1" /> Drinks</Nav.Link>
            </LinkContainer>
            {/* <LinkContainer to="/terms">
              <Nav.Link><FontAwesomeIcon icon={faFileContract} className="me-1" /> Terms</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/privacy">
              <Nav.Link><FontAwesomeIcon icon={faUserSecret} className="me-1" /> Privacy</Nav.Link>
            </LinkContainer> */}
          </Nav>
          {/* Settings Panel remains on the right */}
          <div className="ms-auto">
            <SettingsPanel />
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;