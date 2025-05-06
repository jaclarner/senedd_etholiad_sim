import React, { useState, useEffect } from 'react';
import ParliamentVisualization from './ParliamentVisualization';
import DHondtExplainer from './DHondtExplainer';
import ProportionalityMetrics from './ProportionalityMetrics';
import { formatDecimal, formatPartyName, getPartyColor } from '../utils/formatting';
import { seneddConstituencyNames } from '../data/constituencyPairings';
import CoalitionAnalysis from './CoalitionAnalysis'; // New component we'll create

/**
 * Enhanced component to display election results with visualizations and coalition analysis
 * @param {Object} props
 * @param {Object} props.results - Complete election results
 */
function ResultsDisplay({ results }) {
  // State to track the selected constituency for the D'Hondt visualization
  const [selectedConstituency, setSelectedConstituency] = useState(0);
  // State to track the selected coalition for detailed view
  const [selectedCoalition, setSelectedCoalition] = useState(0);
  
  // Reset selected constituency when results change
  useEffect(() => {
    setSelectedConstituency(0);
    setSelectedCoalition(0);
  }, [results]);
  
  // Extract data from results
  const { nationalTotals, metrics, constituencyResults, closestContests } = results;
  
  // Handle constituency selection for allocation visualization
  const handleConstituencySelect = (e) => {
    const index = parseInt(e.target.value);
    setSelectedConstituency(index);
  };

  // Handle coalition selection for detailed view
  const handleCoalitionSelect = (index) => {
    setSelectedCoalition(index);
  };
  
  return (
    <div className="results-display">
      <section className="card result-section">
        <h2 className="section-title">National Results</h2>
        <div className="national-summary">
          <div className="summary-item">
            <span className="label">Largest Party:</span>
            <span className="value">{formatPartyName(metrics.largestParty)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Overall Majority:</span>
            <span className="value">
              {metrics.hasOverallMajority ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Majority Threshold:</span>
            <span className="value">{metrics.majorityThreshold} seats</span>
          </div>
          <div className="summary-item">
            <span className="label">Disproportionality Index:</span>
            <span className="value">{formatDecimal(metrics.disproportionalityIndex, 2)}</span>
          </div>
        </div>
        
        {/* Parliament visualization */}
        <ParliamentVisualization 
          seatTotals={nationalTotals}
          majorityThreshold={metrics.majorityThreshold}
        />
      </section>
      
      <section className="card result-section">
        <h2 className="section-title">Vote Share vs. Seat Share</h2>
        
        <div className="comparative-chart">
          {Object.keys(metrics.voteShare)
            .filter(party => metrics.voteShare[party] > 1 || metrics.seatShare[party] > 0)
            .sort((a, b) => metrics.voteShare[b] - metrics.voteShare[a])
            .map(party => (
              <div key={`chart-${party}-${metrics.voteShare[party]}`} className="party-row">
                <div className="party-name">
                  {formatPartyName(party)}
                </div>
                <div className="bar-container">
                  <div 
                    className="vote-bar"
                    style={{ 
                      width: `${metrics.voteShare[party]}%`,
                      backgroundColor: `${getPartyColor(party)}80` // Add transparency
                    }}
                  ></div>
                  <span className="bar-label vote-label">{formatDecimal(metrics.voteShare[party], 1)}%</span>
                </div>
                <div className="bar-container">
                  <div 
                    className="seat-bar"
                    style={{ 
                      width: `${metrics.seatShare[party] || 0}%`,
                      backgroundColor: getPartyColor(party)
                    }}
                  ></div>
                  <span className="bar-label seat-label">{formatDecimal(metrics.seatShare[party] || 0, 1)}%</span>
                </div>
              </div>
            ))
          }
        </div>
        
        <div className="chart-legend">
          <div className="legend-item">
            <span className="vote-legend-color"></span>
            <span>Vote Share</span>
          </div>
          <div className="legend-item">
            <span className="seat-legend-color"></span>
            <span>Seat Share</span>
          </div>
        </div>
      </section>
      
      <section className="card result-section">
        <h2 className="section-title">D'Hondt Seat Allocation</h2>
        <div className="constituency-selector">
          <label htmlFor="constituency-select">Select Constituency:</label>
          <select 
            id="constituency-select" 
            onChange={handleConstituencySelect}
            value={selectedConstituency}
            className="select-input"
          >
            {constituencyResults.map((constituency, index) => (
              <option 
                key={`${constituency.constituency}-${index}`}
                value={index}
              >
                {seneddConstituencyNames[index] || constituency.constituency}
              </option>
            ))}
          </select>
        </div>
        
        {/* DHondt visualization component */}
        {constituencyResults.length > 0 && (
          <DHondtExplainer 
            allocationHistory={constituencyResults[selectedConstituency].allocationHistory}
            seatStability={constituencyResults[selectedConstituency].seatStability}
            votesNeededToChange={constituencyResults[selectedConstituency].votesNeededToChange}
            key={`dhondt-${selectedConstituency}-${JSON.stringify(nationalTotals)}`}
          />
        )}
      </section>
      
      {/* Proportionality metrics section */}
      <section className="card result-section">
        <h2 className="section-title">Electoral System Metrics</h2>
        <ProportionalityMetrics metrics={metrics} />
      </section>
      
      {/* Enhanced coalition analysis section */}
{!metrics.hasOverallMajority && metrics.possibleCoalitions && metrics.possibleCoalitions.length > 0 && (
  <section className="card result-section">
    <h2 className="section-title">Potential Governing Arrangements</h2>
    
    {/* Simplified coalition explanation */}
    <div className="coalition-theory">
      <p className="theory-intro">
        While the Senedd uses a proportional system, most democracies form governments based on ideological compatibility. 
        The below analysis shows potential coalitions based on ideological alignment.
      </p>
      
      <div className="theory-details">
        <div className="theory-item">
          <h4>Welsh/Left-wing Group</h4>
          <p>Combinations of Labour, Plaid Cymru, Greens, and potentially Liberal Democrats</p>
        </div>
        
        <div className="theory-item">
          <h4>British/Right-wing Group</h4>
          <p>Combinations of Conservatives, Reform.</p>
        </div>
      </div>
    </div>
  
    {/* List of theoretical coalition possibilities */}
    <div className="coalitions-container">
      {metrics.possibleCoalitions.slice(0, 5).map((coalition, index) => (
        <div 
          key={`coalition-${index}-${coalition.seats}`} 
          className={`coalition-card ${selectedCoalition === index ? 'selected' : ''}`}
          onClick={() => handleCoalitionSelect(index)}
        >
          <div className="coalition-header">
            <div className="coalition-title">
              <h4>{coalition.coalitionType}</h4>
              <span className="coalition-seats">{coalition.seats} seats</span>
            </div>
            
            {/* Coalition compatibility indicator */}
            <div className="compatibility-indicator">
              <span 
                className={`compatibility-dot ${
                  coalition.compatibility.averageCompatibility > 5 ? 'high' :
                  coalition.compatibility.averageCompatibility > 0 ? 'medium' : 'low'
                }`}
                title={`Compatibility: ${formatDecimal(coalition.compatibility.averageCompatibility, 1)}`}
              ></span>
            </div>
          </div>
          
          <div className="coalition-parties">
            {coalition.parties.map(party => (
              <span key={`${index}-${party}`} className="coalition-party">
                {formatPartyName(party)}
                {coalition.parties.indexOf(party) < coalition.parties.length - 1 ? ' + ' : ''}
              </span>
            ))}
          </div>
          
          <div className="coalition-bar">
            {coalition.parties.map(party => (
              <div 
                key={`bar-${index}-${party}`}
                className="party-segment"
                style={{
                  width: `${(coalition.partySeatCounts[party] / coalition.seats) * 100}%`,
                  backgroundColor: getPartyColor(party)
                }}
                title={`${formatPartyName(party)}: ${coalition.partySeatCounts[party]} seats`}
              ></div>
            ))}
          </div>
          
          <div className="coalition-details">
            <div className="majority-info">
              <span className="label">Majority:</span>
              <span className="value">{coalition.majority} {coalition.majority === 1 ? 'seat' : 'seats'}</span>
            </div>
            
            <div className="compatibility-info">
              <span className="label">Compatibility:</span>
              <span className="value">
                {coalition.compatibility.averageCompatibility > 5 ? 'High' : 
                 coalition.compatibility.averageCompatibility > 0 ? 'Moderate' : 'Low'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Detailed analysis of selected coalition */}
    {metrics.possibleCoalitions.length > 0 && (
      <CoalitionAnalysis 
        coalition={metrics.possibleCoalitions[selectedCoalition]}
        seatTotals={nationalTotals}
        majorityThreshold={metrics.majorityThreshold}
      />
    )}
    
    <div className="coalition-theory-notes">
      <h4>Understanding Welsh Coalition Politics</h4>
      <p>
        Wales has a history of parties working together formally in a coalition or via some other arrangement. 
        Currently two main ideological blocs are generally:
      </p>
      <ul>
        <li>A Welsh/Left Bloc: Labour and Plaid Cymru and sometimes Liberal Democrats and potentially Greens.</li>
        <li>A British/Right Bloc: Conservatives and Reform UK.</li>
      </ul>
      <p>
        The Liberal Democrats could potentially work with either bloc (though in recent years are much closer aligned to the Welsh/left bloc), while other cross-bloc arrangements 
        are less common but not impossible in specific political circumstances.
      </p>
    </div>
  </section>
)}
     
    </div>
  );
}

export default ResultsDisplay;