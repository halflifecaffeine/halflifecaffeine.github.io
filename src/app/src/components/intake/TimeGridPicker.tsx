import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { CaffeineIntake, Drink, CustomDrink, VolumeUnit } from '../../types';
import { calculateCaffeineAmount, formatVolume, getVolumeUnits } from '../../utils/conversions';
import { validateVolumeInput } from '../../utils/validators';

interface TimeGridEntry {
  hour: number;
  minute: number;
  hasEntries: boolean;
  entries: CaffeineIntake[];
}

interface TimeGridPickerProps {
  drinks: (Drink | CustomDrink)[];
  onAddIntake: (intake: CaffeineIntake) => void;
  existingIntakes: CaffeineIntake[];
}

const TimeGridPicker: React.FC<TimeGridPickerProps> = ({ 
  drinks,
  onAddIntake,
  existingIntakes
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number } | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<string>('');
  const [volume, setVolume] = useState<string>('1');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('oz');
  const [error, setError] = useState<string | null>(null);
  const [timeGrid, setTimeGrid] = useState<TimeGridEntry[]>([]);
  
  // Initialize time grid
  useEffect(() => {
    const grid: TimeGridEntry[] = [];
    
    // Create a grid entry for each hour
    for (let hour = 0; hour < 24; hour++) {
      grid.push({
        hour,
        minute: 0,
        hasEntries: false,
        entries: []
      });
    }
    
    // Populate with existing intakes
    existingIntakes.forEach(intake => {
      const intakeDate = new Date(intake.datetime);
      const today = new Date();
      
      // Only consider intakes from today
      if (
        intakeDate.getDate() === today.getDate() &&
        intakeDate.getMonth() === today.getMonth() &&
        intakeDate.getFullYear() === today.getFullYear()
      ) {
        const hour = intakeDate.getHours();
        const hourEntry = grid.find(entry => entry.hour === hour);
        
        if (hourEntry) {
          hourEntry.hasEntries = true;
          hourEntry.entries.push(intake);
        }
      }
    });
    
    setTimeGrid(grid);
  }, [existingIntakes]);

  const handleTimeClick = (hour: number) => {
    setSelectedTime({ hour, minute: 0 });
    setShowModal(true);
    setError(null);
    setSelectedDrink(''); // Reset selection
    setVolume('1'); // Reset volume
    setVolumeUnit('oz'); // Reset unit
  };
  
  const handleAddIntake = () => {
    if (!selectedTime || !selectedDrink || !volume) {
      setError('Please select a drink and specify the volume.');
      return;
    }
    
    // Validate volume input
    const validation = validateVolumeInput(volume, volumeUnit);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid volume.');
      return;
    }
    
    // Find the selected drink
    const drink = drinks.find(d => `${d.manufacturer}-${d.product}` === selectedDrink);
    if (!drink) {
      setError('Selected drink not found.');
      return;
    }
    
    // Create a date for the selected time
    const intakeDate = new Date();
    intakeDate.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
    
    // Calculate caffeine amount based on drink and volume
    const caffeinePerOz = drink.caffeine_mg / drink.volume_oz;
    const volumeValue = parseFloat(volume);
    const caffeineAmount = calculateCaffeineAmount(
      caffeinePerOz, 
      volumeValue, 
      volumeUnit
    );
    
    // Create intake record
    const intake: CaffeineIntake = {
      id: uuidv4(),
      datetime: intakeDate.toISOString(),
      drink,
      volume: volumeValue,
      unit: volumeUnit,
      mg: caffeineAmount,
      notes: `${drink.manufacturer} ${drink.product}: ${formatVolume(volumeValue, volumeUnit)}`
    };
    
    // Add the intake
    onAddIntake(intake);
    
    // Close modal
    setShowModal(false);
  };
  
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };
  
  const getTimeButtonVariant = (entry: TimeGridEntry): string => {
    if (entry.hasEntries) {
      return 'primary';
    }
    return 'outline-secondary';
  };
  
  const renderTimeButtons = () => {
    return timeGrid.map(entry => (
      <Col key={entry.hour} xs={6} sm={4} md={2} lg={1} className="mb-2">
        <Button 
          variant={getTimeButtonVariant(entry)}
          className="w-100" 
          onClick={() => handleTimeClick(entry.hour)}
        >
          {formatHour(entry.hour)}
          {entry.hasEntries && (
            <span className="badge bg-light text-dark ms-1">
              {entry.entries.length}
            </span>
          )}
        </Button>
      </Col>
    ));
  };
  
  const renderExistingIntakes = () => {
    if (!selectedTime) return null;
    
    const hourEntries = timeGrid.find(entry => entry.hour === selectedTime.hour);
    if (!hourEntries || hourEntries.entries.length === 0) return null;
    
    return (
      <div className="existing-intakes mt-3">
        <h6>Existing intakes for {formatHour(selectedTime.hour)}:</h6>
        <ul className="list-group">
          {hourEntries.entries.map(entry => (
            <li key={entry.id} className="list-group-item">
              {entry.drink.manufacturer} {entry.drink.product}: {formatVolume(entry.volume, entry.unit)}
              <span className="badge bg-info ms-2">{entry.mg} mg</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="time-grid-picker">
      <h3 className="mb-3">24-Hour Grid Picker</h3>
      <p className="mb-3">Click on an hour to add a caffeine intake for that time:</p>
      
      <Row className="time-grid">
        {renderTimeButtons()}
      </Row>
      
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Add Caffeine Intake at {selectedTime && formatHour(selectedTime.hour)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Drink</Form.Label>
              <Form.Select
                value={selectedDrink}
                onChange={(e) => setSelectedDrink(e.target.value)}
              >
                <option value="">-- Select a drink --</option>
                {drinks.map(drink => (
                  <option 
                    key={`${drink.manufacturer}-${drink.product}`} 
                    value={`${drink.manufacturer}-${drink.product}`}
                  >
                    {drink.manufacturer} - {drink.product} ({drink.caffeine_mg}mg per {drink.volume_oz}oz)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Row>
              <Col xs={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Volume</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Select
                    value={volumeUnit}
                    onChange={(e) => setVolumeUnit(e.target.value as VolumeUnit)}
                  >
                    {getVolumeUnits().map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            {selectedDrink && volume && (
              <div className="caffeine-calculation p-2 bg-light rounded">
                <p className="mb-0">
                  <strong>Estimated caffeine:</strong>
                  {' '}
                  {(() => {
                    const drink = drinks.find(d => `${d.manufacturer}-${d.product}` === selectedDrink);
                    if (!drink) return '--';
                    
                    const caffeinePerOz = drink.caffeine_mg / drink.volume_oz;
                    const volumeValue = parseFloat(volume || '0');
                    if (isNaN(volumeValue)) return '--';
                    
                    const caffeineAmount = calculateCaffeineAmount(
                      caffeinePerOz, 
                      volumeValue, 
                      volumeUnit
                    );
                    
                    return `${Math.round(caffeineAmount)} mg`;
                  })()}
                </p>
              </div>
            )}
            
            {renderExistingIntakes()}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddIntake}>
            Add Intake
          </Button>
        </Modal.Footer>
      </Modal>
      
      <div className="mt-4 p-3 bg-light rounded">
        <h5>Usage Instructions</h5>
        <ul>
          <li>Click on any hour button to add a caffeine intake for that time</li>
          <li>Blue buttons indicate hours that already have caffeine intake records</li>
          <li>Use the form to select a drink, specify the volume, and add the intake</li>
          <li>You can add multiple intakes for the same hour</li>
        </ul>
      </div>
    </div>
  );
};

export default TimeGridPicker;