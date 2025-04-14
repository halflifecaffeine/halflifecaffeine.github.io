import React from 'react';
import { Container } from 'react-bootstrap';
import { useAppContext } from '../../contexts/AppContext';
import DrinkLookup from '../../components/DrinkLookup';
import { Drink } from '../../types'; // Import Drink type
import drinksData from '../../data/drinks.json'; // Import default drinks data

const DrinksPage: React.FC = () => {
  const { state, addCustomDrink, updateCustomDrink, removeCustomDrink } = useAppContext();

  return (
    <Container className="mt-4">
      <h1>Manage Drinks Database</h1>
      <p className="text-muted">
        View the default drink database or add, edit, and remove your own custom drinks.
        Custom drinks are stored locally in your browser.
      </p>
      <div className="mt-4 p-3 border rounded">
        <DrinkLookup
          drinks={drinksData as Drink[]} // Pass default drinks
          customDrinks={state.customDrinks} // Pass custom drinks from context
          onAddCustomDrink={addCustomDrink} // Pass context action
          onUpdateCustomDrink={updateCustomDrink} // Pass context action
          onRemoveCustomDrink={removeCustomDrink} // Pass context action
        />
      </div>
    </Container>
  );
};

export default DrinksPage;
