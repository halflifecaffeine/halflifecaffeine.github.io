/**
 * IntakeLogTable - A searchable, sortable, paginated table of caffeine intake records
 */
import React, { useState, useMemo, useEffect } from 'react';
import { Table, Form, ButtonGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, faPencilAlt, faCopy,
  faSortUp, faSortDown, faSort 
} from '@fortawesome/free-solid-svg-icons';
import { CaffeineIntake } from '../types';
import { formatVolume } from '../utils/conversions';
import { formatDisplayDateTime } from '../utils/dateUtils';
import { useAppContext } from '../contexts/AppContext';
import { ThemeAwarePagination } from './ThemeAwarePagination';

// Add a style block to override Bootstrap pagination active colors with our brand colors
const paginationStyle = {
  '.page-item.active .page-link': {
    backgroundColor: 'var(--brand-secondary)',
    borderColor: 'var(--brand-secondary)'
  },
  '.page-link:focus': {
    boxShadow: '0 0 0 0.25rem rgba(42, 116, 134, 0.25)' // lighter version of brand-secondary
  }
};

/**
 * Props for IntakeLogTable component
 */
export interface IntakeLogTableProps {
  intakes: CaffeineIntake[];
  onEditIntake: (intake: CaffeineIntake) => void;
  onDeleteIntake: (intake: CaffeineIntake) => void;
  onCloneIntake: (intake: CaffeineIntake) => void;
}

/**
 * Sort field type for sorting intake records
 */
type SortField = 'datetime' | 'brand' | 'product' | 'volume' | 'mg';

/**
 * Sort direction type
 */
type SortDirection = 'asc' | 'desc';

/**
 * Number of records to display per page
 */
const RECORDS_PER_PAGE = 8;

/**
 * IntakeLogTable component displays a searchable, sortable, paginated table of caffeine intake records
 */
export const IntakeLogTable: React.FC<IntakeLogTableProps> = ({
  intakes,
  onEditIntake,
  onDeleteIntake,
  onCloneIntake,
}) => {
  const { theme } = useAppContext(); // Get current theme
  // UI state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<SortField>('datetime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Step 1: Filter intakes based on search term
  const filteredIntakes = useMemo(() => {
    if (!searchTerm.trim()) {
      return intakes;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return intakes.filter(intake => (
      formatDisplayDateTime(intake.datetime).toLowerCase().includes(term) ||
      intake.drink.brand.toLowerCase().includes(term) ||
      intake.drink.product.toLowerCase().includes(term) ||
      String(intake.volume).toLowerCase().includes(term) ||
      intake.unit.toLowerCase().includes(term) ||
      String(intake.mg).toLowerCase().includes(term) ||
      (intake.notes?.toLowerCase().includes(term) ?? false)
    ));
  }, [intakes, searchTerm]);

  // Step 2: Sort the filtered intakes
  const sortedIntakes = useMemo(() => {
    return [...filteredIntakes].sort((a, b) => {
      let result = 0;
      
      // Compare based on sort field
      switch (sortField) {
        case 'datetime':
          result = new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
          break;
        case 'brand':
          result = a.drink.brand.localeCompare(b.drink.brand);
          break;
        case 'product':
          result = a.drink.product.localeCompare(b.drink.product);
          break;
        case 'volume':
          result = a.volume - b.volume;
          break;
        case 'mg':
          result = a.mg - b.mg;
          break;
        default:
          result = 0;
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? result : -result;
    });
  }, [filteredIntakes, sortField, sortDirection]);

  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(sortedIntakes.length / RECORDS_PER_PAGE));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  
  // Step 3: Get the current page of data
  const paginatedIntakes = useMemo(() => {
    const startIndex = (validPage - 1) * RECORDS_PER_PAGE;
    const endIndex = startIndex + RECORDS_PER_PAGE;
    return sortedIntakes.slice(startIndex, endIndex);
  }, [sortedIntakes, validPage]);

  // Reset to first page when filtering or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort column click
  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with appropriate default direction
      setSortField(field);
      setSortDirection(field === 'datetime' ? 'desc' : 'asc');
    }
  };

  // Empty state
  if (intakes.length === 0) {
    return (
      <div className="text-center p-5 border rounded">
        <p className="text-muted mb-0">No caffeine intake recorded yet.</p>
      </div>
    );
  }

  // Render sort icon based on current sort state
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FontAwesomeIcon icon={faSort} className="ms-2 text-muted" />;
    }
    return sortDirection === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} className="ms-2" /> 
      : <FontAwesomeIcon icon={faSortDown} className="ms-2" />;
  };

  return (
    <div className="intake-log-table">
      {/* Search bar and record count */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Control
          type="search"
          placeholder="Search records..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="me-2"
          style={{ maxWidth: '300px' }}
        />
        <span className="text-muted small">
          {filteredIntakes.length === intakes.length ? (
            <>Showing {paginatedIntakes.length} of {intakes.length} records</>
          ) : (
            <>Filtered: {paginatedIntakes.length} of {filteredIntakes.length} (from {intakes.length} total)</>
          )}
        </span>
      </div>

      {/* Main table */}
      <div className="table-responsive mb-3">
        <Table striped hover className="align-middle mb-0">
          <thead>
            <tr>
              <th 
                onClick={() => handleSortClick('datetime')}
                style={{ cursor: 'pointer' }}
                className="user-select-none"
              >
                Date & Time {renderSortIcon('datetime')}
              </th>
              <th 
                onClick={() => handleSortClick('brand')}
                style={{ cursor: 'pointer' }}
                className="user-select-none"
              >
                Drink {renderSortIcon('brand')}
              </th>
              <th 
                onClick={() => handleSortClick('volume')}
                style={{ cursor: 'pointer' }}
                className="user-select-none"
              >
                Volume {renderSortIcon('volume')}
              </th>
              <th 
                onClick={() => handleSortClick('mg')}
                style={{ cursor: 'pointer' }}
                className="user-select-none"
              >
                Caffeine (mg) {renderSortIcon('mg')}
              </th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIntakes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  <p className="text-muted mb-0">
                    No matching records found for "{searchTerm}"
                  </p>
                </td>
              </tr>
            ) : (
              paginatedIntakes.map((intake) => (
                <tr key={intake.id}>
                  <td>{formatDisplayDateTime(intake.datetime)}</td>
                  <td>
                    {intake.drink.brand !== 'unknown' && (
                      <div className="fw-medium">{intake.drink.brand}</div>
                    )}
                    <div className={intake.drink.brand !== 'unknown' ? "text-muted small" : "fw-medium"}>
                      {intake.drink.product}
                    </div>
                  </td>
                  <td>{formatVolume(intake.volume, intake.unit)}</td>
                  <td>
                    <strong>{intake.mg.toFixed(1)}</strong>
                  </td>
                  <td>
                    <ButtonGroup size="sm" className="float-end">
                      <Button
                        variant="outline-secondary"
                        onClick={() => onCloneIntake(intake)}
                        title="Clone intake"
                        aria-label={`Clone intake at ${formatDisplayDateTime(intake.datetime)}`}
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </Button>
                      <Button
                        variant="outline-primary"
                        onClick={() => onEditIntake(intake)}
                        title="Edit intake"
                        aria-label={`Edit intake at ${formatDisplayDateTime(intake.datetime)}`}
                      >
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => onDeleteIntake(intake)}
                        title="Delete intake"
                        aria-label={`Delete intake at ${formatDisplayDateTime(intake.datetime)}`}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination controls */}
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
