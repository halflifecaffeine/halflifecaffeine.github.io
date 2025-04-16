import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPlusSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';
import { IntakeLogTable } from '../../components/intake/IntakeLogTable';
import IntakeWelcome from '../../components/intake/IntakeWelcome';
import IntakePanel from '../../components/intake/IntakePanel';
import DeleteConfirmation from '../../components/common/modals/DeleteConfirmation';
import SlideoutPanel from '../../components/common/layout/SlideoutPanel';
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

  // Panel visibility states
  const [showAddPanel, setShowAddPanel] = useState<boolean>(false);
  const [showEditPanel, setShowEditPanel] = useState<boolean>(false);
  const [showClonePanel, setShowClonePanel] = useState<boolean>(false);
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

  // Handler for cloning an intake
  const handleCloneIntake = (intake: CaffeineIntake) => {
    addCaffeineIntake(intake);
    setShowClonePanel(false);
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

  // Handler for opening the clone slideout
  const handleCloneClick = (intake: CaffeineIntake) => {
    // Create a cloned intake with new ID and current timestamp
    const clonedData = {
      ...intake,
      id: uuidv4(),
      datetime: new Date().toISOString()
    };
    setSelectedIntake(clonedData);
    setShowClonePanel(true);
  };

  // Handler for opening the delete slideout
  const handleDeleteClick = (intake: CaffeineIntake) => {
    setSelectedIntake(intake);
    setShowDeletePanel(true);
  };

  // Check if there's any intake data
  const hasIntakeData = state.caffeineIntakes.length > 0;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="mb-1">
          <h1>
            <FontAwesomeIcon icon={faPlusSquare} className="me-2" />
            Caffeine Intake
          </h1>
          <small className="text-muted d-block mt-1">
            The table below is your caffeine intake log. You can add, edit, clone, or delete records as needed.
          </small>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddPanel(true)}
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

      {/* Add intake panel */}
      <IntakePanel
        show={showAddPanel}
        onHide={() => setShowAddPanel(false)}
        drinks={availableDrinks}
        onSave={handleAddIntake}
        mode="add"
      />

      {/* Edit intake panel */}
      <IntakePanel
        show={showEditPanel}
        onHide={() => setShowEditPanel(false)}
        intake={selectedIntake || undefined}
        drinks={availableDrinks}
        onSave={handleUpdateIntake}
        mode="edit"
      />

      {/* Clone intake panel */}
      <IntakePanel
        show={showClonePanel}
        onHide={() => setShowClonePanel(false)}
        intake={selectedIntake || undefined}
        drinks={availableDrinks}
        onSave={handleCloneIntake}
        mode="clone"
      />

      {/* Delete confirmation slideout */}
      {selectedIntake && (
        <SlideoutPanel
          show={showDeletePanel}
          onHide={() => setShowDeletePanel(false)}
          title="Delete Caffeine Intake"
          icon={faTrash}
          size="sm"
          footer={
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowDeletePanel(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteIntake}
              >
                Delete
              </Button>
            </div>
          }
        >
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
        </SlideoutPanel>
      )}
    </Container>
  );
};

export default IntakePage;

