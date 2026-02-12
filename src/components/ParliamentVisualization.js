import React, { useEffect, useState } from 'react';
import { formatPartyName, getPartyColor, getContrastText } from '../utils/formatting';

/**
 * Component to visualize seat distribution in a semicircular parliament layout
 * @param {Object} props
 * @param {Object} props.seatTotals - Object with party names as keys and seat counts as values
 * @param {Number} props.majorityThreshold - Number of seats needed for a majority
 */
function ParliamentVisualization({ seatTotals, majorityThreshold }) {
  // State to store calculated seat positions
  const [seats, setSeats] = useState([]);
  
  // Calculate total seats for layout purposes
  const totalSeats = Object.values(seatTotals).reduce((sum, count) => sum + count, 0);
  
  // Sort parties by seat count (descending)
  const sortedParties = Object.keys(seatTotals)
    .filter(party => seatTotals[party] > 0)
    .sort((a, b) => seatTotals[b] - seatTotals[a]);
  
  // Generate seat positions when seatTotals change
  useEffect(() => {
    // Only proceed if we have actual data
    if (totalSeats > 0) {
      console.log("Generating seats for:", seatTotals, "total:", totalSeats);
      const generatedSeats = generateParliamentSeats(seatTotals, totalSeats);
      setSeats(generatedSeats);
      console.log("Generated seats:", generatedSeats.length);
    } else {
      console.log("No seats to generate - total seats:", totalSeats);
      setSeats([]);
    }
  }, [seatTotals, totalSeats]);
  
  return (
    <div className="parliament-visualization">
      <h3 className="visualization-title">Senedd Seat Distribution</h3>
      
      <div className="parliament-container">
        <svg 
          viewBox="0 0 1000 500" 
          className="parliament-svg"
          aria-labelledby="parliament-title parliament-desc"
        >
          <title id="parliament-title">Senedd seat distribution</title>
          <desc id="parliament-desc">
            Visualization of seats in the Senedd arranged in a semicircular parliament layout.
          </desc>
          
          {/* Chamber outline */}
          <path 
            d={`M100,450 A400,400 0 0,1 900,450`} 
            fill="none" 
            stroke="#ccc" 
            strokeWidth="2" 
          />
          
          {/* Majority threshold line */}
          <line 
            x1="500" 
            y1="30" 
            x2="500" 
            y2="450" 
            stroke="#666" 
            strokeWidth="2" 
            strokeDasharray="8,4" 
          />
          <text 
            x="505" 
            y="50" 
            fill="#666" 
            fontWeight="bold" 
            fontSize="14"
          >
            Majority ({majorityThreshold} seats)
          </text>
          
          {/* Render the seats */}
          {seats.map((seat, index) => (
            <g key={`seat-${index}`}>
              <circle 
                cx={seat.x} 
                cy={seat.y} 
                r="18" 
                fill={getPartyColor(seat.party)} 
                stroke="#fff" 
                strokeWidth="1" 
              />
              {seat.abbrev && (
                <text 
                  x={seat.x} 
                  y={seat.y} 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fontSize={seat.abbrev.length > 1 ? "10" : "12"} 
                  fontWeight="bold" 
                  fill={getContrastText(getPartyColor(seat.party))}
                >
                  {seat.abbrev}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      
      {/* Legend for parties */}
      <div className="parliament-legend">
        {sortedParties.map(party => (
          <div key={party} className="legend-item">
            <span 
              className="color-box" 
              style={{ backgroundColor: getPartyColor(party) }}
            ></span>
            <span className="party-name">{formatPartyName(party)}: {seatTotals[party]} {seatTotals[party] === 1 ? 'seat' : 'seats'}</span>
            <span className="percentage">
              ({((seatTotals[party] / totalSeats) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper function to generate seat positions in a hemicycle layout with parties grouped
 * @param {Object} seatTotals - Object with party names as keys and seat counts as values
 * @param {Number} totalSeats - Total number of seats to display
 * @returns {Array} Array of seat objects with position and party information
 */
function generateParliamentSeats(seatTotals, totalSeats) {
  // Initialize empty array to hold all seat objects
  const seats = [];
  
  // Layout configuration for full 96-seat chamber
  const centerX = 500;  // Center of the SVG horizontally
  const baseY = 450;    // Bottom of the arc
  const radius = 340;   // Radius of the outer row
  const rowSpacing = 40; // Distance between rows
  const rowCount = 8;   // Fixed number of rows for 96 seats
  
  // Minimum angle width for small parties (in radians)
  // This ensures even parties with few seats get adequate space
  const minPartyAngle = 0.12; // About 7 degrees
  
  // Political ordering from left to right in the chamber
  // This defines the position in the hemicycle, with left-wing parties on the left,
  // centrists in the middle, and right-wing parties on the right
  const politicalOrder = [
    'Greens', 'PlaidCymru', 'Labour', 'LibDems', 'Conservatives', 'Reform', 'Other'
  ];
  
  // Filter to only include parties with seats
  const activeParties = politicalOrder.filter(party => seatTotals[party] && seatTotals[party] > 0);
  
  // Add any parties not in the political order that have seats
  Object.keys(seatTotals).forEach(party => {
    if (!politicalOrder.includes(party) && seatTotals[party] > 0) {
      activeParties.push(party);
    }
  });
  
  // Calculate the total angle of the hemicycle (180 degrees = π radians)
  const totalAngle = Math.PI;
  
  // First, calculate the minimum space needed for all parties
  let minRequiredAngle = 0;
  activeParties.forEach(party => {
    // For small parties, ensure they get at least the minimum angle
    if (seatTotals[party] <= 3) {
      minRequiredAngle += minPartyAngle;
    }
  });
  
  // Calculate how much angle is left for proportional distribution
  const remainingAngle = Math.max(0, totalAngle - minRequiredAngle);
  const remainingSeats = totalSeats - activeParties.filter(p => seatTotals[p] <= 3).reduce((sum, p) => sum + seatTotals[p], 0);
  
  // Divide the hemicycle into sections for each party
  // The angle size for each party is proportional to their seat count,
  // with a minimum for small parties
  let partyAngles = {};
  let startAngles = {};
  let endAngles = {};
  
  let currentAngle = 0;
  activeParties.forEach(party => {
    let partyAngle;
    
    // For small parties, use the minimum angle
    if (seatTotals[party] <= 3) {
      partyAngle = minPartyAngle;
    } else {
      // For larger parties, allocate space proportionally from the remaining angle
      partyAngle = (seatTotals[party] / remainingSeats) * remainingAngle;
    }
    
    partyAngles[party] = partyAngle;
    startAngles[party] = currentAngle;
    currentAngle += partyAngle;
    endAngles[party] = currentAngle;
  });
  
  // Now place seats for each party in their own section
  activeParties.forEach(party => {
    const partySeats = seatTotals[party];
    const partyStartAngle = startAngles[party];
    const partySectionAngle = partyAngles[party];
    
    // Skip if this party has no seats
    if (partySeats <= 0) return;
    
    // For parties with few seats, use a single row with wider spacing
    if (partySeats <= 3) {
      // Place all seats in a single outer row
      const rowRadius = radius - 50; // Place small parties a bit further in for better visibility
      
      // Determine how many seats to place
      for (let i = 0; i < partySeats; i++) {
        // Calculate even spacing across the section
        const angle = partyStartAngle + ((i + 0.5) / partySeats) * partySectionAngle;
        
        const x = centerX + rowRadius * Math.cos(angle);
        const y = baseY - rowRadius * Math.sin(angle);
        
        // Create abbreviation for the party
        const abbrev = party === 'PlaidCymru' ? 'PC' :
                     party === 'Conservatives' ? 'C' :
                     party === 'Labour' ? 'L' :
                     party === 'LibDems' ? 'LD' :
                     party === 'Greens' ? 'G' :
                     party === 'Reform' ? 'R' : 'O';
        
        // Add the seat
        seats.push({
          x,
          y,
          party,
          abbrev
        });
      }
    } else {
      // For parties with more seats, use the multi-row layout
      
      // Determine how many rows we'll use for this party
      // More seats = more rows (up to rowCount)
      const partyRowCount = Math.min(
        rowCount, 
        Math.max(2, Math.ceil(partySeats / 12))
      );
      
      // Calculate seats per row for this party
      // We want more seats in outer rows for better visibility
      const partyRowDistribution = calculatePartyRowDistribution(partySeats, partyRowCount);
      
      // For each row of this party's section
      let seatIndex = 0;
      for (let row = 0; row < partyRowCount; row++) {
        const rowRadius = radius - (row * rowSpacing);
        const seatsInRow = partyRowDistribution[row];
        
        // Skip empty rows
        if (seatsInRow <= 0) continue;
        
        // Calculate angle step for seats in this row
        const angleStep = partySectionAngle / (seatsInRow + 1);
        
        // Place each seat in this row
        for (let i = 0; i < seatsInRow; i++) {
          // Skip if we've already placed all seats for this party
          if (seatIndex >= partySeats) break;
          
          // Calculate position
          const angle = partyStartAngle + angleStep * (i + 1);
          const x = centerX + rowRadius * Math.cos(angle);
          const y = baseY - rowRadius * Math.sin(angle);
          
          // Create abbreviation for the party
          const abbrev = party === 'PlaidCymru' ? 'PC' :
                       party === 'Conservatives' ? 'C' :
                       party === 'Labour' ? 'L' :
                       party === 'LibDems' ? 'LD' :
                       party === 'Greens' ? 'G' :
                       party === 'Reform' ? 'R' : 'O';
          
          // Add the seat
          seats.push({
            x,
            y,
            party,
            abbrev
          });
          
          seatIndex++;
        }
      }
    }
  });
  
  return seats;
}

/**
 * Calculate distribution of seats across rows for a specific party
 * @param {Number} partySeats - Number of seats for this party
 * @param {Number} rowCount - Maximum number of rows to use
 * @returns {Array} Number of seats for each row
 */
function calculatePartyRowDistribution(partySeats, rowCount) {
  // For a full 96-seat chamber, we need a better distribution
  // that places more seats in outer rows but ensures good spacing
  
  // Create a distribution with more seats in outer rows and fewer in inner rows
  const distribution = [];
  
  // Set weights for each row - outer rows get higher weights
  const weights = [];
  for (let i = 0; i < rowCount; i++) {
    // Decreasing weights from outer to inner rows
    weights.push(2.0 - (i * (1.0 / rowCount)));
  }
  
  // Calculate total weight
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  // Calculate initial distribution
  let remainingSeats = partySeats;
  for (let i = 0; i < rowCount; i++) {
    // Calculate seats for this row based on weight
    const rowSeats = Math.round((weights[i] / totalWeight) * partySeats);
    // Ensure we don't allocate more seats than available
    const actualRowSeats = Math.min(rowSeats, remainingSeats);
    distribution.push(actualRowSeats);
    remainingSeats -= actualRowSeats;
  }
  
  // If we still have seats to distribute (due to rounding),
  // add them to rows that can fit more
  let row = 0;
  while (remainingSeats > 0) {
    distribution[row % rowCount]++;
    remainingSeats--;
    row++;
  }
  
  return distribution;
}

export default ParliamentVisualization;