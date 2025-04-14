import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencilAlt, faTrash, faPlusSquare, faCopy } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';
import IntakeForm from '../../components/IntakeForm';
import IntakeLogTable from '../../components/IntakeLogTable';
import IntakeWelcome from '../../components/IntakeWelcome';
import SlideoutPanel from '../../components/layout/SlideoutPanel';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import { CaffeineIntake, Drink } from '../../types';
import drinksData from '../../data/drinks.json'; // Import default drinks

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

  // Handler for opening the clone slideout
  const handleCloneClick = (intake: CaffeineIntake) => {
    // Set the intake to be cloned, but update the datetime to current time
    const now = new Date();
    setClonedIntake({
      ...intake,
      // Don't copy the ID - a new one will be generated when saved
      datetime: now.toISOString()
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
