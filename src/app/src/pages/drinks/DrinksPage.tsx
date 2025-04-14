import React from 'react';
import { Container } from 'react-bootstrap';
import { useAppContext } from '../../contexts/AppContext';
import DrinkLookup from '../../components/DrinkLookup';
import { Drink } from '../../types'; // Import Drink type
import drinksData from '../../data/drinks.json'; // Import default drinks data
import { faGlassWhiskey } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DrinksPage: React.FC = () => {
  const { state, addCustomDrink, updateCustomDrink } = useAppContext();

  return (
    <Container className="mt-4">
      <h1><FontAwesomeIcon icon={faGlassWhiskey} className="me-2" />Manage Drinks Database</h1>
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
        />
        <div className="mt-4 p-3 border rounded">
          <h5>Errors and Corrections</h5>
          <p>
            If you find information above to be incorrect, please <a href="https://github.com/halflifecaffeine/halflifecaffeine.github.io/issues" target="_blank">submit an issue on GitHub</a> and include any links or relevant information that you have.
          </p>
          <p>If you are a software developer, please feel free to submit a pull request with the changes you would like to see. See the <a href="https://github.com/halflifecaffeine/halflifecaffeine.github.io/blob/main/CONTRIBUTING.md" target="_blank">CONTRIBUTING.md</a> first though.</p>
          <p className="text-muted">
            Your feedback helps us improve the application!
          </p>
        </div>
      </div>
    </Container>
  );
};

export default DrinksPage;
