import React from 'react';
import { Alert } from 'react-bootstrap';
import { CaffeineIntake } from '../types';

interface DeleteConfirmationProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemDetails?: React.ReactNode;
}

/**
 * Generic confirmation component for deleting items.
 * Can be used for any type of deletion confirmation, not just caffeine intakes.
 * This component is designed to be used within a parent container that provides
 * its own footer with action buttons (like SlideoutPanel).
 */
const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ 
  show,
  onHide,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item?",
  itemDetails
}) => {
  if (!show) return null;

  return (
    <div className="delete-confirmation">
      <Alert variant="warning">
        <Alert.Heading>{title}</Alert.Heading>
        <p>{message}</p>
      </Alert>
      
      {itemDetails && (
        <div className="record-details p-3 mb-4 border rounded bg-light">
          {itemDetails}
        </div>
      )}
    </div>
  );
};

export default DeleteConfirmation;