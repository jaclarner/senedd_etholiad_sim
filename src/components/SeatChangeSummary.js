import React from 'react';
import { formatPartyName, getPartyColor } from '../utils/formatting';

/**
 * Compares a simulated seat allocation against the actual 2026 result.
 *
 * @param {Object} props
 * @param {Object} props.actual - Seats each party actually won in 2026
 * @param {Object} props.simulated - Seats each party wins in the current scenario
 * @param {String} props.actualLabel - Column heading for the 2026 figures
 * @param {Boolean} props.compact - Render the tighter constituency-level variant
 */
function SeatChangeSummary({ actual = {}, simulated = {}, actualLabel = '2026', compact = false }) {
  // Show every party that either won seats in 2026 or wins them in this scenario
  const parties = Array.from(new Set([...Object.keys(actual), ...Object.keys(simulated)]))
    .filter(party => (actual[party] || 0) > 0 || (simulated[party] || 0) > 0)
    .sort((a, b) =>
      (simulated[b] || 0) - (simulated[a] || 0) ||
      (actual[b] || 0) - (actual[a] || 0)
    );

  // Total seats moving between parties, counted once rather than twice
  const seatsChangingHands = parties.reduce(
    (sum, party) => sum + Math.max(0, (simulated[party] || 0) - (actual[party] || 0)),
    0
  );

  const formatChange = (change) => (change > 0 ? `+${change}` : `${change}`);
  const changeClass = (change) => (change > 0 ? 'positive' : change < 0 ? 'negative' : 'unchanged');

  return (
    <div className={`seat-change ${compact ? 'seat-change-compact' : ''}`}>
      <table className="seat-change-table">
        <thead>
          <tr>
            <th scope="col" className="seat-change-party">Party</th>
            <th scope="col">{actualLabel}</th>
            <th scope="col">This scenario</th>
            <th scope="col">Change</th>
          </tr>
        </thead>
        <tbody>
          {parties.map(party => {
            const actualSeats = actual[party] || 0;
            const simulatedSeats = simulated[party] || 0;
            const change = simulatedSeats - actualSeats;

            return (
              <tr key={party}>
                <th scope="row" className="seat-change-party">
                  <span
                    className="seat-change-swatch"
                    style={{ backgroundColor: getPartyColor(party) }}
                  />
                  {formatPartyName(party)}
                </th>
                <td>{actualSeats}</td>
                <td className="seat-change-simulated">{simulatedSeats}</td>
                <td className={`seat-change-delta ${changeClass(change)}`}>
                  {change === 0 ? '—' : formatChange(change)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="seat-change-note">
        {seatsChangingHands === 0
          ? `Identical to the ${actualLabel} result.`
          : `${seatsChangingHands} ${seatsChangingHands === 1 ? 'seat changes' : 'seats change'} hands compared with ${actualLabel}.`}
      </p>
    </div>
  );
}

export default SeatChangeSummary;
