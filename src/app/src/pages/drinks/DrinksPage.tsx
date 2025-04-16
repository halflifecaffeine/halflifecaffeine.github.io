/**
 * DrinksPage - Shows a searchable, filterable list of drinks with caffeine content
 */
import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Form, InputGroup, Table, Card, Button, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faMugHot, faCoffee, faBolt, 
  faPlus, faEdit, faTrash, faCopy, 
  faWhiskeyGlass, faChevronLeft,
  faSort, faSortUp, faSortDown
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { useAppContext } from '../../contexts/AppContext';
import { Drink, CustomDrink } from '../../types';
import DrinkPanel from '../../components/drinks/DrinkPanel';
import DeleteConfirmation from '../../components/common/modals/DeleteConfirmation';
import SlideoutPanel from '../../components/common/layout/SlideoutPanel';
import { ThemeAwarePagination } from '../../components/common/displays/ThemeAwarePagination';

// Import drinks data
import drinksData from '../../data/drinks.json';

/**
 * Number of drinks to display per page
 */
const DRINKS_PER_PAGE = 15;

/**
 * Sortable fields for the drinks table
 */
type SortField = 'product' | 'brand' | 'category' | 'default_size_in_oz' | 'caffeine_mg_per_oz' | 'total_caffeine';
type SortDirection = 'asc' | 'desc';

/**
 * DrinksPage component
 */
