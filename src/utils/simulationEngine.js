/// src/utils/simulationEngine.js
// Main simulation engine for Senedd Election Simulator

import baselineVotes from '../data/baselineVotes';
import constituencyVoters from '../data/constituencyVoters';
import { baselineNationalVotes } from '../data/baselineVotes';
import regionDefinitions from '../data/regionDefinitions';

// Import utility functions
import {
  calculateNationalTotals,
  findClosestContests,
  combineConstituencyVotes,
  applySwing,
  applyRegionalSwing,
  dHondt,
  calculateGallagherIndex,
  calculateEffectiveNumberOfParties,
  findViableCoalitions
} from './simulationUtils';

/**
 * Main function to calculate election results
 * @param {Object} nationalVotes - Object with party names as keys and vote percentages as values
 * @param {Array} constituencyPairings - Array of constituency pairs
 * @param {Object} options - Optional configuration including:
 *   - swingType: 'uniform', 'proportional', 'regional'
 *   - regionalSwings: Object with regions as keys and party swing objects as values
 * @returns {Object} Complete election results with metrics
 */
export function calculateElectionResults(nationalVotes, constituencyPairings, options = {}) {
  // Set default options
  const defaultOptions = {
    swingType: 'uniform',
    regionalSwings: null
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Calculate results for all constituencies with enhanced swing models
  const constituencyResults = calculateAllConstituencies(nationalVotes, constituencyPairings, mergedOptions);
  
  // Calculate national totals
  const nationalTotals = calculateNationalTotals(constituencyResults);
  
  // Calculate enhanced metrics for the election
  const metrics = calculateElectionMetrics(nationalTotals, nationalVotes, constituencyResults);
  
  // Find the closest contests
  const closestContests = findClosestContests(constituencyResults);
  
  // Return complete results with enhancements
  return {
    constituencyResults,
    nationalTotals,
    metrics,
    closestContests
  };
}

/**
 * Calculate results for all constituencies
 * @param {Object} nationalVotes - National vote percentages
 * @param {Array} constituencyPairings - Constituency pairings
 * @param {Object} options - Calculation options including regional factors
 * @returns {Array} Results for each constituency
 */
function calculateAllConstituencies(nationalVotes, constituencyPairings, options = {}) {
  return constituencyPairings.map(pair => {
    const constituencyName = pair.join(' + ');
    
    // Combine the baseline votes from the paired constituencies
    const combinedBaseline = combineConstituencyVotes(
      baselineVotes[pair[0]], 
      baselineVotes[pair[1]], 
      pair[0], 
      pair[1]
    );
    
    // Determine which region these constituencies belong to for regional swing
    const region1 = getRegionForConstituency(pair[0]);
    const region2 = getRegionForConstituency(pair[1]);
    
    let constituencyVotes;
    if (options.swingType === 'regional' && options.regionalSwings) {
      // If both constituencies are in the same region, apply that region's swing
      if (region1 === region2 && options.regionalSwings[region1]) {
        constituencyVotes = applyRegionalSwing(
          combinedBaseline, 
          nationalVotes, 
          options.regionalSwings[region1]
        );
      } else {
        // If in different regions, calculate weighted average of regional swings
        const weight1 = constituencyVoters[pair[0]] / (constituencyVoters[pair[0]] + constituencyVoters[pair[1]]);
        const weight2 = constituencyVoters[pair[1]] / (constituencyVoters[pair[0]] + constituencyVoters[pair[1]]);
        
        const regionalSwing1 = options.regionalSwings[region1] || {};
        const regionalSwing2 = options.regionalSwings[region2] || {};
        
        const combinedRegionalSwing = {};
        for (const party in nationalVotes) {
          combinedRegionalSwing[party] = (
            (regionalSwing1[party] || 0) * weight1 + 
            (regionalSwing2[party] || 0) * weight2
          );
        }
        
        constituencyVotes = applyRegionalSwing(
          combinedBaseline, 
          nationalVotes, 
          combinedRegionalSwing
        );
      }
    } else {
      // Apply standard swing (uniform or proportional)
      constituencyVotes = applySwing(
        combinedBaseline, 
        nationalVotes, 
        options.swingType
      );
    }
    
    // Calculate seats using D'Hondt method
    const { results, allocationHistory } = dHondt(constituencyVotes, 6);
    
    // Calculate margin of the last seat and characterize seat stability
    const lastAllocation = allocationHistory[allocationHistory.length - 1];
    const sortedQuotients = [...lastAllocation.quotients].sort((a, b) => b.quotient - a.quotient);
    
    // Calculate margin between last allocated seat and first non-allocated seat
    // This old approach is kept for the closestMargin calculation for backward compatibility
    const lastAllocatedQuotient = sortedQuotients[5].quotient;
    const firstNonAllocatedQuotient = sortedQuotients[6]?.quotient || 0;
    
    const closestMargin = {
      value: lastAllocatedQuotient - firstNonAllocatedQuotient,
      winningParty: sortedQuotients[5].party,
      runnerUpParty: sortedQuotients[6]?.party || 'None',
      // Calculate relative margin as percentage of winning quotient
      relativeMargin: ((lastAllocatedQuotient - firstNonAllocatedQuotient) / lastAllocatedQuotient) * 100
    };
    
    // Categorize each seat's stability
    const seatStability = sortedQuotients.slice(0, 6).map((quotient, index) => {
      let stability;
      
      // Last seat might be a toss-up
      if (index === 5) {
        if (closestMargin.relativeMargin < 1) {
          stability = "toss-up";
        } else if (closestMargin.relativeMargin < 3) {
          stability = "leaning";
        } else {
          stability = "solid";
        }
      } 
      // Second-to-last seat might be leaning
      else if (index === 4) {
        if (closestMargin.relativeMargin < 5) {
          stability = "leaning";
        } else {
          stability = "solid";
        }
      }
      // All other seats are likely solid
      else {
        stability = "solid";
      }
      
      return {
        party: quotient.party,
        stability: stability
      };
    });
    
    // Calculate votes needed to change outcome
    const votesNeededToChange = calculateVotesNeededToChange(sortedQuotients, 6);
    
    return {
      constituency: constituencyName,
      results,
      closestMargin,
      allocationHistory,
      votePercentages: constituencyVotes,
      seatStability,
      votesNeededToChange,
      region1,
      region2
    };
  });
}

/**
 * Calculate how many votes would be needed to change the outcome
 * @param {Array} sortedQuotients - Sorted quotients from D'Hondt calculation
 * @param {Number} seatsAllocated - Number of seats allocated
 * @returns {Object} Information about votes needed to change outcome
 */
function calculateVotesNeededToChange(sortedQuotients, seatsAllocated) {
  // First, find all quotients with seats allocated > 0
  const allocatedQuotients = sortedQuotients.filter(q => q.seats > 0);
  
  // Find quotients with no seats allocated
  const unallocatedQuotients = sortedQuotients.filter(q => q.seats === 0);
  
  // No change possible if we don't have enough parties competing
  if (allocatedQuotients.length === 0 || unallocatedQuotients.length === 0) {
    return { possible: false };
  }
  
  // Find the party with the last allocated seat (lowest quotient among allocated)
  const lastSeat = allocatedQuotients.sort((a, b) => a.quotient - b.quotient)[0];
  
  // Find the party with the highest quotient among unallocated seats
  const firstNonSeat = unallocatedQuotients.sort((a, b) => b.quotient - a.quotient)[0];
  
  // Calculate needed quotient increase to overtake last allocated seat
  const quotientGapNeeded = lastSeat.quotient - firstNonSeat.quotient;
  
  // Calculate votes needed based on the quotient gap and divisor
  const votesNeeded = quotientGapNeeded * (firstNonSeat.seats + 1);
  
  return {
    possible: true,
    lastSeatParty: lastSeat.party,
    challengerParty: firstNonSeat.party,
    votesNeeded: votesNeeded,
    percentageNeeded: votesNeeded / 100, // Convert to percentage points
    quotientGap: quotientGapNeeded
  };
}

/**
 * Get the region a constituency belongs to
 * @param {String} constituency - Name of the constituency
 * @returns {String} Region name
 */
function getRegionForConstituency(constituency) {
  for (const region in regionDefinitions) {
    if (regionDefinitions[region].includes(constituency)) {
      return region;
    }
  }
  return 'Wales'; // Default fallback
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
    majorityThreshold: Math.ceil(totalSeats / 2),
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
  
  // Find viable coalitions if no party has overall majority
  if (!metrics.hasOverallMajority) {
    metrics.possibleCoalitions = findViableCoalitions(
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
  getRegionForConstituency,
  calculateVotesNeededToChange
};