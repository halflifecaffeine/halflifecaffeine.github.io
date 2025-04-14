import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAppContext } from '../../contexts/AppContext';
import CaffeineChart from '../../components/CaffeineChart';
import { computeLevels, CaffeineEvent } from '../../engine/caffeineCalculator';

const HomePage: React.FC = () => {
  const { state } = useAppContext();
  const [caffeineData, setCaffeineData] = useState<any[]>([]);

  // Calculate caffeine levels for the chart
  useEffect(() => {
    if (state.caffeineIntakes.length > 0) {
      const events: CaffeineEvent[] = state.caffeineIntakes.map(intake => ({
        datetime: intake.datetime,
        mg: intake.mg
      }));
      const now = new Date();
      
      // Pass the custom half-life value to the computeLevels function
      const data = computeLevels(
        events, 
        now, 
        24, 
        30, 
        state.preferences.halfLifeHours // Pass the user's custom half-life
      );
      
      setCaffeineData(data);
    } else {
      setCaffeineData([]); // Clear data if no intakes
    }
  }, [state.caffeineIntakes, state.preferences.halfLifeHours]); // Re-run if intakes or half-life changes

  return (
    <Container fluid className="px-3">
      {/* Welcome Section - Commented for now but kept for reference */}
      {/* <Row className="justify-content-md-center mb-4">
        <Col md={10} lg={8}>
          <Card className="text-center">
            <Card.Header as="h2">Welcome Back!</Card.Header>
            <Card.Body>
              <Card.Title>Your Caffeine Dashboard</Card.Title>
              <Card.Text>
                View your current estimated caffeine levels and log new intake.
              </Card.Text>
              <Row className="mt-3">
                <Col sm={6}>
                  <Button as={Link} to="/intake" variant="primary" className="w-100 mb-2">
                    Log New Intake
                  </Button>
                </Col>
                <Col sm={6}>
                  <Button as={Link} to="/drinks" variant="secondary" className="w-100 mb-2">
                    Manage Drinks
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}

      {/* Caffeine Chart Section - Full width with proper card styling */}
      <Row>
        <Col>
          {state.caffeineIntakes.length > 0 ? (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h3 className="mb-0">Caffeine Levels</h3>
              </Card.Header>
              <Card.Body className="p-0 p-md-3">
                <CaffeineChart
                  data={caffeineData}
                  maxSafeLevel={state.preferences.maxSafeCaffeineLevel}
                  sleepThreshold={state.preferences.sleepCaffeineThreshold}
                  sleepStartHour={state.preferences.sleepStartHour}
                  halfLifeHours={state.preferences.halfLifeHours} // Pass the half-life hours to the chart
                />
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="info" className="text-center">
              <h4>No caffeine intake recorded yet.</h4>
              <p>Log your first drink using the button above to see your chart.</p>
            </Alert>
          )}
        </Col>
      </Row>

      {/* Maybe add a small summary of recent intake or link to full log later */}

    </Container>
  );
};

export default HomePage;