export const DrinksPage: React.FC = () => {
  const { state, removeCustomDrink } = useAppContext();
  const { theme } = useAppContext();

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showUserDrinksOnly, setShowUserDrinksOnly] = useState(false);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('product');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Custom drink management state
  const [showDrinkPanel, setShowDrinkPanel] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | CustomDrink | null>(null);
  const [panelMode, setPanelMode] = useState<'add' | 'edit' | 'clone'>('add');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [drinkToDelete, setDrinkToDelete] = useState<CustomDrink | null>(null);
  
  // Handle sort column click
  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get sort icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FontAwesomeIcon icon={faSort} className="ms-1 text-muted" />;
    }
    return sortDirection === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} className="ms-1" /> 
      : <FontAwesomeIcon icon={faSortDown} className="ms-1" />;
  };

  // Combine built-in drinks and custom drinks for display
  const allDrinks = useMemo(() => {
    // Combine standard drinks with user's custom drinks
    const standardDrinks = drinksData as Drink[];
    return showUserDrinksOnly 
      ? state.customDrinks
      : [...standardDrinks, ...state.customDrinks];
  }, [state.customDrinks, showUserDrinksOnly]);

  // Get unique categories for the filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    
    allDrinks.forEach((drink) => {
      if (drink.category && drink.category !== 'unknown') {
        uniqueCategories.add(drink.category);
      }
    });
    
    return Array.from(uniqueCategories).sort();
  }, [allDrinks]);
  
  // Create options for react-select
  const categoryOptions = useMemo(() => {
    return [
      { value: null, label: 'All Categories' },
      ...categories.map(category => ({ value: category, label: category }))
    ];
  }, [categories]);
  
  // Filter drinks based on search term and category
  const filteredDrinks = useMemo(() => {
    return allDrinks.filter((drink) => {
      // Match search term
      const searchMatch = searchTerm === '' || 
        drink.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drink.brand !== 'unknown' && drink.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Match category filter
      const categoryMatch = !categoryFilter || drink.category === categoryFilter;
      
      return searchMatch && categoryMatch;
    });
  }, [searchTerm, categoryFilter, allDrinks]);
  
  // Sort drinks based on search term and category
  const sortedDrinks = useMemo(() => {
    return [...filteredDrinks].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      // Extract the correct field values based on sortField
      switch (sortField) {
        case 'product':
          aValue = a.product.toLowerCase();
          bValue = b.product.toLowerCase();
          break;
        case 'brand':
          aValue = (a.brand || '').toLowerCase();
          bValue = (b.brand || '').toLowerCase();
          break;
        case 'category':
          aValue = (a.category || '').toLowerCase();
          bValue = (b.category || '').toLowerCase();
          break;
        case 'default_size_in_oz':
          // Ensure we're using numeric values for size comparison
          aValue = Number(a.default_size_in_oz) || 0;
          bValue = Number(b.default_size_in_oz) || 0;
          break;
        case 'caffeine_mg_per_oz':
          // Ensure we're using numeric values for caffeine per oz comparison
          aValue = Number(a.caffeine_mg_per_oz) || 0;
          bValue = Number(b.caffeine_mg_per_oz) || 0;
          break;
        case 'total_caffeine':
          // Calculate total caffeine properly for sorting
          aValue = (Number(a.default_size_in_oz) * Number(a.caffeine_mg_per_oz)) || 0;
          bValue = (Number(b.default_size_in_oz) * Number(b.caffeine_mg_per_oz)) || 0;
          break;
        default:
          aValue = a.product.toLowerCase();
          bValue = b.product.toLowerCase();
      }
      
      // Compare the values based on sort direction
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredDrinks, sortField, sortDirection]);
  
  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(sortedDrinks.length / DRINKS_PER_PAGE));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  
  // Get current page of data
  const paginatedDrinks = useMemo(() => {
    const startIndex = (validPage - 1) * DRINKS_PER_PAGE;
    const endIndex = startIndex + DRINKS_PER_PAGE;
    return sortedDrinks.slice(startIndex, endIndex);
  }, [sortedDrinks, validPage]);
  
  // Reset to first page when filtering changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, showUserDrinksOnly]);
  
  // Custom styles for React Select to match current theme
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      background: 'var(--bs-body-bg)',
      borderColor: 'var(--bs-border-color)',
      boxShadow: null,
      '&:hover': {
        borderColor: 'var(--bs-primary)'
      }
    }),
    menu: (base: any) => ({
      ...base,
      background: 'var(--bs-body-bg)',
      border: '1px solid var(--bs-border-color)'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused 
        ? 'var(--bs-tertiary-bg)'
        : state.isSelected
        ? 'var(--bs-primary)'
        : undefined,
      color: state.isSelected ? 'var(--bs-primary-fg)' : 'var(--bs-body-color)',
      '&:active': {
        backgroundColor: 'var(--bs-primary)'
      }
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'var(--bs-body-color)'
    }),
    input: (base: any) => ({
      ...base,
      color: 'var(--bs-body-color)'
    }),
    placeholder: (base: any) => ({
      ...base,
      color: 'var(--bs-secondary-color)'
    })
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'coffee':
        return faCoffee;
      case 'energy drink':
        return faBolt;
      default:
        return faMugHot;
    }
  };

  // Handle drink actions
  const handleAddDrink = () => {
    setSelectedDrink(null);
    setPanelMode('add');
    setShowDrinkPanel(true);
  };

  const handleEditDrink = (drink: CustomDrink) => {
    setSelectedDrink(drink);
    setPanelMode('edit');
    setShowDrinkPanel(true);
  };

  const handleCloneDrink = (drink: Drink | CustomDrink) => {
    setSelectedDrink(drink);
    setPanelMode('clone');
    setShowDrinkPanel(true);
  };

  const handleDeleteDrink = (drink: CustomDrink) => {
    setDrinkToDelete(drink);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteDrink = () => {
    if (drinkToDelete) {
      removeCustomDrink(drinkToDelete);
      setShowDeleteConfirmation(false);
      setDrinkToDelete(null);
    }
  };

  // Check if a drink is a custom user drink
  const isCustomDrink = (drink: Drink | CustomDrink): drink is CustomDrink => {
    return 'user_entered' in drink && drink.user_entered === true;
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1>
          <FontAwesomeIcon icon={faWhiskeyGlass} className="me-2" />
          Drinks Database
        </h1>
        <small className="text-muted d-block mt-1">
          This application uses a fixed database of known caffeine drinks. If you don't find your drink, you can add it below.
        </small>
      </div>
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={7} lg={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by product name or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search drinks"
                />
              </InputGroup>
            </Col>
            <Col md={5} lg={4}>
              <div className="d-flex gap-2">
                <Select
                  options={categoryOptions}
                  placeholder="Filter by category"
                  isClearable
                  onChange={(option) => setCategoryFilter(option?.value || null)}
                  aria-label="Filter by category"
                  styles={selectStyles}
                  className="flex-grow-1"
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      // Use semantic brand colors instead of hardcoded values
                      // These will respect the current theme and brand colors
                      primary: 'var(--bs-primary)',
                      primary75: 'var(--bs-primary-rgb, 13, 110, 253)',
                      primary50: 'var(--bs-primary-rgb, 13, 110, 253)',
                      primary25: 'var(--bs-primary-rgb, 13, 110, 253)',
                    }
                  })}
                />
              </div>
            </Col>
          </Row>
          
          <Row className="mt-3">
            <Col xs={12} sm={6}>
              <Form.Check 
                type="switch"
                id="custom-switch"
                label="Show my custom drinks only"
                checked={showUserDrinksOnly}
                onChange={(e) => setShowUserDrinksOnly(e.target.checked)}
                className="form-check-primary" // Use Bootstrap's built-in theming
              />
            </Col>
            <Col xs={12} sm={6} className="text-sm-end mt-2 mt-sm-0">
              <Button 
                variant="primary" 
                onClick={handleAddDrink}
                className="d-flex align-items-center gap-2"
                style={{ marginLeft: 'auto' }}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Custom Drink</span>
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <div>
        <p>
          {paginatedDrinks.length > 0 
            ? `Showing ${paginatedDrinks.length} of ${sortedDrinks.length} drinks` 
            : searchTerm 
              ? `No drinks found matching "${searchTerm}"` 
              : 'No drinks found'
          }
        </p>
        
        <div className="table-responsive">
          <Table hover>
            <thead className="table-dark">
              <tr>
                <th 
                  onClick={() => handleSortClick('product')}
                  style={{ cursor: 'pointer' }}
                >
                  Product {getSortIcon('product')}
                </th>
                <th 
                  onClick={() => handleSortClick('brand')}
                  style={{ cursor: 'pointer' }}
                >
                  Brand {getSortIcon('brand')}
                </th>
                <th 
                  onClick={() => handleSortClick('category')}
                  style={{ cursor: 'pointer' }}
                >
                  Category {getSortIcon('category')}
                </th>
                <th 
                  onClick={() => handleSortClick('default_size_in_oz')}
                  style={{ cursor: 'pointer' }}
                >
                  Size (oz) {getSortIcon('default_size_in_oz')}
                </th>
                <th 
                  onClick={() => handleSortClick('caffeine_mg_per_oz')}
                  style={{ cursor: 'pointer' }}
                >
                  Caffeine (mg/oz) {getSortIcon('caffeine_mg_per_oz')}
                </th>
                <th 
                  onClick={() => handleSortClick('total_caffeine')}
                  style={{ cursor: 'pointer' }}
                >
                  Total Caffeine (mg) {getSortIcon('total_caffeine')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedDrinks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <p className="text-muted mb-0">
                      {searchTerm ? `No matching drinks found for "${searchTerm}"` : 'No drinks found'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedDrinks.map((drink, index) => (
                  <tr key={`${drink.product}-${index}`} className={isCustomDrink(drink) ? 'table-primary' : ''}>
                    <td className="fw-medium">
                      {drink.product}
                      {isCustomDrink(drink) && (
                        <span className="badge bg-primary ms-2">Custom</span>
                      )}
                    </td>
                    <td>{drink.brand !== 'unknown' ? drink.brand : ''}</td>
                    <td>
                      {drink.category !== 'unknown' && (
                        <>
                          <FontAwesomeIcon 
                            icon={getCategoryIcon(drink.category)} 
                            className="me-2 text-secondary" 
                          />
                          {drink.category}
                        </>
                      )}
                    </td>
                    <td className="text-end">{drink.default_size_in_oz.toFixed(1)}</td>
                    <td className="text-end">{drink.caffeine_mg_per_oz.toFixed(1)}</td>
                    <td className="text-end fw-bold">
                      {(drink.default_size_in_oz * drink.caffeine_mg_per_oz).toFixed(1)}
                    </td>
                    <td>
                      <ButtonGroup size="sm" className="float-end">
                        <Button
                          variant="outline-secondary"
                          onClick={() => handleCloneDrink(drink)}
                          title="Clone drink"
                          aria-label={`Clone ${drink.product}`}
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </Button>
                        
                        {isCustomDrink(drink) && (
                          <>
                            <Button
                              variant="outline-primary"
                              onClick={() => handleEditDrink(drink)}
                              title="Edit drink"
                              aria-label={`Edit ${drink.product}`}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              onClick={() => handleDeleteDrink(drink)}
                              title="Delete drink"
                              aria-label={`Delete ${drink.product}`}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </>
                        )}
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <ThemeAwarePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Slide-out panel for adding/editing drinks */}
      <DrinkPanel
        show={showDrinkPanel}
        onHide={() => setShowDrinkPanel(false)}
        selectedDrink={selectedDrink as CustomDrink}
        mode={panelMode}
      />
      
      {/* Delete confirmation slideout panel */}
      <SlideoutPanel
        show={showDeleteConfirmation}
        onHide={() => setShowDeleteConfirmation(false)}
        title="Delete Custom Drink"
        description={`Are you sure you want to permanently delete?`}
        icon={faTrash}
        footer={
          <div className="d-flex justify-content-between w-100">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowDeleteConfirmation(false)}
              className="d-flex align-items-center gap-2"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
              <span>Back</span>
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDeleteDrink}
              className="d-flex align-items-center gap-2"
            >
              <FontAwesomeIcon icon={faTrash} />
              <span>Permanently Delete</span>
            </Button>
          </div>
        }
        size="sm"
      >
        {drinkToDelete && (
          <DeleteConfirmation
            show={true}
            onHide={() => setShowDeleteConfirmation(false)}
            onConfirm={confirmDeleteDrink}
            title="Delete Custom Drink"
            
            message={`Are you sure you want to delete "${drinkToDelete.product}"? This action cannot be undone.`}
            itemDetails={
              <>
                <p className="mb-1"><strong>Product:</strong> {drinkToDelete.product}</p>
                <p className="mb-1"><strong>Brand:</strong> {drinkToDelete.brand !== 'unknown' ? drinkToDelete.brand : 'Unknown'}</p>
                <p className="mb-1"><strong>Category:</strong> {drinkToDelete.category}</p>
                <p className="mb-1"><strong>Caffeine:</strong> {(drinkToDelete.caffeine_mg_per_oz * drinkToDelete.default_size_in_oz).toFixed(1)}mg</p>
              </>
            }
          />
        )}
      </SlideoutPanel>
    </Container>
  );
};

export default DrinksPage;
