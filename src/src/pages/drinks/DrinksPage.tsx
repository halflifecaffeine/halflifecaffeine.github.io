/**
 * DrinksPage - Main page for browsing and managing drinks
 */
import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faWhiskeyGlass } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';
import { Drink, CustomDrink } from '../../types';
import DrinkBrowser from '../../components/drinks/DrinkBrowser';
import DrinkAddSlideout from '../../components/drinks/DrinkAddSlideout';
import DrinkEditSlideout from '../../components/drinks/DrinkEditSlideout';
import DrinkCloneSlideout from '../../components/drinks/DrinkCloneSlideout';
import DrinkDeleteConfirmation from '../../components/drinks/DrinkDeleteConfirmation';

// Import drinks data
import drinksData from '../../data/drinks.json';

/**
 * DrinksPage component
 */
export const DrinksPage: React.FC = () => {
  const { state, addCustomDrink, updateCustomDrink, removeCustomDrink } = useAppContext();
  
  // UI state
  const [showUserDrinksOnly, setShowUserDrinksOnly] = useState(false);
  
  // Slideout panel states
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showClonePanel, setShowClonePanel] = useState(false);
  const [showDeletePanel, setShowDeletePanel] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | CustomDrink | null>(null);
  const [drinkToDelete, setDrinkToDelete] = useState<CustomDrink | null>(null);
  
  // Combine built-in drinks and custom drinks for display
  const allDrinks = useMemo(() => {
    // Combine standard drinks with user's custom drinks
    const standardDrinks = drinksData as Drink[];
    return showUserDrinksOnly 
      ? state.customDrinks
      : [...standardDrinks, ...state.customDrinks];
  }, [state.customDrinks, showUserDrinksOnly]);
  
  // Handlers for drink actions
  const handleAddDrink = () => {
    setShowAddPanel(true);
  };

  const handleEditDrink = (drink: CustomDrink) => {
    setSelectedDrink(drink);
    setShowEditPanel(true);
  };

  const handleCloneDrink = (drink: Drink | CustomDrink) => {
    setSelectedDrink(drink);
    setShowClonePanel(true);
  };

  const handleDeleteDrink = (drink: CustomDrink) => {
    setDrinkToDelete(drink);
    setShowDeletePanel(true);
  };

  const handleSaveNewDrink = (drink: CustomDrink) => {
    addCustomDrink(drink);
    setShowAddPanel(false);
  };

  const handleSaveEditedDrink = (drink: CustomDrink) => {
    updateCustomDrink(drink);
    setShowEditPanel(false);
    setSelectedDrink(null);
  };

  const handleSaveClonedDrink = (drink: CustomDrink) => {
    addCustomDrink(drink);
    setShowClonePanel(false);
    setSelectedDrink(null);
  };

  const handleConfirmDelete = () => {
    if (drinkToDelete) {
      removeCustomDrink(drinkToDelete);
      setShowDeletePanel(false);
      setDrinkToDelete(null);
    }
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1>
          <FontAwesomeIcon icon={faWhiskeyGlass} className="me-2" />
          Drinks Database
        </h1>
        <small className="text-muted d-block mt-1">
          This application uses a fixed database of known caffeine drinks. If you don't find your drink, you can add it below.
        </small>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs={12} sm={6}>
              <Form.Check 
                type="switch"
                id="custom-switch"
                label="Show my custom drinks only"
                checked={showUserDrinksOnly}
                onChange={(e) => setShowUserDrinksOnly(e.target.checked)}
                className="form-check-primary"
              />
            </Col>
            <Col xs={12} sm={6} className="text-sm-end mt-2 mt-sm-0">
              <Button 
                variant="primary" 
                onClick={handleAddDrink}
                className="d-flex align-items-center gap-2"
                style={{ marginLeft: 'auto' }}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Custom Drink</span>
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Main drink browser component */}
      <DrinkBrowser 
        drinks={allDrinks}
        onEditDrink={handleEditDrink}
        onCloneDrink={handleCloneDrink}
        onDeleteDrink={handleDeleteDrink}
      />

      {/* Add drink slideout */}
      <DrinkAddSlideout 
        show={showAddPanel}
        onHide={() => setShowAddPanel(false)}
        onSave={handleSaveNewDrink}
      />

      {/* Edit drink slideout */}
      {selectedDrink && showEditPanel && (
        <DrinkEditSlideout
          show={showEditPanel}
          onHide={() => { setShowEditPanel(false); setSelectedDrink(null); }}
          onSave={handleSaveEditedDrink}
          drink={selectedDrink as CustomDrink}
        />
      )}

      {/* Clone drink slideout */}
      {selectedDrink && showClonePanel && (
        <DrinkCloneSlideout
          show={showClonePanel}
          onHide={() => { setShowClonePanel(false); setSelectedDrink(null); }}
          onSave={handleSaveClonedDrink}
          drink={selectedDrink}
        />
      )}

      {/* Delete confirmation slideout */}
      {drinkToDelete && (
        <DrinkDeleteConfirmation
          show={showDeletePanel}
          onHide={() => { setShowDeletePanel(false); setDrinkToDelete(null); }}
          onConfirm={handleConfirmDelete}
          drink={drinkToDelete}
        />
      )}
    </Container>
  );
};

export default DrinksPage;
