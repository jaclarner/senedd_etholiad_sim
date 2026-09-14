// src/utils/simulationEngine.js
// Main simulation engine for Senedd Election Simulator

import seneddBaseline from '../data/seneddResults2026';
import seneddConstituencies, {
  SEATS_PER_CONSTITUENCY,
  getRegionForConstituency
} from '../data/seneddConstituencies';

// Import utility functions
import {
  calculateNationalTotals,
  findClosestContests,
  applySwing,
  applyRegionalSwing,
  dHondt,
  calculateGallagherIndex,
  calculateEffectiveNumberOfParties
} from './simulationUtils';

/**
 * Main function to calculate election results
 * @param {Object} nationalVotes - Object with party names as keys and vote percentages as values
 * @param {Object} options - Optional configuration including:
 *   - swingType: 'uniform', 'proportional', 'regional'
 *   - regionalSwings: Object with regions as keys and party swing objects as values
 * @returns {Object} Complete election results with metrics
 */
export function calculateElectionResults(nationalVotes, options = {}) {
  const mergedOptions = {
    swingType: 'uniform',
    regionalSwings: null,
    ...options
  };

  const constituencyResults = calculateAllConstituencies(nationalVotes, mergedOptions);
  const nationalTotals = calculateNationalTotals(constituencyResults);
  const metrics = calculateElectionMetrics(nationalTotals, nationalVotes, constituencyResults);
  const closestContests = findClosestContests(constituencyResults);

  return {
    constituencyResults,
    nationalTotals,
    metrics,
    closestContests
  };
}

/**
 * Apply the chosen swing model to one constituency's 2026 baseline
 * @param {String} name - Senedd constituency name
 * @param {Object} baseline - That constituency's 2026 vote shares
 * @param {Object} nationalVotes - Target national vote percentages
 * @param {Object} options - Calculation options
 * @returns {Object} Adjusted vote percentages for the constituency
 */
function applySwingToConstituency(name, baseline, nationalVotes, options) {
  if (options.swingType === 'regional' && options.regionalSwings) {
    const region = getRegionForConstituency(name);
    return applyRegionalSwing(
      baseline,
      nationalVotes,
      options.regionalSwings[region] || {}
    );
  }

  return applySwing(baseline, nationalVotes, options.swingType);
}

/**
 * Calculate results for all 16 Senedd constituencies
 * @param {Object} nationalVotes - National vote percentages
 * @param {Object} options - Calculation options including regional factors
 * @returns {Array} Results for each constituency
 */
function calculateAllConstituencies(nationalVotes, options = {}) {
  return seneddConstituencies.map(({ name, region, westminsterConstituencies }) => {
    const baseline = seneddBaseline[name];

    if (!baseline) {
      console.error(`No 2026 baseline data for constituency "${name}"`);
      return {
        constituency: name,
        region,
        westminsterConstituencies,
        results: {},
        error: `Missing baseline data for ${name}`,
        allocationHistory: [{ quotients: [], winner: null }],
        votePercentages: {},
        seatStability: [],
        votesNeededToChange: { possible: false }
      };
    }

    const constituencyVotes = applySwingToConstituency(name, baseline, nationalVotes, options);

    // Allocate the constituency's 6 seats using D'Hondt
    const { results, allocationHistory } = dHondt(constituencyVotes, SEATS_PER_CONSTITUENCY);

    // Rank the final round's quotients to work out how close the last seat was
    const lastAllocation = allocationHistory[allocationHistory.length - 1];
    const sortedQuotients = [...lastAllocation.quotients].sort((a, b) => b.quotient - a.quotient);

    const lastSeatIndex = SEATS_PER_CONSTITUENCY - 1;
    const lastAllocatedQuotient = sortedQuotients[lastSeatIndex]?.quotient || 0;
    const firstNonAllocatedQuotient = sortedQuotients[SEATS_PER_CONSTITUENCY]?.quotient || 0;

    const closestMargin = {
      value: lastAllocatedQuotient - firstNonAllocatedQuotient,
      winningParty: sortedQuotients[lastSeatIndex]?.party || 'None',
      runnerUpParty: sortedQuotients[SEATS_PER_CONSTITUENCY]?.party || 'None',
      // Relative margin as a percentage of the winning quotient
      relativeMargin: lastAllocatedQuotient > 0
        ? ((lastAllocatedQuotient - firstNonAllocatedQuotient) / lastAllocatedQuotient) * 100
        : 100
    };

    const seatStability = deriveSeatStability(sortedQuotients, closestMargin.relativeMargin);

    const votesNeededToChange = calculateVotesNeededToChange(
      sortedQuotients,
      SEATS_PER_CONSTITUENCY,
      allocationHistory
    );

    return {
      constituency: name,
      region,
      westminsterConstituencies,
      results,
      closestMargin,
      allocationHistory,
      votePercentages: constituencyVotes,
      seatStability,
      votesNeededToChange
    };
  });
}

/**
 * Categorise how secure each of a constituency's seats is
 * @param {Array} sortedQuotients - Final-round quotients, highest first
 * @param {Number} relativeMargin - Margin of the last seat as a % of its quotient
 * @returns {Array} Party and stability label for each of the 6 seats
 */
