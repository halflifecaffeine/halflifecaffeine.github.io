import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';
import CaffeineChart from '../../components/CaffeineChart';
import WelcomeJumbotron from '../../components/WelcomeJumbotron';
import IntakeForm from '../../components/IntakeForm';
import SlideoutPanel from '../../components/layout/SlideoutPanel';
import { computeLevels, CaffeineEvent } from '../../engine/caffeineCalculator';
import { Drink, CaffeineIntake } from '../../types';
import drinksData from '../../data/drinks.json'; // Import default drinks

const HomePage: React.FC = () => {
  const { state, addCaffeineIntake } = useAppContext();
  const [caffeineData, setCaffeineData] = useState<any[]>([]);
  const [showAddPanel, setShowAddPanel] = useState<boolean>(false);

  // Combine default and custom drinks for the form
  const availableDrinks = [...(drinksData as Drink[]), ...state.customDrinks];

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

  // Handler for adding a new intake
  const handleAddIntake = (intake: CaffeineIntake) => {
    addCaffeineIntake(intake);
    setShowAddPanel(false);
  };

  return (
    <Container fluid className="px-3">
      {/* Caffeine Chart Section or Welcome Jumbotron */}
      <Row>
        <Col>
          {state.caffeineIntakes.length > 0 ? (
            <Card className="border-0 shadow-sm">
              <Card.Header className="border-bottom d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Caffeine Levels</h3>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowAddPanel(true)}
                  className="d-flex align-items-center"
                  aria-label="Add new caffeine intake"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-1" />
                  Add Intake
                </Button>
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
            <WelcomeJumbotron onLogIntakeClick={() => setShowAddPanel(true)} />
          )}
        </Col>
      </Row>

      {/* Add intake slideout panel */}
      <SlideoutPanel
        show={showAddPanel}
        onHide={() => setShowAddPanel(false)}
        title="Add Caffeine Intake"
        description="Record a new caffeine intake with the details below."
        icon={faPlus}
        footer={
          <div className="d-flex justify-content-between w-100">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowAddPanel(false)}
              className="d-flex align-items-center"
            >
              &lt; Back
            </Button>
          </div>
        }
      >
        <IntakeForm
          drinks={availableDrinks}
          onSave={handleAddIntake}
          onCancel={() => setShowAddPanel(false)}
        />
      </SlideoutPanel>
    </Container>
  );
};

export default HomePage;
