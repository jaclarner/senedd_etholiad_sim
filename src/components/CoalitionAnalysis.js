import React from 'react';
import { formatDecimal, formatPartyName, getPartyColor } from '../utils/formatting';
import { partyIdeology, ideologicalBlocs } from '../utils/coalitionUtils';

/**
 * Simplified component to display coalition analysis focused on ideological groupings
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
  
  // Determine which ideological bloc this coalition represents
  const hasLeftParty = sortedParties.some(party => 
    ideologicalBlocs['Left Bloc'] && ideologicalBlocs['Left Bloc'].includes(party)
  );
  const hasRightParty = sortedParties.some(party => 
    ideologicalBlocs['Right Bloc'] && ideologicalBlocs['Right Bloc'].includes(party)
  );
  
  let blocType = "";
  if (hasLeftParty && !hasRightParty) {
    blocType = "Left-wing";
  } else if (hasRightParty && !hasLeftParty) {
    blocType = "Right-wing";
  } else if (hasLeftParty && hasRightParty) {
    blocType = "Cross-bloc";
  } else {
    blocType = "Centrist";
  }
  
  // Get color for compatibility indicator
  const getCompatibilityColor = (compatibility) => {
    if (compatibility > 5) return '#4ade80'; // Green
    if (compatibility > 0) return '#facc15'; // Yellow
    return '#f87171'; // Red
  };
  
  return (
    <div className="coalition-analysis">
      <h3 className="analysis-title">
        {coalition.coalitionType}: {sortedParties.map(formatPartyName).join(' + ')}
      </h3>
      
      <div className="coalition-overview">
        <div className="coalition-stats">
          <div className="stat-item">
            <span className="stat-label">Total Seats:</span>
            <span className="stat-value">{coalition.seats}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Majority Margin:</span>
            <span className="stat-value">{coalition.majority} seats</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Ideological Type:</span>
            <span className="stat-value">{blocType} Coalition</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Compatibility:</span>
            <span className="stat-value" style={{ 
              color: getCompatibilityColor(coalition.compatibility.averageCompatibility) 
            }}>
              {coalition.compatibility.averageCompatibility > 5 ? 'High' : 
               coalition.compatibility.averageCompatibility > 0 ? 'Moderate' : 'Low'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Ideological spectrum visualization */}
      <div className="ideology-spectrum">
        <h4>Ideological Positioning</h4>
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
      
      {/* Seat distribution */}
      <div className="seat-distribution">
        <h4>Seat Distribution</h4>
        <div className="coalition-bar">
          {sortedParties.map(party => (
            <div 
              key={`bar-${party}`}
              className="party-segment"
              style={{
                width: `${(coalition.partySeatCounts[party] / coalition.seats) * 100}%`,
                backgroundColor: getPartyColor(party)
              }}
              title={`${formatPartyName(party)}: ${coalition.partySeatCounts[party]} seats`}
            ></div>
          ))}
        </div>
        
        <div className="seat-distribution-table">
          {sortedParties.map(party => {
            const partySeats = coalition.partySeatCounts[party];
            const percentOfCoalition = (partySeats / coalition.seats) * 100;
            
            return (
              <div key={`dist-${party}`} className="seat-row">
                <div 
                  className="party-name"
                  style={{ borderLeftColor: getPartyColor(party) }}
                >
                  {formatPartyName(party)}
                </div>
                <div className="party-seats">{partySeats} seats</div>
                <div className="party-percent">
                  {formatDecimal(percentOfCoalition, 1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Analysis notes */}
      <div className="coalition-notes">
        <h4>Coalition Analysis</h4>
        
        {blocType === "Left-wing" && (
          <p>
            This is a left-wing coalition combining parties from the progressive side of Welsh politics.
            {sortedParties.includes('Labour') && sortedParties.includes('PlaidCymru') && 
              " Labour and Plaid Cymru have worked together in the past, with varying levels of formality."}
            {sortedParties.includes('LibDems') && 
              " The Liberal Democrats can provide additional support, though they typically maintain some independence."}
          </p>
        )}
        
        {blocType === "Right-wing" && (
          <p>
            This is a right-of-center coalition. 
            {sortedParties.includes('Conservatives') && sortedParties.includes('Reform') && 
              " The Conservatives and Reform UK represent different aspects of right-wing politics, with Reform taking more populist positions."}
            {sortedParties.includes('LibDems') && 
              " The Liberal Democrats can sometimes work with center-right parties on economic issues, though with significant policy differences on other matters."}
          </p>
        )}
        
        {blocType === "Cross-bloc" && (
          <p>
            This cross-bloc coalition would be unusual in Welsh politics, requiring significant compromise between parties with different ideological positions. Such arrangements are more typical during periods of political instability or deadlock.
            {sortedParties.includes('LibDems') && 
              " The Liberal Democrats could potentially act as a bridge between the different ideological camps."}
          </p>
        )}
        
        {blocType === "Centrist" && (
          <p>
            This centrist coalition would focus on moderate policies, likely emphasizing pragmatic governance over strong ideological positions.
          </p>
        )}
        
        <p>
          With a majority of {coalition.majority} seats, this coalition would 
          {coalition.majority > 5 ? ' have a comfortable working margin' : 
           coalition.majority > 2 ? ' have a workable but modest majority' : 
           ' need to maintain strong party discipline due to its narrow majority'}.
        </p>
      </div>
    </div>
  );
}

export default CoalitionAnalysis;