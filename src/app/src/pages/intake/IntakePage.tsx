import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';
import IntakeForm from '../../components/IntakeForm';
import IntakeLogTable from '../../components/IntakeLogTable';
import SlideoutPanel from '../../components/layout/SlideoutPanel';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import { CaffeineIntake, Drink } from '../../types';
import drinksData from '../../data/drinks.json'; // Import default drinks

/**
 * Page component for managing caffeine intake records.
 * Provides functionality to view, add, edit, and delete intake records.
 */
const IntakePage: React.FC = () => {
  // Context and state
  const { state, addCaffeineIntake, updateCaffeineIntake, removeCaffeineIntake } = useAppContext();
  const [selectedIntake, setSelectedIntake] = useState<CaffeineIntake | null>(null);
  
  // Slideout panel visibility states
  const [showAddPanel, setShowAddPanel] = useState<boolean>(false);
  const [showEditPanel, setShowEditPanel] = useState<boolean>(false);
  const [showDeletePanel, setShowDeletePanel] = useState<boolean>(false);

  // Combine default and custom drinks for the form
  const availableDrinks = [...(drinksData as Drink[]), ...state.customDrinks];

  // Handler for adding a new intake
  const handleAddIntake = (intake: CaffeineIntake) => {
    addCaffeineIntake(intake);
    setShowAddPanel(false);
  };

  // Handler for updating an existing intake
  const handleUpdateIntake = (updatedIntake: CaffeineIntake) => {
    updateCaffeineIntake(updatedIntake);
    setShowEditPanel(false);
    setSelectedIntake(null);
  };

  // Handler for deleting an intake
  const handleDeleteIntake = () => {
    if (selectedIntake) {
      removeCaffeineIntake(selectedIntake.id);
      setShowDeletePanel(false);
      setSelectedIntake(null);
    }
  };

  // Handler for opening the edit slideout
  const handleEditClick = (intake: CaffeineIntake) => {
    setSelectedIntake(intake);
    setShowEditPanel(true);
  };

  // Handler for opening the delete slideout
  const handleDeleteClick = (intake: CaffeineIntake) => {
    setSelectedIntake(intake);
    setShowDeletePanel(true);
  };

  // Standard footer component for the edit slideout
  const editFooter = (
    <div className="d-flex justify-content-between w-100">
      <Button 
        variant="outline-secondary" 
        onClick={() => setShowEditPanel(false)}
        className="d-flex align-items-center"
      >
        &lt; Back
      </Button>
    </div>
  );

  // Standard footer component for the delete slideout
  const deleteFooter = (
    <div className="d-flex justify-content-between w-100">
      <Button 
        variant="outline-secondary" 
        onClick={() => setShowDeletePanel(false)}
        className="d-flex align-items-center"
      >
        &lt; Back
      </Button>
    </div>
  );

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Caffeine Intake</h1>
        <Button 
          variant="primary" 
          onClick={() => setShowAddPanel(true)}
          className="d-flex align-items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Intake
        </Button>
      </div>

      {/* Main content - Intake records table */}
      <IntakeLogTable
        intakes={state.caffeineIntakes}
        onEditIntake={handleEditClick}
        onDeleteIntake={handleDeleteClick}
      />

      {/* Add intake slideout panel */}
      <SlideoutPanel
        show={showAddPanel}
        onHide={() => setShowAddPanel(false)}
        title="Add Caffeine Intake"
        description="Record a new caffeine intake with the details below."
        icon={faPlus}
        footer={
          <div className="d-flex justify-content-between w-100">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowAddPanel(false)}
              className="d-flex align-items-center"
            >
              &lt; Back
            </Button>
          </div>
        }
      >
        <IntakeForm
          drinks={availableDrinks}
          onSave={handleAddIntake}
          onCancel={() => setShowAddPanel(false)}
        />
      </SlideoutPanel>

      {/* Edit intake slideout panel */}
      <SlideoutPanel
        show={showEditPanel}
        onHide={() => setShowEditPanel(false)}
        title="Edit Caffeine Intake"
        description="Update the details of this caffeine intake record."
        icon={faPencilAlt}
        footer={editFooter}
      >
        {selectedIntake && (
          <IntakeForm
            intake={selectedIntake}
            drinks={availableDrinks}
            onSave={handleUpdateIntake}
            onCancel={() => setShowEditPanel(false)}
          />
        )}
      </SlideoutPanel>

      {/* Delete confirmation slideout panel */}
      <SlideoutPanel
        show={showDeletePanel}
        onHide={() => setShowDeletePanel(false)}
        title="Delete Caffeine Intake"
        icon={faTrash}
        footer={deleteFooter}
        size="sm"
      >
        {selectedIntake && (
          <DeleteConfirmation
            intake={selectedIntake}
            onConfirm={handleDeleteIntake}
            onCancel={() => setShowDeletePanel(false)}
          />
        )}
      </SlideoutPanel>
    </Container>
  );
};

export default IntakePage;
