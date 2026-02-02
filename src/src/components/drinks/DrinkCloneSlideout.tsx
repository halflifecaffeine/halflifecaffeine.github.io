import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faFloppyDisk, faCopy } from '@fortawesome/free-solid-svg-icons';
import { CustomDrink, Drink } from '../../types';
import SlideoutPanel from '../common/layout/SlideoutPanel';
import DrinkForm from './DrinkForm';

interface DrinkCloneSlideoutProps {
  show: boolean;
  onHide: () => void;
  onSave: (drink: CustomDrink) => void;
  drink: Drink | CustomDrink;
}

/**
 * Component for cloning an existing drink
 */
const DrinkCloneSlideout: React.FC<DrinkCloneSlideoutProps> = ({
  show,
  onHide,
  onSave,
  drink
}) => {
  // The form ID to use for this panel
  const formId = "drinkAddForm"; // Uses add form ID since it's creating a new drink

  const handleSave = (clonedDrink: CustomDrink) => {
    onSave(clonedDrink);
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
        <span>Save as New</span>
      </Button>
    </div>
  );

  return (
    <SlideoutPanel
      show={show}
      onHide={onHide}
      title="Clone Drink"
      description="Create a new drink based on an existing one."
      icon={faCopy}
      footer={footer}
    >
      <DrinkForm 
        drink={drink as CustomDrink}
        onSave={handleSave}
        onCancel={onHide}
        isClone={true}
      />
    </SlideoutPanel>
  );
};

export default DrinkCloneSlideout;