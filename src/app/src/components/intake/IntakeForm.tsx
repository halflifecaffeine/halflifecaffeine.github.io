import React, { useState, useEffect, useMemo } from 'react';
import { Form, InputGroup, Row, Col } from "react-bootstrap";
import Select, { components, OptionProps, SingleValueProps, SingleValue } from "react-select";
import { validateVolumeInput } from "../../utils/validators";
import { formatDateTimeForInput, getCurrentDateTimeForInput, parseInputToISOString } from "../../utils/dateUtils";
import { v4 as uuidv4 } from "uuid";
import { CaffeineIntake, Drink, VolumeUnit } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

interface IntakeFormProps {
  intake?: CaffeineIntake; // For editing existing intake, undefined for new intake
  drinks: Drink[];
  onSave: (intake: CaffeineIntake) => void;
  onCancel: () => void;
  isClone?: boolean; // Default to false if not provided
  id?: string; // Optional form ID for accessibility and form submission targeting
}

// Option type for the React Select component
interface DrinkOption {
  value: string;
  label: string;
  drink: Drink;
}

/**
 * Custom option component for React Select to display drink options with
 * product name, caffeine content, and brand name in a styled format.
 */
const CustomOption = (props: OptionProps<DrinkOption>) => {
  const { data } = props; // Removed unused innerProps
  const drink = data.drink;
  
  // Calculate total caffeine in the default serving
  const totalCaffeine = (drink.caffeine_mg_per_oz * drink.default_size_in_oz).toFixed(1);
  
  // Check if it's a custom drink with proper type guard
  const isCustom = 'user_entered' in drink && drink.user_entered === true;
  
  return (
    <components.Option {...props}>
      <div className="d-flex justify-content-between align-items-center">
        <div className="drink-name fw-medium">
          {drink.product}
          {isCustom && <span className="badge bg-primary ms-1" style={{ fontSize: '10px' }}>Custom</span>}
        </div>
        <div className="caffeine-content text-muted" style={{ fontSize: '0.85em' }}>
          {totalCaffeine}mg
        </div>
      </div>
      {drink.brand && drink.brand !== 'unknown' && (
        <div className="brand-name text-muted mt-1" style={{ fontSize: '0.85em' }}>
          {drink.brand}
        </div>
      )}
    </components.Option>
  );
};

/**
 * Custom single value component for React Select to display the selected drink
 * in the same format as the options.
 */
const CustomSingleValue = (props: SingleValueProps<DrinkOption>) => {
  const { data } = props;
  const drink = data.drink;
  
  // Calculate total caffeine in the default serving
  const totalCaffeine = (drink.caffeine_mg_per_oz * drink.default_size_in_oz).toFixed(1);
  
  // Check if it's a custom drink with proper type guard
  const isCustom = 'user_entered' in drink && drink.user_entered === true;
  
  return (
    <components.SingleValue {...props}>
      <div className="d-flex justify-content-between align-items-center">
        <div className="drink-name">
          {drink.product}
          {isCustom && <span className="badge bg-primary ms-1" style={{ fontSize: '10px' }}>Custom</span>}
        </div>
        <div className="caffeine-content text-muted" style={{ fontSize: '0.85em' }}>
          {totalCaffeine}mg
        </div>
      </div>
      {drink.brand && drink.brand !== 'unknown' && (
        <div className="brand-name text-muted" style={{ fontSize: '0.85em' }}>
          {drink.brand}
        </div>
      )}
    </components.SingleValue>
  );
};

/**
 * Reusable form component for adding or editing caffeine intake records.
 * Uses local time consistently for better user experience.
 */
