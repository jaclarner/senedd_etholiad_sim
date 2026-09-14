import React, { useState, useEffect } from 'react';
import PartyInputForm from './PartyInputForm';
import ResultsDisplay from './ResultsDisplay';
import { calculateElectionResults } from '../utils/simulationEngine';
import { baselineNationalVotes } from '../data/seneddResults2026';

/**
 * Main component for election simulation functionality
 */
function MainSimulator() {
  // Vote percentages for each party, starting from the actual 2026 result
  const [partyVotes, setPartyVotes] = useState({ ...baselineNationalVotes });

  // State to store calculated results
  const [results, setResults] = useState(null);

  // State for simulation options
  const [simulationOptions, setSimulationOptions] = useState({
    swingType: 'uniform',
    regionalSwings: null
  });

  // State to indicate if calculation is in progress
  const [isCalculating, setIsCalculating] = useState(false);

  // State to force recalculation
  const [forceUpdate, setForceUpdate] = useState(0);

  // State to track errors
  const [error, setError] = useState(null);

  // Recalculate whenever the votes or simulation options change
  useEffect(() => {
    setIsCalculating(true);
    setError(null);

    // Use setTimeout to ensure UI is responsive during calculation
    const timeoutId = setTimeout(() => {
      try {
        const newResults = calculateElectionResults(
          { ...partyVotes },
          { ...simulationOptions }
        );
        setResults(newResults);
      } catch (err) {
        console.error("Error calculating results:", err);
        setError(`Calculation error: ${err.message}`);
      } finally {
        setIsCalculating(false);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [partyVotes, simulationOptions, forceUpdate]);

  // Handle form submission with new vote percentages and options
  const handleVoteSubmit = (newVotes, options = {}) => {
    setPartyVotes({ ...newVotes });
    setSimulationOptions({ ...options });
    setForceUpdate(prev => prev + 1);
  };

  return (
    <div className="main-simulator">
      <div className="grid">
        {/* Left column with form inputs */}
        <div className="card input-section">
          <h2>Enter National Vote Percentages or Select Preset Below</h2>
          <PartyInputForm
            initialVotes={partyVotes}
            onSubmit={handleVoteSubmit}
            currentSimulationOptions={simulationOptions}
          />

          <div className="baseline-info">
            <p>
              <strong>Baseline:</strong> The starting values are the actual results of the
              2026 Senedd election. Changes you make are applied to each constituency's real
              2026 vote shares.
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
