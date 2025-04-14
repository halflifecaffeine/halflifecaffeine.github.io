import React, { useState } from 'react';
import { Button, Offcanvas } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';

const SettingsPanel: React.FC = () => {
  const {
    state,
    updatePreferences,
    resetPreferences,
    exportData,
    importData,
    clearAllIntakes,
  } = useAppContext();

  const [showSettings, setShowSettings] = useState(false);
  const [exportString, setExportString] = useState<string | null>(null);
  const [importString, setImportString] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    const data = exportData();
    setExportString(JSON.stringify(data, null, 2));
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importString);
      importData(data);
      setImportString('');
      setImportError(null);
      setShowSettings(false);
    } catch (error) {
      setImportError('Invalid JSON format. Please check your data.');
    }
  };

  const handleResetPreferences = () => {
    if (window.confirm('Reset all settings to default values?')) {
      resetPreferences();
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all caffeine intake data? This cannot be undone.')) {
      clearAllIntakes();
      setShowSettings(false);
    }
  };

  return (
    <>
      <Button 
        variant="light" 
        onClick={() => setShowSettings(true)}
        className="settings-button"
        aria-label="Open Settings"
      >
        <FontAwesomeIcon icon={faGear} />
      </Button>

      <Offcanvas 
        show={showSettings} 
        onHide={() => setShowSettings(false)} 
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Settings</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <h5>Theme</h5>
          <div className="mb-3">
            <div className="d-flex gap-2">
              <Button 
                variant={state.preferences.theme === 'light' ? 'primary' : 'outline-primary'} 
                onClick={() => updatePreferences({ theme: 'light' })}
              >
                <FontAwesomeIcon icon={faSun} /> Light
              </Button>
              <Button 
                variant={state.preferences.theme === 'dark' ? 'primary' : 'outline-primary'} 
                onClick={() => updatePreferences({ theme: 'dark' })}
              >
                <FontAwesomeIcon icon={faMoon} /> Dark
              </Button>
              <Button 
                variant={state.preferences.theme === 'auto' ? 'primary' : 'outline-primary'} 
                onClick={() => updatePreferences({ theme: 'auto' })}
              >
                Auto
              </Button>
            </div>
          </div>

          <h5 className="mt-4">Caffeine Half-Life</h5>
          <div className="mb-3">
            <label htmlFor="halfLife" className="form-label">
              Half-life in hours: {state.preferences.halfLifeHours}
            </label>
            <input
              type="range"
              className="form-range"
              id="halfLife"
              min="4"
              max="8"
              step="0.5"
              value={state.preferences.halfLifeHours}
              onChange={(e) => updatePreferences({ halfLifeHours: parseFloat(e.target.value) })}
            />
            <div className="text-muted small">
              Most adults metabolize caffeine with a half-life of 5-6 hours.
            </div>
          </div>

          <h5 className="mt-4">Health Guidelines</h5>
          <div className="mb-3">
            <label htmlFor="maxSafeLevel" className="form-label">
              Max Safe Daily Level: {state.preferences.maxSafeCaffeineLevel} mg
            </label>
            <input
              type="range"
              className="form-range"
              id="maxSafeLevel"
              min="200"
              max="600"
              step="50"
              value={state.preferences.maxSafeCaffeineLevel}
              onChange={(e) => updatePreferences({ maxSafeCaffeineLevel: parseInt(e.target.value) })}
            />
          </div>

          <h5 className="mt-4">Sleep Time Goal</h5>
          <div className="mb-3">
            <label htmlFor="sleepStartHour" className="form-label">
              Target Sleep Time: {state.preferences.sleepStartHour}:00
            </label>
            <input
              type="range"
              className="form-range"
              id="sleepStartHour"
              min="20"
              max="24"
              step="1"
              value={state.preferences.sleepStartHour}
              onChange={(e) => updatePreferences({ sleepStartHour: parseInt(e.target.value) })}
            />
            <div className="text-muted small">
              Set your target bedtime to help manage caffeine levels before sleep.
            </div>
          </div>

          <h5 className="mt-4">Data Management</h5>
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={handleExport}>
              Export Data
            </Button>
            {exportString && (
              <div className="mt-2">
                <textarea 
                  className="form-control" 
                  rows={5} 
                  value={exportString} 
                  readOnly 
                />
                <div className="text-muted small mt-1">
                  Copy this data to save it somewhere safe.
                </div>
              </div>
            )}
            
            <Button variant="outline-primary" onClick={() => setExportString(null)}>
              Import Data
            </Button>
            {!exportString && (
              <div className="mt-2">
                <textarea 
                  className="form-control" 
                  rows={5} 
                  value={importString} 
                  onChange={(e) => setImportString(e.target.value)} 
                  placeholder="Paste exported data here..."
                />
                {importError && (
                  <div className="text-danger small">{importError}</div>
                )}
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="mt-2" 
                  onClick={handleImport}
                  disabled={!importString.trim()}
                >
                  Import
                </Button>
              </div>
            )}
            
            <Button variant="danger" onClick={handleClearData}>
              Clear All Intake Data
            </Button>
            
            <Button variant="outline-secondary" onClick={handleResetPreferences}>
              Reset All Settings
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default SettingsPanel;