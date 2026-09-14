import React, { useState, useMemo } from 'react';
import { calculateFptpResults } from '../utils/fptpEngine';
import {
  baselineNationalVotes2024,
  actualNationalSeats2024
} from '../data/westminsterResults2024';
import { baselineNationalVotes as seneddNationalVotes2026 } from '../data/seneddResults2026';
import SeatChangeSummary from './SeatChangeSummary';
import { formatPartyName, getPartyColor, formatDecimal, getContrastText } from '../utils/formatting';

const PARTIES = ['Labour', 'Conservatives', 'PlaidCymru', 'LibDems', 'Greens', 'Reform', 'Other'];

// Quick-fill scenarios. Users are expected to type their own polling numbers,
// so these are reference points rather than an exhaustive preset list.
const QUICK_FILLS = [
  {
    id: 'ge2024',
    label: '2024 general election',
    votes: baselineNationalVotes2024
  },
  {
    id: 'senedd2026',
    label: '2026 Senedd election',
    votes: seneddNationalVotes2026
  }
];

/**
 * Projects a Westminster general election across the 32 Welsh constituencies
 * under first past the post, from vote shares the user enters.
 *
 * Deliberately keeps its own vote state, separate from the Senedd simulator,
 * so users can work with different polling numbers on each page.
 */
