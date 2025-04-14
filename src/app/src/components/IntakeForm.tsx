import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Row, Col } from 'react-bootstrap';
import { CaffeineIntake, Drink, VolumeUnit } from '../types';
import { validateVolumeInput } from '../utils/validators';
import { v4 as uuidv4 } from 'uuid';

interface IntakeFormProps {
  intake?: CaffeineIntake; // For editing existing intake, undefined for new intake
  drinks: Drink[];
  onSave: (intake: CaffeineIntake) => void;
  onCancel: () => void;
}

/**
 * Reusable form component for adding or editing caffeine intake records.
 * Used in both the Add Intake and Edit Intake slideouts.
 */
const IntakeForm: React.FC<IntakeFormProps> = ({ intake, drinks, onSave, onCancel }) => {
  const [selectedDrink, setSelectedDrink] = useState<string>('');
  const [volume, setVolume] = useState<string>('1');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('oz');
  const [dateTime, setDateTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize form with existing data when editing
  useEffect(() => {
    if (intake) {
      // Select the drink by combining manufacturer and product as a unique ID
      setSelectedDrink(`${intake.drink.manufacturer}|${intake.drink.product}`);
      setVolume(intake.volume.toString());
      setVolumeUnit(intake.unit);
      
      // Format the datetime for the input
      const date = new Date(intake.datetime);
      const formattedDate = date.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
      setDateTime(formattedDate);
      
      setNotes(intake.notes || '');
    } else {
      // Set default values for new intake
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 16);
      setDateTime(formattedDate);
    }
  }, [intake]);

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
    
    const [manufacturer, product] = selectedDrink.split('|');
    const drink = drinks.find(d => d.manufacturer === manufacturer && d.product === product);
    
    if (!drink) {
      setErrors({ ...errors, drink: 'Selected drink not found' });
      return;
    }
    
    const volumeNum = parseFloat(volume);
    const caffeineAmount = (drink.caffeine_mg / drink.volume_oz) * volumeNum;
    
    const intakeData: CaffeineIntake = {
      id: intake?.id || uuidv4(),
      datetime: new Date(dateTime).toISOString(),
      drink,
      volume: volumeNum,
      unit: volumeUnit,
      mg: Math.round(caffeineAmount * 10) / 10, // Round to 1 decimal
      notes
    };
    
    onSave(intakeData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formIntakeDrink">
        <Form.Label>Drink</Form.Label>
        <Form.Select
          value={selectedDrink}
          onChange={(e) => setSelectedDrink(e.target.value)}
          isInvalid={!!errors.drink}
        >
          <option value="">Select a drink...</option>
          {drinks.map((drink) => (
            <option 
              key={`${drink.manufacturer}|${drink.product}`} 
              value={`${drink.manufacturer}|${drink.product}`}
            >
              {`${drink.manufacturer} ${drink.product} (${drink.caffeine_mg}mg)`}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.drink}
        </Form.Control.Feedback>
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