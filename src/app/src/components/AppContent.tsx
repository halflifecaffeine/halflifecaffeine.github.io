import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Navbar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';

// Import components
import CaffeineChart from './CaffeineChart';
import CaffeineTable from './CaffeineTable';
import IntakeTextForm from './IntakeTextForm';
import DrinkLookup from './DrinkLookup';
import TimeGridPicker from './TimeGridPicker';
import SettingsPanel from './settings/SettingsPanel';

// Import engine
import { computeLevels, CaffeineEvent } from '../engine/caffeineCalculator';

// Import data
import drinksData from '../data/drinks.json';

// Import context
import { useAppContext } from '../contexts/AppContext';

// Import types
import { CaffeineIntake, Drink } from '../types';

/**
 * Main application content component
 * Contains the UI layout and main functionality of the application
 */
const AppContent: React.FC = () => {
  const { state, addCaffeineIntake, addCustomDrink, updateCustomDrink, removeCustomDrink, theme } = useAppContext();
  const [key, setKey] = useState<string>('chart');
  const [caffeineData, setCaffeineData] = useState<any[]>([]);

  // Convert saved intake records to caffeine events for calculation
  useEffect(() => {
    const events: CaffeineEvent[] = state.caffeineIntakes.map(intake => ({
      datetime: intake.datetime,
      mg: intake.mg
    }));
    
    // Calculate current caffeine levels
    const now = new Date();
    const data = computeLevels(events, now, 24, 30); // 24 hours with 30-min resolution
    setCaffeineData(data);
  }, [state.caffeineIntakes, state.preferences.halfLifeHours]);

  const handleAddIntakes = (intakes: CaffeineIntake[]) => {
    intakes.forEach(intake => {
      addCaffeineIntake(intake);
    });
  };

  // Type-safe event handler for delete
  const handleDeleteIntake = (id: string): void => {
    console.log('Delete intake', id);
    // Implementation would go here
  };

  return (
    <div className={`app theme-${theme}`}>
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-3">
        <Container>
          <Navbar.Brand href="#">
            <FontAwesomeIcon icon={faCoffee} /> Half-Life Caffeine Tracker
          </Navbar.Brand>
          <div>
            <SettingsPanel />
          </div>
        </Container>
      </Navbar>

      <Container className="main-content mb-5">
        {state.caffeineIntakes.length > 0 && (
          <div className="mb-4">
            <CaffeineChart
              data={caffeineData}
              maxSafeLevel={state.preferences.maxSafeCaffeineLevel}
              sleepThreshold={state.preferences.sleepCaffeineThreshold}
              sleepStartHour={state.preferences.sleepStartHour}
              halfLifeHours={state.preferences.halfLifeHours}
            />
          </div>
        )}

        <Tabs
          activeKey={key}
          onSelect={(k) => setKey(k || 'chart')}
          className="mb-4"
          justify
        >
          <Tab eventKey="intake" title="Enter Intake">
            <div className="mt-3 p-3 border rounded">
              <Tabs defaultActiveKey="text" id="intake-methods" className="mb-3">
                <Tab eventKey="text" title="Text Entry">
                  <IntakeTextForm onAddIntakes={handleAddIntakes} />
                </Tab>
                <Tab eventKey="grid" title="Time Grid">
                  <TimeGridPicker 
                    drinks={[...drinksData as Drink[], ...state.customDrinks]} 
                    onAddIntake={addCaffeineIntake}
                    existingIntakes={state.caffeineIntakes}
                  />
                </Tab>
                <Tab eventKey="drinks" title="Drink Database">
                  <DrinkLookup 
                    drinks={[...drinksData as Drink[], ...state.customDrinks]} 
                    onAddCustomDrink={addCustomDrink}
                    onUpdateCustomDrink={updateCustomDrink}
                    customDrinks={state.customDrinks}
                  />
                </Tab>
              </Tabs>
            </div>
          </Tab>
          <Tab eventKey="chart" title="Caffeine Chart">
            {state.caffeineIntakes.length === 0 ? (
              <div className="text-center p-5 bg-light rounded">
                <h4>No caffeine intake recorded yet</h4>
                <p>Add your first caffeinated drink to see how it affects you over time.</p>
              </div>
            ) : (
              <div className="mt-3">
                {/* Chart is already shown above tabs if there's data */}
              </div>
            )}
          </Tab>
          <Tab eventKey="log" title="Intake Log">
            <div className="mt-3">
              <CaffeineTable 
                intakes={state.caffeineIntakes} 
                drinks={[...drinksData as Drink[], ...state.customDrinks]}
                onDeleteIntake={handleDeleteIntake} 
              />
            </div>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default AppContent;