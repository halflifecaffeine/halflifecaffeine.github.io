import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faFloppyDisk, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CustomDrink } from '../../types';
import SlideoutPanel from '../common/layout/SlideoutPanel';
import DrinkForm from './DrinkForm';

interface DrinkAddSlideoutProps {
  show: boolean;
  onHide: () => void;
  onSave: (drink: CustomDrink) => void;
}

/**
 * Component for adding a new custom drink
 */
const DrinkAddSlideout: React.FC<DrinkAddSlideoutProps> = ({
  show,
  onHide,
  onSave
}) => {
  // The form ID to use for this panel
  const formId = "drinkAddForm";

  const handleSave = (drink: CustomDrink) => {
    onSave(drink);
    onHide();
  };

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
        <span>Save Drink</span>
      </Button>
    </div>
  );

  return (
    <SlideoutPanel
      show={show}
      onHide={onHide}
      title="Add Custom Drink"
      description="Create a new custom drink with caffeine content details."
      icon={faPlus}
      footer={footer}
    >
      <DrinkForm 
        onSave={handleSave}
        onCancel={onHide}
      />
    </SlideoutPanel>
  );
};

export default DrinkAddSlideout;