/**
 * IntakeEditSlideout - Slide-out panel for editing caffeine intake records
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faFloppyDisk, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { CaffeineIntake, Drink } from '../../types';
import SlideoutPanel from '../common/layout/SlideoutPanel';
import IntakeForm from './IntakeForm';

interface IntakeEditSlideoutProps {
  /**
   * Whether the panel should be shown
   */
  show: boolean;
  
  /**
   * Callback when the panel is closed
   */
  onHide: () => void;
  
  /**
   * The intake record to edit
   */
  intake: CaffeineIntake;
  
  /**
   * Available drinks to select from
   */
  drinks: Drink[];
  
  /**
   * Callback when intake is saved
   */
  onSave: (intake: CaffeineIntake) => void;
}

/**
 * Component for editing an existing caffeine intake record
 */
const IntakeEditSlideout: React.FC<IntakeEditSlideoutProps> = ({
  show,
  onHide,
  intake,
  drinks,
  onSave
}) => {
  // The form ID to use for this panel
  const formId = "intakeEditForm";

  const handleSave = (updatedIntake: CaffeineIntake) => {
    onSave(updatedIntake);
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
      title="Edit Caffeine Intake"
      description="Update the details of this caffeine intake record."
      icon={faPencilAlt}
      footer={footer}
    >
      <IntakeForm 
        intake={intake}
        drinks={drinks}
        onSave={handleSave}
        onCancel={onHide}
        id={formId}
      />
    </SlideoutPanel>
  );
};

export default IntakeEditSlideout;