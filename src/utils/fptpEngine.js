// src/utils/fptpEngine.js
// First-past-the-post projection engine for Welsh Westminster constituencies.
//
// Unlike the Senedd simulator, which allocates 6 seats per constituency by
// D'Hondt, this projects single-member seats: whichever party leads the vote in
// a constituency takes it.

import westminsterBaseline, {
  actualWinners2024,
  baselineNationalVotes2024,
  westminsterConstituencyNames
} from '../data/westminsterResults2024';

import {
  applySwing,
  calculateGallagherIndex,
  calculateEffectiveNumberOfParties
} from './simulationUtils';

/**
 * Rank the parties in a constituency by vote share, highest first
 * @param {Object} votes - Vote percentages by party
 * @returns {Array} [{ party, share }] sorted descending
 */
function rankParties(votes) {
  return Object.keys(votes)
    .map(party => ({ party, share: votes[party] }))
    .sort((a, b) => b.share - a.share);
}

/**
 * Project a Westminster general election result across the 32 Welsh seats
 * @param {Object} nationalVotes - Wales-wide vote percentages by party
 * @param {Object} options - { swingType }
 * @returns {Object} Constituency results, seat totals, changes and metrics
 */
export function calculateFptpResults(nationalVotes, options = {}) {
  const { swingType = 'uniform' } = options;

  const constituencyResults = westminsterConstituencyNames.map(name => {
    const baseline = westminsterBaseline[name];

    // Swing is measured against the 2024 Wales-wide result, not the Senedd one
    const votes = applySwing(baseline, nationalVotes, swingType, baselineNationalVotes2024);

    const ranked = rankParties(votes);
    const winner = ranked[0];
    const runnerUp = ranked[1] || { party: 'None', share: 0 };
    const previousWinner = actualWinners2024[name];

    return {
      constituency: name,
      votes,
      ranked,
      winner: winner.party,
      winnerShare: winner.share,
      runnerUp: runnerUp.party,
      runnerUpShare: runnerUp.share,
      // Winning margin in percentage points
      majority: winner.share - runnerUp.share,
      previousWinner,
      isGain: winner.party !== previousWinner,
      baseline
    };
  });

  // Seat totals
  const seatTotals = {};
  Object.keys(baselineNationalVotes2024).forEach(party => { seatTotals[party] = 0; });
  constituencyResults.forEach(({ winner }) => {
    seatTotals[winner] = (seatTotals[winner] || 0) + 1;
  });

  const totalSeats = constituencyResults.length;

  // Seats gained and lost relative to 2024
  const gains = constituencyResults.filter(c => c.isGain);

  // Closest contests, useful for showing which seats are on a knife edge
  const closestSeats = [...constituencyResults]
    .sort((a, b) => a.majority - b.majority)
    .slice(0, 10);

  const seatShare = {};
  Object.keys(seatTotals).forEach(party => {
    seatShare[party] = (seatTotals[party] / totalSeats) * 100;
  });

  let largestParty = null;
  let maxSeats = -1;
  Object.keys(seatTotals).forEach(party => {
    if (seatTotals[party] > maxSeats) {
      maxSeats = seatTotals[party];
      largestParty = party;
    }
  });

  return {
    constituencyResults,
    seatTotals,
    totalSeats,
    gains,
    closestSeats,
    metrics: {
      voteShare: { ...nationalVotes },
      seatShare,
      largestParty,
      disproportionalityIndex: calculateGallagherIndex(nationalVotes, seatShare),
      effectiveNumberOfPartiesVotes: calculateEffectiveNumberOfParties(nationalVotes),
      effectiveNumberOfPartiesSeats: calculateEffectiveNumberOfParties(seatShare)
    }
  };
}

export default calculateFptpResults;
