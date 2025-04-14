import { faCheckCircle, faExclamationTriangle, faHeartPulse } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';

interface CaffeineHealthInfoProps {
  currentLevel: number;
  maxSafeLevel: number;
  sleepThreshold: number;
  halfLifeHours?: number;
}

const CaffeineHealthInfo: React.FC<CaffeineHealthInfoProps> = ({
  currentLevel,
  maxSafeLevel,
  sleepThreshold,
  halfLifeHours = 6
}) => {
  // Calculate percentage of max safe level for progress bars
  const safeLevelPercentage = Math.min(100, (currentLevel / maxSafeLevel) * 100);
  const sleepThresholdPercentage = Math.min(100, (currentLevel / sleepThreshold) * 100);
  
  // Determine status badges based on current level
  const getSafeLevelStatus = () => {
    if (currentLevel > maxSafeLevel) {
      return <Badge bg="danger">Exceeded</Badge>;
    } else if (currentLevel > maxSafeLevel * 0.75) {
      return <Badge bg="warning" text="dark"><FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />Approaching Limit</Badge>;
    } else {
      return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} className="me-2" />Within Safe Limits</Badge>;
    }
  };
  
  const getSleepQualityStatus = () => {
    if (currentLevel > sleepThreshold) {
      return <Badge bg="warning" text="dark"><FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />May Affect Sleep</Badge>;
    } else {
      return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} className="me-2" />Unlikely to Affect Sleep</Badge>;
    }
  };
  
  // Calculate estimated time until levels drop below thresholds
  // Now using the custom half-life value from user preferences
  const calculateTimeUntil = (targetLevel: number) => {
    if (currentLevel <= targetLevel) return 'Already below this level';
    
    // Using custom caffeine half-life
    // Formula: t = t_half * log2(initial_conc / target_conc)
    const hoursUntil = halfLifeHours * Math.log2(currentLevel / targetLevel);
    
    if (hoursUntil < 1) {
      return `~${Math.round(hoursUntil * 60)} minutes`;
    } else {
      const hours = Math.floor(hoursUntil);
      const mins = Math.round((hoursUntil - hours) * 60);
      return `~${hours}h ${mins}m`;
    }
  };
  
  return (
    <div className="caffeine-health-info">
      <h3 className="mb-3">
        {<FontAwesomeIcon icon={faHeartPulse} className="me-2" />}
        <span className="d-none d-md-inline">Caffeine </span>
        Health Information</h3>
      
      <Row className="g-3">
        {/* Daily intake card */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Daily Safe Intake</strong>
              {getSafeLevelStatus()}
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Current: {Math.round(currentLevel)}mg</span>
                  <span>Max: {maxSafeLevel}mg</span>
                </div>
                <ProgressBar now={safeLevelPercentage} variant={
                  currentLevel > maxSafeLevel ? "danger" : 
                  currentLevel > maxSafeLevel * 0.75 ? "warning" : "success"
                } />
              </div>
              <p className="mb-1">FDA recommends no more than {maxSafeLevel}mg of caffeine per day for healthy adults.</p>
              {currentLevel > maxSafeLevel && (
                <p className="text-danger mb-0">
                  <strong>You're {Math.round(currentLevel - maxSafeLevel)}mg above the daily recommended limit.</strong>
                </p>
              )}
              {currentLevel > 0 && (
                <div className="mt-2 pt-2 border-top">
                  <small>Time until below safe level: {calculateTimeUntil(maxSafeLevel)}</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        {/* Sleep quality card */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Sleep Quality</strong>
              {getSleepQualityStatus()}
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Current: {Math.round(currentLevel)}mg</span>
                  <span>Threshold: {sleepThreshold}mg</span>
                </div>
                <ProgressBar now={sleepThresholdPercentage} variant={
                  currentLevel > sleepThreshold ? "warning" : "success"
                } />
              </div>
              <p className="mb-1">Caffeine levels above {sleepThreshold}mg within  {(halfLifeHours !== 6) ? `${halfLifeHours}` : '6'} hours of bedtime may disrupt sleep quality.</p>
              {currentLevel > sleepThreshold && (
                <p className="text-warning mb-0">
                  <strong>Sleep may be difficult until levels decrease.</strong>
                </p>
              )}
              {currentLevel > 0 && (
                <div className="mt-2 pt-2 border-top">
                  <small>Time until caffeine shouldn't affect sleep: {calculateTimeUntil(sleepThreshold)}</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        {/* Caffeine half-life info */}
        <Col md={12}>
          <Card>
            <Card.Header>
              <strong>Caffeine Metabolism Facts</strong>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center">
                    <div className="display-4 me-3">
                      <i className="bi bi-hourglass-split text-primary"></i>
                    </div>
                    <div>
                      <h5 className="mb-1">6-Hour Half-Life</h5>
                      <p className="mb-0 text-muted">Caffeine typically takes 6 hours to reduce to half its concentration in your body. {(halfLifeHours !== 6) && `However you have customized this to be ${halfLifeHours}, which all of this data will be based on.`}</p>
                    </div>
                  </div>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center">
                    <div className="display-4 me-3">
                      <i className="bi bi-person-hearts text-primary"></i>
                    </div>
                    <div>
                      <h5 className="mb-1">Individual Variation</h5>
                      <p className="mb-0 text-muted">Metabolism varies by age, body mass, medications, and genetics</p>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <div className="display-4 me-3">
                      <i className="bi bi-cup-hot text-primary"></i>
                    </div>
                    <div>
                      <h5 className="mb-1">Complete Clearance</h5>
                      <p className="mb-0 text-muted">Takes approximately {Math.round(halfLifeHours * 4)} hours to fully clear from your system</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CaffeineHealthInfo;