import { faGavel } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Container, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link

const TermsPage: React.FC = () => {
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
          <h1>{<FontAwesomeIcon icon={faGavel} />} Terms of Use</h1>
          <p className="text-muted">Effective Date: April 13, 2025</p>
        </Card.Header>
        <Card.Body>
          <Alert variant="warning">
            <strong>Disclaimer:</strong> This application is for informational and educational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or your caffeine consumption.
          </Alert>

          <Card.Title as="h2">Use of Application</Card.Title>
          <Card.Text>
            By using the Half-Life Caffeine Tracker application ("the App"), you agree to these Terms of Use. The App provides tools to track estimated caffeine intake and visualize its theoretical metabolic half-life based on standard models.
          </Card.Text>

          <Card.Title as="h2">Accuracy of Information</Card.Title>
          <Card.Text>
            The caffeine content data provided for drinks is based on publicly available information and manufacturer data, which may not always be accurate or up-to-date. Actual caffeine content can vary significantly due to brewing methods, product variations, and other factors. The metabolic calculations use a standard half-life (defaulting to 6 hours) which may not reflect individual physiological differences. The App provides estimates only.
          </Card.Text>

          <Card.Title as="h2">No Medical Advice</Card.Title>
          <Card.Text>
            The App does not offer medical advice. The information presented, including caffeine levels, health guidelines (e.g., maximum safe intake, sleep thresholds), and metabolic projections, are general guidelines and may not be appropriate for your individual health circumstances. Consult a healthcare professional for personalized advice regarding caffeine consumption, especially if you have underlying health conditions, are pregnant or nursing, or are sensitive to caffeine.
          </Card.Text>

          <Card.Title as="h2">Data Storage and Privacy</Card.Title>
          <Card.Text>
            All data entered into the App is stored locally on your device using browser LocalStorage. No data is transmitted to external servers. Please refer to our <Link to="/privacy">Privacy Policy</Link> for more details. You are responsible for managing and securing the data stored on your device.
          </Card.Text>

          <Card.Title as="h2">Limitation of Liability</Card.Title>
          <Card.Text>
            The developers of the App shall not be liable for any damages arising out of the use or inability to use the App, or reliance on the information provided within it. Use the App at your own risk.
          </Card.Text>

          <Card.Title as="h2">Changes to Terms</Card.Title>
          <Card.Text>
            We reserve the right to modify these Terms of Use at any time. Continued use of the App after changes constitutes acceptance of the new terms.
          </Card.Text>

          <Card.Text className="text-muted">
            Last Updated: April 13, 2025
            {versionInfo.show && (
              <span>
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

export default TermsPage;
