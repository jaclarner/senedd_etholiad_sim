import React from 'react';
import hexCells from '../data/welshHexMap';
import { formatPartyName, getPartyColor, getContrastText } from '../utils/formatting';

// Hexagon geometry. Pointy-top hexes in an "odd-r" offset grid, so odd rows
// sit half a hexagon to the right.
const SIZE = 26;                        // centre to vertex
const WIDTH = Math.sqrt(3) * SIZE;      // flat-to-flat across
const ROW_HEIGHT = 1.5 * SIZE;          // vertical distance between row centres
const PADDING = SIZE + 4;

/**
 * Points of one pointy-top hexagon centred on (cx, cy)
 */
function hexPoints(cx, cy) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90);
    points.push(`${cx + SIZE * Math.cos(angle)},${cy + SIZE * Math.sin(angle)}`);
  }
  return points.join(' ');
}

/**
 * Hex cartogram of the 32 Welsh Westminster constituencies.
 *
 * Each constituency is one equally sized hexagon, filled with the colour of
 * the party projected to win it. Seats changing hands since 2024 are outlined.
 *
 * @param {Object} props
 * @param {Array} props.constituencyResults - Results from the FPTP engine
 */
function HexMap({ constituencyResults }) {
  // Look up each constituency's projected result by name
  const byName = {};
  (constituencyResults || []).forEach(result => {
    byName[result.constituency] = result;
  });

  const cols = Math.max(...hexCells.map(c => c.col)) + 1;
  const rows = Math.max(...hexCells.map(c => c.row)) + 1;

  // Odd rows are offset, so allow half a hex of extra width
  const svgWidth = PADDING * 2 + (cols - 1) * WIDTH + WIDTH / 2 + WIDTH;
  const svgHeight = PADDING * 2 + (rows - 1) * ROW_HEIGHT + SIZE;

  // Parties present, for the legend
  const seatCounts = {};
  hexCells.forEach(({ constituency }) => {
    const party = byName[constituency]?.winner;
    if (party) seatCounts[party] = (seatCounts[party] || 0) + 1;
  });
  const legendParties = Object.keys(seatCounts).sort((a, b) => seatCounts[b] - seatCounts[a]);

  const changedCount = hexCells.filter(({ constituency }) => byName[constituency]?.isGain).length;

  return (
    <div className="hex-map">
      <div className="hex-map-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="hex-map-svg"
          role="img"
          aria-label="Hex map of the 32 Welsh Westminster constituencies, coloured by projected winner"
        >
          {hexCells.map(({ code, constituency, col, row }) => {
            const result = byName[constituency];
            const party = result?.winner;
            const fill = party ? getPartyColor(party) : '#e5e7eb';
            const cx = PADDING + col * WIDTH + (row % 2 === 1 ? WIDTH / 2 : 0);
            const cy = PADDING + row * ROW_HEIGHT;

            return (
              <g key={code} className={result?.isGain ? 'hex-cell hex-gain' : 'hex-cell'}>
                <title>
                  {constituency}
                  {result
                    ? ` — ${formatPartyName(result.winner)} ${result.winnerShare.toFixed(1)}%` +
                      (result.isGain ? ` (gain from ${formatPartyName(result.previousWinner)})` : ' (hold)')
                    : ''}
                </title>
                <polygon
                  points={hexPoints(cx, cy)}
                  fill={fill}
                  stroke={result?.isGain ? '#111827' : '#ffffff'}
                  strokeWidth={result?.isGain ? 2.5 : 1.5}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fontWeight="600"
                  fill={getContrastText(fill)}
                  pointerEvents="none"
                >
                  {code}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="hex-map-legend">
        {legendParties.map(party => (
          <div key={party} className="legend-item">
            <span className="color-box" style={{ backgroundColor: getPartyColor(party) }} />
            <span className="party-name">
              {formatPartyName(party)}: {seatCounts[party]}
            </span>
          </div>
        ))}
        {changedCount > 0 && (
          <div className="legend-item">
            <span className="color-box hex-legend-gain" />
            <span className="party-name">Changes hands ({changedCount})</span>
          </div>
        )}
      </div>

      <p className="hex-map-note">
        Each hexagon is one constituency, sized equally rather than by area, so
        densely populated seats stay visible. Positions approximate where seats
        sit in Wales. Hover a hexagon for the full name and result.
      </p>
    </div>
  );
}

export default HexMap;
