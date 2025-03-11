import React from 'react';
import { formatDecimal } from '../utils/formatting';

/**
 * Component to visualize electoral system proportionality metrics
 * @param {Object} props
 * @param {Object} props.metrics - Election metrics including proportionality measures
 */
function ProportionalityMetrics({ metrics }) {
  // Extract relevant metrics
  const { 
    disproportionalityIndex, 
    effectiveNumberOfPartiesVotes, 
    effectiveNumberOfPartiesSeats 
  } = metrics;
  
  // Calculate fragmentation difference (how much the electoral system reduces party fragmentation)
  const fragmentationReduction = effectiveNumberOfPartiesVotes - effectiveNumberOfPartiesSeats;
  
  // Get interpretation text for the disproportionality index
  const getDisproportionalityInterpretation = (index) => {
    if (index < 1) return "Very proportional";
    if (index < 3) return "Moderately proportional";
    if (index < 5) return "Somewhat disproportional";
    if (index < 8) return "Highly disproportional";
    return "Extremely disproportional";
  };
  
  // Get interpretation text for ENP
  const getENPInterpretation = (enp) => {
    if (enp < 2) return "Dominant party system";
    if (enp < 2.5) return "Two-party system";
    if (enp < 3.5) return "Two-and-a-half party system";
    if (enp < 4.5) return "Moderate multi-party system";
    return "Fragmented multi-party system";
  };
  
  // Get color for gauge based on value
  const getGaugeColor = (value, type) => {
    if (type === 'disproportionality') {
      // Lower is better for disproportionality
      if (value < 1) return '#4ade80'; // Green
      if (value < 3) return '#22c55e';
      if (value < 5) return '#eab308'; // Yellow
      if (value < 8) return '#f97316'; // Orange
      return '#ef4444'; // Red
    } else if (type === 'fragmentation') {
      // Neutral color scale for ENP
      if (value < 2) return '#60a5fa'; // Blue
      if (value < 3) return '#3b82f6';
      if (value < 4) return '#2563eb';
      if (value < 5) return '#1d4ed8';
      return '#1e40af'; // Dark Blue
    }
    
    return '#888888'; // Default gray
  };
  
  return (
    <div className="proportionality-metrics">
      <h3 className="metrics-title">Electoral System Metrics</h3>
      
      <div className="metrics-grid">
        {/* Gallagher Index */}
        <div className="metric-card">
          <h4>Disproportionality (Gallagher Index)</h4>
          <div className="metric-gauge">
            <div className="gauge-scale">
              <span>0</span>
              <span>2.5</span>
              <span>5</span>
              <span>7.5</span>
              <span>10+</span>
            </div>
            <div className="gauge-container">
              <div 
                className="gauge-indicator"
                style={{ 
                  left: `${Math.min(disproportionalityIndex * 10, 100)}%`,
                  backgroundColor: getGaugeColor(disproportionalityIndex, 'disproportionality')
                }}
              ></div>
            </div>
          </div>
          <div className="metric-value">
            <span className="value">{formatDecimal(disproportionalityIndex, 2)}</span>
            <span className="interpretation">
              {getDisproportionalityInterpretation(disproportionalityIndex)}
            </span>
          </div>
          <p className="metric-description">
            The Gallagher Index measures the difference between votes received and seats allocated to parties. 
            Lower values indicate a more proportional electoral system. Values below 5 are typically considered 
            reasonably proportional.
          </p>
        </div>
        
        {/* Effective Number of Parties */}
        <div className="metric-card">
          <h4>Effective Number of Parties</h4>
          <div className="enp-comparison">
            <div className="enp-item">
              <span className="enp-label">Votes</span>
              <div className="enp-bar-container">
                <div 
                  className="enp-bar" 
                  style={{ 
                    width: `${Math.min(effectiveNumberOfPartiesVotes * 14, 100)}%`,
                    backgroundColor: getGaugeColor(effectiveNumberOfPartiesVotes, 'fragmentation')
                  }}
                ></div>
              </div>
              <span className="enp-value">{formatDecimal(effectiveNumberOfPartiesVotes, 2)}</span>
              <span className="enp-interpretation">
                {getENPInterpretation(effectiveNumberOfPartiesVotes)}
              </span>
            </div>
            
            <div className="enp-item">
              <span className="enp-label">Seats</span>
              <div className="enp-bar-container">
                <div 
                  className="enp-bar" 
                  style={{ 
                    width: `${Math.min(effectiveNumberOfPartiesSeats * 14, 100)}%`,
                    backgroundColor: getGaugeColor(effectiveNumberOfPartiesSeats, 'fragmentation')
                  }}
                ></div>
              </div>
              <span className="enp-value">{formatDecimal(effectiveNumberOfPartiesSeats, 2)}</span>
              <span className="enp-interpretation">
                {getENPInterpretation(effectiveNumberOfPartiesSeats)}
              </span>
            </div>
          </div>
          
          <div className="metric-value">
            <span className="value">Fragmentation Reduction: {formatDecimal(fragmentationReduction, 2)}</span>
            <span className="interpretation">
              {fragmentationReduction > 0 ? 
                "The electoral system reduces party fragmentation" : 
                "The electoral system maintains party system fragmentation"}
            </span>
          </div>
          
          <p className="metric-description">
            The Effective Number of Parties (ENP) measures how many "effective" parties compete in the system, 
            accounting for their relative sizes. Comparing ENP for votes versus seats shows how the electoral system 
            affects party fragmentation. Higher values indicate a more fragmented party system.
          </p>
        </div>
      </div>
      
      <div className="metrics-explanation">
        <h4>Understanding Electoral Metrics</h4>
        <p>
          These metrics help assess how well the electoral system translates votes into representation. The D'Hondt PR system used for Senedd elections aims to balance 
          proportionality with the need for stable government. While perfect proportionality is rarely achieved, 
          these indices help evaluate how closely seat allocation matches voter preferences.
        </p>
      </div>
    </div>
  );
}

export default ProportionalityMetrics;