import { useState } from 'react';
import './App.css';

const UNITS = {
  METER: 'm',
  CENTIMETER: 'cm',
  FOOT: 'ft',
  INCH: 'in'
};

const convertToMeters = (value, unit) => {
  switch (unit) {
    case UNITS.CENTIMETER:
      return value / 100;
    case UNITS.FOOT:
      return value * 0.3048;
    case UNITS.INCH:
      return value * 0.0254;
    default:
      return value; // already in meters
  }
};

/**
 * Converts a value from any supported unit to centimeters
 * @param {number} value - The value to convert
 * @param {string} fromUnit - The unit to convert from ('m', 'cm', 'ft', 'in')
 * @returns {number} The converted value in centimeters
 */
const convertToCentimeters = (value, fromUnit) => {
  const valueNum = parseFloat(value) || 0;
  switch (fromUnit) {
    case UNITS.METER:
      return valueNum * 100;
    case UNITS.CENTIMETER:
      return valueNum;
    case UNITS.FOOT:
      return valueNum * 30.48;
    case UNITS.INCH:
      return valueNum * 2.54;
    default:
      return valueNum; // return as is if unit is not recognized
  }
};

const calculateGhanFoot = (length, circumference, lengthUnit, circumferenceUnit, returnIndividual = false) => {
  if (!length || !circumference) return returnIndividual ? { individual: 0, final: 0 } : '0.00';
  
  const lengthInMeters = convertToMeters(parseFloat(length) || 0, lengthUnit);
  const circumferenceInCentimeters = convertToCentimeters(parseFloat(circumference) || 0, circumferenceUnit);
  
  // Calculate individual log volume (ghanFootNew)
  const ghanFoot = (lengthInMeters * circumferenceInCentimeters * circumferenceInCentimeters) / 160;
  const ghanFootNew = (ghanFoot / 1000);
  
  if (returnIndividual) {
    return {
      individual: ghanFootNew,
      final: ghanFootNew * 35.315
    };
  }
  
  return ghanFootNew.toFixed(4);
};

// Function to calculate total volume from all logs
const calculateTotalVolume = (logs) => {
  if (!logs.length) return '0.00';
  
  const totalGhanFootNew = logs.reduce((sum, log) => {
    if (!log.length || !log.circumference) return sum;
    const { individual } = calculateGhanFoot(
      log.length, 
      log.circumference, 
      log.lengthUnit, 
      log.circumferenceUnit,
      true
    );
    return sum + (individual || 0);
  }, 0);
  
  // Multiply the sum by 35.315 to get the final total
  return (totalGhanFootNew * 35.315).toFixed(2);
};

const LogInput = ({ log, index, onUpdate, onRemove }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate(index, { ...log, [name]: value });
  };

  // Calculate individual log volume
  const { individual, final } = calculateGhanFoot(
    log.length,
    log.circumference,
    log.lengthUnit,
    log.circumferenceUnit,
    true
  );

  return (
    <div className="log-row">
      <div className="log-header">
        <span className="log-number">Log #{index + 1}</span>
        {index > 0 && (
          <button 
            type="button" 
            className="remove-btn"
            onClick={() => onRemove(index)}
            title="Remove log"
          >
            ×
          </button>
        )}
      </div>
      <div className="input-grid">
        <div className="input-group">
          <label>Length (m) <span className="gujarati">(લંબાઈ)</span></label>
          <div className="input-with-unit">
            <input
              type="number"
              name="length"
              value={log.length}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="compact-input"
            />
            <select
              name="lengthUnit"
              value={log.lengthUnit}
              onChange={handleChange}
              className="unit-select"
            >
              <option value={UNITS.METER}>m</option>
              <option value={UNITS.CENTIMETER}>cm</option>
              <option value={UNITS.FOOT}>ft</option>
              <option value={UNITS.INCH}>in</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label>Circumference (cm) <span className="gujarati">(ઘેરાવ)</span></label>
          <div className="input-with-unit">
            <input
              type="number"
              name="circumference"
              value={log.circumference}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="0.0"
              className="compact-input"
            />
            <select
              name="circumferenceUnit"
              value={log.circumferenceUnit}
              onChange={handleChange}
              className="unit-select"
            >
              <option value={UNITS.CENTIMETER}>cm</option>
              <option value={UNITS.METER}>m</option>
              <option value={UNITS.INCH}>in</option>
              <option value={UNITS.FOOT}>ft</option>
            </select>
          </div>
        </div>

        <div className="result-group">
          <label>Volume <span className="gujarati">(ઘનમીટર)</span></label>
          <div className="result-box">
            {individual ? individual.toFixed(2) : '0.00'} m³
            {/* <div className="volume-final">
              ({final ? final.toFixed(2) : '0.00'} ft³)
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [logs, setLogs] = useState([
    { length: '', circumference: '', lengthUnit: UNITS.METER, circumferenceUnit: UNITS.CENTIMETER }
  ]);
  const [totalGhanFoot, setTotalGhanFoot] = useState(0);

  const handleUpdateLog = (index, updatedLog) => {
    const updatedLogs = [...logs];
    updatedLogs[index] = updatedLog;
    setLogs(updatedLogs);
  };

  const handleRemoveLog = (index) => {
    if (logs.length > 1) {
      const newLogs = logs.filter((_, i) => i !== index);
      setLogs(newLogs);
    }
  };

  const handleAddLog = () => {
    setLogs([...logs, { length: '', circumference: '', lengthUnit: UNITS.METER, circumferenceUnit: UNITS.CENTIMETER }]);
  };

  const handleReset = () => {
    setLogs([{ length: '', circumference: '', lengthUnit: UNITS.METER, circumferenceUnit: UNITS.CENTIMETER }]);
  };

  return (
    <div className="app">
      <header>
        <h1>Ghan-foot Calculator</h1>
      </header>

      <main className="main-content">
        <div className="logs-container">
          {logs.map((log, index) => (
            <LogInput
              key={index}
              log={log}
              index={index}
              onUpdate={handleUpdateLog}
              onRemove={handleRemoveLog}
            />
          ))}
        </div>

        <div className="action-buttons">
          <button type="button" className="btn btn-outline" onClick={handleAddLog}>
            + Add Log
          </button>
          <button type="button" className="btn btn-outline-danger" onClick={handleReset}>
            Reset All
          </button>
        </div>
      </main>
      
      <footer className="footer-section">
        <div className="total-display">
          Total (ઘનફૂટ): {calculateTotalVolume(logs)} ft³
        </div>
      </footer>
    </div>
  );
}

export default App;
