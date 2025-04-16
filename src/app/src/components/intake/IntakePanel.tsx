/**
 * IntakePanel - Slide-out panel for creating and editing caffeine intake records
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencilAlt, faCopy, faChevronLeft, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { CaffeineIntake, Drink } from '../../types';
import SlideoutPanel from '../common/layout/SlideoutPanel';
import IntakeForm from './IntakeForm';

interface IntakePanelProps {
  /**
   * Whether the panel should be shown
   */
  show: boolean;
  
  /**
   * Callback when the panel is closed
   */
  onHide: () => void;

  /**
   * The intake record to edit (if in edit or clone mode)
   */
  intake?: CaffeineIntake;
  
  /**
   * Available drinks to select from
   */
  drinks: Drink[];
  
  /**
   * Panel mode: add, edit, or clone
   */
  mode: 'add' | 'edit' | 'clone';
  
  /**
   * Callback when intake is saved
   */
  onSave: (intake: CaffeineIntake) => void;
}

/**
 * IntakePanel - A standardized slide-out panel for adding, editing, or cloning caffeine intake records
 */
const IntakePanel: React.FC<IntakePanelProps> = ({ 
  show, 
  onHide, 
  intake, 
  drinks, 
  mode, 
  onSave 
}) => {
  // Determine title, description, and icon based on mode
  let title: string;
  let description: string;
  let icon: any; // FontAwesome icon
  
  switch (mode) {
    case 'edit':
      title = "Edit Caffeine Intake";
      description = "Update the details of this caffeine intake record.";
      icon = faPencilAlt;
      break;
    case 'clone':
      title = "Clone Caffeine Intake";
      description = "Create a new intake based on an existing one. Make any changes needed before saving.";
      icon = faCopy;
      break;
    case 'add':
    default:
      title = "Add Caffeine Intake";
      description = "Record a new caffeine intake with the details below.";
      icon = faPlus;
      break;
  }

  // Standard footer with back and save buttons
  const panelFooter = (
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
        form={`intake${mode}Form`}
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
      footer={panelFooter}
    >
      <IntakeForm
        intake={intake}
        drinks={drinks}
        onSave={onSave}
        onCancel={onHide}
        isClone={mode === 'clone'}
        id={`intake${mode}Form`}
      />
    </SlideoutPanel>
  );
};

export default IntakePanel;