import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { CaffeineIntake, Drink, VolumeUnit } from '../types';
import { validateVolumeInput } from '../utils/validators';
import { formatDateTimeForInput, getCurrentDateTimeForInput, parseInputToISOString } from '../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../contexts/AppContext';

interface IntakeFormProps {
  intake?: CaffeineIntake; // For editing existing intake, undefined for new intake
  drinks: Drink[];
  onSave: (intake: CaffeineIntake) => void;
  onCancel: () => void;
  isClone?: boolean; // Default to false if not provided
}

// Option type for the React Select component
interface DrinkOption {
  value: string;
  label: string;
  drink: Drink;
}

/**
 * Reusable form component for adding or editing caffeine intake records.
 * Uses local time consistently for better user experience.
 */
const IntakeForm: React.FC<IntakeFormProps> = ({ 
  intake, 
  drinks, 
  onSave, 
  onCancel,
  isClone = false // Default to false if not provided
}) => {
  const { theme } = useAppContext(); // Get current theme
  const [selectedDrink, setSelectedDrink] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<DrinkOption | null>(null);
  const [volume, setVolume] = useState<string>('1');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('oz');
  const [dateTime, setDateTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Format drinks for React Select
  const drinkOptions: DrinkOption[] = drinks.map((drink) => ({
    value: `${drink.brand}|${drink.product}`,
    label: `${drink.brand !== 'unknown' ? drink.brand : ''} ${drink.product} (${(drink.caffeine_mg_per_oz * drink.default_size_in_oz).toFixed(1)}mg)`,
    drink: drink
  }));
  
  // Track if we're in edit mode to prevent overriding user values
  // Treat clones as add mode, not edit mode (to ensure drink selection works properly)
  const isEditMode = !!intake && !isClone;
  
  // Initialize form with existing data when editing or cloning
  useEffect(() => {
    if (intake) {
      const drinkValue = `${intake.drink.brand}|${intake.drink.product}`;
      // Set the selected drink value
      setSelectedDrink(drinkValue);
      
      // Find the corresponding React Select option
      const option = drinkOptions.find(opt => opt.value === drinkValue) || null;
      setSelectedOption(option);
      
      setVolume(intake.volume.toString());
      setVolumeUnit(intake.unit);
      
      // Format the datetime for the input using local time
      const date = new Date(intake.datetime);
      setDateTime(formatDateTimeForInput(date));
      
      setNotes(intake.notes || '');
    } else {
      // Set default values for new intake using local time
      // Only set the initial datetime once when the component mounts
      if (dateTime === '') {
        setDateTime(getCurrentDateTimeForInput());
      }
    }
    // Only include dependencies that should trigger a re-initialization
    // Exclude drinkOptions which changes frequently
  }, [intake]);

  // Set default volume based on selected drink's default_size_in_oz, but only in Add mode
  useEffect(() => {
    // Only update volume when a drink is selected and we're not in edit mode
    // For cloned intakes, we want to keep the volume from the original
    if (selectedDrink && !isEditMode && !isClone) {
      const [brand, product] = selectedDrink.split('|');
      const drink = drinks.find(d => d.brand === brand && d.product === product);
      
      if (drink) {
        // Set volume to the drink's default size
        setVolume(drink.default_size_in_oz.toString());
        // Always use oz as the default unit to match the default_size_in_oz
        setVolumeUnit('oz');
      }
    }
  }, [selectedDrink, drinks, isEditMode, isClone]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedDrink) {
      newErrors.drink = 'Please select a drink';
    }
    
    if (!volume) {
      newErrors.volume = 'Please enter volume';
    } else {
      const volumeValidation = validateVolumeInput(volume, volumeUnit);
      if (!volumeValidation.isValid) {
        newErrors.volume = volumeValidation.error || 'Invalid volume';
      }
    }
    
    if (!dateTime) {
      newErrors.dateTime = 'Please select date and time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const [brand, product] = selectedDrink.split('|');
    const drink = drinks.find(d => d.brand === brand && d.product === product);
    
    if (!drink) {
      setErrors({ ...errors, drink: 'Selected drink not found' });
      return;
    }
    
    const volumeNum = parseFloat(volume);
    const caffeineAmount = drink.caffeine_mg_per_oz * volumeNum;
    
    const intakeData: CaffeineIntake = {
      id: intake?.id || uuidv4(),
      datetime: parseInputToISOString(dateTime),
      drink,
      volume: volumeNum,
      unit: volumeUnit,
      mg: Math.round(caffeineAmount * 10) / 10, // Round to 1 decimal
      notes
    };
    
    onSave(intakeData);
  };

  const handleDrinkChange = (option: DrinkOption | null) => {
    if (option) {
      setSelectedOption(option);
      setSelectedDrink(option.value);
      // Volume will be updated by the effect for new intakes
    } else {
      setSelectedOption(null);
      setSelectedDrink('');
    }
  };

  // Custom styles for the React Select component to match Bootstrap's form control and respect current theme
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? 'var(--dark-mode-bg)' : '#fff',
      borderColor: errors.drink 
        ? '#dc3545' 
        : theme === 'dark' ? 'var(--dark-mode-border)' : '#ced4da',
      boxShadow: errors.drink 
        ? '0 0 0 0.25rem rgba(220, 53, 69, 0.25)' 
        : state.isFocused 
          ? theme === 'dark'
            ? '0 0 0 0.25rem rgba(42, 116, 134, 0.25)'  // Using brand-secondary rgba
            : '0 0 0 0.25rem rgba(42, 116, 134, 0.25)'  // Using brand-secondary rgba
          : provided.boxShadow,
      '&:hover': {
        borderColor: errors.drink 
          ? '#dc3545' 
          : theme === 'dark' ? 'var(--dark-mode-border)' : 'var(--brand-secondary)'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? 'var(--dark-mode-card-bg)' : '#fff',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'var(--brand-secondary)'
        : state.isFocused
          ? theme === 'dark' ? 'var(--dark-mode-container-bg)' : '#f8f9fa'
          : 'transparent',
      color: state.isSelected
        ? '#fff'
        : theme === 'dark' ? 'var(--dark-mode-text)' : '#212529',
      '&:hover': {
        backgroundColor: state.isSelected
          ? 'var(--brand-secondary)'
          : theme === 'dark' ? 'var(--dark-mode-container-bg)' : '#f8f9fa',
      }
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? 'var(--dark-mode-text)' : '#212529',
    }),
    input: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? 'var(--dark-mode-text)' : '#212529',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? 'var(--dark-mode-secondary-text)' : '#6c757d',
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? 'var(--dark-mode-border)' : '#ced4da'
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? 'var(--dark-mode-secondary-text)' : '#6c757d',
      '&:hover': {
        color: theme === 'dark' ? 'var(--dark-mode-text)' : '#212529'
      }
    }),
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formIntakeDrink">
        <Form.Label>Drink</Form.Label>
        <Select
          value={selectedOption}
          onChange={handleDrinkChange}
          options={drinkOptions}
          styles={customStyles}
          placeholder="Search for a drink..."
          isClearable
          isSearchable
          className={errors.drink ? 'is-invalid' : ''}
        />
        {errors.drink && (
          <div className="invalid-feedback d-block">
            {errors.drink}
          </div>
        )}
      </Form.Group>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="formIntakeVolume">
            <Form.Label>Volume</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                step="0.1"
                min="0.1"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                isInvalid={!!errors.volume}
              />
              <Form.Select
                value={volumeUnit}
                onChange={(e) => setVolumeUnit(e.target.value as VolumeUnit)}
              >
                <option value="oz">oz</option>
                <option value="ml">ml</option>
                <option value="cup">cup</option>
                <option value="quart">quart</option>
                <option value="gallon">gallon</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.volume}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="formIntakeDateTime">
        <Form.Label>Date & Time</Form.Label>
        <Form.Control
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          isInvalid={!!errors.dateTime}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateTime}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formIntakeNotes">
        <Form.Label>Notes (optional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this intake"
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="outline-secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};

export default IntakeForm;