// src/utils/simulationUtils.js
import constituencyVoters from '../data/constituencyVoters';
import { baselineNationalVotes } from '../data/baselineVotes';

/**
 * Calculates national totals from constituency results
 * @param {Array} constituencyResults - Results for each constituency
 * @returns {Object} Total seats per party nationally
 */
export function calculateNationalTotals(constituencyResults) {
  const totals = {};
  
  // Sum up seats across all constituencies
  constituencyResults.forEach(constituency => {
    for (const party in constituency.results) {
      totals[party] = (totals[party] || 0) + constituency.results[party];
    }
  });
  
  return totals;
}

/**
 * Find the closest contests based on margin between winner and runner-up
 * @param {Array} constituencyResults - Results for each constituency
 * @param {Number} limit - Maximum number of contests to return
 * @returns {Array} Array of closest contests
 */
export function findClosestContests(constituencyResults, limit = 10) {
  // Extract contests with margin data
  const contests = constituencyResults.map(constituency => ({
    constituency: constituency.constituency,
    margin: constituency.closestMargin.value,
    winningParty: constituency.closestMargin.winningParty,
    runnerUpParty: constituency.closestMargin.runnerUpParty
  }));
  
  // Sort by margin (ascending)
  contests.sort((a, b) => a.margin - b.margin);
  
  // Return top N closest contests
  return contests.slice(0, limit);
}

/**
 * Combines vote percentages from two constituencies
 * @param {Object} votes1 - Vote percentages from first constituency
 * @param {Object} votes2 - Vote percentages from second constituency
 * @param {String} constituency1 - Name of first constituency
 * @param {String} constituency2 - Name of second constituency
 * @returns {Object} Combined vote percentages
 */
export function combineConstituencyVotes(votes1, votes2, constituency1, constituency2) {
  const combined = {};
  
  // Get the number of voters in each constituency for weighting
  const voters1 = constituencyVoters[constituency1] || 1;
  const voters2 = constituencyVoters[constituency2] || 1;
  
  // Calculate the weight for each constituency
  const totalVoters = voters1 + voters2;
  const weight1 = voters1 / totalVoters;
  const weight2 = voters2 / totalVoters;
  
  // Combine the vote percentages with proper weighting
  const allParties = new Set([...Object.keys(votes1), ...Object.keys(votes2)]);
  
  allParties.forEach(party => {
    const v1 = votes1[party] || 0;
    const v2 = votes2[party] || 0;
    combined[party] = (v1 * weight1) + (v2 * weight2);
  });
  
  return combined;
}

/**
 * Apply swing model to baseline votes
 * @param {Object} baselineVotes - Baseline vote percentages
 * @param {Object} targetVotes - Target national vote percentages
 * @param {String} swingType - Type of swing model ('uniform' or 'proportional')
 * @returns {Object} Adjusted vote percentages
 */
export function applySwing(baselineVotes, targetVotes, swingType = 'uniform') {
  const adjustedVotes = {};
  
  // Calculate national baseline for reference
  const nationalBaseline = {};
  for (const party in targetVotes) {
    nationalBaseline[party] = baselineNationalVotes[party] || targetVotes[party];
  }
  
  // Apply swing based on model type
  if (swingType === 'proportional') {
    // Proportional swing: each party's vote changes in proportion to its baseline
    for (const party in baselineVotes) {
      if (nationalBaseline[party] > 0) {
        const ratio = targetVotes[party] / nationalBaseline[party];
        adjustedVotes[party] = baselineVotes[party] * ratio;
      } else {
        // Handle case where party had zero votes in baseline
        adjustedVotes[party] = targetVotes[party] * (baselineVotes[party] > 0 ? 1 : 0);
      }
    }
  } else {
    // Default: Uniform swing - same percentage point change across all constituencies
    for (const party in baselineVotes) {
      const swing = targetVotes[party] - nationalBaseline[party];
      adjustedVotes[party] = Math.max(0, baselineVotes[party] + swing);
    }
  }
  
  // Make sure all parties from targetVotes are included
  for (const party in targetVotes) {
    if (adjustedVotes[party] === undefined) {
      adjustedVotes[party] = targetVotes[party] * 0.01; // Small placeholder value
    }
  }
  
  // Normalize to ensure the total equals 100%
  const totalVotes = Object.values(adjustedVotes).reduce((sum, value) => sum + value, 0);
  for (const party in adjustedVotes) {
    adjustedVotes[party] = (adjustedVotes[party] / totalVotes) * 100;
  }
  
  return adjustedVotes;
}

/**
 * Apply regional swing model
 * @param {Object} baselineVotes - Baseline vote percentages
 * @param {Object} nationalVotes - Target national vote percentages
 * @param {Object} regionalSwing - Regional swing adjustments
 * @returns {Object} Adjusted vote percentages
 */
export function applyRegionalSwing(baselineVotes, nationalVotes, regionalSwing) {
  const swingVotes = {};
  
  // First apply national swing as the baseline
  for (const party in baselineVotes) {
    const nationalSwing = nationalVotes[party] - baselineNationalVotes[party];
    swingVotes[party] = Math.max(0, baselineVotes[party] + nationalSwing);
  }
  
  // Then apply regional adjustment on top
  for (const party in swingVotes) {
    if (regionalSwing[party]) {
      swingVotes[party] = Math.max(0, swingVotes[party] + regionalSwing[party]);
    }
  }
  
  // Make sure all parties from nationalVotes are included
  for (const party in nationalVotes) {
    if (swingVotes[party] === undefined) {
      swingVotes[party] = nationalVotes[party] * 0.01; // Small placeholder value
    }
  }
  
  // Normalize to ensure the total equals 100%
  const totalVotes = Object.values(swingVotes).reduce((sum, value) => sum + value, 0);
  for (const party in swingVotes) {
    swingVotes[party] = (swingVotes[party] / totalVotes) * 100;
  }
  
  return swingVotes;
}

