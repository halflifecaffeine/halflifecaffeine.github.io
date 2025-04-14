import React, { ReactNode } from 'react';
import { Offcanvas, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface SlideoutPanelProps {
  show: boolean;
  onHide: () => void;
  title: string;
  description?: string;
  icon?: IconDefinition;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'lg';
}

/**
 * Reusable slideout panel component with standardized header, description,
 * and optional footer.
 */
const SlideoutPanel: React.FC<SlideoutPanelProps> = ({
  show,
  onHide,
  title,
  description,
  icon,
  children,
  footer,
  size = 'lg'
}) => {
  return (
    <Offcanvas show={show} onHide={onHide} placement="end" backdrop={true} className="slideout-panel" scroll={true} size={size}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="d-flex align-items-center gap-2">
          {icon && <FontAwesomeIcon icon={icon} className="me-2" />}
          {title}
        </Offcanvas.Title>
      </Offcanvas.Header>
      
      <Offcanvas.Body className="d-flex flex-column">
        {description && (
          <div className="slideout-description mb-4 text-muted">
            {description}
          </div>
        )}
        
        <div className="slideout-content flex-grow-1">
          {children}
        </div>
        
        {footer && (
          <div className="slideout-footer mt-4 pt-3 border-top">
            {footer}
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default SlideoutPanel;