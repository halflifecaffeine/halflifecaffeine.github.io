import React, { useState, useRef } from 'react';
import { Container, Card, Row, Col, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faUpload, faTrash, faDatabase, faFileExport, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';
import { exportToJSON, exportToCSV } from '../../utils/exportUtils';
import { validateImportData } from '../../utils/validators';
import DataDeleteConfirmation from '../../components/mydata/DataDeleteConfirmation';

/**
 * MyDataPage - Component for managing user data (import, export, delete)
 */
const MyDataPage: React.FC = () => {
  const { state, importDataWithMerge, resetAllData } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [importAlert, setImportAlert] = useState<{
    type: 'success' | 'danger' | 'warning';
    message: string;
  } | null>(null);

  const handleExportJSON = () => {
    exportToJSON({
      caffeineIntakes: state.caffeineIntakes,
      customDrinks: state.customDrinks,
      version: '1.0'
    }, 'halflife-caffeine-data.json');
  };

  const handleExportCSV = () => {
    exportToCSV(state.caffeineIntakes, 'halflife-caffeine-intakes.csv');
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Validate the imported data
        const validationResult = validateImportData(parsedData);
        
        if (validationResult.isValid) {
          // Import the validated data with merge
          importDataWithMerge({
            caffeineIntakes: parsedData.caffeineIntakes || [],
            customDrinks: parsedData.customDrinks || []
          });
          
          setImportAlert({
            type: 'success',
            message: `Successfully imported ${parsedData.caffeineIntakes?.length || 0} caffeine intake records and ${parsedData.customDrinks?.length || 0} custom drinks.`
          });
        } else {
          setImportAlert({
            type: 'danger',
            message: `Import failed: ${validationResult.error}`
          });
        }
      } catch (error) {
        setImportAlert({
          type: 'danger',
          message: `Could not parse the imported file: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be uploaded again if needed
    if (event.target) {
      event.target.value = '';
    }
  };

  const downloadSampleData = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const sampleData = {
      caffeineIntakes: [
        {
          id: "sample-1",
          datetime: now.toISOString(),
          drink: {
            brand: "Sample Coffee",
            product: "Medium Roast",
            category: "coffee",
            caffeine_mg_per_oz: 12.5,
            default_size_in_oz: 8,
            labels: ["#coffee", "#sample"]
          },
          volume: 8,
          unit: "oz",
          mg: 100,
          notes: "Sample morning coffee"
        },
        {
          id: "sample-2",
          datetime: yesterday.toISOString(),
          drink: {
            brand: "Sample Tea",
            product: "Green Tea",
            category: "tea",
            caffeine_mg_per_oz: 3.5,
            default_size_in_oz: 12,
            labels: ["#tea", "#sample"]
          },
          volume: 12,
          unit: "oz",
          mg: 42,
          notes: "Sample afternoon tea"
        }
      ],
      customDrinks: [
        {
          id: "sample-drink-1",
          brand: "My Favorite Coffee",
          product: "House Blend",
          category: "coffee",
          caffeine_mg_per_oz: 15.0,
          default_size_in_oz: 10,
          labels: ["#coffee", "#custom"],
          user_entered: true
        }
      ],
      version: "1.0"
    };

    exportToJSON(sampleData, 'halflife-caffeine-sample-data.json');
  };

  const handleDeleteAllData = () => {
    resetAllData();
    setShowDeleteConfirmation(false);
  };

  return (
    <Container className="mt-4 mb-4">
      <Card>
        <Card.Header>
          <h1><FontAwesomeIcon icon={faDatabase} className="me-2" /> My Data</h1>
          <p className="text-muted mb-0">Import, export, and manage your caffeine tracking data</p>
        </Card.Header>
        <Card.Body>
          {importAlert && (
            <Alert 
              variant={importAlert.type} 
              onClose={() => setImportAlert(null)} 
              dismissible
            >
              {importAlert.message}
            </Alert>
          )}

          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header as="h5">
                  <FontAwesomeIcon icon={faFileImport} className="me-2" /> Import Data
                </Card.Header>
                <Card.Body>
                  <p>
                    Upload a previously exported JSON file to restore your data.
                    This will merge with your existing data.
                  </p>
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      onClick={handleFileInputClick}
                    >
                      <FontAwesomeIcon icon={faUpload} className="me-2" /> 
                      Select File to Import
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="d-none"
                      accept=".json"
                      onChange={handleFileChange}
                    />
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={downloadSampleData}
                    >
                      Download Sample Data Format
                    </Button>
                  </div>
                  <div className="mt-3 small text-muted">
                    <p className="mb-1">Supported format:</p>
                    <ul>
                      <li>JSON files with "caffeineIntakes" and "customDrinks" arrays</li>
                      <li>Each intake must include: id, datetime, drink, volume, unit, and mg</li>
                      <li>Each custom drink must include: id, brand, product, category, and caffeine information</li>
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header as="h5">
                  <FontAwesomeIcon icon={faFileExport} className="me-2" /> Export Data
                </Card.Header>
                <Card.Body>
                  <p>
                    Download your caffeine tracking data for backup or transfer to another device.
                  </p>
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      onClick={handleExportJSON}
                    >
                      <FontAwesomeIcon icon={faDownload} className="me-2" /> 
                      Export as JSON
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      onClick={handleExportCSV}
                    >
                      <FontAwesomeIcon icon={faDownload} className="me-2" /> 
                      Export Intakes as CSV
                    </Button>
                    <div className="small text-muted mt-2">
                      <p className="mb-1">Export formats:</p>
                      <ul className="mb-0">
                        <li><strong>JSON:</strong> Complete backup of all data</li>
                        <li><strong>CSV:</strong> Only caffeine intakes (compatible with spreadsheets)</li>
                      </ul>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-danger">
            <Card.Header as="h5" className="text-danger">
              <FontAwesomeIcon icon={faTrash} className="me-2" /> Delete All Data
            </Card.Header>
            <Card.Body>
              <p>
                Permanently delete all your caffeine tracking data and custom drinks.
                This action cannot be undone.
              </p>
              <Button 
                variant="danger" 
                onClick={() => setShowDeleteConfirmation(true)}
              >
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Delete All My Data
              </Button>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Use the separate DataDeleteConfirmation component */}
      <DataDeleteConfirmation 
        show={showDeleteConfirmation}
        onHide={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteAllData}
        caffeineIntakesCount={state.caffeineIntakes.length}
        customDrinksCount={state.customDrinks.length}
      />
    </Container>
  );
};

export default MyDataPage;