function GeneralElectionProjection() {
  const [votes, setVotes] = useState({ ...baselineNationalVotes2024 });
  const [swingType, setSwingType] = useState('uniform');
  const [showAllSeats, setShowAllSeats] = useState(false);

  // Normalise to 100% before projecting, so the inputs need not total exactly 100
  const normalisedVotes = useMemo(() => {
    const sum = PARTIES.reduce((acc, p) => acc + (votes[p] || 0), 0);
    if (sum <= 0) return null;
    const out = {};
    PARTIES.forEach(p => { out[p] = ((votes[p] || 0) / sum) * 100; });
    return out;
  }, [votes]);

  const results = useMemo(() => {
    if (!normalisedVotes) return null;
    return calculateFptpResults(normalisedVotes, { swingType });
  }, [normalisedVotes, swingType]);

  const handleVoteChange = (party, value) => {
    const num = parseFloat(value);
    setVotes(prev => ({ ...prev, [party]: isNaN(num) || num < 0 ? 0 : num }));
  };

  const applyQuickFill = (fill) => setVotes({ ...fill.votes });

  const inputTotal = PARTIES.reduce((acc, p) => acc + (votes[p] || 0), 0);
  const showNormalisationNote = Math.abs(inputTotal - 100) > 0.5;

  const seatsShown = results
    ? (showAllSeats ? results.constituencyResults : results.gains)
    : [];

  return (
    <div className="ge-projection">

      {/* ── Intro ── */}
      <div className="card">
        <h2 className="section-title">Westminster Projection for Wales</h2>
        <p>
          Wales returns <strong>32 MPs</strong> to the House of Commons, one per constituency,
          elected by first past the post. Enter Wales-wide vote shares below and this projects
          who would win each seat, applying the change you specify to the actual 2024 result
          in every constituency.
        </p>
        <p className="ge-note">
          This is separate from the Senedd simulator: the vote shares here are your own, and
          nothing you enter on this page affects the other one. Note that first past the post
          behaves very differently from the Senedd's proportional system, so the same vote
          shares can produce dramatically different outcomes.
        </p>
      </div>

      {/* ── Inputs ── */}
      <div className="card">
        <h3>Wales-wide vote shares</h3>

        <div className="ge-quickfill">
          <span className="ge-quickfill-label">Start from:</span>
          {QUICK_FILLS.map(fill => (
            <button
              key={fill.id}
              className="btn btn-secondary btn-small"
              onClick={() => applyQuickFill(fill)}
            >
              {fill.label}
            </button>
          ))}
        </div>

        {PARTIES.map(party => (
          <div key={party} className="ce-party-row">
            <div className="ce-party-swatch" style={{ backgroundColor: getPartyColor(party) }} />
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
              step="0.1"
              value={formatDecimal(votes[party] || 0, 1)}
              onChange={e => handleVoteChange(party, e.target.value)}
              className="ce-number-input"
            />
            <span className="ce-pct-label">%</span>
          </div>
        ))}

        <div className={`ce-total ${showNormalisationNote ? 'ce-total-warn' : 'ce-total-ok'}`}>
          Total: {formatDecimal(inputTotal, 1)}%
          {showNormalisationNote && (
            <span className="ce-normalise-note"> — will be normalised to 100%</span>
          )}
        </div>

        <div className="ge-swing-row">
          <label htmlFor="ge-swing-type"><strong>Swing model:</strong></label>
          <select
            id="ge-swing-type"
            value={swingType}
            onChange={e => setSwingType(e.target.value)}
            className="select-input"
          >
            <option value="uniform">Uniform national swing</option>
            <option value="proportional">Proportional swing</option>
            <option value="proportional-bounded">Proportional swing (bounded)</option>
          </select>
        </div>
      </div>

      {/* ── Results ── */}
      {results && (
        <>
          <div className="card">
            <h3 className="section-title">Projected result</h3>

            <div className="national-summary">
              <div className="summary-item">
                <span className="label">Most seats:</span>
                <span className="value">{formatPartyName(results.metrics.largestParty)}</span>
              </div>
              <div className="summary-item">
                <span className="label">Seats changing hands:</span>
                <span className="value">{results.gains.length} of {results.totalSeats}</span>
              </div>
              <div className="summary-item">
                <span className="label">Disproportionality:</span>
                <span className="value">{formatDecimal(results.metrics.disproportionalityIndex, 2)}</span>
              </div>
              <div className="summary-item">
                <span className="label">Closest seat:</span>
                <span className="value">
                  {formatDecimal(results.closestSeats[0].majority, 1)} pts
                </span>
              </div>
            </div>

            <SeatChangeSummary
              actual={actualNationalSeats2024}
              simulated={results.seatTotals}
              actualLabel="2024"
            />

            {/* Seat bar */}
            <div className="ge-seat-bar">
              {PARTIES
                .filter(p => results.seatTotals[p] > 0)
                .sort((a, b) => results.seatTotals[b] - results.seatTotals[a])
                .map(party => (
                  <div
                    key={party}
                    className="ge-seat-bar-segment"
                    style={{
                      width: `${(results.seatTotals[party] / results.totalSeats) * 100}%`,
                      backgroundColor: getPartyColor(party),
                      color: getContrastText(getPartyColor(party))
                    }}
                    title={`${formatPartyName(party)}: ${results.seatTotals[party]} seats`}
                  >
                    {results.seatTotals[party] >= 3 ? results.seatTotals[party] : ''}
                  </div>
                ))
              }
            </div>
          </div>

          {/* Constituency detail */}
          <div className="card">
            <div className="ge-table-header">
              <h3 className="section-title">
                {showAllSeats ? 'All 32 constituencies' : `Seats changing hands (${results.gains.length})`}
              </h3>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setShowAllSeats(v => !v)}
              >
                {showAllSeats ? 'Show only changes' : 'Show all 32 seats'}
              </button>
            </div>

            {seatsShown.length === 0 ? (
              <p className="ge-note">
                No seats change hands: every constituency returns the same party as in 2024.
              </p>
            ) : (
              <div className="ge-table-wrap">
                <table className="ge-table">
                  <thead>
                    <tr>
                      <th scope="col">Constituency</th>
                      <th scope="col">2024</th>
                      <th scope="col">Projected</th>
                      <th scope="col">Share</th>
                      <th scope="col">Majority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seatsShown.map(seat => (
                      <tr key={seat.constituency} className={seat.isGain ? 'ge-row-gain' : ''}>
                        <th scope="row" className="ge-constituency">{seat.constituency}</th>
                        <td>
                          <span
                            className="ge-party-tag"
                            style={{
                              backgroundColor: getPartyColor(seat.previousWinner),
                              color: getContrastText(getPartyColor(seat.previousWinner))
                            }}
                          >
                            {formatPartyName(seat.previousWinner)}
                          </span>
                        </td>
                        <td>
                          <span
                            className="ge-party-tag"
                            style={{
                              backgroundColor: getPartyColor(seat.winner),
                              color: getContrastText(getPartyColor(seat.winner))
                            }}
                          >
                            {formatPartyName(seat.winner)}
                          </span>
                        </td>
                        <td>{formatDecimal(seat.winnerShare, 1)}%</td>
                        <td className={seat.majority < 5 ? 'ge-tight' : ''}>
                          {formatDecimal(seat.majority, 1)} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default GeneralElectionProjection;
