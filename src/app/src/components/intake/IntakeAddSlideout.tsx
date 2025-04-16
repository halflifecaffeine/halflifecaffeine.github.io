/**
 * IntakeAddSlideout - Slide-out panel for adding new caffeine intake records
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faFloppyDisk, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CaffeineIntake, Drink } from '../../types';
import SlideoutPanel from '../common/layout/SlideoutPanel';
import IntakeForm from './IntakeForm';

interface IntakeAddSlideoutProps {
  /**
   * Whether the panel should be shown
   */
  show: boolean;
  
  /**
   * Callback when the panel is closed
   */
  onHide: () => void;
  
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
 * Component for adding a new caffeine intake record
 */
const IntakeAddSlideout: React.FC<IntakeAddSlideoutProps> = ({
  show,
  onHide,
  drinks,
  onSave
}) => {
  // The form ID to use for this panel
  const formId = "intakeAddForm";

  const handleSave = (intake: CaffeineIntake) => {
    onSave(intake);
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
        <span>Save Intake</span>
      </Button>
    </div>
  );

  return (
    <SlideoutPanel
      show={show}
      onHide={onHide}
      title="Add Caffeine Intake"
      description="Record a new caffeine intake with the details below."
      icon={faPlus}
      footer={footer}
    >
      <IntakeForm 
        drinks={drinks}
        onSave={handleSave}
        onCancel={onHide}
        id={formId}
      />
    </SlideoutPanel>
  );
};

export default IntakeAddSlideout;