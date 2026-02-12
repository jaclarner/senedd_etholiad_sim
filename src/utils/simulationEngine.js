// src/utils/simulationEngine.js
// Main simulation engine for Senedd Election Simulator

import baselineVotes from '../data/baselineVotes';
import constituencyVoters from '../data/constituencyVoters';
import regionDefinitions from '../data/regionDefinitions';

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
 * Safely combines vote percentages from two constituencies with robust error handling
 * @param {Object} votes1 - Vote percentages from first constituency
 * @param {Object} votes2 - Vote percentages from second constituency
 * @param {String} constituency1 - Name of first constituency
 * @param {String} constituency2 - Name of second constituency
 * @returns {Object} Combined vote percentages
 */
function combineConstituencyVotes(votes1, votes2, constituency1, constituency2) {
  const combined = {};
  
  // Add extensive input validation
  if (votes1 === undefined || votes1 === null) {
    console.error(`votes1 is ${votes1} for constituency ${constituency1}`);
    votes1 = {};
  }
  
  if (votes2 === undefined || votes2 === null) {
    console.error(`votes2 is ${votes2} for constituency ${constituency2}`);
    votes2 = {};
  }
  
  if (typeof votes1 !== 'object') {
    console.error(`votes1 is not an object for constituency ${constituency1}, it is a ${typeof votes1}`);
    votes1 = {};
  }
  
  if (typeof votes2 !== 'object') {
    console.error(`votes2 is not an object for constituency ${constituency2}, it is a ${typeof votes2}`);
    votes2 = {};
  }
  
  // Get the number of voters in each constituency for weighting
  const voters1 = constituencyVoters[constituency1];
  const voters2 = constituencyVoters[constituency2];
  
  // Validate voter counts
  if (!voters1 || isNaN(voters1)) {
    console.error(`Invalid voter count for ${constituency1}: ${voters1}`);
  }
  
  if (!voters2 || isNaN(voters2)) {
    console.error(`Invalid voter count for ${constituency2}: ${voters2}`);
  }
  
  // Use default values if needed
  const validVoters1 = voters1 || 1;
  const validVoters2 = voters2 || 1;
  
  // Calculate the weight for each constituency
  const totalVoters = validVoters1 + validVoters2;
  const weight1 = validVoters1 / totalVoters;
  const weight2 = validVoters2 / totalVoters;
  
  // Safely gather all parties from both vote objects
  let parties1 = [];
  let parties2 = [];
  
  try {
    parties1 = Object.keys(votes1);
  } catch (error) {
    console.error(`Error getting keys from votes1: ${error.message}`);
    parties1 = [];
  }
  
  try {
    parties2 = Object.keys(votes2);
  } catch (error) {
    console.error(`Error getting keys from votes2: ${error.message}`);
    parties2 = [];
  }
  
  // Safely combine all party keys
  const allParties = new Set([...parties1, ...parties2]);
  
  // If no parties were found, use a default set of parties
  if (allParties.size === 0) {
    console.warn("No parties found in either constituency, using default party list");
    ['Labour', 'Conservatives', 'PlaidCymru', 'LibDems', 'Greens', 'Reform', 'Other'].forEach(p => allParties.add(p));
  }
  
  // Combine the vote percentages with proper weighting
  allParties.forEach(party => {
    // Safely get vote percentages or default to 0
    let v1 = 0, v2 = 0;
    
    try {
      v1 = votes1[party] || 0;
    } catch (error) {
      console.error(`Error accessing ${party} in votes1: ${error.message}`);
    }
    
    try {
      v2 = votes2[party] || 0;
    } catch (error) {
      console.error(`Error accessing ${party} in votes2: ${error.message}`);
    }
    
    // Combine with weights
    combined[party] = (v1 * weight1) + (v2 * weight2);
  });
  
  // Ensure the combined percentages add up to 100%
  const totalPercentage = Object.values(combined).reduce((sum, value) => sum + value, 0);
  
  if (Math.abs(totalPercentage - 100) > 1) {
    console.warn(`Combined vote percentages total ${totalPercentage}%, normalizing to 100%`);
    
    // Normalize to ensure total is 100%
    Object.keys(combined).forEach(party => {
      combined[party] = (combined[party] / totalPercentage) * 100;
    });
  }
  
  return combined;
}

