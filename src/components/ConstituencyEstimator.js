
import React, { useState, useEffect } from 'react';
import seneddConstituencies from '../data/seneddConstituencies';
import seneddBaseline, { actualSeats2026 } from '../data/seneddResults2026';
import DHondtExplainer from './DHondtExplainer';
import { dHondt } from '../utils/simulationUtils';
import { calculateVotesNeededToChange } from '../utils/simulationEngine';
import { formatPartyName, getPartyColor, formatDecimal } from '../utils/formatting';

// The seven parties in the simulator
const PARTIES = ['Labour', 'Conservatives', 'PlaidCymru', 'LibDems', 'Greens', 'Reform', 'Other'];

/**
 * Returns the actual 2026 vote shares for a Senedd constituency.
 */
function getBaselineFor(name) {
  const baseline = seneddBaseline[name] || {};
  const combined = {};
  PARTIES.forEach(party => { combined[party] = baseline[party] || 0; });
  return combined;
}

/**
 * Derives seat stability from D'Hondt allocation history.
 * Matches the stability logic in simulationEngine.js.
 */
function deriveSeatStability(allocationHistory) {
  const lastAllocation = allocationHistory[allocationHistory.length - 1];
  const sortedQuotients = [...lastAllocation.quotients].sort((a, b) => b.quotient - a.quotient);

  const lastAllocatedQuotient = sortedQuotients[5]?.quotient || 0;
  const firstNonAllocatedQuotient = sortedQuotients[6]?.quotient || 0;
  const relativeMargin = lastAllocatedQuotient > 0
    ? ((lastAllocatedQuotient - firstNonAllocatedQuotient) / lastAllocatedQuotient) * 100
    : 100;

  return sortedQuotients.slice(0, 6).map((q, i) => {
    let stability;
    if (i === 5) {
      stability = relativeMargin < 1 ? 'toss-up' : relativeMargin < 3 ? 'leaning' : 'solid';
    } else if (i === 4) {
      stability = relativeMargin < 5 ? 'leaning' : 'solid';
    } else {
      stability = 'solid';
    }
    return { party: q.party, stability };
  });
}

/**
 * Individual Constituency Estimator component.
 *
 * Lets users pick one of the 16 Senedd regions, adjust vote shares for that
 * area specifically, and see the D'Hondt seat allocation for those 6 seats.
 */
