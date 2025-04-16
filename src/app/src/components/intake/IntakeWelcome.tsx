import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faPlus, faMugHot } from '@fortawesome/free-solid-svg-icons';

interface IntakeWelcomeProps {
  onAddClick: () => void;
}

/**
 * Welcome component to display when no intake data is present
 * Provides explanation and a prominent Call To Action button
 */
const IntakeWelcome: React.FC<IntakeWelcomeProps> = ({ onAddClick }) => {
  return (
    <Card className="border-0 shadow my-4 welcome-intake">
      <Card.Body className="text-center py-5 px-4">
        <div className="welcome-icon-container mb-4">
          <div className="welcome-icon">
            <FontAwesomeIcon icon={faMugHot} className="coffee-icon" />
          </div>
        </div>
        
        <h3 className="welcome-title mb-3">No Caffeine Intake Yet</h3>
        
        <Card.Text className="mb-4">
          Track your caffeine consumption by logging your drinks.
          Your intake history will appear here and be used to calculate your caffeine levels over time.
        </Card.Text>
        
        <Button 
          variant="primary" 
          size="lg" 
          className="px-4 py-2"
          onClick={onAddClick}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Intake
        </Button>
      </Card.Body>
    </Card>
  );
};

export default IntakeWelcome;