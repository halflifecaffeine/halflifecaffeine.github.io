import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Update interval in milliseconds - set to 3 seconds for testing
const UPDATE_INTERVAL = 3000; // Changed to 3 seconds for testing

const HomePage: React.FC = () => {
  const { state, addCaffeineIntake, lastIntakeTimestamp } = useAppContext();
  const [caffeineData, setCaffeineData] = useState<any[]>([]);
  const [showAddPanel, setShowAddPanel] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date()); // Track current time for chart
  const timerRef = useRef<number | undefined>(undefined);
  const isPageVisible = useRef<boolean>(true);

  // Combine default and custom drinks for the form
  const availableDrinks = [...(drinksData as Drink[]), ...state.customDrinks];

  // Memoized function to calculate and update caffeine levels
  const updateCaffeineData = useCallback(() => {
    const now = new Date();
    console.log(`[Caffeine Update] Recalculating caffeine levels at ${now.toLocaleTimeString()}`);
    
    // Update the current time whenever we recalculate
    setCurrentTime(now);
    
    if (state.caffeineIntakes.length > 0) {
      const events: CaffeineEvent[] = state.caffeineIntakes.map(intake => ({
        datetime: intake.datetime,
        mg: intake.mg
      }));
      
      // Pass the custom half-life value to the computeLevels function
      const data = computeLevels(
        events, 
        now, 
        24, 
        30, 
        state.preferences.halfLifeHours // Pass the user's custom half-life
      );
      
      setCaffeineData(data);
      setLastUpdateTime(now);
    } else {
      setCaffeineData([]); // Clear data if no intakes
    }
  }, [state.caffeineIntakes, state.preferences.halfLifeHours]);

  // Start or stop the auto-refresh timer based on page visibility
  const setupTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current !== undefined) {
      window.clearInterval(timerRef.current);
      timerRef.current = undefined;
    }

    // Only start timer if we have intake data and the page is visible
    if (isPageVisible.current && state.caffeineIntakes.length > 0) {
      console.log(`[Caffeine Update] Setting up timer to update every ${UPDATE_INTERVAL/1000} seconds`);
      
      timerRef.current = window.setInterval(() => {
        updateCaffeineData();
      }, UPDATE_INTERVAL);
    }
  }, [updateCaffeineData, state.caffeineIntakes.length]);

  // Handle visibility change events
  useEffect(() => {
    // Function to handle visibility changes
    const handleVisibilityChange = () => {
      isPageVisible.current = !document.hidden;
      
      console.log(`[Caffeine Update] Page visibility changed - now ${isPageVisible.current ? 'visible' : 'hidden'}`);
      
      if (isPageVisible.current) {
        // Page just became visible - update immediately then setup timer
        updateCaffeineData();
      }
      
      // Either start or stop the timer based on new visibility
      setupTimer();
    };

    // Initial calculation
    updateCaffeineData();
    
    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial timer setup
    setupTimer();
    
    console.log('[Caffeine Update] Component mounted - initial data loaded');
    
    // Cleanup function
    return () => {
      console.log('[Caffeine Update] Component unmounting - removing listeners and timers');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current !== undefined) {
        window.clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [updateCaffeineData, setupTimer]);
  
  // React to lastIntakeTimestamp changes to immediately update the data
  // This ensures changes made on other pages (like IntakePage) are reflected here
  useEffect(() => {
    if (isPageVisible.current) {
      console.log('[Caffeine Update] Detected caffeine intake change, updating chart');
      updateCaffeineData();
    }
  }, [lastIntakeTimestamp, updateCaffeineData]);
  
  // Force refresh when viewed for more than 5 minutes without inputs changing
  useEffect(() => {
    if (state.caffeineIntakes.length === 0) return;
    
    const forceUpdateInterval = window.setInterval(() => {
      // Only force update if it's been more than 5 minutes since the last update
      const now = new Date();
      const timeSinceLastUpdate = now.getTime() - lastUpdateTime.getTime();
      if (timeSinceLastUpdate > 300000) { // 5 minutes
        console.log('[Caffeine Update] Forcing refresh after inactivity');
        updateCaffeineData();
      }
    }, 60000); // Check every minute
    
    return () => {
      window.clearInterval(forceUpdateInterval);
    };
  }, [state.caffeineIntakes.length, lastUpdateTime, updateCaffeineData]);

  // Handler for adding a new intake
  const handleAddIntake = (intake: CaffeineIntake) => {
    addCaffeineIntake(intake);
    setShowAddPanel(false);
    // Immediate update after adding new intake is now handled by the lastIntakeTimestamp effect
  };

  return (
    <Container fluid className="px-3">
      {/* Caffeine Chart Section or Welcome Jumbotron */}
      <Row>
        <Col>
          {state.caffeineIntakes.length > 0 ? (
            <Card className="border-0 shadow-sm">
              <Card.Header className="border-bottom d-flex justify-content-between align-items-center">
                <h3 className="mb-0">
                  Caffeine Levels
                  <small className="d-none d-sm-inline text-muted ms-2 fs-6 fw-normal" style={{ fontSize: '0.7rem' }}>
                    (Updated: {lastUpdateTime.toLocaleTimeString()})
                  </small>
                </h3>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowAddPanel(true)}
                  className="d-flex align-items-center"
                  aria-label="Add new caffeine intake"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-1" />
                  Add
                  <span className="d-none d-sm-inline">&nbsp;Intake</span>
                </Button>
              </Card.Header>
              <Card.Body className="p-0 p-md-3">
                <CaffeineChart
                  data={caffeineData}
                  maxSafeLevel={state.preferences.maxSafeCaffeineLevel}
                  sleepThreshold={state.preferences.sleepCaffeineThreshold}
                  sleepStartHour={state.preferences.sleepStartHour}
                  halfLifeHours={state.preferences.halfLifeHours}
                  currentTime={currentTime} // Pass the current time to the chart
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
