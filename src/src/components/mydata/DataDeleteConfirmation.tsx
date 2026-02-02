import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import SlideoutPanel from '../common/layout/SlideoutPanel';
import DeleteConfirmation from '../common/modals/DeleteConfirmation';

interface DataDeleteConfirmationProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  caffeineIntakesCount: number;
  customDrinksCount: number;
}

/**
 * Component for confirming deletion of all user data
 */
const DataDeleteConfirmation: React.FC<DataDeleteConfirmationProps> = ({
  show,
  onHide,
  onConfirm,
  caffeineIntakesCount,
  customDrinksCount
}) => {
  // Create the footer with standardized buttons
  const footer = (
    <div className="d-flex justify-content-between w-100">
      <Button 
        variant="outline-secondary" 
        className="d-flex align-items-center gap-2"
        onClick={onHide}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
        <span>Back</span>
      </Button>
      <Button 
        variant="danger" 
        className="d-flex align-items-center gap-2"
        onClick={onConfirm}
      >
        <FontAwesomeIcon icon={faTrash} />
        <span>Delete All Data</span>
      </Button>
    </div>
  );

  return (
    <SlideoutPanel
      show={show}
      onHide={onHide}
      title="Delete All Data"
      icon={faExclamationTriangle}
      description="This action will permanently erase all your tracking data and cannot be undone."
      footer={footer}
      size="sm"
    >
      <DeleteConfirmation
        show={show}
        onHide={onHide}
        onConfirm={onConfirm}
        title="Delete All Data"
        description="This will permanently erase all your caffeine tracking history and custom drinks from this device."
        itemDetails={
          <div>
            <p className="mb-2"><strong>This includes:</strong></p>
            <ul className="mb-0">
              <li>{caffeineIntakesCount} caffeine intake records</li>
              <li>{customDrinksCount} custom drink configurations</li>
            </ul>
            <p className="mt-3 mb-0 text-muted">
              <small>Your user preferences (theme, half-life settings, etc.) will be preserved.</small>
            </p>
          </div>
        }
      />
    </SlideoutPanel>
  );
};

export default DataDeleteConfirmation;