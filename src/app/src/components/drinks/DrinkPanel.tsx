/**
 * DrinkPanel - Slide-out panel for adding, editing, or cloning custom drinks
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faFloppyDisk, faPlus, faPencilAlt, faCopy } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';
import { CustomDrink, Drink } from '../../types';
import DrinkForm from '../drinks/DrinkForm';
import SlideoutPanel from '../common/layout/SlideoutPanel';

interface DrinkPanelProps {
  show: boolean;
  onHide: () => void;
  selectedDrink?: Drink;
  mode: 'add' | 'edit' | 'clone';
}

/**
 * DrinkPanel component using the common SlideoutPanel for consistency
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

  // Create the footer with standardized buttons
  const footer = (
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
  );

  return (
    <SlideoutPanel
      show={show}
      onHide={onHide}
      title={title}
      description={description}
      icon={icon}
      footer={footer}
    >
      <DrinkForm 
        drink={selectedDrink as CustomDrink}
        onSave={handleSave}
        onCancel={onHide}
        isClone={mode === 'clone'}
      />
    </SlideoutPanel>
  );
};

export default DrinkPanel;