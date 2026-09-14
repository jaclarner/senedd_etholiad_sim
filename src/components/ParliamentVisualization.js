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
      setSeats(generateParliamentSeats(seatTotals, totalSeats));
    } else {
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
 * Generate seat positions for a hemicycle.
 *
 * All parties share the same concentric rows, and seats are filled in political
 * order sweeping from the left of the chamber to the right. Each party therefore
 * occupies one continuous wedge spanning every row, which is how parliament
 * diagrams are normally drawn.
 *
 * @param {Object} seatTotals - Seats held by each party
 * @param {Number} totalSeats - Total seats to place
 * @returns {Array} Seat objects with position, party and abbreviation
 */
function generateParliamentSeats(seatTotals, totalSeats) {
  if (totalSeats <= 0) return [];

  // Geometry of the chamber within the 1000x500 viewBox
  const centerX = 500;
  const baseY = 455;
  const outerRadius = 395;
  const innerRadius = 170;

  // More seats need more rows to stay legible
  const rowCount = totalSeats > 80 ? 6 : totalSeats > 40 ? 5 : totalSeats > 18 ? 3 : 2;

  // Row radii, evenly spaced from the inner row outwards
  const radii = [];
  for (let row = 0; row < rowCount; row++) {
    const t = rowCount === 1 ? 1 : row / (rowCount - 1);
    radii.push(innerRadius + (outerRadius - innerRadius) * t);
  }

  // Seats per row in proportion to each row's arc length, which scales with radius
  const totalRadius = radii.reduce((sum, r) => sum + r, 0);
  const seatsPerRow = radii.map(r => Math.max(1, Math.round((totalSeats * r) / totalRadius)));

  // Rounding rarely lands on exactly totalSeats, so correct from the outside in
  let drift = totalSeats - seatsPerRow.reduce((sum, n) => sum + n, 0);
  let cursor = seatsPerRow.length - 1;
  while (drift !== 0) {
    const step = drift > 0 ? 1 : -1;
    if (seatsPerRow[cursor] + step >= 1) {
      seatsPerRow[cursor] += step;
      drift -= step;
    }
    cursor = (cursor - 1 + seatsPerRow.length) % seatsPerRow.length;
  }

  // Build every seat position, then order them left to right across the whole arc
  const positions = [];
  radii.forEach((radius, row) => {
    const seatsInRow = seatsPerRow[row];

    for (let i = 0; i < seatsInRow; i++) {
      // Fraction along the row, inset slightly so seats clear the chamber floor
      const t = seatsInRow === 1 ? 0.5 : i / (seatsInRow - 1);
      const inset = 0.5 + (t - 0.5) * 0.94;

      // Angle pi points to the left of the chamber, 0 to the right
      const angle = Math.PI * (1 - inset);

      positions.push({
        row,
        angle,
        x: centerX + radius * Math.cos(angle),
        y: baseY - radius * Math.sin(angle)
      });
    }
  });

  // Sweep from the left of the chamber (angle pi) round to the right (angle 0)
  positions.sort((a, b) => b.angle - a.angle || a.row - b.row);

  // Seating order, left wing through to right wing
  const politicalOrder = [
    'Greens', 'PlaidCymru', 'Labour', 'LibDems', 'Conservatives', 'Reform', 'Other'
  ];

  const seatedParties = politicalOrder.filter(party => seatTotals[party] > 0);

  // Any party missing from the ordering still needs a place
  Object.keys(seatTotals).forEach(party => {
    if (!politicalOrder.includes(party) && seatTotals[party] > 0) {
      seatedParties.push(party);
    }
  });

  const abbreviations = {
    PlaidCymru: 'PC',
    Conservatives: 'C',
    Labour: 'L',
    LibDems: 'LD',
    Greens: 'G',
    Reform: 'R',
    Other: 'O'
  };

  const seats = [];
  let positionIndex = 0;

  seatedParties.forEach(party => {
    for (let i = 0; i < seatTotals[party]; i++) {
      const position = positions[positionIndex];
      if (!position) return;
      positionIndex += 1;

      seats.push({
        x: position.x,
        y: position.y,
        party,
        abbrev: abbreviations[party] || party.slice(0, 2).toUpperCase()
      });
    }
  });

  return seats;
}

export default ParliamentVisualization;
