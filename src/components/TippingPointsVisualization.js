import React, { useMemo } from 'react';
import { formatPartyName, getPartyColor, formatDecimal } from '../utils/formatting';

/**
 * Component to visualize potential tipping points in seat allocation
 * @param {Object} props
 * @param {Object} props.votesNeededToChange - Primary tipping point data from engine
 * @param {Array} props.allQuotients - All quotients for calculating additional scenarios
 * @param {Number} props.seatsAllocated - Number of seats allocated (usually 6)
 */
function TippingPointsVisualization({ votesNeededToChange, allQuotients, seatsAllocated }) {
  // Use useMemo to avoid recalculating on every render
  const tippingPoints = useMemo(() => {
    // First, validate that we have enough quotient data
    if (!allQuotients || allQuotients.length <= seatsAllocated) {
      console.warn("Insufficient quotient data for tipping point analysis");
      return [];
    }
    
    return calculateAllTippingPoints(allQuotients, seatsAllocated);
  }, [allQuotients, seatsAllocated]);
  
  // If no tipping points could be calculated, show a placeholder
  if (tippingPoints.length === 0) {
    return (
      <div className="uncertainty-analysis">
        <h4>Seat Allocation Tipping Points</h4>
        <p className="no-data-message">
          Insufficient data to calculate tipping points for this allocation.
        </p>
      </div>
    );
  }
  
  // Determine primary scenario - use the first tipping point from our calculation
  // instead of using votesNeededToChange which may have inconsistencies
  const primaryScenario = tippingPoints[0];
  
  // Additional scenarios - filter out the primary one and take the next few
  const additionalScenarios = tippingPoints
    .filter((_, index) => index > 0)
    .slice(0, 3); // Limit to 3 additional scenarios
  
  return (
    <div className="uncertainty-analysis">
      <h4>Seat Allocation Tipping Points</h4>
      
      <div className="explanation">
        <p>This analysis shows exactly how much vote share would need to change to alter the seat allocation outcomes.</p>
        <p>Each scenario represents a potential change in results, with the most likely changes (requiring smaller shifts) highlighted.</p>
      </div>
      
      <div className="tipping-points">
        {/* Primary scenario */}
        <div className="tipping-point-card primary-scenario">
          <div className="scenario-header">
            <h5>Primary Scenario</h5>
            <div className={`probability-badge ${primaryScenario.probability}`}>
              {primaryScenario.probability === 'high' ? 'Highly Possible' : 
               primaryScenario.probability === 'medium' ? 'Possible' : 'Less Likely'}
            </div>
          </div>
          
          <div className="parties-container">
            <div className="party-badge" style={{backgroundColor: getPartyColor(primaryScenario.allocatedSeat.party)}}>
              {formatPartyName(primaryScenario.allocatedSeat.party)}
            </div>
            
            <div className="direction-arrow">
              ⟶
            </div>
            
            <div className="party-badge" style={{backgroundColor: getPartyColor(primaryScenario.challenger.party)}}>
              {formatPartyName(primaryScenario.challenger.party)}
            </div>
          </div>
          
          <div className="shift-needed">
            <div className="shift-description">
              <p>
                If {formatPartyName(primaryScenario.allocatedSeat.party)} loses {formatDecimal(Math.abs(primaryScenario.votesNeeded), 1)}% 
                vote share to {formatPartyName(primaryScenario.challenger.party)}
              </p>
            </div>
            
            <div className={`shift-value ${primaryScenario.probability}`}>
              {formatDecimal(Math.abs(primaryScenario.votesNeeded), 1)}%
            </div>
          </div>
          
          <div className="outcome">
            <strong>Outcome:</strong> {formatPartyName(primaryScenario.challenger.party)} would win a seat instead of {formatPartyName(primaryScenario.allocatedSeat.party)}
          </div>
        </div>
        
        {/* Additional scenarios */}
        {additionalScenarios.map((scenario, index) => (
          <div key={`scenario-${index}`} className="tipping-point-card secondary-scenario">
            <div className="scenario-header">
              <h5>Additional Scenario {index + 1}</h5>
              <div className={`probability-badge ${scenario.probability}`}>
                {scenario.probability === 'high' ? 'Highly Possible' : 
                 scenario.probability === 'medium' ? 'Possible' : 'Less Likely'}
              </div>
            </div>
            
            <div className="parties-container">
              <div className="party-badge" style={{backgroundColor: getPartyColor(scenario.allocatedSeat.party)}}>
                {formatPartyName(scenario.allocatedSeat.party)}
              </div>
              
              <div className="direction-arrow">
                ⟶
              </div>
              
              <div className="party-badge" style={{backgroundColor: getPartyColor(scenario.challenger.party)}}>
                {formatPartyName(scenario.challenger.party)}
              </div>
            </div>
            
            <div className="shift-needed">
              <div className="shift-description">
                <p>
                  If {formatPartyName(scenario.allocatedSeat.party)} loses {formatDecimal(Math.abs(scenario.votesNeeded), 1)}% 
                  vote share to {formatPartyName(scenario.challenger.party)}
                </p>
              </div>
              
              <div className={`shift-value ${scenario.probability}`}>
                {formatDecimal(Math.abs(scenario.votesNeeded), 1)}%
              </div>
            </div>
            
            <div className="outcome">
              <strong>Outcome:</strong> {formatPartyName(scenario.challenger.party)} would win a seat instead of {formatPartyName(scenario.allocatedSeat.party)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend for probability indicators */}
      <div className="stability-legend">
        <h5>Probability Legend</h5>
        <div className="stability-items">
          <div className="stability-item">
            <span className="probability-indicator high"></span>
            <span>Highly Possible: Could occur with very small vote changes (&lt;1%)</span>
          </div>
          <div className="stability-item">
            <span className="probability-indicator medium"></span>
            <span>Possible: Could occur with moderate vote shifts (1-3%)</span>
          </div>
          <div className="stability-item">
            <span className="probability-indicator low"></span>
            <span>Less Likely: Would require significant vote changes (&gt;3%)</span>
          </div>
        </div>
      </div>
      
      <div className="methodology-note">
        <p>Note: Tipping points are calculated using the D'Hondt quotient values from the table above. 
        Smaller percentage shifts indicate more uncertain seat allocations.</p>
      </div>
    </div>
  );
}

/**
 * Calculate all potential tipping points for seat allocations
 * This improved version correctly identifies vulnerabilities based on the D'Hondt quotient table
 * @param {Array} quotients - Current quotients from D'Hondt allocation
 * @param {Number} seatsAllocated - Number of seats allocated (usually 6)
 * @returns {Array} Array of tipping point scenarios
 */
function calculateAllTippingPoints(quotients, seatsAllocated) {
  if (!quotients || quotients.length === 0) {
    console.warn("No quotients provided to calculateAllTippingPoints");
    return [];
  }
  
  // Get a clean copy of quotients and sort them by quotient value (descending)
  // This ensures we're working with the exact order shown in the table
  const sortedQuotients = [...quotients].sort((a, b) => b.quotient - a.quotient);
  
  // Find allocated seats and unallocated seats based on position in sorted list
  const allocatedSeats = sortedQuotients.slice(0, seatsAllocated);
  const unallocatedSeats = sortedQuotients.slice(seatsAllocated);
  
  // If no unallocated seats, we can't calculate tipping points
  if (unallocatedSeats.length === 0) {
    console.warn("No unallocated seats available for tipping point calculation");
    return [];
  }
  
  // Sort allocated seats by quotient (ascending) to get most vulnerable first
  allocatedSeats.sort((a, b) => a.quotient - b.quotient);
  
  // Sort unallocated seats by quotient (descending) to get strongest challengers first
  unallocatedSeats.sort((a, b) => b.quotient - a.quotient);
  
  const tippingPoints = [];
  
  // Take the 3 most vulnerable allocated seats (lowest quotients)
  const vulnerableSeats = allocatedSeats.slice(0, 3);
  
  // And the 3 top challenger parties (highest unallocated quotients)
  const topChallengers = unallocatedSeats.slice(0, 3);
  
  // For each vulnerable seat, calculate potential tipping points with each challenger
  vulnerableSeats.forEach((seat) => {
    topChallengers.forEach((challenger) => {
      // Calculate the quotient gap
      const quotientGap = seat.quotient - challenger.quotient;
      
      // Calculate votes needed as percentage points
      const challengerDivisor = challenger.seats + 1;
      const votesNeeded = quotientGap * challengerDivisor;
      
      // Only include realistic scenarios (under 10% vote shift)
      if (votesNeeded < 10) {
        tippingPoints.push({
          allocatedSeat: seat,
          challenger: challenger,
          quotientGap: quotientGap,
          votesNeeded: votesNeeded,
          isLastSeat: seat === vulnerableSeats[0] && challenger === topChallengers[0],
          probability: votesNeeded < 1 ? 'high' : votesNeeded < 3 ? 'medium' : 'low'
        });
      }
    });
  });
  
  // Sort by votes needed (ascending)
  tippingPoints.sort((a, b) => a.votesNeeded - b.votesNeeded);
  
  return tippingPoints;
}

export default TippingPointsVisualization;