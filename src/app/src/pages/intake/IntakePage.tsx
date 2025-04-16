import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencilAlt, faTrash, faPlusSquare, faCopy } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';
import IntakeForm from '../../components/IntakeForm';
import { IntakeLogTable } from '../../components/IntakeLogTable';
import IntakeWelcome from '../../components/IntakeWelcome';
import SlideoutPanel from '../../components/layout/SlideoutPanel';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import { CaffeineIntake, Drink } from '../../types';
import drinksData from '../../data/drinks.json'; // Import default drinks
import { v4 as uuidv4 } from 'uuid'; // Import the UUID library

/**
 * Page component for managing caffeine intake records.
 * Provides functionality to view, add, edit, clone, and delete intake records.
 */
const IntakePage: React.FC = () => {
  // Context and state
  const { state, addCaffeineIntake, updateCaffeineIntake, removeCaffeineIntake } = useAppContext();
  const [selectedIntake, setSelectedIntake] = useState<CaffeineIntake | null>(null);
  const [clonedIntake, setClonedIntake] = useState<CaffeineIntake | null>(null);
  
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
    setClonedIntake(null); // Clear the cloned intake after saving
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
      removeCaffeineIntake(selectedIntake);
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

  // Handler for opening the clone slideout
  const handleCloneClick = (intake: CaffeineIntake) => {
    setClonedIntake({
      ...intake,
      id: uuidv4(), // Generate a new UUID using the proper function
      datetime: new Date().toISOString(), // Set date to now when cloning
    });
    setShowAddPanel(true);
  };

  // Close the add panel and reset any cloned data
  const handleAddPanelClose = () => {
    setShowAddPanel(false);
    setClonedIntake(null);
  };

  // Standard footer component for the add slideout
  const addFooter = (
    <div className="d-flex justify-content-between w-100">
      <Button 
        variant="outline-secondary" 
        onClick={handleAddPanelClose}
        className="d-flex align-items-center"
      >
        &lt; Back
      </Button>
      <Button 
        variant="primary" 
        type="submit"
        form="intakeAddForm"
      >
        Save Changes
      </Button>
    </div>
  );

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
      <Button 
        variant="primary" 
        type="submit"
        form="intakeEditForm"
      >
        Save Changes
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
      <Button 
        variant="danger" 
        onClick={handleDeleteIntake}
      >
        Delete
      </Button>
    </div>
  );

  // Check if there's any intake data
  const hasIntakeData = state.caffeineIntakes.length > 0;

  // Determine the appropriate title and icon for the add panel based on whether we're cloning
  const addPanelTitle = clonedIntake ? "Clone Caffeine Intake" : "Add Caffeine Intake";
  const addPanelIcon = clonedIntake ? faCopy : faPlus;
  const addPanelDescription = clonedIntake 
    ? "Create a new intake based on an existing one. Make any changes needed before saving."
    : "Record a new caffeine intake with the details below.";

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1><FontAwesomeIcon icon={faPlusSquare} className="me-2" />Caffeine Intake</h1>
        <Button 
          variant="primary" 
          onClick={() => {
            setClonedIntake(null); // Ensure we're not cloning when clicking Add
            setShowAddPanel(true);
          }}
          className="d-flex align-items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Intake
        </Button>
      </div>

      {/* Show welcome component if no data, otherwise show intake table */}
      {hasIntakeData ? (
        <IntakeLogTable
          intakes={state.caffeineIntakes}
          onEditIntake={handleEditClick}
          onDeleteIntake={handleDeleteClick}
          onCloneIntake={handleCloneClick}
        />
      ) : (
        <IntakeWelcome onAddClick={() => setShowAddPanel(true)} />
      )}

      {/* Add/Clone intake slideout panel */}
      <SlideoutPanel
        show={showAddPanel}
        onHide={handleAddPanelClose}
        title={addPanelTitle}
        description={addPanelDescription}
        icon={addPanelIcon}
        footer={addFooter}
      >
        <IntakeForm
          intake={clonedIntake || undefined}
          drinks={availableDrinks}
          onSave={handleAddIntake}
          onCancel={handleAddPanelClose}
          isClone={!!clonedIntake} // Pass true if this is a cloned intake
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
            isClone={false}
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
            show={true}
            onHide={() => setShowDeletePanel(false)}
            onConfirm={handleDeleteIntake}
            title="Delete Caffeine Intake"
            message="You are about to delete the following caffeine intake record:"
            itemDetails={
              <>
                <p className="mb-1"><strong>Date & Time:</strong> {new Date(selectedIntake.datetime).toLocaleString([], {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p className="mb-1">
                  <strong>Drink:</strong> {selectedIntake.drink.brand !== 'unknown' ? `${selectedIntake.drink.brand} ` : ''}{selectedIntake.drink.product}
                </p>
                <p className="mb-1"><strong>Caffeine Amount:</strong> {selectedIntake.mg.toFixed(1)}mg</p>
                {selectedIntake.notes && <p className="mb-0"><strong>Notes:</strong> {selectedIntake.notes}</p>}
              </>
            }
          />
        )}
      </SlideoutPanel>
    </Container>
  );
};

export default IntakePage;

