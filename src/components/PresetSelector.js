import React, { useState } from 'react';
import presetScenarios from '../data/presetScenarios';
import { getPartyColor, formatPartyName } from '../utils/formatting';

/**
 * Component to display a small chart of party vote percentages for a preset
 * @param {Object} props
 * @param {Object} props.votes - Vote percentages by party
 */
function PresetVoteChart({ votes }) {
  if (!votes) return null;
  
  // Sort parties by vote percentage (descending)
  const sortedParties = Object.keys(votes).sort((a, b) => votes[b] - votes[a]);
  
  // Only show top parties to keep the chart clean
  const topParties = sortedParties.slice(0, 4);
  
  return (
    <div className="preset-vote-chart">
      {topParties.map(party => (
        <div key={party} className="vote-bar-container">
          <div className="vote-bar-label">
            {formatPartyName(party)}
          </div>
          <div className="vote-bar-wrapper">
            <div 
              className="vote-bar"
              style={{ 
                width: `${votes[party]}%`,
                backgroundColor: getPartyColor(party)
              }}
            />
            <span className="vote-bar-value">{votes[party]}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Component for selecting preset election scenarios
 * @param {Object} props
 * @param {Function} props.onSelectPreset - Function to call when a preset is selected
 * @param {Object} props.currentPreset - Currently selected preset (if any)
 */
function PresetSelector({ onSelectPreset, currentPreset }) {
  // State to track which category is expanded
  const [activeCategory, setActiveCategory] = useState('polling');
  
  const handlePresetSelect = (preset) => {
    onSelectPreset(preset);
  };

  // Group presets by category
  const historicalPresets = presetScenarios.filter(preset => preset.category === 'historical');
  const pollingPresets = presetScenarios.filter(preset => preset.category === 'polling');
  const hypotheticalPresets = presetScenarios.filter(preset => preset.category === 'hypothetical');

  return (
    <div className="preset-selector-container">
      <div className="preset-tabs">
        <button 
          className={`preset-tab ${activeCategory === 'historical' ? 'active' : ''}`}
          onClick={() => setActiveCategory('historical')}
        >
          Historical Results
        </button>
        <button 
          className={`preset-tab ${activeCategory === 'polling' ? 'active' : ''}`}
          onClick={() => setActiveCategory('polling')}
        >
          Recent Polling
        </button>
        <button 
          className={`preset-tab ${activeCategory === 'hypothetical' ? 'active' : ''}`}
          onClick={() => setActiveCategory('hypothetical')}
        >
          Hypothetical Scenarios
        </button>
      </div>
      
      <div className="preset-cards">
        {activeCategory === 'historical' && historicalPresets.map(preset => (
          <div 
            key={preset.id} 
            className={`preset-card ${currentPreset?.id === preset.id ? 'selected' : ''}`}
            onClick={() => handlePresetSelect(preset)}
          >
            <h4>{preset.name}</h4>
            <p>{preset.description}</p>
            <PresetVoteChart votes={preset.votes} />
            {preset.date && <p className="preset-date">Date: {preset.date}</p>}
          </div>
        ))}
        
        {activeCategory === 'polling' && pollingPresets.map(preset => (
          <div 
            key={preset.id} 
            className={`preset-card ${currentPreset?.id === preset.id ? 'selected' : ''}`}
            onClick={() => handlePresetSelect(preset)}
          >
            <h4>{preset.name}</h4>
            <p>{preset.description}</p>
            <PresetVoteChart votes={preset.votes} />
            {preset.date && <p className="preset-date">Date: {preset.date}</p>}
          </div>
        ))}
        
        {activeCategory === 'hypothetical' && hypotheticalPresets.map(preset => (
          <div 
            key={preset.id} 
            className={`preset-card ${currentPreset?.id === preset.id ? 'selected' : ''}`}
            onClick={() => handlePresetSelect(preset)}
          >
            <h4>{preset.name}</h4>
            <p>{preset.description}</p>
            <PresetVoteChart votes={preset.votes} />
          </div>
        ))}
      </div>
      
      {currentPreset && (
        <div className="current-preset">
          <p>Currently using: <strong>{currentPreset.name}</strong></p>
          <button 
            className="btn btn-secondary clear-preset-button"
            onClick={() => onSelectPreset(null)}
          >
            Clear Preset
          </button>
        </div>
      )}
    </div>
  );
}

export default PresetSelector;