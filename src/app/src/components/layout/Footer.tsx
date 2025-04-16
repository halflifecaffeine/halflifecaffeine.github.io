import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Use Link for internal navigation

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [versionInfo, setVersionInfo] = useState<{
    text: string;
    show: boolean;
  }>({
    text: 'Version: (Local Development)',
    show: true
  });

  useEffect(() => {
    fetch('/version.txt')
      .then(response => {
        if (!response.ok) {
          console.debug('Version file not found:', response.status)
          return null
        }
        const contentType = response.headers.get('content-type')
        if (!contentType?.includes('text/plain')) {
          console.debug('Invalid content type:', contentType)
          return null
        }
        return response.text()
      })
      .then(text => {
        if (text?.trim()) {
          setVersionInfo({
            text: `Version: ${text.trim()}`,
            show: true
          })
        }
        // if text is null/empty, keep default state
      })
      .catch((error) => {
        console.debug('Error loading version:', error.message)
        setVersionInfo(prev => ({ ...prev, show: false }))
      })
  }, [])

  return (
    <footer className="app-footer">
      <Container className="text-center d-flex justify-content-center align-items-center h-100">
        <span className="text-light small">
          &copy; {currentYear} Half-Life Caffeine Tracker |{' '}
          <Link to="/privacy" className="text-light">Privacy</Link> |{' '}
          <Link to="/terms" className="text-light">Terms</Link>
          {versionInfo.show && (
            <span className="d-none d-sm-inline">
              <span className="mx-2">|</span>
              <span>{versionInfo.text}</span>
            </span>
          )}
        </span>
      </Container>
    </footer>
  );
};

export default Footer;