// Helper function to validate constituency exists in baseline data
function validateConstituency(constituencyName) {
  if (!baselineVotes[constituencyName]) {
    console.error(`Constituency "${constituencyName}" not found in baseline votes`);
    return false;
  }
  return true;
}

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
  console.log("Calculate Election Results called with:", { 
    nationalVotes, 
    constituencyPairings: Array.isArray(constituencyPairings) ? 
      constituencyPairings.slice(0, 2) : 'Not an array',
    options 
  });
  
  // Set default options
  const defaultOptions = {
    swingType: 'uniform',
    regionalSwings: null
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Validate input data
  if (!Array.isArray(constituencyPairings)) {
    console.error("constituencyPairings is not an array:", constituencyPairings);
    throw new Error("Invalid constituency pairings data");
  }
  
  if (constituencyPairings.length === 0) {
    console.error("constituencyPairings is empty");
    throw new Error("Empty constituency pairings data");
  }
  
  // Check the structure of the first pairing
  const firstPairing = constituencyPairings[0];
  if (!Array.isArray(firstPairing)) {
    console.error("Expected constituency pairing to be an array, got:", firstPairing);
    throw new Error("Invalid pairing structure");
  }
  
  if (firstPairing.length !== 2) {
    console.error("Expected each pairing to contain exactly 2 constituencies, got:", firstPairing);
    throw new Error("Invalid pairing structure: each pairing must contain exactly 2 constituencies");
  }
  
  // Calculate results for all constituencies with enhanced swing models
  try {
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
  } catch (error) {
    console.error("Error in calculation:", error);
    throw error;
  }
}

/**
 * Calculate results for all constituencies
 * @param {Object} nationalVotes - National vote percentages
 * @param {Array} constituencyPairings - Constituency pairings
 * @param {Object} options - Calculation options including regional factors
 * @returns {Array} Results for each constituency
 */
function calculateAllConstituencies(nationalVotes, constituencyPairings, options = {}) {
  console.log("Calculating for constituency pairings:", constituencyPairings.slice(0, 2), "...");
  
  return constituencyPairings.map(pair => {
    try {
      // Validate pair structure
      if (!Array.isArray(pair) || pair.length !== 2) {
        console.error("Invalid pair structure:", pair);
        throw new Error(`Invalid constituency pair: ${JSON.stringify(pair)}`);
      }
      
      const [constituency1, constituency2] = pair;
      const constituencyName = `${constituency1} + ${constituency2}`;
      
      console.log(`Processing constituency pairing: ${constituencyName}`);
      
      // Check if constituency names exist in baseline data
      const valid1 = validateConstituency(constituency1);
      const valid2 = validateConstituency(constituency2);

      // We'll proceed even if the constituencies are not valid, but with safer handling
      
      // Combine the baseline votes from the paired constituencies
      const combinedBaseline = combineConstituencyVotes(
        valid1 ? baselineVotes[constituency1] : {},
        valid2 ? baselineVotes[constituency2] : {},
        constituency1,
        constituency2
      );
      
      // Determine which region these constituencies belong to for regional swing
      const region1 = getRegionForConstituency(constituency1);
      const region2 = getRegionForConstituency(constituency2);
      
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
          const weight1 = (constituencyVoters[constituency1] || 1) / 
                         ((constituencyVoters[constituency1] || 1) + (constituencyVoters[constituency2] || 1));
          const weight2 = (constituencyVoters[constituency2] || 1) / 
                         ((constituencyVoters[constituency1] || 1) + (constituencyVoters[constituency2] || 1));
          
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
      const votesNeededToChange = calculateVotesNeededToChange(sortedQuotients, 6, allocationHistory);
      
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
    } catch (error) {
      console.error(`Error calculating for constituency pair:`, pair, error);
      // Return a placeholder result for this constituency pair with error info
      return {
        constituency: Array.isArray(pair) ? pair.join(' + ') : 'Invalid pair',
        results: {},
        error: error.message,
        allocationHistory: [{quotients: [], winner: null}],
        votePercentages: {},
        seatStability: [],
        votesNeededToChange: {possible: false}
      };
    }
  });
}

/**
 * Calculate how many votes would be needed to change the outcome
 * This improved version calculates more accurate tipping points
 * @param {Array} sortedQuotients - Sorted quotients from D'Hondt calculation
 * @param {Number} seatsAllocated - Number of seats allocated
 * @param {Array} allocationHistory - Full history of seat allocations in chronological order
 * @returns {Object} Information about votes needed to change outcome
 */

function calculateVotesNeededToChange(sortedQuotients, seatsAllocated, allocationHistory) {
  try {
    // Get the allocation of the 6th seat
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
    
    // Find the index of the winning quotient
    const winnerIndex = sortedQuotientsForRound.findIndex(
      q => q.party === finalSeatWinner && q.quotient === winningQuotient.quotient
    );
    
    // The runner-up should be the next highest quotient
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
  
  // Find viable coalitions using enhanced coalition theory models
  // We'll do this even if a party has an overall majority,
  // as it's still interesting to see the theoretical possibilities
  try {
    // Import the enhanced coalition utility functions
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
  getRegionForConstituency,
  calculateVotesNeededToChange,
  combineConstituencyVotes // Export the fixed version
};