import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faChartLine, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface WelcomeJumbotronProps {
  /**
   * Function to open the intake form slideout when clicking "Log First Drink"
   */
  onLogIntakeClick?: () => void;
}

/**
 * A welcome component that appears when users have no caffeine intake data
 * Provides a friendly introduction and quick action buttons
 */
export const WelcomeJumbotron: React.FC<WelcomeJumbotronProps> = ({ onLogIntakeClick }) => {
  return (
    <Card className="border-0 shadow-sm welcome-jumbotron">
      <Card.Body className="text-center p-md-5 p-4">
        <div className="welcome-icon-container mb-4">
          <div className="welcome-icon">
            <FontAwesomeIcon icon={faCoffee} className="coffee-icon" />
          </div>
        </div>
        
        <h2 className="welcome-title mb-3">Welcome to Half-Life Caffeine Tracker</h2>
        
        <Card.Text className="lead mb-4">
          Track your caffeine consumption and visualize how it affects your body throughout the day.
          Start by logging your first caffeine intake to see your personalized chart.
        </Card.Text>
        
        <Row className="justify-content-center mb-4 g-3">
          <Col md={4} sm={6}>
            <Button 
              onClick={onLogIntakeClick}
              variant="primary" 
              size="lg" 
              className="w-100"
              aria-label="Log your first caffeine intake"
            >
              <FontAwesomeIcon icon={faCoffee} className="me-2" />
              Log First Drink
            </Button>
          </Col>
          <Col md={4} sm={6}>
            <Button 
              as={Link} 
              to="/drinks" 
              variant="outline-secondary" 
              size="lg" 
              className="w-100"
              aria-label="Browse caffeine drinks database"
            >
              <FontAwesomeIcon icon={faChartLine} className="me-2" />
              Browse Drinks
            </Button>
          </Col>
        </Row>
        
        <div className="info-section p-3 border rounded mt-4">
          <h5>
            <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
            How it works
          </h5>
          <p className="mb-1">
            Half-Life Caffeine Tracker uses the science of caffeine metabolism to show you how caffeine 
            levels change in your body over time. The average caffeine half-life is 5-6 hours, 
            but you can customize this in your preferences.
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WelcomeJumbotron;