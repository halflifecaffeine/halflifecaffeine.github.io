/**
 * DrinkPanel - Slide-out panel for adding, editing, or cloning custom drinks
 * Similar in function to SettingsPanel but specific to drinks management
 */
import React from 'react';
import { Offcanvas, Button } from 'react-bootstrap';
import { useAppContext } from '../../contexts/AppContext';
import { CustomDrink, Drink } from '../../types';
import DrinkForm from '../DrinkForm';

interface DrinkPanelProps {
  show: boolean;
  onHide: () => void;
  selectedDrink?: Drink;
  mode: 'add' | 'edit' | 'clone';
}

/**
 * Slide-out panel for drink management
 */
const DrinkPanel: React.FC<DrinkPanelProps> = ({
  show,
  onHide,
  selectedDrink,
  mode
}) => {
  const { addCustomDrink, updateCustomDrink } = useAppContext();
  
  // Generate a title based on the current mode
  const getPanelTitle = () => {
    switch(mode) {
      case 'add':
        return 'Add Custom Drink';
      case 'edit':
        return 'Edit Custom Drink';
      case 'clone':
        return 'Clone Drink';
      default:
        return 'Custom Drink';
    }
  };
  
  // Handle form submission
  const handleSave = (drink: CustomDrink) => {
    if (mode === 'edit') {
      updateCustomDrink(drink);
    } else {
      // For both 'add' and 'clone' we're creating a new drink
      addCustomDrink(drink);
    }
    onHide();
  };

  // The form ID to use for this panel
  const formId = mode === 'edit' ? 'drinkEditForm' : 'drinkAddForm';

  return (
    <Offcanvas 
      show={show} 
      onHide={onHide} 
      placement="end"
      className="drink-panel"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{getPanelTitle()}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column">
        <div className="flex-grow-1 overflow-auto">
          <DrinkForm 
            drink={selectedDrink as CustomDrink}
            onSave={handleSave}
            onCancel={onHide}
            isClone={mode === 'clone'}
          />
        </div>
      </Offcanvas.Body>
      <div className="p-3 border-top">
        <div className="d-flex justify-content-between w-100">
          <Button 
            variant="outline-secondary" 
            onClick={onHide}
            className="d-flex align-items-center"
          >
            &lt; Back
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            form={formId}
          >
            Save
          </Button>
        </div>
      </div>
    </Offcanvas>
  );
};

export default DrinkPanel;