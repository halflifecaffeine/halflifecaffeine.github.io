import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const Preferences: React.FC = () => {
  const { state, updatePreferences } = useAppContext();
  const { preferences } = state;
  
  // Local state for form
  const [sleepStartHour, setSleepStartHour] = useState(preferences.sleepStartHour);
  
  // Format hour for display (0-23 to formatted 12-hour time)
  const formatHour = (hour: number): string => {
    const amPm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${amPm}`;
  };
  
  // Handle sleep time change
  const handleSleepTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = parseInt(e.target.value, 10);
    setSleepStartHour(newHour);
    updatePreferences({ sleepStartHour: newHour });
  };
  
  return (
    <div className="preferences-container card p-4 mb-4">
      <h3 className="mb-3">Preferences</h3>
      
      <div className="mb-3">
        <label htmlFor="sleepTimeGoal" className="form-label">
          <strong>Sleep Time Goal</strong>
        </label>
        <select 
          id="sleepTimeGoal" 
          className="form-select"
          value={sleepStartHour}
          onChange={handleSleepTimeChange}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {formatHour(i)}
            </option>
          ))}
        </select>
        <div className="form-text">
          Set your target sleep time. The app will use this to calculate optimal caffeine 
          cutoff times.
        </div>
      </div>
      
      <div className="mb-3">
        <h5>Other Settings</h5>
        <p className="text-muted">
          Additional preference settings like theme, caffeine half-life customization, and 
          threshold adjustments will be available here in future updates.
        </p>
      </div>
    </div>
  );
};

export default Preferences;