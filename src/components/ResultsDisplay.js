import React, { useState, useEffect } from 'react';
import ParliamentVisualization from './ParliamentVisualization';
import DHondtExplainer from './DHondtExplainer';
import ProportionalityMetrics from './ProportionalityMetrics';
import { formatDecimal, formatPartyName, getPartyColor } from '../utils/formatting';

/**
 * Component to display election results with visualizations
 * @param {Object} props
 * @param {Object} props.results - Complete election results
 */
function ResultsDisplay({ results }) {
  // State to track the selected constituency for the D'Hondt visualization
  const [selectedConstituency, setSelectedConstituency] = useState(0);
  
  // Reset selected constituency when results change
  useEffect(() => {
    setSelectedConstituency(0);
  }, [results]);
  
  // Extract data from results
  const { nationalTotals, metrics, constituencyResults, closestContests } = results;
  
  // Handle constituency selection for allocation visualization
  const handleConstituencySelect = (e) => {
    const index = parseInt(e.target.value);
    setSelectedConstituency(index);
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
                  <span className="bar-label">{formatDecimal(metrics.voteShare[party], 1)}%</span>
                </div>
                <div className="bar-container">
                  <div 
                    className="seat-bar"
                    style={{ 
                      width: `${metrics.seatShare[party] || 0}%`,
                      backgroundColor: getPartyColor(party)
                    }}
                  ></div>
                  <span className="bar-label">{formatDecimal(metrics.seatShare[party] || 0, 1)}%</span>
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
                {constituency.constituency}
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
      
      {!metrics.hasOverallMajority && (
        <section className="card result-section">
          <h2 className="section-title">Possible Coalitions</h2>
          <div className="coalitions-container">
            {metrics.possibleCoalitions.slice(0, 5).map((coalition, index) => (
              <div key={`coalition-${index}-${coalition.seats}`} className="coalition-card">
                <div className="coalition-header">
                  <h4>Coalition {index + 1}</h4>
                  <span className="coalition-seats">{coalition.seats} seats</span>
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
                
                <div className="coalition-breakdown">
                  {coalition.parties.map(party => (
                    <div key={`breakdown-${index}-${party}`} className="party-item">
                      <span 
                        className="party-color"
                        style={{ backgroundColor: getPartyColor(party) }}
                      ></span>
                      <span>
                        {formatPartyName(party)}: {coalition.partySeatCounts[party]} seats
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="coalition-majority">
                  Majority of {coalition.majority} {coalition.majority === 1 ? 'seat' : 'seats'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ResultsDisplay;