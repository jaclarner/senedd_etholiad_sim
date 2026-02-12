import React, { useState, useEffect, useRef } from 'react';
import { formatDecimal, formatPartyName, getPartyColor } from '../utils/formatting';

/**
 * Component to visualize and explain the D'Hondt allocation process with uncertainty
 * @param {Object} props
 * @param {Array} props.allocationHistory - History of D'Hondt allocation steps
 * @param {Object} props.seatStability - Stability data for allocated seats
 * @param {Object} props.votesNeededToChange - Information about votes needed to change outcome
 */
function DHondtExplainer({ allocationHistory, seatStability, votesNeededToChange }) {
  // State to track current round
  const [currentRound, setCurrentRound] = useState(0);
  // State to control animation
  const [isPlaying, setIsPlaying] = useState(false);
  // Reference for animation timer
  const animationTimerRef = useRef(null);
  
  // Validate input data to prevent rendering errors
  const validAllocationHistory = Array.isArray(allocationHistory) && allocationHistory.length > 0 
    ? allocationHistory 
    : [{ quotients: [], winner: null }];
  
  // Control animation playback
  useEffect(() => {
    if (isPlaying) {
      // Start animation timer
      animationTimerRef.current = setInterval(() => {
        setCurrentRound(prevRound => {
          const nextRound = prevRound + 1;
          // Stop at the end of allocation
          if (nextRound >= validAllocationHistory.length) {
            setIsPlaying(false);
            clearInterval(animationTimerRef.current);
            return prevRound;
          }
          return nextRound;
        });
      }, 1500); // 1.5 seconds per step
    } else {
      // Clear timer when paused
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [isPlaying, validAllocationHistory.length]);
  
  // Handle slider change
  const handleSliderChange = (e) => {
    setCurrentRound(parseInt(e.target.value));
    setIsPlaying(false); // Pause when manually changing
  };
  
  // Toggle animation playback
  const togglePlayback = () => {
    if (currentRound >= validAllocationHistory.length - 1) {
      // If at the end, restart from beginning
      setCurrentRound(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };
  
  // Reset animation
  const resetAnimation = () => {
    setCurrentRound(0);
    setIsPlaying(false);
  };
  
  // Skip to end
  const skipToEnd = () => {
    setCurrentRound(validAllocationHistory.length - 1);
    setIsPlaying(false);
  };
  
  // Get current allocation data
  const currentAllocation = validAllocationHistory[currentRound] || validAllocationHistory[0];
  
  // Sort quotients by value
  const sortedQuotients = [...(currentAllocation.quotients || [])].sort((a, b) => b.quotient - a.quotient);
  
  // Get seat distribution for current round
  const seatDistribution = {};
  
  // Initialize with zero seats
  sortedQuotients.forEach(q => {
    seatDistribution[q.party] = q.seats;
  });
  
  // Create explanation for the current round
  let explanation = '';
  if (currentRound === 0) {
    explanation = 'Initial state: Each party\'s vote share is shown before any seats are allocated.';
  } else {
    const winningParty = currentAllocation.winner;
    explanation = `Round ${currentRound}: A seat was awarded to ${formatPartyName(winningParty)} with a quotient of ${formatDecimal(sortedQuotients.find(q => q.party === winningParty)?.quotient || 0, 1)}.`;
  }
  
  // Get stability class for each seat
  const getStabilityClass = (stability) => {
    switch (stability) {
      case "solid": return "seat-solid";
      case "leaning": return "seat-leaning";
      case "toss-up": return "seat-toss-up";
      default: return "";
    }
  };

  return (
    <div className="dhondt-visualization">
      <div className="visualization-controls">
        <div className="animation-buttons">
          <button 
            className="btn btn-secondary"
            onClick={resetAnimation}
            aria-label="Reset animation"
          >
            ⏮️ Reset
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? "⏸️ Pause" : "▶️ Play"}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={skipToEnd}
            aria-label="Skip to end"
          >
            ⏭️ End
          </button>
        </div>
        
        <div className="slider-container">
          <label htmlFor="round-slider">
            Allocation Round: {currentRound} of {validAllocationHistory.length - 1}
          </label>
          <input 
            type="range" 
            id="round-slider" 
            min="0" 
            max={validAllocationHistory.length - 1} 
            value={currentRound}
            onChange={handleSliderChange}
            className="round-slider"
          />
        </div>
      </div>
      
      <div className="animation-explanation">
        <p>{explanation}</p>
      </div>
      
      <div className="visualization-grid">
        {/* Left side: Quotient table */}
        <div className="quotient-table">
          <h4>D'Hondt Quotients</h4>
          <table className="allocation-table">
            <thead>
              <tr>
                <th>Party</th>
                <th>Votes</th>
                <th>Divisor</th>
                <th>Quotient</th>
                <th>Seats</th>
              </tr>
            </thead>
            <tbody>
              {sortedQuotients.slice(0, 10).map((q, index) => {
                // Determine if this row should be highlighted based on actual seat allocation
                const isWinningRow = index === 0 && currentRound > 0;
                
                // These determine special highlighting for rows
                const isLastAllocatedSeat = q.seats > 0 && index === sortedQuotients.filter(q => q.seats > 0).length - 1;
                const isFirstUnallocatedSeat = q.seats === 0 && sortedQuotients.filter(sq => sq.seats > 0).length === index;
                
                return (
                  <tr 
                    key={`${q.party}-${index}`}
                    className={`
                      ${isWinningRow ? "winning-row" : ""}
                      ${isLastAllocatedSeat ? "last-seat-row" : ""}
                      ${isFirstUnallocatedSeat ? "first-unallocated-row" : ""}
                    `}
                  >
                    <td>
                      <span 
                        className="party-color-indicator" 
                        style={{backgroundColor: getPartyColor(q.party)}}
                      ></span>
                      {formatPartyName(q.party)}
                    </td>
                    <td className="truncate-text">{formatDecimal(q.votes, 1)}</td>
                    <td>{q.seats + 1}</td>
                    <td className="quotient-cell">{formatDecimal(q.quotient, 1)}</td>
                    <td>{q.seats}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Right side: Progressive seat allocation visualization */}
        <div className="seat-allocation">
          <h4>Seat Allocation</h4>
          <div className="seat-allocation-grid">
            {Array.from({ length: 6 }).map((_, i) => {
              // Find which party won this seat (if allocated yet)
              let seatWinner = null;
              let roundWon = null;
              
              // Check if this seat has been allocated in the current round
              for (let round = 1; round <= currentRound && round < validAllocationHistory.length; round++) {
                if (i === round - 1) {
                  seatWinner = validAllocationHistory[round].winner;
                  roundWon = round;
                  break;
                }
              }
              
              // Determine stability class if seat is allocated
              let stabilityClass = "";
              if (seatWinner && seatStability && i < seatStability.length) {
                // Get information about this specific seat from seatStability
                const seatInfo = seatStability.find(seat => seat.party === seatWinner);
                if (seatInfo) {
                  stabilityClass = getStabilityClass(seatInfo.stability);
                }
              }
              
              return (
                <div 
                  key={`seat-${i}`} 
                  className={`seat ${seatWinner ? 'allocated' : ''} ${stabilityClass}`}
                  style={{
                    backgroundColor: seatWinner ? getPartyColor(seatWinner) : '#e5e7eb'
                  }}
                >
                  {seatWinner && (
                    <div className="seat-info">
                      <span className="seat-round">{roundWon}</span>
                      <span className="seat-party truncate-text">{formatPartyName(seatWinner)}</span>
                      {stabilityClass === 'seat-toss-up' && (
                        <span className="seat-stability-indicator">Toss-up</span>
                      )}
                      {stabilityClass === 'seat-leaning' && (
                        <span className="seat-stability-indicator">Leaning</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Current seat totals */}
          <div className="current-seat-totals">
            <h5>Current Seat Totals</h5>
            <div className="seat-totals-grid">
              {Object.keys(seatDistribution)
                .filter(party => seatDistribution[party] > 0)
                .sort((a, b) => seatDistribution[b] - seatDistribution[a])
                .map(party => (
                  <div key={`total-${party}`} className="party-total">
                    <span 
                      className="party-color-block" 
                      style={{ backgroundColor: getPartyColor(party) }}
                    ></span>
                    <span className="party-name truncate-text">{formatPartyName(party)}</span>
                    <span className="party-seats">{seatDistribution[party]}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Sixth Seat Tipping Point */}
      <div className="uncertainty-analysis">
        <h4>Sixth Seat Tipping Point</h4>
        
        <div className="explanation">
          <p>This analysis shows how much vote share would need to change for the final seat allocation to be different.</p>
        </div>
        
        {votesNeededToChange && votesNeededToChange.possible ? (
          <div className="tipping-point-card primary-scenario">
            <div className="scenario-header">
              <h5>Sixth Seat Contest</h5>
              <div className={`probability-badge ${
                votesNeededToChange.votesNeeded < 1 ? 'high' : 
                votesNeededToChange.votesNeeded < 3 ? 'medium' : 'low'
              }`}>
                {votesNeededToChange.votesNeeded < 1 ? 'Highly Possible' : 
                votesNeededToChange.votesNeeded < 3 ? 'Possible' : 'Less Likely'}
              </div>
            </div>
            
            <div className="parties-container">
              <div className="party-badge" style={{backgroundColor: getPartyColor(votesNeededToChange.lastSeatParty)}}>
                {formatPartyName(votesNeededToChange.lastSeatParty)}
              </div>
              
              <div className="direction-arrow">
                ⟶
              </div>
              
              <div className="party-badge" style={{backgroundColor: getPartyColor(votesNeededToChange.challengerParty)}}>
                {formatPartyName(votesNeededToChange.challengerParty)}
              </div>
            </div>
            
            <div className="shift-needed">
              <div className="shift-description">
                <p>
                  If {formatPartyName(votesNeededToChange.lastSeatParty)} loses {formatDecimal(Math.abs(votesNeededToChange.votesNeeded), 1)}% 
                  vote share to {formatPartyName(votesNeededToChange.challengerParty)}
                </p>
              </div>
              
              <div className={`shift-value ${
                votesNeededToChange.votesNeeded < 1 ? 'high' : 
                votesNeededToChange.votesNeeded < 3 ? 'medium' : 'low'
              }`}>
                {formatDecimal(Math.abs(votesNeededToChange.votesNeeded), 1)}%
              </div>
            </div>
            
            <div className="outcome">
              <strong>Outcome:</strong> {formatPartyName(votesNeededToChange.challengerParty)} would win the final seat instead of {formatPartyName(votesNeededToChange.lastSeatParty)}
            </div>
          </div>
        ) : (
          <div className="no-tipping-points">
            <p>Unable to calculate tipping point for the current allocation.</p>
          </div>
        )}
        
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
      
      <div className="dhondt-explanation">
        <h4>How D'Hondt Works</h4>
        <p>The D'Hondt method allocates seats one by one, following these steps:</p>
        <ol>
          <li>Divide each party's votes by 1, 2, 3, etc. (based on how many seats they've already won + 1)</li>
          <li>Find the highest quotient after each division</li>
          <li>Award a seat to the party with the highest quotient</li>
          <li>Repeat until all seats are allocated</li>
        </ol>
        <p>
          This creates a proportional system where larger parties typically win more seats, but smaller 
          parties can still win representation if they have significant vote share. The final seats 
          allocated are often the most uncertain and can change with small vote shifts.
        </p>
      </div>
    </div>
  );
}

export default DHondtExplainer;