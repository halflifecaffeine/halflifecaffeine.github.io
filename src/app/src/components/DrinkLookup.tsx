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
  onDeleteCustomDrink: (drink: CustomDrink) => void;
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
  const [labels, setLabels] = useState<string[]>([]);
  
  const [showCustomDrinkModal, setShowCustomDrinkModal] = useState(false);
  const [customDrinkFormData, setCustomDrinkFormData] = useState({
    manufacturer: '',
    product: '',
    category: 'coffee',
    volume: '8',
    volumeUnit: 'oz' as VolumeUnit,
    caffeine: '100',
    labels: '',
    isEdit: false
  });
  const [customDrinkError, setCustomDrinkError] = useState<string | null>(null);
  
  // Combine standard and custom drinks
  useEffect(() => {
    const combined = [...drinks, ...customDrinks];
    setAllDrinks(combined);
    
    // Extract unique categories and labels
    const uniqueCategories = Array.from(
      new Set(combined.map(drink => drink.category))
    ).sort();
    
    const uniqueLabels = Array.from(
      new Set(combined.flatMap(drink => drink.labels).map(label => label.replace('#', '')))
    ).sort();
    
    setCategories(uniqueCategories);
    setLabels(uniqueLabels);
  }, [drinks, customDrinks]);
  
  // Apply filters
  useEffect(() => {
    let result = allDrinks;
    
    // Filter by search term
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      result = result.filter(drink => 
        drink.manufacturer.toLowerCase().includes(searchLower) ||
        drink.product.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (filter.category) {
      result = result.filter(drink => drink.category === filter.category);
    }
    
    // Filter by label
    if (filter.label) {
      const labelToFind = `#${filter.label}`;
      result = result.filter(drink => 
        drink.labels.some(label => label.toLowerCase() === labelToFind.toLowerCase())
      );
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
  
  const handleLabelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({
      ...filter,
      label: e.target.value || null
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
      manufacturer: '',
      product: '',
      category: 'coffee',
      volume: '8',
      volumeUnit: 'oz',
      caffeine: '100',
      labels: '',
      isEdit: false
    });
    setCustomDrinkError(null);
    setShowCustomDrinkModal(true);
  };
  
  const openEditCustomDrinkModal = (drink: CustomDrink) => {
    setCustomDrinkFormData({
      manufacturer: drink.manufacturer,
      product: drink.product,
      category: drink.category,
      volume: drink.volume_oz.toString(),
      volumeUnit: 'oz',
      caffeine: drink.caffeine_mg.toString(),
      labels: drink.labels.map(label => label.replace('#', '')).join(', '),
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
    if (!customDrinkFormData.manufacturer.trim()) {
      setCustomDrinkError('Manufacturer is required.');
      return;
    }
    
    if (!customDrinkFormData.product.trim()) {
      setCustomDrinkError('Product name is required.');
      return;
    }
    
    const volume = parseFloat(customDrinkFormData.volume);
    if (isNaN(volume) || volume <= 0) {
      setCustomDrinkError('Volume must be a positive number.');
      return;
    }
    
    const caffeine = parseFloat(customDrinkFormData.caffeine);
    if (isNaN(caffeine) || caffeine < 0) {
      setCustomDrinkError('Caffeine amount must be a non-negative number.');
      return;
    }
    
    // Convert volume to ounces if needed
    const volumeOz = convertToOunces(volume, customDrinkFormData.volumeUnit);
    
    // Process labels
    const labelText = customDrinkFormData.labels.trim();
    const labels = labelText
      ? labelText.split(',').map(label => 
          `#${label.trim().toLowerCase().replace(/\s+/g, '-')}`)
      : ['#custom'];
    
    // Create custom drink object
    const customDrink: CustomDrink = {
      manufacturer: customDrinkFormData.manufacturer.trim(),
      product: customDrinkFormData.product.trim(),
      category: customDrinkFormData.category,
      volume_oz: volumeOz,
      caffeine_mg: caffeine,
      labels,
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
    if (window.confirm(`Are you sure you want to delete ${drink.manufacturer} ${drink.product}?`)) {
      onDeleteCustomDrink(drink);
    }
  };
  
  const isCustomDrink = (drink: Drink | CustomDrink): drink is CustomDrink => {
    return 'isCustom' in drink && drink.isCustom;
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
          <Col md={6}>
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
          <Col md={3}>
            <Form.Select 
              className="mb-3"
              value={filter.category || ''}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ')}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              className="mb-3"
              value={filter.label || ''}
              onChange={handleLabelChange}
            >
              <option value="">All Labels</option>
              {labels.map(label => (
                <option key={label} value={label}>
                  {label}
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
              <th>Manufacturer</th>
              <th>Product</th>
              <th>Category</th>
              <th>Serving Size</th>
              <th>Caffeine</th>
              <th>Labels</th>
              {(customDrinks.length > 0) && <th>Actions</th>}
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
                  <td>{drink.manufacturer}</td>
                  <td>{drink.product}</td>
                  <td>{drink.category.replace('_', ' ')}</td>
                  <td>{formatVolume(drink.volume_oz, 'oz')}</td>
                  <td>{drink.caffeine_mg} mg</td>
                  <td>
                    {drink.labels.map(label => (
                      <Badge 
                        key={label} 
                        bg="info" 
                        className="me-1"
                      >
                        {label}
                      </Badge>
                    ))}
                  </td>
                  {(customDrinks.length > 0) && (
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
              <Form.Label>Manufacturer/Brand</Form.Label>
              <Form.Control
                type="text"
                name="manufacturer"
                value={customDrinkFormData.manufacturer}
                onChange={handleCustomDrinkFormChange}
                placeholder="e.g., Starbucks, Monster, etc."
              />
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
                <option value="coffee">Coffee</option>
                <option value="tea">Tea</option>
                <option value="energy_drink">Energy Drink</option>
                <option value="soft_drink">Soft Drink</option>
                <option value="chocolate">Chocolate</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
            
            <Row>
              <Col xs={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Serving Size</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="0.1"
                    name="volume"
                    value={customDrinkFormData.volume}
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
              <Form.Label>Caffeine Amount (mg)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                name="caffeine"
                value={customDrinkFormData.caffeine}
                onChange={handleCustomDrinkFormChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Labels (comma-separated)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="labels"
                value={customDrinkFormData.labels}
                onChange={handleCustomDrinkFormChange}
                placeholder="e.g., coffee, espresso, strong"
              />
              <Form.Text className="text-muted">
                Optional: Add labels to help categorize and search for this drink
              </Form.Text>
            </Form.Group>
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