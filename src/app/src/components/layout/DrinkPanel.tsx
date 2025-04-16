/**
 * DrinkPanel - Slide-out panel for adding, editing, or cloning custom drinks
 * Similar in function to SettingsPanel but specific to drinks management
 */
import React from 'react';
import { Offcanvas, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faFloppyDisk, faPlus, faPencilAlt, faCopy } from '@fortawesome/free-solid-svg-icons';
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
  
  // Generate panel data based on the current mode
  const getPanelData = () => {
    switch(mode) {
      case 'add':
        return {
          title: 'Add Custom Drink',
          description: 'Create a new custom drink with caffeine content details.',
          icon: faPlus
        };
      case 'edit':
        return {
          title: 'Edit Custom Drink',
          description: 'Update the details of this custom drink.',
          icon: faPencilAlt
        };
      case 'clone':
        return {
          title: 'Clone Drink',
          description: 'Create a new drink based on an existing one.',
          icon: faCopy
        };
      default:
        return {
          title: 'Custom Drink',
          description: 'Manage drink details.',
          icon: faPlus
        };
    }
  };
  
  const { title, description, icon } = getPanelData();
  
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
      className="drink-panel d-flex flex-column"
    >
      <Offcanvas.Header closeButton className="border-bottom pb-3">
        <Offcanvas.Title className="w-100">
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={icon} className="me-2" />
            <span>{title}</span>
          </div>
          <small className="text-muted d-block mt-1 fs-6 fw-light lh-sm">{description}</small>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="flex-grow-1 overflow-auto">
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
            className="d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            <span>Back</span>
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            form={formId}
            className="d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>
    </Offcanvas>
  );
};

export default DrinkPanel;