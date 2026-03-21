
import React, { useState, useEffect } from 'react';
import constituencyPairingsData from '../data/constituencyPairings';
import baselineVotes from '../data/baselineVotes';
import constituencyVoters from '../data/constituencyVoters';
import DHondtExplainer from './DHondtExplainer';
import { dHondt } from '../utils/simulationUtils';
import { calculateVotesNeededToChange } from '../utils/simulationEngine';
import { formatPartyName, getPartyColor, formatDecimal } from '../utils/formatting';

// The seven parties in the simulator
const PARTIES = ['Labour', 'Conservatives', 'PlaidCymru', 'LibDems', 'Greens', 'Reform', 'Other'];

/**
 * Combines baseline vote shares from two UK constituencies, weighted by electorate size.
 * Mirrors the logic in simulationEngine.js so results are consistent.
 */
function getBaselineForPairing(c1, c2) {
  const votes1 = baselineVotes[c1] || {};
  const votes2 = baselineVotes[c2] || {};
  const voters1 = constituencyVoters[c1] || 1;
  const voters2 = constituencyVoters[c2] || 1;
  const total = voters1 + voters2;
  const w1 = voters1 / total;
  const w2 = voters2 / total;

  const combined = {};
  PARTIES.forEach(party => {
    combined[party] = ((votes1[party] || 0) * w1) + ((votes2[party] || 0) * w2);
  });

  // Normalise to 100%
  const sum = Object.values(combined).reduce((a, b) => a + b, 0);
  if (sum > 0) {
    PARTIES.forEach(party => {
      combined[party] = (combined[party] / sum) * 100;
    });
  }

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

  const selectedPairing = constituencyPairingsData[selectedIndex];

  // Pre-fill vote shares from the 2021 baseline whenever the selected constituency changes
  useEffect(() => {
    if (!selectedPairing) return;
    const [c1, c2] = selectedPairing.ukConstituencies;
    const baseline = getBaselineForPairing(c1, c2);
    setVotes(baseline);
    setDhondtResult(null);
    setHasCalculated(false);
  }, [selectedIndex, selectedPairing]);

  // Handle a change to any party's vote share input
  const handleVoteChange = (party, value) => {
    const num = parseFloat(value);
    setVotes(prev => ({ ...prev, [party]: isNaN(num) || num < 0 ? 0 : num }));
  };

  // Reset to the 2021 baseline for the selected constituency
  const handleReset = () => {
    if (!selectedPairing) return;
    const [c1, c2] = selectedPairing.ukConstituencies;
    setVotes(getBaselineForPairing(c1, c2));
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
          how the 6 seats would be allocated under the new system. Vote shares are pre-filled from the
          2021 notional estimates I have generated for each constituency (e.g. my estimate of what the 
          2021 election would have looked like under this new system and new bboundaries).
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
            {constituencyPairingsData.map((pairing, i) => (
              <option key={i} value={i}>
                {pairing.seneddName} ({pairing.ukConstituencies.join(' + ')})
              </option>
            ))}
          </select>
        </div>

        {/* Party vote share sliders + number inputs */}
        <div className="ce-party-inputs">
          <h3>Vote Shares for <em>{selectedPairing?.seneddName}</em></h3>
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
            Reset to 2021 Baseline
          </button>
        </div>
      </div>

      {/* ── Results card ── */}
      {hasCalculated && dhondtResult && (
        <div className="card ce-results">
          <h3>Results for {selectedPairing?.seneddName}</h3>
          <p className="ce-pairing-note">
            Combined region: {selectedPairing?.ukConstituencies.join(' + ')}
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