/**
 * D'Hondt method for allocating seats proportionally
 * @param {Object} votePercentages - Vote percentages by party
 * @param {Number} seats - Number of seats to allocate
 * @returns {Object} Allocation results and history
 */
export function dHondt(votePercentages, seats) {
  // Initialize results and allocation history
  const results = {};
  const allocationHistory = []; // Track each step for visualization
  
  // Initialize seat counts for each party
  const parties = Object.keys(votePercentages);
  for (const party of parties) {
    results[party] = 0;
  }
  
  // Initialize allocation history with starting state
  const initialQuotients = parties.map(party => ({
    party,
    votes: votePercentages[party],
    seats: 0,
    quotient: votePercentages[party]
  }));
  
  allocationHistory.push({
    quotients: initialQuotients,
    winner: null
  });
  
  // Allocate seats one by one
  for (let seatIndex = 0; seatIndex < seats; seatIndex++) {
    // Calculate quotients for each party
    const quotients = parties.map(party => ({
      party,
      votes: votePercentages[party],
      seats: results[party],
      quotient: votePercentages[party] / (results[party] + 1)
    }));
    
    // Find the party with the highest quotient
    const winningParty = quotients.reduce(
      (max, current) => (current.quotient > max.quotient ? current : max),
      { quotient: -1 }
    ).party;
    
    // Allocate the seat
    results[winningParty]++;
    
    // Add this step to history
    allocationHistory.push({
      quotients,
      winner: winningParty
    });
  }
  
  return { results, allocationHistory };
}

/**
 * Calculate the Gallagher index of disproportionality
 * @param {Object} votePercentages - Vote percentages by party
 * @param {Object} seatPercentages - Seat percentages by party
 * @returns {Number} Gallagher index value
 */
export function calculateGallagherIndex(votePercentages, seatPercentages) {
  let sumSquaredDifferences = 0;
  
  // For each party, calculate squared difference between vote % and seat %
  for (const party in votePercentages) {
    const votePct = votePercentages[party] || 0;
    const seatPct = seatPercentages[party] || 0;
    sumSquaredDifferences += Math.pow(votePct - seatPct, 2);
  }
  
  // Gallagher Index = sqrt(0.5 * sum of squared differences)
  return Math.sqrt(sumSquaredDifferences / 2);
}

/**
 * Calculate the effective number of parties (Laakso-Taagepera index)
 * @param {Object} shares - Object with party shares (can be vote shares or seat shares)
 * @returns {Number} Effective number of parties
 */
export function calculateEffectiveNumberOfParties(shares) {
  let sumSquaredShares = 0;
  
  // Convert percentages to proportions (0-1) and sum the squares
  for (const party in shares) {
    const proportion = shares[party] / 100; // Convert from percentage to proportion
    sumSquaredShares += Math.pow(proportion, 2);
  }
  
  // ENP = 1 / sum of squared proportions
  return sumSquaredShares > 0 ? 1 / sumSquaredShares : 0;
}

/**
 * Find viable coalition combinations that could form a government
 * @param {Object} seatTotals - Seat totals by party
 * @param {Number} majorityThreshold - Seats needed for a majority
 * @returns {Array} Array of viable coalitions
 */
export function findViableCoalitions(seatTotals, majorityThreshold) {
  const parties = Object.keys(seatTotals).filter(party => seatTotals[party] > 0);
  const coalitions = [];
  
  // Check all 2-party coalitions
  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      const coalition = [parties[i], parties[j]];
      const totalCoalitionSeats = seatTotals[parties[i]] + seatTotals[parties[j]];
      
      if (totalCoalitionSeats >= majorityThreshold) {
        coalitions.push({
          parties: coalition,
          seats: totalCoalitionSeats,
          majority: totalCoalitionSeats - majorityThreshold + 1,
          partySeatCounts: {
            [parties[i]]: seatTotals[parties[i]],
            [parties[j]]: seatTotals[parties[j]]
          }
        });
      }
    }
  }
  
  // Check all 3-party coalitions if needed
  if (coalitions.length < 3) {
    for (let i = 0; i < parties.length; i++) {
      for (let j = i + 1; j < parties.length; j++) {
        for (let k = j + 1; k < parties.length; k++) {
          const coalition = [parties[i], parties[j], parties[k]];
          const totalCoalitionSeats = seatTotals[parties[i]] + seatTotals[parties[j]] + seatTotals[parties[k]];
          
          if (totalCoalitionSeats >= majorityThreshold) {
            coalitions.push({
              parties: coalition,
              seats: totalCoalitionSeats,
              majority: totalCoalitionSeats - majorityThreshold + 1,
              partySeatCounts: {
                [parties[i]]: seatTotals[parties[i]],
                [parties[j]]: seatTotals[parties[j]],
                [parties[k]]: seatTotals[parties[k]]
              }
            });
          }
        }
      }
    }
  }
  
  // Sort coalitions by number of seats (descending)
  coalitions.sort((a, b) => b.seats - a.seats);
  
  return coalitions;
}