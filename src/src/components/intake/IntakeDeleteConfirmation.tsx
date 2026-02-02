/**
 * IntakeDeleteConfirmation - Slide-out panel for confirming intake deletion
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { CaffeineIntake } from '../../types';
import SlideoutPanel from '../common/layout/SlideoutPanel';
import { formatDisplayDateTime } from '../../utils/dateUtils';

interface IntakeDeleteConfirmationProps {
  /**
   * Whether the panel should be shown
   */
  show: boolean;
  
  /**
   * Callback when the panel is closed
   */
  onHide: () => void;
  
  /**
   * Callback when deletion is confirmed
   */
  onConfirm: () => void;
  
  /**
   * The intake record to delete
   */
  intake: CaffeineIntake;
}

/**
 * Component for confirming the deletion of a caffeine intake record
 */
const IntakeDeleteConfirmation: React.FC<IntakeDeleteConfirmationProps> = ({
  show,
  onHide,
  onConfirm,
  intake
}) => {
  // Format the intake datetime for readable display
  const formattedDateTime = formatDisplayDateTime(new Date(intake.datetime));

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
        variant="danger" 
        onClick={onConfirm}
        className="d-flex align-items-center gap-2"
      >
        <FontAwesomeIcon icon={faTrash} />
        <span>Delete</span>
      </Button>
    </div>
  );

  return (
    <SlideoutPanel
      show={show}
      onHide={onHide}
      title="Delete Caffeine Intake"
      description="Are you sure you want to delete this record?"
      icon={faTrash}
      footer={footer}
      size="sm"
    >
      <div className="p-2">
        <p className="mb-3">
          This action cannot be undone. Are you sure you want to delete this intake record?
        </p>
        <div className="border-top pt-3">
          <p className="mb-1"><strong>Date & Time:</strong> {formattedDateTime}</p>
          <p className="mb-1"><strong>Drink:</strong> {intake.drink.product}</p>
          <p className="mb-1"><strong>Volume:</strong> {intake.volume} {intake.unit}</p>
          <p className="mb-1"><strong>Caffeine:</strong> {intake.mg}mg</p>
          {intake.notes && <p className="mb-1"><strong>Notes:</strong> {intake.notes}</p>}
        </div>
      </div>
    </SlideoutPanel>
  );
};

export default IntakeDeleteConfirmation;