function deriveSeatStability(sortedQuotients, relativeMargin) {
  const lastSeatIndex = SEATS_PER_CONSTITUENCY - 1;

  return sortedQuotients.slice(0, SEATS_PER_CONSTITUENCY).map((quotient, index) => {
    let stability;

    // The final seat is the one most likely to change hands
    if (index === lastSeatIndex) {
      if (relativeMargin < 1) {
        stability = "toss-up";
      } else if (relativeMargin < 3) {
        stability = "leaning";
      } else {
        stability = "solid";
      }
    }
    // The second-to-last seat may be leaning
    else if (index === lastSeatIndex - 1) {
      stability = relativeMargin < 5 ? "leaning" : "solid";
    }
    // All other seats are likely solid
    else {
      stability = "solid";
    }

    return { party: quotient.party, stability };
  });
}

/**
 * Calculate how many votes would be needed to change the outcome
 * @param {Array} sortedQuotients - Sorted quotients from D'Hondt calculation
 * @param {Number} seatsAllocated - Number of seats allocated
 * @param {Array} allocationHistory - Full history of seat allocations in chronological order
 * @returns {Object} Information about votes needed to change outcome
 */
function calculateVotesNeededToChange(sortedQuotients, seatsAllocated, allocationHistory) {
  try {
    // Get the allocation of the final seat
    const finalSeatAllocation = allocationHistory[seatsAllocated];
    const finalSeatWinner = finalSeatAllocation.winner;

    // Get the quotient of the winning party for this seat
    const winningQuotient = finalSeatAllocation.quotients.find(q => q.party === finalSeatWinner);

    if (!winningQuotient) {
      return { possible: false };
    }

    // For the runner-up, find the party with the next highest quotient
    // that isn't the winner of this seat
    const sortedQuotientsForRound = [...finalSeatAllocation.quotients]
      .sort((a, b) => b.quotient - a.quotient);

    const winnerIndex = sortedQuotientsForRound.findIndex(
      q => q.party === finalSeatWinner && q.quotient === winningQuotient.quotient
    );

    const runnerUpQuotient = sortedQuotientsForRound[winnerIndex + 1];

    if (!runnerUpQuotient) {
      return { possible: false };
    }

    // Calculate the vote shift needed
    const quotientGap = winningQuotient.quotient - runnerUpQuotient.quotient;
    const runnerUpDivisor = runnerUpQuotient.seats + 1;
    const votesNeeded = quotientGap * runnerUpDivisor;

    return {
      possible: true,
      lastSeatParty: finalSeatWinner,
      challengerParty: runnerUpQuotient.party,
      votesNeeded: votesNeeded,
      quotientGap: quotientGap,
      lastSeatQuotient: winningQuotient.quotient,
      challengerQuotient: runnerUpQuotient.quotient
    };
  } catch (error) {
    console.error("Error calculating votes needed to change:", error);
    return { possible: false, error: error.message };
  }
}

/**
 * Calculate comprehensive election metrics
 * @param {Object} seatTotals - Total seats by party
 * @param {Object} votePercentages - Vote percentages by party
 * @param {Array} constituencyResults - Detailed constituency results
 * @returns {Object} Election metrics
 */
function calculateElectionMetrics(seatTotals, votePercentages, constituencyResults) {
  const totalSeats = Object.values(seatTotals).reduce((sum, seats) => sum + seats, 0);
  const metrics = {
    // Basic metrics
    seatShare: {},
    voteShare: { ...votePercentages },
    majorityThreshold: Math.floor(totalSeats / 2) + 1,
    hasOverallMajority: false,
    largestParty: null,

    // Advanced metrics
    disproportionalityIndex: 0,
    effectiveNumberOfPartiesVotes: 0,
    effectiveNumberOfPartiesSeats: 0,
    possibleCoalitions: []
  };

  // Calculate seat shares and find largest party
  let maxSeats = 0;
  for (const party in seatTotals) {
    metrics.seatShare[party] = (seatTotals[party] / totalSeats) * 100;

    if (seatTotals[party] > maxSeats) {
      maxSeats = seatTotals[party];
      metrics.largestParty = party;
    }

    if (seatTotals[party] >= metrics.majorityThreshold) {
      metrics.hasOverallMajority = true;
    }
  }

  // Calculate Gallagher disproportionality index
  metrics.disproportionalityIndex = calculateGallagherIndex(
    metrics.voteShare,
    metrics.seatShare
  );

  // Calculate Effective Number of Parties (ENP)
  metrics.effectiveNumberOfPartiesVotes = calculateEffectiveNumberOfParties(
    metrics.voteShare
  );

  metrics.effectiveNumberOfPartiesSeats = calculateEffectiveNumberOfParties(
    metrics.seatShare
  );

  // Find viable coalitions using enhanced coalition theory models
  // We'll do this even if a party has an overall majority,
  // as it's still interesting to see the theoretical possibilities
  try {
    const { findViableCoalitions } = require('./coalitionUtils');
    metrics.possibleCoalitions = findViableCoalitions(
      seatTotals,
      metrics.majorityThreshold
    );
  } catch (error) {
    console.error("Error using enhanced coalition utilities:", error);
    // Fall back to the original implementation
    const { findViableCoalitions: legacyCoalitionFinder } = require('./simulationUtils');
    metrics.possibleCoalitions = legacyCoalitionFinder(
      seatTotals,
      metrics.majorityThreshold
    );
  }

  return metrics;
}

// Export all functions for use elsewhere
export {
  calculateAllConstituencies,
  calculateElectionMetrics,
  calculateVotesNeededToChange,
  deriveSeatStability
};
