import React, { ReactNode } from 'react';
import { Offcanvas } from 'react-bootstrap';
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
    <Offcanvas 
      show={show} 
      onHide={onHide} 
      placement="end" 
      backdrop={true} 
      className="slideout-panel d-flex flex-column" 
      scroll={false} 
      size={size}
    >
      <Offcanvas.Header className="border-bottom pb-3">
        <Offcanvas.Title className="w-100">
          <div className="d-flex align-items-center">
            {icon && <FontAwesomeIcon icon={icon} className="me-2" />}
            <span>{title}</span>
          </div>
          {description && (
            <small className="text-muted d-block mt-1 fs-6 fw-light lh-sm">{description}</small>
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>
      
      <Offcanvas.Body className="flex-grow-1 overflow-auto">
        {children}
      </Offcanvas.Body>
      
      {footer && (
        <div className="slideout-footer p-3 border-top mt-auto">
          {footer}
        </div>
      )}
    </Offcanvas>
  );
};

export default SlideoutPanel;