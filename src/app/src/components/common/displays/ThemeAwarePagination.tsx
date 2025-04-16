import React from 'react';
import { Pagination } from 'react-bootstrap';

/**
 * Props for ThemeAwarePagination component
 */
export interface ThemeAwarePaginationProps {
  /**
   * Current active page number (1-based)
   */
  currentPage: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Handler for page change events
   */
  onPageChange: (page: number) => void;
  
  /**
   * Optional CSS class to apply to the pagination component
   */
  className?: string;
  
  /**
   * Maximum number of numbered page links to show before using ellipsis
   * Default: 5
   */
  maxVisiblePages?: number;
}

/**
 * A theme-aware pagination component that uses brand colors consistently
 * This component wraps Bootstrap's Pagination with custom styling to
 * ensure it follows the application's theme, especially for the active page.
 */
export const ThemeAwarePagination: React.FC<ThemeAwarePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  maxVisiblePages = 5
}) => {
  // Don't render pagination if we only have one page
  if (totalPages <= 1) {
    return null;
  }

  /**
   * Create pagination items based on current page and total pages
   */
  const renderPaginationItems = (): React.ReactNode[] => {
    const items: React.ReactNode[] = [];
    
    // If we have fewer pages than the max, just show all pages
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Pagination.Item>
        );
      }
    } else {
      // For many pages, show first, last, current and neighbors
      items.push(
        <Pagination.Item
          key={1}
          active={1 === currentPage}
          onClick={() => onPageChange(1)}
        >
          1
        </Pagination.Item>
      );
      
      // Show ellipsis if current page is more than 3
      if (currentPage > 3) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
      
      // Show current page and its neighbors
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Pagination.Item>
        );
      }
      
      // Show ellipsis if current page is less than totalPages - 2
      if (currentPage < totalPages - 2) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      
      // Always show the last page
      items.push(
        <Pagination.Item
          key={totalPages}
          active={totalPages === currentPage}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    return items;
  };

  return (
    <Pagination 
      className={`theme-aware-pagination justify-content-center ${className}`}
    >
      <Pagination.Prev
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      />
      {renderPaginationItems()}
      <Pagination.Next
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      />
      
      {/* Inline styles for theme-aware pagination */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Active page styling */
            .theme-aware-pagination .page-item.active .page-link,
            .theme-aware-pagination .page-link.active {
              background-color: var(--brand-secondary);
              border-color: var(--brand-secondary);
              color: white; /* Ensure text is white for proper contrast */
            }
            
            /* Regular page link styling */
            .theme-aware-pagination .page-link {
              color: var(--brand-secondary);
            }
            
            /* Focus state styling */
            .theme-aware-pagination .page-link:focus {
              box-shadow: 0 0 0 0.25rem rgba(42, 116, 134, 0.25);
            }
            
            /* Hover state styling */
            .theme-aware-pagination .page-link:hover {
              color: #236577; /* Slightly darker shade of brand-secondary */
              background-color: var(--bs-pagination-hover-bg);
              border-color: var(--bs-pagination-hover-border-color);
            }
          `
        }}
      />
    </Pagination>
  );
};