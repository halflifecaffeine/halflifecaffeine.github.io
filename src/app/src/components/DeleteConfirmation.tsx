import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { CaffeineIntake } from '../types';

interface DeleteConfirmationProps {
  intake: CaffeineIntake;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Component that displays a confirmation message before deleting a caffeine intake record.
 * Used within the delete slideout panel.
 */
const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ 
  intake, 
  onConfirm, 
  onCancel 
}) => {
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="delete-confirmation">
      <Alert variant="warning">
        <Alert.Heading>Warning: This action cannot be undone</Alert.Heading>
        <p>
          You are about to delete the following caffeine intake record:
        </p>
      </Alert>
      
      <div className="record-details p-3 mb-4 border rounded bg-light">
        <p className="mb-1"><strong>Date & Time:</strong> {formatDateTime(intake.datetime)}</p>
        <p className="mb-1"><strong>Drink:</strong> {intake.drink.manufacturer} {intake.drink.product}</p>
        <p className="mb-1"><strong>Caffeine Amount:</strong> {intake.mg.toFixed(1)}mg</p>
        {intake.notes && <p className="mb-0"><strong>Notes:</strong> {intake.notes}</p>}
      </div>
      
      <p>Are you sure you want to delete this record?</p>
      
      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="outline-secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete Record
        </Button>
      </div>
    </div>
  );
};

export default DeleteConfirmation;