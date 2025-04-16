/**
 * DrinkForm - A reusable form component for adding, editing, or cloning drinks
 * Used in modals or slide-out panels for drink management
 */
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { CustomDrink } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../contexts/AppContext';

interface DrinkFormProps {
  drink?: CustomDrink; // For editing or cloning existing drink, undefined for new drink
  onSave: (drink: CustomDrink) => void;
  onCancel: () => void;
  isClone?: boolean; // Default to false if not provided
}

/**
 * Form for adding, editing, or cloning custom drinks
 */
const DrinkForm: React.FC<DrinkFormProps> = ({
  drink,
  onSave,
  onCancel,
  isClone = false
}) => {
  const { theme } = useAppContext(); // Get current theme
  
  // Form state
  const [product, setProduct] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [category, setCategory] = useState<string>('Coffee');
  const [defaultSize, setDefaultSize] = useState<string>('8');
  const [caffeineMgPerOz, setCaffeineMgPerOz] = useState<string>('20');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common drink categories for dropdown
  const categories = [
    'Coffee', 
    'Tea', 
    'Energy Drink', 
    'Soda', 
    'Other'
  ];

  // Initialize form with existing data when editing or cloning
  useEffect(() => {
    if (drink) {
      setProduct(drink.product);
      setBrand(drink.brand || '');
      setCategory(drink.category || 'Other');
      setDefaultSize(drink.default_size_in_oz.toString());
      setCaffeineMgPerOz(drink.caffeine_mg_per_oz.toString());
    }
  }, [drink]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!product.trim()) {
      newErrors.product = 'Product name is required';
    }
    
    if (!defaultSize) {
      newErrors.defaultSize = 'Default size is required';
    } else {
      const size = parseFloat(defaultSize);
      if (isNaN(size) || size <= 0) {
        newErrors.defaultSize = 'Default size must be a positive number';
      }
    }
    
    if (!caffeineMgPerOz) {
      newErrors.caffeineMgPerOz = 'Caffeine content is required';
    } else {
      const caffeine = parseFloat(caffeineMgPerOz);
      if (isNaN(caffeine) || caffeine < 0) {
        newErrors.caffeineMgPerOz = 'Caffeine content must be a non-negative number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const drinkData: CustomDrink = {
      // Always generate a new ID for clones or new drinks; preserve ID only when editing
      id: (isClone || !drink) ? uuidv4() : drink.id,
      product: product.trim(),
      brand: brand.trim() || 'unknown', // Use 'unknown' if brand is empty
      category: category || 'Other',
      default_size_in_oz: parseFloat(defaultSize),
      caffeine_mg_per_oz: parseFloat(caffeineMgPerOz),
      user_entered: true // Mark as user-entered custom drink
    };
    
    onSave(drinkData);
  };

  return (
    <Form onSubmit={handleSubmit} id={isClone || !drink ? "drinkAddForm" : "drinkEditForm"}>
      <Form.Group className="mb-3" controlId="formDrinkProduct">
        <Form.Label>Product Name*</Form.Label>
        <Form.Control
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="e.g. Cold Brew Coffee"
          isInvalid={!!errors.product}
          required
        />
        <Form.Control.Feedback type="invalid">
          {errors.product}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formDrinkBrand">
        <Form.Label>Brand</Form.Label>
        <Form.Control
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. Starbucks (leave empty for unknown)"
        />
        <Form.Text className="text-muted">
          Leave empty if brand is unknown
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formDrinkCategory">
        <Form.Label>Category*</Form.Label>
        <Form.Select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="formDefaultSize">
            <Form.Label>Default Size (oz)*</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              min="0.1"
              value={defaultSize}
              onChange={(e) => setDefaultSize(e.target.value)}
              isInvalid={!!errors.defaultSize}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.defaultSize}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col>
          <Form.Group controlId="formCaffeineContent">
            <Form.Label>Caffeine (mg/oz)*</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              min="0"
              value={caffeineMgPerOz}
              onChange={(e) => setCaffeineMgPerOz(e.target.value)}
              isInvalid={!!errors.caffeineMgPerOz}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.caffeineMgPerOz}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      
      {/* Buttons are now handled by the parent slideout panel's footer */}
    </Form>
  );
};

export default DrinkForm;