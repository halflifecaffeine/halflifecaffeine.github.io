import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { CustomDrink } from '../../types';
import SlideoutPanel from '../common/layout/SlideoutPanel';

interface DrinkDeleteConfirmationProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  drink: CustomDrink;
}

/**
 * Component for confirming drink deletion
 */
const DrinkDeleteConfirmation: React.FC<DrinkDeleteConfirmationProps> = ({
  show,
  onHide,
  onConfirm,
  drink
}) => {
  // Calculate total caffeine
  const totalCaffeine = (drink.caffeine_mg_per_oz * drink.default_size_in_oz).toFixed(1);

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
        <span>Permanently Delete</span>
      </Button>
    </div>
  );

  return (
    <SlideoutPanel
      show={show}
      onHide={onHide}
      title="Delete Custom Drink"
      description="Are you sure you want to permanently delete this drink?"
      icon={faTrash}
      footer={footer}
      size="sm"
    >
      <div className="p-2">
        <p className="mb-3">
          Are you sure you want to delete "{drink.product}"? This action cannot be undone.
        </p>
        <div className="border-top pt-3">
          <p className="mb-1"><strong>Product:</strong> {drink.product}</p>
          <p className="mb-1"><strong>Brand:</strong> {drink.brand !== 'unknown' ? drink.brand : 'Unknown'}</p>
          <p className="mb-1"><strong>Category:</strong> {drink.category}</p>
          <p className="mb-1"><strong>Caffeine:</strong> {totalCaffeine}mg</p>
        </div>
      </div>
    </SlideoutPanel>
  );
};

export default DrinkDeleteConfirmation;