function ConstituencyEstimator() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [votes, setVotes] = useState({});
  const [dhondtResult, setDhondtResult] = useState(null);
  const [seatStability, setSeatStability] = useState([]);
  const [votesNeededToChange, setVotesNeededToChange] = useState(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const selectedConstituency = seneddConstituencies[selectedIndex];

  // Pre-fill vote shares from the 2026 result whenever the selected constituency changes
  useEffect(() => {
    if (!selectedConstituency) return;
    setVotes(getBaselineFor(selectedConstituency.name));
    setDhondtResult(null);
    setHasCalculated(false);
  }, [selectedIndex, selectedConstituency]);

  // Handle a change to any party's vote share input
  const handleVoteChange = (party, value) => {
    const num = parseFloat(value);
    setVotes(prev => ({ ...prev, [party]: isNaN(num) || num < 0 ? 0 : num }));
  };

  // Reset to the actual 2026 result for the selected constituency
  const handleReset = () => {
    if (!selectedConstituency) return;
    setVotes(getBaselineFor(selectedConstituency.name));
    setDhondtResult(null);
    setHasCalculated(false);
  };

  // Run the D'Hondt calculation for this constituency
  const handleCalculate = () => {
    // Normalise vote shares to 100% before running D'Hondt
    const sum = Object.values(votes).reduce((a, b) => a + b, 0);
    if (sum <= 0) return;

    const normalised = {};
    PARTIES.forEach(p => { normalised[p] = (votes[p] / sum) * 100; });

    const { results, allocationHistory } = dHondt(normalised, 6);

    // Build the sorted quotients array needed by calculateVotesNeededToChange
    const lastAllocation = allocationHistory[allocationHistory.length - 1];
    const sortedQuotients = [...lastAllocation.quotients].sort((a, b) => b.quotient - a.quotient);

    const stability = deriveSeatStability(allocationHistory);
    const tippingPoint = calculateVotesNeededToChange(sortedQuotients, 6, allocationHistory);

    setDhondtResult({ results, allocationHistory });
    setSeatStability(stability);
    setVotesNeededToChange(tippingPoint);
    setHasCalculated(true);
  };

  // Total of current inputs (used to show normalisation warning)
  const inputTotal = Object.values(votes).reduce((a, b) => a + b, 0);
  const showNormalisationWarning = Math.abs(inputTotal - 100) > 0.5;

  return (
    <div className="constituency-estimator">

      {/* ── Intro card ── */}
      <div className="card ce-intro">
        <h2>Individual Constituency Estimator</h2>
        <p>
          Select one of the 16 Senedd constituencies and adjust the vote shares for that area to see
          how its 6 seats would be allocated. Vote shares are pre-filled with the actual results of the
          2026 Senedd election in that constituency, so you can start from what really happened and
          change it.
        </p>
      </div>

      {/* ── Input card ── */}
      <div className="card ce-inputs">

        {/* Constituency selector */}
        <div className="ce-selector-row">
          <label htmlFor="ce-constituency-select" className="ce-label">
            <strong>Select Senedd Region:</strong>
          </label>
          <select
            id="ce-constituency-select"
            value={selectedIndex}
            onChange={e => setSelectedIndex(parseInt(e.target.value))}
            className="ce-select"
          >
            {seneddConstituencies.map((constituency, i) => (
              <option key={constituency.name} value={i}>
                {constituency.name} ({constituency.westminsterConstituencies.join(' + ')})
              </option>
            ))}
          </select>
        </div>

        {/* Party vote share sliders + number inputs */}
        <div className="ce-party-inputs">
          <h3>Vote Shares for <em>{selectedConstituency?.name}</em></h3>
          <p className="ce-hint">
            Adjust the sliders or type values directly. Numbers are normalised to 100% when calculating.
          </p>

          {PARTIES.map(party => (
            <div key={party} className="ce-party-row">
              <div
                className="ce-party-swatch"
                style={{ backgroundColor: getPartyColor(party) }}
              />
              <span className="ce-party-name">{formatPartyName(party)}</span>

              <input
                type="range"
                min="0"
                max="70"
                step="0.5"
                value={votes[party] || 0}
                onChange={e => handleVoteChange(party, e.target.value)}
                className="ce-slider"
                style={{ accentColor: getPartyColor(party) }}
              />

              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formatDecimal(votes[party] || 0, 1)}
                onChange={e => handleVoteChange(party, e.target.value)}
                className="ce-number-input"
              />
              <span className="ce-pct-label">%</span>
            </div>
          ))}

          {/* Total indicator */}
          <div className={`ce-total ${showNormalisationWarning ? 'ce-total-warn' : 'ce-total-ok'}`}>
            Total: {formatDecimal(inputTotal, 1)}%
            {showNormalisationWarning && (
              <span className="ce-normalise-note"> — will be normalised to 100% on calculate</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="ce-buttons">
          <button className="btn btn-primary" onClick={handleCalculate}>
            Calculate Seats
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset to 2026 Result
          </button>
        </div>
      </div>

      {/* ── Results card ── */}
      {hasCalculated && dhondtResult && (
        <div className="card ce-results">
          <h3>Results for {selectedConstituency?.name}</h3>
          <p className="ce-pairing-note">
            Covers: {selectedConstituency?.westminsterConstituencies.join(' + ')}
          </p>
          <p className="ce-pairing-note">
            <strong>Actual 2026 result:</strong>{' '}
            {PARTIES
              .filter(p => (actualSeats2026[selectedConstituency?.name] || {})[p] > 0)
              .map(p => `${formatPartyName(p)} ${actualSeats2026[selectedConstituency.name][p]}`)
              .join(', ')}
          </p>

          {/* Seat summary badges */}
          <div className="ce-seat-summary">
            {Object.entries(dhondtResult.results)
              .filter(([, seats]) => seats > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([party, seats]) => (
                <div
                  key={party}
                  className="ce-seat-badge"
                  style={{ backgroundColor: getPartyColor(party) }}
                >
                  <span className="ce-badge-party">{formatPartyName(party)}</span>
                  <span className="ce-badge-seats">{seats} seat{seats !== 1 ? 's' : ''}</span>
                </div>
              ))
            }
          </div>

          {/* Full D'Hondt breakdown (reuses the existing DHondtExplainer component) */}
          <DHondtExplainer
            allocationHistory={dhondtResult.allocationHistory}
            seatStability={seatStability}
            votesNeededToChange={votesNeededToChange}
          />
        </div>
      )}
    </div>
  );
}

export default ConstituencyEstimator;