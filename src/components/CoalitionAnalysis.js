import React from 'react';
import { formatDecimal, formatPartyName, getPartyColor } from '../utils/formatting';
import { getPartyCompatibility, partyIdeology } from '../utils/coalitionUtils';

/**
 * Component to display detailed analysis of a selected coalition
 * @param {Object} props
 * @param {Object} props.coalition - Selected coalition object
 * @param {Object} props.seatTotals - Total seats by party
 * @param {Number} props.majorityThreshold - Seats needed for a majority
 */
function CoalitionAnalysis({ coalition, seatTotals, majorityThreshold }) {
  if (!coalition) {
    return <div className="coalition-analysis empty">Select a coalition to see detailed analysis</div>;
  }
  
  // Sort parties by seat count (descending)
  const sortedParties = [...coalition.parties].sort(
    (a, b) => coalition.partySeatCounts[b] - coalition.partySeatCounts[a]
  );
  
  // Calculate party pair compatibility scores
  const partyPairs = [];
  for (let i = 0; i < sortedParties.length; i++) {
    for (let j = i + 1; j < sortedParties.length; j++) {
      const party1 = sortedParties[i];
      const party2 = sortedParties[j];
      const compatibility = getPartyCompatibility(party1, party2);
      
      partyPairs.push({
        party1,
        party2,
        compatibility
      });
    }
  }
  
  // Determine coalition type characteristics
  const isMinimalConnected = coalition.isMinimalConnected;
  const isMinimumWinning = coalition.isMinimumWinning;
  const isOversized = coalition.isOversized;
  const isIdeologicallyCoherent = coalition.compatibility.ideologicalRange < 3;
  
  // Get the theoretical name for this coalition
  const getTheoreticalCoalitionName = () => {
    if (sortedParties.length === 1) {
      return "Single Party Government";
    } else if (isMinimalConnected && isMinimumWinning) {
      return "Minimum Connected Winning Coalition (Axelrod/Riker)";
    } else if (isMinimalConnected) {
      return "Minimal Connected Winning Coalition (Axelrod)";
    } else if (isMinimumWinning) {
      return "Minimum Winning Coalition (Riker)";
    } else if (isOversized) {
      return "Oversized Coalition";
    } else {
      return "Practical Coalition";
    }
  };
  
  return (
    <div className="coalition-analysis">
      <h3 className="analysis-title">
        Coalition Analysis: {sortedParties.map(formatPartyName).join(' + ')}
      </h3>
      
      <div className="coalition-theory-classification">
        <h4>Theoretical Classification</h4>
        <div className="theory-classification">
          <p className="coalition-type">{getTheoreticalCoalitionName()}</p>
          
          <div className="theory-properties">
            <div className="property">
              <span className="property-name">Minimal Connected:</span>
              <span className={`property-value ${isMinimalConnected ? 'positive' : 'negative'}`}>
                {isMinimalConnected ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="property">
              <span className="property-name">Minimum Winning:</span>
              <span className={`property-value ${isMinimumWinning ? 'positive' : 'negative'}`}>
                {isMinimumWinning ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="property">
              <span className="property-name">Ideologically Coherent:</span>
              <span className={`property-value ${isIdeologicallyCoherent ? 'positive' : 'negative'}`}>
                {isIdeologicallyCoherent ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="property">
              <span className="property-name">Excess Seats:</span>
              <span className="property-value">
                {coalition.excessSeats} over majority
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="coalition-compatibility">
        <h4>Ideological Positioning</h4>
        
        {/* Ideological spectrum visualization */}
        <div className="ideology-spectrum">
          <div className="spectrum-scale">
            <span className="scale-label left">Left</span>
            <span className="scale-label center">Center</span>
            <span className="scale-label right">Right</span>
          </div>
          
          <div className="spectrum-track">
            {sortedParties.map(party => (
              <div 
                key={`ideology-${party}`}
                className="party-position"
                style={{
                  left: `${(partyIdeology[party] / 10) * 100}%`,
                  backgroundColor: getPartyColor(party)
                }}
                title={`${formatPartyName(party)}: ${partyIdeology[party]}`}
              >
                <span className="party-label">{formatPartyName(party).charAt(0)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Party pair compatibility table */}
        <div className="party-compatibility">
          <h4>Party Pair Compatibility</h4>
          <div className="compatibility-pairs">
            {partyPairs.map((pair, index) => (
              <div 
                key={`pair-${index}`} 
                className={`compatibility-pair ${
                  pair.compatibility > 2 ? 'high-compatibility' :
                  pair.compatibility > 0 ? 'medium-compatibility' : 'low-compatibility'
                }`}
              >
                <div className="pair-parties">
                  <span 
                    className="pair-party" 
                    style={{ backgroundColor: getPartyColor(pair.party1) }}
                  >
                    {formatPartyName(pair.party1)}
                  </span>
                  <span className="pair-connector">+</span>
                  <span 
                    className="pair-party"
                    style={{ backgroundColor: getPartyColor(pair.party2) }}
                  >
                    {formatPartyName(pair.party2)}
                  </span>
                </div>
                <div className="pair-score">
                  <div className="score-bar-container">
                    <div 
                      className="score-bar"
                      style={{ 
                        width: `${Math.max(0, ((pair.compatibility + 10) / 20) * 100)}%`,
                        backgroundColor: pair.compatibility > 2 ? '#4ade80' : 
                                        pair.compatibility > 0 ? '#facc15' : '#f87171'
                      }}
                    ></div>
                  </div>
                  <span className="score-value">{formatDecimal(pair.compatibility, 1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="coalition-power-distribution">
        <h4>Power Distribution</h4>
        
        {/* Seat and power distribution */}
        <div className="power-table">
          <div className="power-header">
            <div className="power-cell">Party</div>
            <div className="power-cell">Seats</div>
            <div className="power-cell">% of Coalition</div>
            <div className="power-cell">% of Senedd</div>
          </div>
          
          {sortedParties.map(party => {
            const partySeats = coalition.partySeatCounts[party];
            const percentOfCoalition = (partySeats / coalition.seats) * 100;
            const percentOfSenedd = (partySeats / Object.values(seatTotals).reduce((a, b) => a + b, 0)) * 100;
            
            return (
              <div key={`power-${party}`} className="power-row">
                <div 
                  className="power-cell party"
                  style={{ borderLeftColor: getPartyColor(party) }}
                >
                  {formatPartyName(party)}
                </div>
                <div className="power-cell seats">{partySeats}</div>
                <div className="power-cell percent-coalition">
                  {formatDecimal(percentOfCoalition, 1)}%
                </div>
                <div className="power-cell percent-senedd">
                  {formatDecimal(percentOfSenedd, 1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="coalition-notes">
        <h4>Analysis Notes</h4>
        <p>
          {isMinimalConnected ? (
            <span>
              This coalition follows Axelrod's minimal connected winning theory, consisting of 
              ideologically adjacent parties with no unnecessary members.
            </span>
          ) : isMinimumWinning ? (
            <span>
              This coalition follows Riker's minimum winning coalition theory, representing the 
              smallest possible majority, but includes some ideological diversity.
            </span>
          ) : isOversized ? (
            <span>
              This oversized coalition includes more parties than necessary for a majority, 
              which contradicts both Axelrod's and Riker's theories but may provide greater stability.
            </span>
          ) : (
            <span>
              This coalition balances practical considerations with ideological compatibility,
              and represents a workable compromise.
            </span>
          )}
        </p>
        
        <p>
          Overall compatibility: {
            coalition.compatibility.averageCompatibility > 5 ? 'Very High' :
            coalition.compatibility.averageCompatibility > 2 ? 'High' :
            coalition.compatibility.averageCompatibility > 0 ? 'Moderate' :
            coalition.compatibility.averageCompatibility > -2 ? 'Low' : 'Very Low'
          } ({formatDecimal(coalition.compatibility.averageCompatibility, 1)})
        </p>
      </div>
    </div>
  );
}

export default CoalitionAnalysis;