const IntakeForm: React.FC<IntakeFormProps> = ({ 
  intake, 
  drinks, 
  onSave, 
  onCancel: _, // Renamed to underscore to indicate it's intentionally unused
  isClone = false, // Default to false if not provided
  id // Optional form ID for accessibility and form submission targeting
}) => {
  // Move useAppContext to the top level to follow React Hooks rules
  const { theme, state } = useAppContext(); // Get current theme and state
  
  const [selectedDrink, setSelectedDrink] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<DrinkOption | null>(null);
  const [volume, setVolume] = useState<string>('1');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('oz');
  const [dateTime, setDateTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Format drinks for React Select - combine standard drinks with custom drinks
  const drinkOptions: DrinkOption[] = useMemo(() => {
    const allOptions: DrinkOption[] = [];
    
    // Track products we've added to avoid duplicates
    const addedProductKeys = new Set<string>();
    
    // Add custom drinks first (they take priority)
    state.customDrinks.forEach(drink => {
      // Create a unique key for this drink
      const productKey = `${drink.brand.toLowerCase()}|${drink.product.toLowerCase()}`;
      
      // Add to our options and track that we've added it
      allOptions.push({
        value: `custom|${drink.id}`,
        label: `${drink.brand !== 'unknown' ? drink.brand : ''} ${drink.product} (${(drink.caffeine_mg_per_oz * drink.default_size_in_oz).toFixed(1)}mg) [Custom]`,
        drink: drink
      });
      
      addedProductKeys.add(productKey);
    });
    
    // Add standard drinks, but skip any that would be duplicates of custom drinks
    drinks.forEach(drink => {
      // Create same key format to check for duplicates
      const productKey = `${drink.brand.toLowerCase()}|${drink.product.toLowerCase()}`;
      
      // Only add if we haven't already added this drink
      if (!addedProductKeys.has(productKey)) {
        allOptions.push({
          value: `standard|${drink.brand}|${drink.product}`,
          label: `${drink.brand !== 'unknown' ? drink.brand : ''} ${drink.product} (${(drink.caffeine_mg_per_oz * drink.default_size_in_oz).toFixed(1)}mg)`,
          drink: drink
        });
        
        // Track that we've added this drink
        addedProductKeys.add(productKey);
      }
    });
    
    return allOptions;
  }, [drinks, state.customDrinks]); // Fixed dependency array to use state.customDrinks directly
  
  // Track if we're in edit mode to prevent overriding user values
  // Treat clones as add mode, not edit mode (to ensure drink selection works properly)
  const isEditMode = !!intake && !isClone;
  
  // Initialize form with existing data when editing or cloning
  useEffect(() => {
    if (intake) {
      let drinkValue = '';
      
      // Determine the correct value format based on the drink type
      if ('id' in intake.drink && intake.drink.user_entered) {
        // It's a custom drink
        drinkValue = `custom|${intake.drink.id}`;
      } else {
        // It's a standard drink
        drinkValue = `standard|${intake.drink.brand}|${intake.drink.product}`;
      }
      
      // Set the selected drink value
      setSelectedDrink(drinkValue);
      
      // Find the corresponding React Select option
      const option = drinkOptions.find(opt => {
        // For custom drinks, match by ID
        if (opt.value.startsWith('custom|') && 'id' in intake.drink) {
          const customId = opt.value.split('|')[1];
          return customId === intake.drink.id;
        }
        // For standard drinks, match by brand and product
        else {
          return opt.drink.brand === intake.drink.brand && 
                 opt.drink.product === intake.drink.product;
        }
      }) || null;
      
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
  }, [intake, drinkOptions]);

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
    
    // Use the drink directly from the selected option instead of trying to find it
    if (!selectedOption || !selectedOption.drink) {
      setErrors({ ...errors, drink: 'Selected drink not found' });
      return;
    }
    
    const drink = selectedOption.drink;
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

  const handleDrinkChange = (
    newValue: SingleValue<DrinkOption>,
    // Removed unused actionMeta parameter
  ) => {
    if (newValue) {
      setSelectedOption(newValue);
      setSelectedDrink(newValue.value);
      
      // Store the selected drink directly, rather than looking it up again later
      const selectedDrink = newValue.drink;
      
      // Update volume based on selected drink's default size (for new or cloned intakes)
      if (!isEditMode) {
        setVolume(selectedDrink.default_size_in_oz.toString());
        setVolumeUnit('oz');
      }
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
    <Form onSubmit={handleSubmit} id={id || (intake && !isClone ? "intakeEditForm" : "intakeAddForm")}>
      <Form.Group className="mb-3" controlId="formIntakeDrink">
        <Form.Label>Drink</Form.Label>
        <Select<DrinkOption, false> // Added explicit type parameters to Select component
          value={selectedOption}
          onChange={handleDrinkChange}
          options={drinkOptions}
          styles={customStyles}
          placeholder="Search for a drink..."
          isClearable
          isSearchable
          className={errors.drink ? 'is-invalid' : ''}
          components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
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
      
      {/* Buttons are now handled by the parent slideout panel's footer */}
    </Form>
  );
};

export default IntakeForm;