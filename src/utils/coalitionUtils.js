// src/utils/coalitionUtils.js
// Enhanced utilities for coalition formation based on political science theories


/**
 * Ideological positioning of Welsh political parties on left-right spectrum
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
 * Define ideological blocs for Welsh politics
 * This simplifies coalition analysis to focus on realistic combinations
 */
export const ideologicalBlocs = {
  'Left Bloc': ['Labour', 'PlaidCymru', 'Greens'],
  'Right Bloc': ['Conservatives', 'Reform'],
  'Centrist': ['LibDems'] // Can potentially work with either bloc
};

/**
 * Check if a party belongs to a specific bloc
 * @param {String} party - Party name
 * @param {String} bloc - Bloc name
 * @returns {Boolean} Whether the party belongs to the bloc
 */
function isInBloc(party, bloc) {
  return ideologicalBlocs[bloc] && ideologicalBlocs[bloc].includes(party);
}

/**
 * Get ideological bloc name for a party
 * @param {String} party - Party name
 * @returns {String} Bloc name or "Other"
 */
function getPartyBloc(party) {
  for (const bloc in ideologicalBlocs) {
    if (ideologicalBlocs[bloc].includes(party)) {
      return bloc;
    }
  }
  return "Other";
}

/**
 * Calculate compatibility between parties based on ideological proximity
 * @param {String} party1 - First party
 * @param {String} party2 - Second party
 * @returns {Number} Compatibility score (10 = high, -10 = incompatible)
 */
export function getPartyCompatibility(party1, party2) {
  if (party1 === party2) return 10; // Same party - perfect compatibility
  
  // Get the blocs
  const bloc1 = getPartyBloc(party1);
  const bloc2 = getPartyBloc(party2);
  
  // Same bloc = high compatibility
  if (bloc1 === bloc2 && bloc1 !== "Other") {
    return 8;
  }
  
  // Lib Dems can work with either bloc with moderate compatibility
  if ((party1 === 'LibDems' && (bloc2 === 'Left Bloc' || bloc2 === 'Right Bloc')) ||
      (party2 === 'LibDems' && (bloc1 === 'Left Bloc' || bloc1 === 'Right Bloc'))) {
    // Higher compatibility with left bloc than right bloc
    const otherParty = party1 === 'LibDems' ? party2 : party1;
    return isInBloc(otherParty, 'Left Bloc') ? 5 : 3;
  }
  
  // Left and right blocs have low compatibility
  if ((bloc1 === 'Left Bloc' && bloc2 === 'Right Bloc') ||
      (bloc1 === 'Right Bloc' && bloc2 === 'Left Bloc')) {
    return -8;
  }
  
  // Other combinations
  return 0;
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
      ideologicalRange: 0,
      isRealistic: true
    };
  }
  
  let totalCompatibility = 0;
  let pairCount = 0;
  let minimumCompatibility = 10;
  
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
    }
  }
  
  const averageCompatibility = pairCount > 0 ? totalCompatibility / pairCount : 10;
  
  // A coalition is realistic if the minimum compatibility isn't too negative
  const isRealistic = minimumCompatibility > -5;
  
  return {
    averageCompatibility,
    minimumCompatibility,
    ideologicalRange,
    isRealistic
  };
}

/**
 * Determine coalition type based on ideological composition
 * @param {Array} parties - Array of parties in the coalition
 * @returns {String} Coalition type description
 */
function determineCoalitionType(parties) {
  if (parties.length === 1) {
    return "Single Party Government";
  }
  
  const hasLeftParty = parties.some(party => isInBloc(party, 'Left Bloc'));
  const hasRightParty = parties.some(party => isInBloc(party, 'Right Bloc'));
  const hasLibDems = parties.includes('LibDems');
  
  // Left bloc coalition
  if (hasLeftParty && !hasRightParty) {
    if (parties.includes('Labour') && parties.includes('PlaidCymru')) {
      return hasLibDems ? "Progressive Alliance" : "Labour-Plaid Coalition";
    }
    return "Left Coalition";
  }
  
  // Right bloc coalition
  if (hasRightParty && !hasLeftParty) {
    if (parties.includes('Conservatives') && parties.includes('Reform')) {
      return hasLibDems ? "Right Alliance with Lib Dems" : "Conservative-Reform Coalition";
    }
    return "Right Coalition";
  }
  
  // Cross-bloc coalitions (less likely)
  if (hasLeftParty && hasRightParty) {
    if (hasLibDems) {
      return "Cross-Party Coalition";
    }
    return "Grand Coalition";
  }
  
  return "Other Coalition";
}

/**
 * Find viable coalitions focused on realistic ideological combinations
 * @param {Object} seatTotals - Seat totals by party
 * @param {Number} majorityThreshold - Seats needed for a majority
 * @returns {Array} Array of viable coalitions with classifications
 */
