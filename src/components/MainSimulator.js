import React, { useState, useEffect } from 'react';
import PartyInputForm from './PartyInputForm';
import ResultsDisplay from './ResultsDisplay';
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
    'Reform': 4.1,
    'Other': 2.2  // Includes former Abolish votes
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

  // State to track errors
  const [error, setError] = useState(null);
  
  // Load initial constituency pairings from data file
  useEffect(() => {
    console.log("Loading constituency pairings data...");
    
    try {
      // Extract pairings from the new data format
      if (Array.isArray(constituencyPairingsData) && constituencyPairingsData.length > 0) {
        // Check if it's the new format with ukConstituencies property
        if (constituencyPairingsData[0].ukConstituencies) {
          const pairings = constituencyPairingsData.map(item => item.ukConstituencies);
          console.log("Created pairings from new format:", pairings);
          setConstituencyPairings(pairings);
        } 
        // Check if it's the old format (array of arrays)
        else if (Array.isArray(constituencyPairingsData[0])) {
          console.log("Using existing pairings array:", constituencyPairingsData);
          setConstituencyPairings(constituencyPairingsData);
        } else {
          throw new Error("Unrecognized constituency pairings format");
        }
      } else {
        throw new Error("No valid constituency pairings data found");
      }
      
      setIsInitialized(true);
    } catch (err) {
      console.error("Error setting constituency pairings:", err);
      setError("Failed to initialize constituency data: " + err.message);
    }
  }, []);
  
  // Calculate results when party votes, constituency pairings, or simulation options change
  useEffect(() => {
    // Skip if not initialized yet
    if (!isInitialized || !constituencyPairings || constituencyPairings.length === 0) {
      console.log("Skipping calculation - not initialized yet:", { 
        isInitialized, 
        hasPairings: Boolean(constituencyPairings),
        pairingsLength: constituencyPairings?.length || 0
      });
      return;
    }
    
    // Start calculation
    setIsCalculating(true);
    setError(null);
    
    console.log("Starting calculation with:", {
      partyVotes,
      constituencyPairings: constituencyPairings.slice(0, 2), // Log just the first two for brevity
      simulationOptions
    });
    
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
        setError(`Calculation error: ${error.message}`);
      } finally {
        setIsCalculating(false);
      }
    }, 100);
    
    // Cleanup timeout if component unmounts or dependencies change
    return () => clearTimeout(timeoutId);
  }, [partyVotes, constituencyPairings, simulationOptions, isInitialized, forceUpdate]);

  
  // Handle form submission with new vote percentages and options
  const handleVoteSubmit = (newVotes, options = {}) => {
    console.log("Submitting new votes:", newVotes, options);
    
    // Create completely new objects to ensure React detects the change
    const updatedVotes = { ...newVotes };
    const updatedOptions = { ...options };
    
    // Update state with new values
    setPartyVotes(updatedVotes);
    setSimulationOptions(updatedOptions);
    
    // Force a recalculation
    setForceUpdate(prev => prev + 1);
    console.log("Force update triggered:", forceUpdate + 1);
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
          {error && (
            <div className="card error-message">
              <h3>Error</h3>
              <p>{error}</p>
              <details>
                <summary>Debug Information</summary>
                <pre>{JSON.stringify({
                  isInitialized,
                  pairings: constituencyPairings ? 
                    (constituencyPairings.length > 0 ? 
                      constituencyPairings.slice(0, 2) : 
                      "Empty array") : 
                    "No pairings",
                  parties: Object.keys(partyVotes)
                }, null, 2)}</pre>
              </details>
            </div>
          )}
          
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