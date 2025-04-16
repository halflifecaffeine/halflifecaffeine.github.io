import React, { useState, useMemo, useEffect } from 'react';
import { Row, Col, Form, InputGroup, Table, ButtonGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faMugHot, faCoffee, faBolt, 
  faEdit, faTrash, faCopy, 
  faSort, faSortUp, faSortDown
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { Drink, CustomDrink } from '../../types';
import { ThemeAwarePagination } from '../common/displays/ThemeAwarePagination';

// Number of drinks to display per page
const DRINKS_PER_PAGE = 15;

// Sortable fields for the drinks table
type SortField = 'product' | 'brand' | 'category' | 'default_size_in_oz' | 'caffeine_mg_per_oz' | 'total_caffeine';
type SortDirection = 'asc' | 'desc';

export interface DrinkBrowserProps {
  drinks: (Drink | CustomDrink)[];
  onEditDrink?: (drink: CustomDrink) => void;
  onCloneDrink?: (drink: Drink | CustomDrink) => void;
  onDeleteDrink?: (drink: CustomDrink) => void;
  theme?: string;
}

const DrinkBrowser: React.FC<DrinkBrowserProps> = ({ 
  drinks,
  onEditDrink,
  onCloneDrink,
  onDeleteDrink,
  theme
}) => {
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('product');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Get unique categories for the filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    
    drinks.forEach((drink) => {
      if (drink.category && drink.category !== 'unknown') {
        uniqueCategories.add(drink.category);
      }
    });
    
    return Array.from(uniqueCategories).sort();
  }, [drinks]);
  
  // Create options for react-select
  const categoryOptions = useMemo(() => {
    return [
      { value: null, label: 'All Categories' },
      ...categories.map(category => ({ value: category, label: category }))
    ];
  }, [categories]);
  
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

  // Filter drinks based on search term and category
  const filteredDrinks = useMemo(() => {
    return drinks.filter((drink) => {
      // Match search term
      const searchMatch = searchTerm === '' || 
        drink.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drink.brand !== 'unknown' && drink.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Match category filter
      const categoryMatch = !categoryFilter || drink.category === categoryFilter;
      
      return searchMatch && categoryMatch;
    });
  }, [searchTerm, categoryFilter, drinks]);
  
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
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

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

  // Get icon for category
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

  // Check if a drink is a custom user drink
  const isCustomDrink = (drink: Drink | CustomDrink): drink is CustomDrink => {
    return 'user_entered' in drink && drink.user_entered === true;
  };

  return (
    <div>
      {/* Search and filter UI */}
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
      
      {/* Results summary */}
      <p className="mt-3">
        {paginatedDrinks.length > 0 
          ? `Showing ${paginatedDrinks.length} of ${sortedDrinks.length} drinks` 
          : searchTerm 
            ? `No drinks found matching "${searchTerm}"` 
            : 'No drinks found'
        }
      </p>
      
      {/* Drinks table */}
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
              <th className="text-end">Actions</th>
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
                        onClick={() => onCloneDrink?.(drink)}
                        title="Clone drink"
                        aria-label={`Clone ${drink.product}`}
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </Button>
                      
                      {isCustomDrink(drink) && (
                        <>
                          <Button
                            variant="outline-primary"
                            onClick={() => onEditDrink?.(drink)}
                            title="Edit drink"
                            aria-label={`Edit ${drink.product}`}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => onDeleteDrink?.(drink)}
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
      
      {/* Pagination */}
      {totalPages > 1 && (
        <ThemeAwarePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default DrinkBrowser;