// src/utils/coalitionUtils.js
// Enhanced utilities for coalition formation based on political science theories

/**
 * Ideological positioning of Welsh political parties on left-right spectrum
 * These values are approximate and used for coalition compatibility calculations
 * Scale: 0 (far left) to 10 (far right)
 */
export const partyIdeology = {
    'Labour': 3.5,      // Centre-left
    'PlaidCymru': 3.0,  // Left-leaning nationalist
    'LibDems': 5.0,     // Centrist
    'Greens': 2.5,      // Left-wing
    'Conservatives': 7.0, // Centre-right
    'Reform': 8.5,      // Right-wing
    'Other': 5.0        // Default centrist position for others
  };
  
  /**
   * Calculate ideological distance between parties
   * @param {String} party1 - First party
   * @param {String} party2 - Second party
   * @returns {Number} Ideological distance (0-10)
   */
  export function getIdeologicalDistance(party1, party2) {
    const position1 = partyIdeology[party1] || 5;
    const position2 = partyIdeology[party2] || 5;
    return Math.abs(position1 - position2);
  }
  
  /**
   * Define historical compatibility between parties
   * This captures non-ideological factors that affect coalition formation
   * Scale: -2 (incompatible) to 2 (highly compatible)
   */
  export const historicalCompatibility = {
    'Labour': {
      'PlaidCymru': 1,
      'LibDems': 1,
      'Greens': 0.5,
      'Conservatives': -1.5,
      'Reform': -2,
      'Other': 0
    },
    'PlaidCymru': {
      'Labour': 1,
      'LibDems': 0.5,
      'Greens': 1,
      'Conservatives': -1,
      'Reform': -2,
      'Other': 0
    },
    'LibDems': {
      'Labour': 1,
      'PlaidCymru': 0.5,
      'Greens': 0.5,
      'Conservatives': 0,
      'Reform': -1,
      'Other': 0
    },
    'Greens': {
      'Labour': 0.5,
      'PlaidCymru': 1,
      'LibDems': 0.5,
      'Conservatives': -1.5,
      'Reform': -2,
      'Other': 0
    },
    'Conservatives': {
      'Labour': -1.5,
      'PlaidCymru': -1,
      'LibDems': 0,
      'Greens': -1.5,
      'Reform': 0.5,
      'Other': 0
    },
    'Reform': {
      'Labour': -2,
      'PlaidCymru': -2,
      'LibDems': -1,
      'Greens': -2,
      'Conservatives': 0.5,
      'Other': 0
    },
    'Other': {
      'Labour': 0,
      'PlaidCymru': 0,
      'LibDems': 0,
      'Greens': 0,
      'Conservatives': 0,
      'Reform': 0,
      'Other': 0
    }
  };
  
  /**
   * Calculate overall compatibility score between parties
   * @param {String} party1 - First party
   * @param {String} party2 - Second party
   * @returns {Number} Compatibility score (-10 to 10, higher is more compatible)
   */
  export function getPartyCompatibility(party1, party2) {
    if (party1 === party2) return 10; // Same party - perfect compatibility
    
    // Get ideological distance (0-10)
    const ideologicalDistance = getIdeologicalDistance(party1, party2);
    // Convert to ideological compatibility (-5 to 5)
    const ideologicalCompatibility = 5 - ideologicalDistance;
    
    // Get historical compatibility (-2 to 2)
    const historicalComp = (historicalCompatibility[party1] && historicalCompatibility[party1][party2]) || 0;
    
    // Combine factors (weighted: ideology 60%, historical 40%)
    return (ideologicalCompatibility * 0.6) + (historicalComp * 2 * 0.4);
  }
  
  /**
   * Calculate overall coalition compatibility
   * @param {Array} parties - Array of party names
   * @returns {Object} Compatibility metrics for the coalition
   */
  export function getCoalitionCompatibility(parties) {
    if (!parties || parties.length <= 1) {
      return {
        averageCompatibility: 10, // Perfect for single party
        minimumCompatibility: 10,
        ideologicalRange: 0,
        isConnected: true
      };
    }
    
    let totalCompatibility = 0;
    let pairCount = 0;
    let minimumCompatibility = 10;
    let isConnected = true;
    
    // Get min and max ideological positions to calculate range
    const ideologicalPositions = parties.map(party => partyIdeology[party] || 5);
    const minPosition = Math.min(...ideologicalPositions);
    const maxPosition = Math.max(...ideologicalPositions);
    const ideologicalRange = maxPosition - minPosition;
    
    // Check each party pair
    for (let i = 0; i < parties.length; i++) {
      for (let j = i + 1; j < parties.length; j++) {
        const compatibility = getPartyCompatibility(parties[i], parties[j]);
        totalCompatibility += compatibility;
        pairCount++;
        
        if (compatibility < minimumCompatibility) {
          minimumCompatibility = compatibility;
        }
        
        // Check if any pair is fundamentally incompatible (below -5)
        if (compatibility < -5) {
          isConnected = false;
        }
      }
    }
    
    const averageCompatibility = pairCount > 0 ? totalCompatibility / pairCount : 10;
    
    return {
      averageCompatibility,
      minimumCompatibility,
      ideologicalRange,
      isConnected
    };
  }
  
  /**
   * Classify coalition types based on political science theories
   * @param {Object} coalition - Coalition object with parties and seat counts
   * @param {Number} majorityThreshold - Number of seats needed for majority
   * @returns {Object} Coalition with added classification data
   */
  export function classifyCoalition(coalition, majorityThreshold) {
    const compatibility = getCoalitionCompatibility(coalition.parties);
    const totalSeats = coalition.seats;
    const excessSeats = totalSeats - majorityThreshold;
    
    // Classify based on Axelrod's minimal connected winning theory
    const isMinimalConnected = compatibility.isConnected && 
      coalition.parties.length > 1 && 
      excessSeats < 5; // Allow small buffer for practical stability
    
    // Classify based on Riker's minimum winning coalition theory
    const isMinimumWinning = totalSeats >= majorityThreshold && 
      excessSeats < 3; // Very small margin
    
    // Check if it's an oversized coalition
    const isOversized = excessSeats >= 5;
    
    // Check if it's a grand coalition (includes major opposing parties)
    const hasLabour = coalition.parties.includes('Labour');
    const hasConservative = coalition.parties.includes('Conservatives');
    const isGrandCoalition = hasLabour && hasConservative;
    
    // Determine coalition type
    let coalitionType = '';
    if (isGrandCoalition) {
      coalitionType = 'Grand Coalition';
    } else if (!compatibility.isConnected) {
      coalitionType = 'Ideologically Disconnected';
    } else if (isMinimumWinning && isMinimalConnected) {
      coalitionType = 'Minimum Connected Winning';
    } else if (isMinimalConnected) {
      coalitionType = 'Minimal Connected Winning';
    } else if (isOversized) {
      coalitionType = 'Oversized Coalition';
    } else {
      coalitionType = 'Practical Coalition';
    }
    
    // Return enhanced coalition object
    return {
      ...coalition,
      compatibility: compatibility,
      coalitionType: coalitionType,
      isMinimalConnected,
      isMinimumWinning,
      isOversized,
      isGrandCoalition,
      excessSeats
    };
  }
  
  /**
   * Find viable coalitions using political science theories
   * @param {Object} seatTotals - Seat totals by party
   * @param {Number} majorityThreshold - Seats needed for a majority
   * @returns {Array} Array of viable coalitions with classifications
   */
  export function findViableCoalitions(seatTotals, majorityThreshold) {
    const parties = Object.keys(seatTotals).filter(party => seatTotals[party] > 0);
    const coalitions = [];
    
    // Start with single-party majorities
    for (const party of parties) {
      if (seatTotals[party] >= majorityThreshold) {
        const singlePartyCoalition = {
          parties: [party],
          seats: seatTotals[party],
          majority: seatTotals[party] - majorityThreshold + 1,
          partySeatCounts: { [party]: seatTotals[party] }
        };
        
        coalitions.push(classifyCoalition(singlePartyCoalition, majorityThreshold));
      }
    }
    
    // Check all 2-party coalitions
    for (let i = 0; i < parties.length; i++) {
      for (let j = i + 1; j < parties.length; j++) {
        const party1 = parties[i];
        const party2 = parties[j];
        const totalSeats = seatTotals[party1] + seatTotals[party2];
        
        if (totalSeats >= majorityThreshold) {
          const coalition = {
            parties: [party1, party2],
            seats: totalSeats,
            majority: totalSeats - majorityThreshold + 1,
            partySeatCounts: {
              [party1]: seatTotals[party1],
              [party2]: seatTotals[party2]
            }
          };
          
          coalitions.push(classifyCoalition(coalition, majorityThreshold));
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
          const totalSeats = seatTotals[party1] + seatTotals[party2] + seatTotals[party3];
          
          if (totalSeats >= majorityThreshold) {
            const coalition = {
              parties: [party1, party2, party3],
              seats: totalSeats,
              majority: totalSeats - majorityThreshold + 1,
              partySeatCounts: {
                [party1]: seatTotals[party1],
                [party2]: seatTotals[party2],
                [party3]: seatTotals[party3]
              }
            };
            
            coalitions.push(classifyCoalition(coalition, majorityThreshold));
          }
        }
      }
    }
    
    // Sort coalitions based on multiple criteria:
    // 1. First by theoretical preference (Minimum Connected Winning first)
    // 2. Then by compatibility
    // A multi-criteria sort:
    coalitions.sort((a, b) => {
      // Prioritize minimum connected winning coalitions
      if (a.isMinimalConnected && !b.isMinimalConnected) return -1;
      if (!a.isMinimalConnected && b.isMinimalConnected) return 1;
      
      // Then sort by compatibility
      if (a.compatibility.averageCompatibility !== b.compatibility.averageCompatibility) {
        return b.compatibility.averageCompatibility - a.compatibility.averageCompatibility;
      }
      
      // Then prefer smaller coalitions (fewer parties)
      if (a.parties.length !== b.parties.length) {
        return a.parties.length - b.parties.length;
      }
      
      // Finally, prefer coalitions with smaller total seats (minimum winning)
      return a.seats - b.seats;
    });
    
    return coalitions;
  }