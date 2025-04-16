/**
 * DrinksPage - Shows a searchable, filterable list of drinks with caffeine content
 */
import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Form, InputGroup, Table, Pagination, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMugHot, faCoffee, faBolt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../hooks/useTheme';
import Select from 'react-select';

// Import drinks data
import drinksData from '../../data/drinks.json';

// Define drink type based on data structure
interface Drink {
  product: string;
  category: string;
  brand: string;
  default_size_in_oz: number;
  caffeine_mg_per_oz: number;
}

/**
 * Number of drinks to display per page
 */
const DRINKS_PER_PAGE = 15;

/**
 * DrinksPage component
 */
export const DrinksPage: React.FC = () => {
  const [theme] = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Get unique categories for the filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    
    drinksData.forEach((drink: Drink) => {
      if (drink.category && drink.category !== 'unknown') {
        uniqueCategories.add(drink.category);
      }
    });
    
    return Array.from(uniqueCategories).sort();
  }, []);
  
  // Create options for react-select
  const categoryOptions = useMemo(() => {
    return [
      { value: null, label: 'All Categories' },
      ...categories.map(category => ({ value: category, label: category }))
    ];
  }, [categories]);
  
  // Filter drinks based on search term and category
  const filteredDrinks = useMemo(() => {
    return drinksData.filter((drink: Drink) => {
      // Match search term
      const searchMatch = searchTerm === '' || 
        drink.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drink.brand !== 'unknown' && drink.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Match category filter
      const categoryMatch = !categoryFilter || drink.category === categoryFilter;
      
      return searchMatch && categoryMatch;
    });
  }, [searchTerm, categoryFilter]);
  
  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(filteredDrinks.length / DRINKS_PER_PAGE));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  
  // Get current page of data
  const paginatedDrinks = useMemo(() => {
    const startIndex = (validPage - 1) * DRINKS_PER_PAGE;
    const endIndex = startIndex + DRINKS_PER_PAGE;
    return filteredDrinks.slice(startIndex, endIndex);
  }, [filteredDrinks, validPage]);
  
  // Reset to first page when filtering changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);
  
  // Generate pagination items
  const paginationItems = useMemo(() => {
    const items = [];
    
    for (let i = 0; i < totalPages; i++) {
      const pageNum = i + 1;
      
      // Show all pages if fewer than 8, otherwise show smart pagination
      const showPageNum = 
        totalPages <= 7 || // Show all if 7 or fewer pages
        pageNum === 1 || // Always show first page
        pageNum === totalPages || // Always show last page
        Math.abs(pageNum - currentPage) <= 2; // Show pages near current
        
      // Show ellipsis when skipping pages
      const showPrevEllipsis = pageNum === 2 && currentPage > 4;
      const showNextEllipsis = pageNum === totalPages - 1 && currentPage < totalPages - 3;
      
      if (showPrevEllipsis) {
        items.push(<Pagination.Ellipsis key="prev-ellipsis" disabled />);
      }
      
      if (showNextEllipsis) {
        items.push(<Pagination.Ellipsis key="next-ellipsis" disabled />);
      }
      
      if (showPageNum) {
        items.push(
          <Pagination.Item
            key={pageNum}
            active={currentPage === pageNum}
            onClick={() => setCurrentPage(pageNum)}
          >
            {pageNum}
          </Pagination.Item>
        );
      }
    }
    
    return items;
  }, [currentPage, totalPages]);
  
  // Custom styles for React Select to match current theme
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      background: theme === 'dark' ? '#212529' : '#fff',
      borderColor: theme === 'dark' ? '#495057' : '#ced4da',
      boxShadow: null,
      '&:hover': {
        borderColor: theme === 'dark' ? '#6c757d' : '#b3d7ff'
      }
    }),
    menu: (base: any) => ({
      ...base,
      background: theme === 'dark' ? '#212529' : '#fff',
      border: theme === 'dark' ? '1px solid #495057' : '1px solid #ced4da'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused 
        ? (theme === 'dark' ? '#495057' : '#e9ecef')
        : state.isSelected
        ? (theme === 'dark' ? '#343a40' : '#007bff')
        : undefined,
      color: state.isSelected && theme !== 'dark' ? 'white' : undefined,
      '&:active': {
        backgroundColor: theme === 'dark' ? '#6c757d' : '#007bff'
      }
    }),
    singleValue: (base: any) => ({
      ...base,
      color: theme === 'dark' ? '#f8f9fa' : '#212529'
    }),
    input: (base: any) => ({
      ...base,
      color: theme === 'dark' ? '#f8f9fa' : '#212529'
    }),
    placeholder: (base: any) => ({
      ...base,
      color: theme === 'dark' ? '#6c757d' : '#6c757d'
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

  return (
    <Container className="py-4">
      <h1 className="mb-4">Drinks Database</h1>
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={8} lg={9}>
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
            <Col md={4} lg={3}>
              <Select
                options={categoryOptions}
                placeholder="Filter by category"
                isClearable
                onChange={(option) => setCategoryFilter(option?.value || null)}
                aria-label="Filter by category"
                styles={selectStyles}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: '#0d6efd',
                    primary75: '#3d8bfd',
                    primary50: '#6ea8fe',
                    primary25: '#b6d4fe',
                  }
                })}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <div>
        <p>Showing {paginatedDrinks.length} of {filteredDrinks.length} drinks</p>
        
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th className="text-end">Size (oz)</th>
                <th className="text-end">Caffeine per oz</th>
                <th className="text-end">Total Caffeine (mg)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDrinks.map((drink: Drink, index: number) => (
                <tr key={`${drink.product}-${index}`}>
                  <td className="fw-medium">{drink.product}</td>
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
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <Pagination className="justify-content-center mt-4">
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
            
            {paginationItems}
            
            <Pagination.Next
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
            />
          </Pagination>
        )}
      </div>
    </Container>
  );
};

export default DrinksPage;
