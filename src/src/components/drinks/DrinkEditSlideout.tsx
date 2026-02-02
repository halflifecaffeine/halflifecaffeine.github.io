import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faFloppyDisk, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { CustomDrink } from '../../types';
import SlideoutPanel from '../common/layout/SlideoutPanel';
import DrinkForm from './DrinkForm';

interface DrinkEditSlideoutProps {
  show: boolean;
  onHide: () => void;
  onSave: (drink: CustomDrink) => void;
  drink: CustomDrink;
}

/**
 * Component for editing an existing custom drink
 */
const DrinkEditSlideout: React.FC<DrinkEditSlideoutProps> = ({
  show,
  onHide,
  onSave,
  drink
}) => {
  // The form ID to use for this panel
  const formId = "drinkEditForm";

  const handleSave = (updatedDrink: CustomDrink) => {
    onSave(updatedDrink);
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
        <span>Save Changes</span>
      </Button>
    </div>
  );

  return (
    <SlideoutPanel
      show={show}
      onHide={onHide}
      title="Edit Custom Drink"
      description="Update the details of this custom drink."
      icon={faPencilAlt}
      footer={footer}
    >
      <DrinkForm 
        drink={drink}
        onSave={handleSave}
        onCancel={onHide}
      />
    </SlideoutPanel>
  );
};

export default DrinkEditSlideout;