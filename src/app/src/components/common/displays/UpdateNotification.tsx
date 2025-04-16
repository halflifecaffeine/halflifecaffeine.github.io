import React, { useState } from 'react';
import { Toast, ToastContainer, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';

interface UpdateNotificationProps {
  onAccept: () => void;
  onDismiss: () => void;
}

/**
 * Component to display a PWA update notification to users
 * Shows when a new version of the application is available
 */
const UpdateNotification: React.FC<UpdateNotificationProps> = ({ 
  onAccept, 
  onDismiss 
}) => {
  const [show, setShow] = useState<boolean>(true);

  const handleAccept = () => {
    setShow(false);
    onAccept();
  };

  const handleDismiss = () => {
    setShow(false);
    onDismiss();
  };

  return (
    <ToastContainer 
      position="bottom-center" 
      className="p-3"
      style={{ zIndex: 1060 }}
    >
      <Toast 
        show={show} 
        onClose={handleDismiss}
        animation={true} 
        className="border-primary"
        delay={10000}
        autohide={false}
      >
        <Toast.Header>
          <strong className="me-auto">
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Update Available
          </strong>
        </Toast.Header>
        <Toast.Body>
          <p className="mb-2">A new version of this app is available!</p>
          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={handleDismiss}
            >
              <FontAwesomeIcon icon={faTimes} className="me-1" /> 
              Later
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleAccept}
            >
              <FontAwesomeIcon icon={faDownload} className="me-1" /> 
              Update Now
            </Button>
          </div>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default UpdateNotification;