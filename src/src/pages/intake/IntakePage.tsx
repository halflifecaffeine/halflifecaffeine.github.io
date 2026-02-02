import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';
import IntakeBrowser from '../../components/intake/IntakeBrowser';
import IntakeWelcomeCard from '../../components/intake/IntakeWelcomeCard';
import IntakeAddSlideout from '../../components/intake/IntakeAddSlideout';
import IntakeEditSlideout from '../../components/intake/IntakeEditSlideout';
import IntakeCloneSlideout from '../../components/intake/IntakeCloneSlideout';
import IntakeDeleteConfirmation from '../../components/intake/IntakeDeleteConfirmation';
import { CaffeineIntake, Drink } from '../../types';
import drinksData from '../../data/drinks.json';
import { v4 as uuidv4 } from 'uuid';

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

      {/* Show welcome component if no data, otherwise show intake browser */}
      {hasIntakeData ? (
        <IntakeBrowser
          intakes={state.caffeineIntakes}
          onEditIntake={handleEditClick}
          onDeleteIntake={handleDeleteClick}
          onCloneIntake={handleCloneClick}
        />
      ) : (
        <IntakeWelcomeCard onAddClick={() => setShowAddPanel(true)} />
      )}

      {/* Add intake slideout */}
      <IntakeAddSlideout
        show={showAddPanel}
        onHide={() => setShowAddPanel(false)}
        drinks={availableDrinks}
        onSave={handleAddIntake}
      />

      {/* Edit intake slideout */}
      {selectedIntake && showEditPanel && (
        <IntakeEditSlideout
          show={showEditPanel}
          onHide={() => { setShowEditPanel(false); setSelectedIntake(null); }}
          intake={selectedIntake}
          drinks={availableDrinks}
          onSave={handleUpdateIntake}
        />
      )}

      {/* Clone intake slideout */}
      {selectedIntake && showClonePanel && (
        <IntakeCloneSlideout
          show={showClonePanel}
          onHide={() => { setShowClonePanel(false); setSelectedIntake(null); }}
          intake={selectedIntake}
          drinks={availableDrinks}
          onSave={handleCloneIntake}
        />
      )}

      {/* Delete confirmation slideout */}
      {selectedIntake && showDeletePanel && (
        <IntakeDeleteConfirmation
          show={showDeletePanel}
          onHide={() => { setShowDeletePanel(false); setSelectedIntake(null); }}
          onConfirm={handleDeleteIntake}
          intake={selectedIntake}
        />
      )}
    </Container>
  );
};

export default IntakePage;

