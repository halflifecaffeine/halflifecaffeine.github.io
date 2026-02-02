/**
 * IntakeCloneSlideout - Slide-out panel for cloning caffeine intake records
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faFloppyDisk, faCopy } from '@fortawesome/free-solid-svg-icons';
import { CaffeineIntake, Drink } from '../../types';
import SlideoutPanel from '../common/layout/SlideoutPanel';
import IntakeForm from './IntakeForm';

interface IntakeCloneSlideoutProps {
  /**
   * Whether the panel should be shown
   */
  show: boolean;
  
  /**
   * Callback when the panel is closed
   */
  onHide: () => void;
  
  /**
   * The intake record to clone
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
 * Component for cloning an existing caffeine intake record
 */
const IntakeCloneSlideout: React.FC<IntakeCloneSlideoutProps> = ({
  show,
  onHide,
  intake,
  drinks,
  onSave
}) => {
  // The form ID to use for this panel
  const formId = "intakeCloneForm";

  const handleSave = (clonedIntake: CaffeineIntake) => {
    onSave(clonedIntake);
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
      title="Clone Caffeine Intake"
      description="Create a new intake based on an existing one. Make any changes needed before saving."
      icon={faCopy}
      footer={footer}
    >
      <IntakeForm 
        intake={intake}
        drinks={drinks}
        onSave={handleSave}
        onCancel={onHide}
        isClone={true}
        id={formId}
      />
    </SlideoutPanel>
  );
};

export default IntakeCloneSlideout;