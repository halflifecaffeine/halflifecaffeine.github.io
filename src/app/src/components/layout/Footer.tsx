import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Use Link for internal navigation

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <Container className="text-center d-flex justify-content-center align-items-center h-100">
        <span className="text-light small">
          &copy; {currentYear} Half-Life Caffeine Tracker |{' '}
          <Link to="/privacy" className="text-light">Privacy</Link> |{' '}
          <Link to="/terms" className="text-light">Terms</Link>
        </span>
      </Container>
    </footer>
  );
};

export default Footer;
