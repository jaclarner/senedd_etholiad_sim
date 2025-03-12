import React, { useState, useEffect } from 'react';
import { formatDecimal, getPartyColor, formatPartyName } from '../utils/formatting';
import { baselineNationalVotes } from '../data/baselineVotes';

/**
 * Component for entering party vote percentages
 * @param {Object} props
 * @param {Object} props.initialVotes - Initial vote percentages
 * @param {Function} props.onSubmit - Function to call when submitting form
 * @param {Object} props.currentSimulationOptions - Current simulation options
 */
function PartyInputForm({ initialVotes, onSubmit, currentSimulationOptions = {} }) {
  // State to hold current vote percentages
  const [votes, setVotes] = useState({ ...initialVotes });
  
  // State to track total percentage
  const [totalPercentage, setTotalPercentage] = useState(100);
  
  // State to track if form is valid
  const [isValid, setIsValid] = useState(true);
  
  // State to track swing type - initialize from props if available
  const [swingType, setSwingType] = useState(
    currentSimulationOptions?.swingType || 'uniform'
  );
  
  // State to track regional swings - initialize from props if available
  const [regionalSwings, setRegionalSwings] = useState(
    currentSimulationOptions?.regionalSwings || {}
  );
  
  // State to control warning message visibility
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Update internal state when props change
  useEffect(() => {
    setVotes({ ...initialVotes });
  }, [initialVotes]);

  // Update swing type when simulation options change
  useEffect(() => {
    if (currentSimulationOptions && currentSimulationOptions.swingType) {
      setSwingType(currentSimulationOptions.swingType);
    }
    if (currentSimulationOptions && currentSimulationOptions.regionalSwings) {
      setRegionalSwings(currentSimulationOptions.regionalSwings);
    }
  }, [currentSimulationOptions]);

  // Calculate total percentage whenever votes change
  useEffect(() => {
    const total = Object.values(votes).reduce((sum, value) => sum + value, 0);
    setTotalPercentage(Number(total.toFixed(1)));
    setIsValid(Math.abs(total - 100) <= 0.1);
  }, [votes]);

  // Handle input change for a party
  const handleInputChange = (party, value) => {
    // Convert to number and limit to 1 decimal place
    const numValue = parseFloat(Number(value).toFixed(1));
    
    setVotes(prevVotes => ({
      ...prevVotes,
      [party]: isNaN(numValue) ? 0 : numValue
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isValid) {
      // Show warning modal first
      setShowWarningModal(true);
    } else {
      alert('Total percentage must equal 100%');
    }
  };
  
  // Handle confirming after warning
  const handleConfirmSubmit = () => {
    // Create a completely new object for votes to ensure React detects the change
    const newVotes = { ...votes };
    
    // Create options object based on swing type
    const options = {
      swingType,
      regionalSwings: swingType === 'regional' ? { ...regionalSwings } : null
    };
    
    onSubmit(newVotes, options);
  };

  // Handle swing type change
  const handleSwingTypeChange = (e) => {
    const newSwingType = e.target.value;
    setSwingType(newSwingType);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="party-input-form">
        <div className="swing-type-selector">
          <label htmlFor="swing-type">Vote Calculation Method:</label>
          <select 
            id="swing-type" 
            value={swingType} 
            onChange={handleSwingTypeChange}
            className="select-input"
          >
            <option value="uniform">Uniform National Swing</option>
            <option value="proportional">Proportional Swing</option>
            <option value="regional">Regional Variation</option>
          </select>
          
          {/* Help text based on selected swing type */}
          <div className="swing-explanation">
            {swingType === 'uniform' && (
              <p>Uniform National Swing applies the same percentage point change to all constituencies.</p>
            )}
            {swingType === 'proportional' && (
              <p>Proportional Swing applies changes proportionally to a party's baseline support in each constituency.</p>
            )}
            {swingType === 'regional' && (
              <p>Regional Variation allows you to specify different swings for different regions of Wales.</p>
            )}
          </div>
          
          {/* Regional swing configuration button - would be implemented in a future version */}
          {swingType === 'regional' && (
            <div className="regional-notice">
              <p><i>(Currently trying to ge this to work - check back soon!)</i></p>
            </div>
          )}
        </div>
        
        <div className="party-inputs">
  {Object.keys(votes).map(party => (
    <div key={party} className="input-group">
      <label htmlFor={`input-${party}`} className="party-label">
        {formatPartyName(party)}:
      </label>
      <div className="input-container">
        <input
          id={`input-${party}`}
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={votes[party]}
          onChange={(e) => handleInputChange(party, e.target.value)}
          className="party-input"
        />
        <div className="input-visualization">
          <div 
            className="vote-indicator"
            style={{
              width: `${votes[party]}%`,
              backgroundColor: getPartyColor(party),
              maxWidth: '100%'
            }}
          />
          
          {/* Show change from baseline */}
          <div className={`vote-change ${votes[party] > baselineNationalVotes[party] ? 'positive' : votes[party] < baselineNationalVotes[party] ? 'negative' : ''}`}>
            {votes[party] > baselineNationalVotes[party] ? '+' : ''}
            {formatDecimal(votes[party] - baselineNationalVotes[party], 1)}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>

        <div className={`total-percentage ${!isValid ? 'invalid' : ''}`}>
          Total: {totalPercentage.toFixed(1)}%
          {!isValid && <span className="error-message"> (Must equal 100%)</span>}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary submit-button"
          disabled={!isValid}
        >
          Calculate Results
        </button>
      </form>
      
      {/* Warning Modal */}
      {showWarningModal && (
        <div className="modal-overlay">
          <div className="modal-container warning-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="warning-icon">⚠️</span> Educational Tool Warning
              </h2>
              <button 
                className="close-button" 
                onClick={() => setShowWarningModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p className="warning-intro">
                Please note that this simulator is designed as an <strong>educational tool</strong>, not a predictive model.
              </p>
              
              <div className="warning-details">
                <h3>Important limitations to be aware of:</h3>
                <ul>
                  <li>
                    <strong>Simplified assumptions:</strong> The simulator uses a simplified model of electoral behavior 
                    and does not account for local factors, candidate effects, or tactical voting.
                  </li>
                  <li>
                    <strong>Baseline data:</strong> Vote patterns are based on estimates from past elections adapted 
                    to new boundaries, which may not reflect current political sentiment.
                  </li>
                  <li>
                    <strong>Uniform changes:</strong> The default model applies changes uniformly across constituencies, 
                    which rarely happens in real elections.
                  </li>
                  <li>
                    <strong>No demographic modeling:</strong> The simulator doesn't account for demographic shifts 
                    or differential turnout.
                  </li>
                </ul>
                
                <p className="warning-purpose">
                  This tool is intended to help users understand how the D'Hondt proportional representation system 
                  translates votes into seats, not to predict actual election outcomes.
                </p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowWarningModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  handleConfirmSubmit();
                  setShowWarningModal(false);
                }}
              >
                I Understand, Calculate Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PartyInputForm;