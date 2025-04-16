import React, { useState, useEffect } from 'react';
import { 
  Form, 
  InputGroup, 
  Button, 
  Table, 
  Badge, 
  Modal,
  Alert,
  Row,
  Col 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Drink, CustomDrink, DrinkFilter, VolumeUnit } from '../types';
import { formatVolume, convertToOunces, getVolumeUnits } from '../utils/conversions';

interface DrinkLookupProps {
  drinks: Drink[];
  customDrinks: CustomDrink[];
  onAddCustomDrink: (drink: CustomDrink) => void;
  onUpdateCustomDrink: (drink: CustomDrink) => void;
  onDeleteCustomDrink?: (drink: CustomDrink) => void;
}

const DrinkLookup: React.FC<DrinkLookupProps> = ({
  drinks,
  customDrinks,
  onAddCustomDrink,
  onUpdateCustomDrink,
  onDeleteCustomDrink
}) => {
  const [filter, setFilter] = useState<DrinkFilter>({
    searchTerm: '',
    category: null,
    label: null
  });
  
  const [allDrinks, setAllDrinks] = useState<(Drink | CustomDrink)[]>([]);
  const [filteredDrinks, setFilteredDrinks] = useState<(Drink | CustomDrink)[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [showCustomDrinkModal, setShowCustomDrinkModal] = useState(false);
  const [customDrinkFormData, setCustomDrinkFormData] = useState({
    brand: '',
    product: '',
    category: 'Coffee',
    default_size: '8',
    volumeUnit: 'oz' as VolumeUnit,
    caffeine_per_oz: '10',
    isEdit: false
  });
  const [customDrinkError, setCustomDrinkError] = useState<string | null>(null);
  
  // Combine standard and custom drinks
  useEffect(() => {
    const combined = [...drinks, ...customDrinks];
    setAllDrinks(combined);
    
    // Extract unique categories
    const uniqueCategories = Array.from(
      new Set(combined.map(drink => drink.category))
    ).filter(category => category !== 'unknown').sort();
    
    setCategories(uniqueCategories);
  }, [drinks, customDrinks]);
  
  // Apply filters
  useEffect(() => {
    let result = allDrinks;
    
    // Filter by search term
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      result = result.filter(drink => 
        (drink.brand && drink.brand.toLowerCase().includes(searchLower)) ||
        drink.product.toLowerCase().includes(searchLower) ||
        drink.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (filter.category) {
      result = result.filter(drink => drink.category === filter.category);
    }
    
    setFilteredDrinks(result);
  }, [allDrinks, filter]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({
      ...filter,
      searchTerm: e.target.value
    });
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({
      ...filter,
      category: e.target.value || null
    });
  };
  
  const handleResetFilters = () => {
    setFilter({
      searchTerm: '',
      category: null,
      label: null
    });
  };
  
  const openAddCustomDrinkModal = () => {
    setCustomDrinkFormData({
      brand: '',
      product: '',
      category: 'Coffee',
      default_size: '8',
      volumeUnit: 'oz',
      caffeine_per_oz: '10',
      isEdit: false
    });
    setCustomDrinkError(null);
    setShowCustomDrinkModal(true);
  };
  
  const openEditCustomDrinkModal = (drink: CustomDrink) => {
    setCustomDrinkFormData({
      brand: drink.brand,
      product: drink.product,
      category: drink.category,
      default_size: drink.default_size_in_oz.toString(),
      volumeUnit: 'oz',
      caffeine_per_oz: drink.caffeine_mg_per_oz.toString(),
      isEdit: true
    });
    setCustomDrinkError(null);
    setShowCustomDrinkModal(true);
  };
  
  const handleCustomDrinkFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomDrinkFormData({
      ...customDrinkFormData,
      [name]: value
    });
  };
  
  const handleCustomDrinkSubmit = () => {
    // Basic validation
    if (!customDrinkFormData.product.trim()) {
      setCustomDrinkError('Product name is required.');
      return;
    }
    
    const defaultSize = parseFloat(customDrinkFormData.default_size);
    if (isNaN(defaultSize) || defaultSize <= 0) {
      setCustomDrinkError('Default size must be a positive number.');
      return;
    }
    
    const caffeinePerOz = parseFloat(customDrinkFormData.caffeine_per_oz);
    if (isNaN(caffeinePerOz) || caffeinePerOz < 0) {
      setCustomDrinkError('Caffeine per oz must be a non-negative number.');
      return;
    }
    
    // Convert size to ounces if needed
    const defaultSizeInOz = convertToOunces(defaultSize, customDrinkFormData.volumeUnit);
    
    // Create custom drink object
    const customDrink: CustomDrink = {
      brand: customDrinkFormData.brand.trim() || 'unknown',
      product: customDrinkFormData.product.trim(),
      category: customDrinkFormData.category,
      default_size_in_oz: defaultSizeInOz,
      caffeine_mg_per_oz: caffeinePerOz,
      isCustom: true
    };
    
    if (customDrinkFormData.isEdit) {
      onUpdateCustomDrink(customDrink);
    } else {
      onAddCustomDrink(customDrink);
    }
    
    setShowCustomDrinkModal(false);
  };
  
  const handleDeleteCustomDrink = (drink: CustomDrink) => {
    if (onDeleteCustomDrink && window.confirm(`Are you sure you want to delete ${drink.product}?`)) {
      onDeleteCustomDrink(drink);
    }
  };
  
  const isCustomDrink = (drink: Drink | CustomDrink): drink is CustomDrink => {
    return 'isCustom' in drink && drink.isCustom;
  };

  // Calculate total caffeine based on default size and caffeine per oz
  const calculateTotalCaffeine = (drink: Drink | CustomDrink): number => {
    return Math.round(drink.caffeine_mg_per_oz * drink.default_size_in_oz);
  };

  return (
    <div className="drink-lookup">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Caffeine Drink Lookup</h3>
        <Button variant="success" onClick={openAddCustomDrinkModal}>
          <FontAwesomeIcon icon={faPlus} /> Add Custom Drink
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="filters mb-4">
        <Row>
          <Col md={8}>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search drinks..."
                value={filter.searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select 
              className="mb-3"
              value={filter.category || ''}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        
        <div className="d-flex justify-content-end mb-3">
          <Button variant="outline-secondary" size="sm" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>
      
      {/* Results table */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Product</th>
              <th>Category</th>
              <th>Default Size</th>
              <th>Caffeine per oz</th>
              <th>Total Caffeine</th>
              {(onDeleteCustomDrink && customDrinks.length > 0) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredDrinks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-3">
                  No drinks found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredDrinks.map((drink, index) => (
                <tr key={index}>
                  <td>{drink.brand !== 'unknown' ? drink.brand : '-'}</td>
                  <td>{drink.product}</td>
                  <td>{drink.category !== 'unknown' ? drink.category : '-'}</td>
                  <td>{formatVolume(drink.default_size_in_oz, 'oz')}</td>
                  <td>{drink.caffeine_mg_per_oz.toFixed(1)} mg/oz</td>
                  <td>{calculateTotalCaffeine(drink)} mg</td>
                  {(onDeleteCustomDrink && customDrinks.length > 0) && (
                    <td>
                      {isCustomDrink(drink) && (
                        <>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => openEditCustomDrinkModal(drink)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteCustomDrink(drink)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      
      {/* Custom Drink Modal */}
      <Modal show={showCustomDrinkModal} onHide={() => setShowCustomDrinkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {customDrinkFormData.isEdit ? 'Edit Custom Drink' : 'Add Custom Drink'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {customDrinkError && (
            <Alert variant="danger" onClose={() => setCustomDrinkError(null)} dismissible>
              {customDrinkError}
            </Alert>
          )}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Brand (optional)</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={customDrinkFormData.brand}
                onChange={handleCustomDrinkFormChange}
                placeholder="e.g., Starbucks, Monster, etc."
              />
              <Form.Text className="text-muted">
                Leave empty if unknown or generic
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="product"
                value={customDrinkFormData.product}
                onChange={handleCustomDrinkFormChange}
                placeholder="e.g., Cold Brew, Energy Drink, etc."
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={customDrinkFormData.category}
                onChange={handleCustomDrinkFormChange}
              >
                <option value="Coffee">Coffee</option>
                <option value="Tea">Tea</option>
                <option value="Energy Drink">Energy Drink</option>
                <option value="Soda">Soda</option>
                <option value="unknown">Unknown/Other</option>
              </Form.Select>
            </Form.Group>
            
            <Row>
              <Col xs={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Default Serving Size</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="0.1"
                    name="default_size"
                    value={customDrinkFormData.default_size}
                    onChange={handleCustomDrinkFormChange}
                  />
                </Form.Group>
              </Col>
              <Col xs={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Select
                    name="volumeUnit"
                    value={customDrinkFormData.volumeUnit}
                    onChange={handleCustomDrinkFormChange}
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
            
            <Form.Group className="mb-3">
              <Form.Label>Caffeine per oz (mg)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.1"
                name="caffeine_per_oz"
                value={customDrinkFormData.caffeine_per_oz}
                onChange={handleCustomDrinkFormChange}
              />
              <Form.Text className="text-muted">
                Amount of caffeine per fluid ounce
              </Form.Text>
            </Form.Group>
            
            <Alert variant="info">
              Total caffeine: {parseFloat(customDrinkFormData.caffeine_per_oz || '0') * 
                convertToOunces(parseFloat(customDrinkFormData.default_size || '0'), 
                customDrinkFormData.volumeUnit)} mg
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomDrinkModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCustomDrinkSubmit}>
            {customDrinkFormData.isEdit ? 'Update Drink' : 'Add Drink'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      <div className="mt-4 p-3 border rounded">
        <h5>About Drink Caffeine Content</h5>
        <p>
          The information in this database is sourced from manufacturer reports and 
          published scientific studies. Actual caffeine content may vary by batch, 
          brewing method, and other factors. Values shown are approximate.
        </p>
        <p className="mb-0">
          You can add your own custom drinks to track caffeine from sources not listed here.
        </p>
      </div>
    </div>
  );
};

export default DrinkLookup;