/**
 * SettingsPanel - Slide-out panel for application preferences and settings
 */
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faMoon, faSun, faClock } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../contexts/AppContext';
import SlideoutPanel from '../common/layout/SlideoutPanel';

interface SettingsPanelProps {
  /**
   * Whether the settings panel should be shown (controlled mode)
   */
  show?: boolean;
  
  /**
   * Callback when the panel is closed (controlled mode)
   */
  onClose?: () => void;
}

/**
 * Settings panel component for managing user preferences and application settings
 * Can operate in standalone mode or controlled mode via props
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({ show: externalShow, onClose }) => {
  const {
    state,
    updatePreferences,
    resetPreferences,
    exportData,
    importData,
    clearAllIntakes,
  } = useAppContext();

  // Internal state for standalone mode
  const [internalShow, setInternalShow] = useState(false);
  
  // Use external state if provided (controlled mode), otherwise use internal state
  const isControlled = externalShow !== undefined;
  const showSettings = isControlled ? externalShow : internalShow;
  
  // Format hour for display (0-23 to formatted 12-hour time)
  const formatHour = (hour: number): string => {
    const amPm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${amPm}`;
  };

  const handleClose = (): void => {
    if (isControlled && onClose) {
      onClose();
    } else {
      setInternalShow(false);
    }
  };

  const handleExport = (): void => {
    const data = exportData();
    setExportString(JSON.stringify(data, null, 2));
  };

  const handleImport = (): void => {
    try {
      const data = JSON.parse(importString);
      importData(data);
      setImportString('');
      setImportError(null);
      handleClose();
    } catch (error) {
      setImportError('Invalid JSON format. Please check your data.');
    }
  };

  const handleResetPreferences = (): void => {
    if (window.confirm('Reset all settings to default values?')) {
      resetPreferences();
    }
  };

  const handleClearData = (): void => {
    if (window.confirm('Are you sure you want to clear all caffeine intake data? This cannot be undone.')) {
      clearAllIntakes();
      handleClose();
    }
  };

  const [exportString, setExportString] = useState<string | null>(null);
  const [importString, setImportString] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  const settingsContent = (
    <>
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
        <label htmlFor="sleepStartHour" className="form-label d-flex align-items-center">
          <FontAwesomeIcon icon={faClock} className="me-2" /> Target Sleep Time
        </label>
        <Form.Select
          id="sleepStartHour"
          value={state.preferences.sleepStartHour}
          onChange={(e) => updatePreferences({ sleepStartHour: parseInt(e.target.value) })}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {formatHour(i)}
            </option>
          ))}
        </Form.Select>
        <div className="text-muted small mt-1">
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
    </>
  );

  return (
    <>
      {/* Only render button in standalone mode */}
      {!isControlled && (
        <Button 
          variant="light" 
          onClick={() => setInternalShow(true)}
          className="settings-button"
          aria-label="Open Settings"
        >
          <FontAwesomeIcon icon={faGear} />
        </Button>
      )}

      <SlideoutPanel
        show={showSettings}
        onHide={handleClose}
        title="Settings"
        description="Configure your preferences and manage your data"
        icon={faGear}
      >
        {settingsContent}
      </SlideoutPanel>
    </>
  );
};

export default SettingsPanel;