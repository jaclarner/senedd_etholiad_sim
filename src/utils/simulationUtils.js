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
 * This is the legacy implementation, maintained for backward compatibility
 * @param {Object} seatTotals - Seat totals by party
 * @param {Number} majorityThreshold - Seats needed for a majority
 * @returns {Array} Array of viable coalitions
 */
export function findViableCoalitions(seatTotals, majorityThreshold) {
  const parties = Object.keys(seatTotals).filter(party => seatTotals[party] > 0);
  const coalitions = [];
  
  // First check if any single party has a majority
  for (const party of parties) {
    if (seatTotals[party] >= majorityThreshold) {
      coalitions.push({
        parties: [party],
        seats: seatTotals[party],
        majority: seatTotals[party] - majorityThreshold + 1,
        partySeatCounts: { [party]: seatTotals[party] },
        // Add estimated compatibility for backward compatibility
        compatibility: { 
          averageCompatibility: 10,
          minimumCompatibility: 10,
          ideologicalRange: 0,
          isConnected: true
        },
        coalitionType: "Single Party Government",
        isMinimalConnected: true,
        isMinimumWinning: true,
        isOversized: false,
        isGrandCoalition: false,
        excessSeats: seatTotals[party] - majorityThreshold
      });
    }
  }
  
  // Check all 2-party coalitions
  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      const party1 = parties[i];
      const party2 = parties[j];
      const totalCoalitionSeats = seatTotals[party1] + seatTotals[party2];
      
      if (totalCoalitionSeats >= majorityThreshold) {
        // Estimate compatibility based on party names
        // This is a simplified version of the more detailed approach in coalitionUtils.js
        let estimatedCompatibility = 0;
        
        // Basic political positioning (for backward compatibility)
        const leftParties = ['Labour', 'PlaidCymru', 'Greens'];
        const centristParties = ['LibDems'];
        const rightParties = ['Conservatives', 'Reform'];
        
        const isParty1Left = leftParties.includes(party1);
        const isParty1Centrist = centristParties.includes(party1);
        const isParty1Right = rightParties.includes(party1);
        
        const isParty2Left = leftParties.includes(party2);
        const isParty2Centrist = centristParties.includes(party2);
        const isParty2Right = rightParties.includes(party2);
        
        // If both on same side, higher compatibility
        if ((isParty1Left && isParty2Left) || 
            (isParty1Right && isParty2Right)) {
          estimatedCompatibility = 5;
        } 
        // If one centrist and one left/right, moderate compatibility
        else if ((isParty1Centrist && (isParty2Left || isParty2Right)) ||
                 (isParty2Centrist && (isParty1Left || isParty1Right))) {
          estimatedCompatibility = 2;
        }
        // If left and right, low compatibility
        else if ((isParty1Left && isParty2Right) || (isParty1Right && isParty2Left)) {
          estimatedCompatibility = -5;
        }
        // Default compatibility
        else {
          estimatedCompatibility = 0;
        }
        
        // Add the coalition with estimated political compatibility
        coalitions.push({
          parties: [party1, party2],
          seats: totalCoalitionSeats,
          majority: totalCoalitionSeats - majorityThreshold + 1,
          partySeatCounts: {
            [party1]: seatTotals[party1],
            [party2]: seatTotals[party2]
          },
          compatibility: {
            averageCompatibility: estimatedCompatibility,
            minimumCompatibility: estimatedCompatibility,
            ideologicalRange: Math.abs(estimatedCompatibility - 10) / 2,
            isConnected: estimatedCompatibility > -3
          },
          coalitionType: estimatedCompatibility > 2 ? "Minimal Connected Winning" : 
                        estimatedCompatibility > -3 ? "Practical Coalition" : 
                        "Ideologically Disconnected",
          isMinimalConnected: estimatedCompatibility > 2,
          isMinimumWinning: totalCoalitionSeats - majorityThreshold < 3,
          isOversized: totalCoalitionSeats - majorityThreshold >= 5,
          isGrandCoalition: (party1 === 'Labour' && party2 === 'Conservatives') || 
                           (party1 === 'Conservatives' && party2 === 'Labour'),
          excessSeats: totalCoalitionSeats - majorityThreshold
        });
      }
    }
  }
  
  // Check all 3-party coalitions
  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      for (let k = j + 1; k < parties.length; k++) {
        const party1 = parties[i];
        const party2 = parties[j];
        const party3 = parties[k];
        const totalCoalitionSeats = seatTotals[party1] + seatTotals[party2] + seatTotals[party3];
        
        if (totalCoalitionSeats >= majorityThreshold) {
          // Simplified estimation of compatibility for 3-party coalitions
          // Estimate based on general left-right positioning
          const leftParties = ['Labour', 'PlaidCymru', 'Greens'];
          const centristParties = ['LibDems'];
          const rightParties = ['Conservatives', 'Reform'];
          
          const leftCount = [party1, party2, party3].filter(p => leftParties.includes(p)).length;
          const rightCount = [party1, party2, party3].filter(p => rightParties.includes(p)).length;
          
          let estimatedCompatibility;
          let isConnected = true;
          
          // All from same bloc (left or right)
          if (leftCount === 3 || rightCount === 3) {
            estimatedCompatibility = 5;
          }
          // Two from same bloc plus a centrist
          else if ((leftCount === 2 && [party1, party2, party3].some(p => centristParties.includes(p))) ||
                  (rightCount === 2 && [party1, party2, party3].some(p => centristParties.includes(p)))) {
            estimatedCompatibility = 3;
          }
          // Mixed left-right with centrist bridge
          else if (leftCount === 1 && rightCount === 1 && [party1, party2, party3].some(p => centristParties.includes(p))) {
            estimatedCompatibility = 0;
          }
          // Direct left-right coalition (ideologically disconnected)
          else if (leftCount > 0 && rightCount > 0) {
            estimatedCompatibility = -3;
            isConnected = false;
          }
          // Default
          else {
            estimatedCompatibility = 1;
          }
          
          // Add to coalitions with compatibility estimate
          coalitions.push({
            parties: [party1, party2, party3],
            seats: totalCoalitionSeats,
            majority: totalCoalitionSeats - majorityThreshold + 1,
            partySeatCounts: {
              [party1]: seatTotals[party1],
              [party2]: seatTotals[party2],
              [party3]: seatTotals[party3]
            },
            compatibility: {
              averageCompatibility: estimatedCompatibility,
              minimumCompatibility: estimatedCompatibility - 2,
              ideologicalRange: Math.abs(estimatedCompatibility - 10) / 2,
              isConnected: isConnected
            },
            coalitionType: isConnected ? 
                        (totalCoalitionSeats - majorityThreshold < 3 ? "Minimum Winning Coalition" : "Oversized Coalition") : 
                        "Ideologically Disconnected",
            isMinimalConnected: isConnected && totalCoalitionSeats - majorityThreshold < 5,
            isMinimumWinning: totalCoalitionSeats - majorityThreshold < 3,
            isOversized: totalCoalitionSeats - majorityThreshold >= 5,
            isGrandCoalition: (leftCount > 0 && rightCount > 0),
            excessSeats: totalCoalitionSeats - majorityThreshold
          });
        }
      }
    }
  }
  
  // Sort coalitions:
  // 1. First by estimated compatibility (higher is better)
  // 2. Then by number of parties (fewer is better)
  // 3. Finally by total seats (more seats = more stable)
  coalitions.sort((a, b) => {
    // First by compatibility
    if (a.compatibility.averageCompatibility !== b.compatibility.averageCompatibility) {
      return b.compatibility.averageCompatibility - a.compatibility.averageCompatibility;
    }
    
    // Then by number of parties (fewer is better)
    if (a.parties.length !== b.parties.length) {
      return a.parties.length - b.parties.length;
    }
    
    // Finally by seats
    return b.seats - a.seats;
  });
  
  return coalitions;
}