export function findViableCoalitions(seatTotals, majorityThreshold) {
  const parties = Object.keys(seatTotals).filter(party => seatTotals[party] > 0);
  const coalitions = [];
  
  // Start with single-party governments
  for (const party of parties) {
    if (seatTotals[party] >= majorityThreshold) {
      coalitions.push({
        parties: [party],
        seats: seatTotals[party],
        majority: seatTotals[party] - majorityThreshold + 1,
        partySeatCounts: { [party]: seatTotals[party] },
        compatibility: { 
          averageCompatibility: 10,
          minimumCompatibility: 10,
          ideologicalRange: 0,
          isRealistic: true
        },
        coalitionType: "Single Party Government",
        excessSeats: seatTotals[party] - majorityThreshold
      });
    }
  }
  
  // Pre-defined ideological groupings to check first
  const idealGroupings = [
    // Left bloc combinations
    ['Labour', 'PlaidCymru'],
    ['Labour', 'PlaidCymru', 'Greens'],
    ['Labour', 'PlaidCymru', 'LibDems'],
    ['Labour', 'PlaidCymru', 'Greens', 'LibDems'],
    ['Labour', 'LibDems'],
    ['Labour', 'Greens'],
    ['PlaidCymru', 'LibDems'],
    
    // Right bloc combinations
    ['Conservatives', 'Reform'],
    ['Conservatives', 'LibDems'],
    ['Conservatives', 'Reform', 'LibDems']
  ];
  
  // Check the predefined combinations first
  for (const grouping of idealGroupings) {
    // Filter to only include parties that have seats
    const validParties = grouping.filter(party => parties.includes(party));
    
    // Skip if not enough parties remain
    if (validParties.length < 2) continue;
    
    // Calculate total seats
    const totalSeats = validParties.reduce((sum, party) => sum + seatTotals[party], 0);
    
    // Only include if it meets the majority threshold
    if (totalSeats >= majorityThreshold) {
      const compatibility = getCoalitionCompatibility(validParties);
      const partySeatCounts = {};
      validParties.forEach(party => {
        partySeatCounts[party] = seatTotals[party];
      });
      
      coalitions.push({
        parties: validParties,
        seats: totalSeats,
        majority: totalSeats - majorityThreshold + 1,
        partySeatCounts,
        compatibility,
        coalitionType: determineCoalitionType(validParties),
        excessSeats: totalSeats - majorityThreshold
      });
    }
  }
  
  // Add any other two-party combinations that might work
  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      const party1 = parties[i];
      const party2 = parties[j];
      
      // Skip combinations we've already checked
      if (idealGroupings.some(group => 
          group.includes(party1) && group.includes(party2) && group.length === 2)) {
        continue;
      }
      
      const totalSeats = seatTotals[party1] + seatTotals[party2];
      
      if (totalSeats >= majorityThreshold) {
        const compatibility = getCoalitionCompatibility([party1, party2]);
        
        // Only include if it's somewhat realistic
        if (compatibility.averageCompatibility > -5) {
          coalitions.push({
            parties: [party1, party2],
            seats: totalSeats,
            majority: totalSeats - majorityThreshold + 1,
            partySeatCounts: {
              [party1]: seatTotals[party1],
              [party2]: seatTotals[party2]
            },
            compatibility,
            coalitionType: determineCoalitionType([party1, party2]),
            excessSeats: totalSeats - majorityThreshold
          });
        }
      }
    }
  }
  
  // Sort coalitions by:
  // 1. Realistic groupings first (favoring those in idealGroupings)
  // 2. Higher compatibility score
  // 3. Fewer parties (simpler coalitions)
  coalitions.sort((a, b) => {
    // First, check if coalition was in our ideal groupings list
    const aIsIdeal = idealGroupings.some(group => 
      a.parties.every(p => group.includes(p)) && 
      a.parties.length === group.length
    );
    const bIsIdeal = idealGroupings.some(group => 
      b.parties.every(p => group.includes(p)) && 
      b.parties.length === group.length
    );
    
    if (aIsIdeal && !bIsIdeal) return -1;
    if (!aIsIdeal && bIsIdeal) return 1;
    
    // Then by compatibility
    if (a.compatibility.averageCompatibility !== b.compatibility.averageCompatibility) {
      return b.compatibility.averageCompatibility - a.compatibility.averageCompatibility;
    }
    
    // Then by number of parties (fewer is better)
    if (a.parties.length !== b.parties.length) {
      return a.parties.length - b.parties.length;
    }
    
    // Finally by seats (more seats = more stable)
    return b.seats - a.seats;
  });
  
  // Limit to top 5 realistic coalitions
  return coalitions.slice(0, 5);
}