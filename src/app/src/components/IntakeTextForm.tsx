import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { CaffeineIntake } from '../types';
import { validateIntakeTextLine } from '../utils/validators';

interface IntakeTextFormProps {
  onAddIntakes: (intakes: CaffeineIntake[]) => void;
}

const IntakeTextForm: React.FC<IntakeTextFormProps> = ({ onAddIntakes }) => {
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate and parse each line
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      setError('Please enter at least one caffeine intake record.');
      return;
    }

    const intakes: CaffeineIntake[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const validation = validateIntakeTextLine(line);
      
      if (!validation.isValid) {
        errors.push(`Line ${index + 1}: ${validation.error}`);
        return;
      }

      const parts = line.trim().split(/\s+/);
      if (parts.length === 2) {
        const [time, amountStr] = parts;
        const amount = parseFloat(amountStr);
        
        // Create today's date with the specified time
        const today = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        
        // Create a fresh date object to avoid issues with timestamp handling
        const intakeDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          hours,
          minutes,
          0,
          0
        );
        
        // Create intake record with precise time and exact amount
        intakes.push({
          id: uuidv4(),
          datetime: intakeDate.toISOString(),
          drink: {
            manufacturer: 'Manual Entry',
            product: `${amount}mg at ${time}`,
            category: 'manual_entry',
            volume_oz: 1,
            caffeine_mg: amount,
            labels: ['#manual']
          },
          volume: 1,
          unit: 'oz',
          mg: amount, // Use exactly the amount specified
          notes: `Manually entered: ${amount}mg at ${time}`
        });
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    // Add intakes if validation passed
    if (intakes.length > 0) {
      onAddIntakes(intakes);
      setText(''); // Clear form
      setSuccess(true);
    }
  };

  return (
    <div className="intake-text-form">
      <h3 className="mb-3">Enter Caffeine Intake</h3>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Error</Alert.Heading>
          <pre>{error}</pre>
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
          Caffeine intake added successfully!
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Enter each caffeine intake on a separate line:</Form.Label>
          <Form.Text className="text-muted d-block mb-2">
            Format: <code>HH:MM amount_in_mg</code> (e.g., <code>08:30 150</code> for 150mg at 8:30 AM)
          </Form.Text>
          <Form.Control
            as="textarea"
            rows={5}
            placeholder="14:00 75
16:30 150
19:45 35"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Form.Group>
        
        <Button variant="primary" type="submit">
          Add Caffeine Intake
        </Button>
      </Form>
      
      <div className="mt-4 p-3 bg-light rounded">
        <h5>Tips</h5>
        <ul>
          <li>Use 24-hour time format (e.g., 14:30 for 2:30 PM)</li>
          <li>Enter the caffeine amount in milligrams (mg)</li>
          <li>For common drinks, use the Drink Lookup tab to find caffeine content</li>
        </ul>
      </div>
    </div>
  );
};

export default IntakeTextForm;