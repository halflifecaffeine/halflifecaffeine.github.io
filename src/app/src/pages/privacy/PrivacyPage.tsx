import { faGavel, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Container, Card } from 'react-bootstrap';

const PrivacyPage: React.FC = () => {
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
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h1>{<FontAwesomeIcon icon={faLock} />} Privacy Policy</h1>
          <p className="text-muted">Effective Date: April 13, 2025</p>
        </Card.Header>
        <Card.Body>
          <Card.Title as="h2">Data Storage</Card.Title>
          <Card.Text>
            This application, Half-Life Caffeine Tracker, stores all user data exclusively in your web browser's <strong>LocalStorage</strong>. This includes:
            <ul>
              <li>Your recorded caffeine intake history.</li>
              <li>Any custom drinks you add to the database.</li>
              <li>Your application preferences (theme, calculation settings).</li>
            </ul>

            There is no server-side storage or database involved. All data is stored locally on your device and is not accessible by any external parties.
          </Card.Text>
          <Card.Title as="h2">Data Privacy</Card.Title>
          <Card.Text>
            <strong>No data is ever transmitted to any external server or third party.</strong> Your information remains entirely on your own device and under your control. We do not collect, track, or share any personal information or usage data.
          </Card.Text>
          <Card.Title as="h2">Data Deletion</Card.Title>
          <Card.Text>
            You can clear all stored data at any time using the "Clear All Data" option in the application settings. Clearing your browser's cache or site data for this application will also permanently remove all stored information.
          </Card.Text>
          <Card.Title as="h2">Third-Party Services</Card.Title>
          <Card.Text>
            This application does not currently integrate with any third-party services for data storage, analytics, or advertising.
          </Card.Text>
          <Card.Title as="h2">Changes to This Policy</Card.Title>
          <Card.Text>
            We may update this Privacy Policy from time to time. Any changes will be reflected on this page. As no user data is collected centrally, users will not be individually notified of changes.
          </Card.Text>
          <Card.Text className="text-muted">
            Last Updated: April 13, 2025
            {versionInfo.show && (
              <span className="d-none d-sm-inline">
                <span className="mx-2">|</span>
                <span>{versionInfo.text}</span>
              </span>
            )}
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PrivacyPage;
