import React, { useState, useEffect } from 'react';
import PartyInputForm from './PartyInputForm';
import ResultsDisplay from './ResultsDisplay';
import ConstituencyManager from './ConstituencyManager';
import { calculateElectionResults } from '../utils/simulationEngine';
import { baselineNationalVotes } from '../data/baselineVotes';
import constituencyPairingsData from '../data/constituencyPairings';

/**
 * Main component for election simulation functionality
 */
function MainSimulator() {
  // State to store vote percentages for each party
  const [partyVotes, setPartyVotes] = useState({
    'Labour': 38.4,
    'Conservatives': 25.1,
    'PlaidCymru': 22.4,
    'LibDems': 4.2,
    'Greens': 3.6,
    'Reform': 1.1,
    'Other': 5.2  // Includes former Abolish votes
  });
  
  // State to store constituency pairings
  const [constituencyPairings, setConstituencyPairings] = useState([]);
  
  // State to store calculated results
  const [results, setResults] = useState(null);
  
  // State for simulation options
  const [simulationOptions, setSimulationOptions] = useState({
    swingType: 'uniform',
    regionalSwings: null
  });
  
  // State to indicate if calculation is in progress
  const [isCalculating, setIsCalculating] = useState(false);
  
  // State to track if initial data is loaded
  const [isInitialized, setIsInitialized] = useState(false);
  
  // State to force recalculation
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Load initial constituency pairings from data file
  useEffect(() => {
    setConstituencyPairings([...constituencyPairingsData]);
    setIsInitialized(true);
  }, []);
  
  // Calculate results when party votes, constituency pairings, or simulation options change
  useEffect(() => {
    // Skip if not initialized yet
    if (!isInitialized || constituencyPairings.length === 0) {
      return;
    }
    
    // Start calculation
    setIsCalculating(true);
    
    // Use setTimeout to ensure UI is responsive during calculation
    const timeoutId = setTimeout(() => {
      try {
        // Calculate the results
        const newResults = calculateElectionResults(
          { ...partyVotes }, 
          [...constituencyPairings],
          { ...simulationOptions }
        );
        
        // Update state with new results
        setResults(newResults);
        console.log("Calculation complete:", newResults);
      } catch (error) {
        console.error("Error calculating results:", error);
        // You could set an error state here and show to the user
      } finally {
        setIsCalculating(false);
      }
    }, 100);
    
    // Cleanup timeout if component unmounts or dependencies change
    return () => clearTimeout(timeoutId);
  }, [partyVotes, constituencyPairings, simulationOptions, isInitialized, forceUpdate]);
  
  // Handle form submission with new vote percentages and options
  const handleVoteSubmit = (newVotes, options = {}) => {
    // Create completely new objects to ensure React detects the change
    const updatedVotes = { ...newVotes };
    const updatedOptions = { ...options };
    
    // Update state with new values
    setPartyVotes(updatedVotes);
    setSimulationOptions(updatedOptions);
    
    // Force a recalculation
    setForceUpdate(prev => prev + 1);
  };
  
  // Handle saving of new constituency pairings
  const handleSavePairings = (newPairings) => {
    setConstituencyPairings([...newPairings]);
    
    // Force a recalculation
    setForceUpdate(prev => prev + 1);
  };
  
  return (
    <div className="main-simulator">
      <div className="grid">
        {/* Left column with form inputs */}
        <div className="card input-section">
          <h2>Enter National Vote Percentages</h2>
          <PartyInputForm 
            initialVotes={partyVotes} 
            onSubmit={handleVoteSubmit} 
            currentSimulationOptions={simulationOptions}
          />
          
          <div className="constituency-management">
            <ConstituencyManager 
              pairings={constituencyPairings}
              onSavePairings={handleSavePairings}
            />
          </div>
          
          <div className="baseline-info">
            <p>
              <strong>Baseline:</strong> The starting values are based on modified 2021 Senedd election results.
            </p>
            <p>
              <strong>Note:</strong> This simulator is for educational purposes and does not predict actual election outcomes.
            </p>
          </div>
        </div>
        
        {/* Right column with results */}
        <div className="results-section">
          {isCalculating ? (
            <div className="card loading-message">
              <h3>Calculating results...</h3>
              <p>Please wait while we process your scenario.</p>
            </div>
          ) : results ? (
            <ResultsDisplay 
              results={results} 
              key={`results-${forceUpdate}`} // Force re-render when results change
            />
          ) : (
            <div className="card loading-message">
              <h3>Welcome to the Senedd Election Simulator</h3>
              <p>Adjust the vote percentages and click "Calculate Results" to see what would happen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainSimulator;