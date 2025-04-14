import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAppContext } from '../../contexts/AppContext';
import CaffeineChart from '../../components/CaffeineChart';
import WelcomeJumbotron from '../../components/WelcomeJumbotron';
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
      {/* Caffeine Chart Section or Welcome Jumbotron */}
      <Row>
        <Col>
          {state.caffeineIntakes.length > 0 ? (
            <Card className="border-0 shadow-sm">
              <Card.Header className="border-bottom">
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
            <WelcomeJumbotron />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
