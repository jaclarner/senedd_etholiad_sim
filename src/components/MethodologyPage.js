import React from 'react';

function MethodologyPage() {
  return (
    <section className="card methodology-section">
      <h2 className="section-title">Methodology and Assumptions</h2>
      
      <div className="methodology-content">
        <h3>Electoral System</h3>
        <p>
          The Senedd Election Simulator models the new electoral system for the Senedd (Welsh Parliament)
          that will be used in future elections. This system uses:
        </p>
        <ul>
          <li>Paired constituencies that form multi-member electoral regions</li>
          <li>The D'Hondt method of proportional representation to allocate seats</li>
          <li>A total of 96 Members of the Senedd (MSs), with 6 MSs elected from each paired constituency</li>
        </ul>
        
        <h3>D'Hondt Method Explained</h3>
        <p>
          The D'Hondt method is a highest averages method for allocating seats in a party-list proportional
          representation system. The calculation process works as follows:
        </p>
        <ol>
          <li>
            Each party's vote total is divided by a divisor sequence: 1, 2, 3, etc. 
            (based on how many seats they already have plus one)
          </li>
          <li>The party with the highest resulting quotient (votes ÷ divisor) wins the next seat</li>
          <li>After each seat is allocated, the divisor for that party increases by one</li>
          <li>This process repeats until all seats are allocated</li>
        </ol>
        <p>
          This method tends to favor larger parties slightly more than other proportional systems, but still
          allows smaller parties with significant vote share to gain representation.
        </p>
        
        <h3>Baseline Data</h3>
        <p>
          The simulator uses baseline data from the 2021 Senedd election, adjusted to the new constituency
          boundaries. These constituency-level estimates were created using:
        </p>
        <ul>
          <li>The official election results from the 2021 Senedd election</li>
          <li>Welsh Election Study data</li>
          <li>Boundary Commission data on the new constituency boundaries</li>
          <li>Statistical modeling to estimate vote share in the new boundaries</li>
        </ul>
        <p>
          These estimates represent our best approximation of how the 2021 votes would have translated
          to the new boundaries, but they are estimations rather than precise figures.
        </p>
        
        <h3>Swing Calculation Models</h3>
        <p>
          The simulator offers three different methods for calculating how votes change from the baseline:
        </p>
        <dl>
          <dt>Uniform National Swing</dt>
          <dd>
            Adds or subtracts the same percentage points from each party's vote share in every constituency.
            This is the simplest model but may not reflect how votes actually change across different areas.
          </dd>
          
          <dt>Proportional Swing</dt>
          <dd>
            Changes each party's vote share proportionally to their starting position in each constituency.
            This reflects that parties often gain or lose more votes in areas where they're already strong.
          </dd>
          
          <dt>Regional Variation</dt>
          <dd>
            Allows for different swings in different regions of Wales, reflecting that parties often
            perform differently across regions. This is the most sophisticated model available in the simulator.
          </dd>
        </dl>
        
        <h3>Limitations and Caveats</h3>
        <p>
          While the simulator aims to provide educational insights into the electoral system,
          users should be aware of several important limitations:
        </p>
        <ul>
          <li>
            <strong>Not a prediction tool:</strong> The simulator demonstrates how votes translate to seats
            under different scenarios, but is not designed to predict actual election outcomes.
          </li>
          <li>
            <strong>Simplified swing models:</strong> Real electoral changes are more complex than the
            models used, with demographic, candidate, and local factors all playing important roles.
          </li>
          <li>
            <strong>Turnout assumptions:</strong> The simulator assumes consistent turnout across constituencies
            and doesn't model differential turnout effects.
          </li>
          <li>
            <strong>No tactical voting:</strong> The simulator doesn't account for tactical voting behavior
            that might occur under the new system.
          </li>
          <li>
            <strong>Party stability:</strong> The simulator assumes the same parties contest all constituencies
            and doesn't account for local parties, independents, or changing party landscapes.
          </li>
        </ul>
        
        <h3>Uncertainty Visualization</h3>
        <p>
          The simulator includes visualizations of uncertainty in the seat allocation process. These indicate:
        </p>
        <ul>
          <li><strong>Solid seats:</strong> Very likely to be allocated as shown</li>
          <li><strong>Leaning seats:</strong> Likely but could change with moderate vote shifts (1-3%)</li>
          <li><strong>Toss-up seats:</strong> Could easily flip with small vote changes (&lt;1%)</li>
        </ul>
        <p>
          These uncertainty indicators help users understand which results are more or less secure,
          and how small changes in vote share might affect outcomes.
        </p>
        
        <h3>Statistical Metrics</h3>
        <p>
          The simulator calculates several statistical measures to evaluate the electoral system:
        </p>
        <dl>
          <dt>Gallagher Index (Disproportionality)</dt>
          <dd>
            Measures the difference between the votes received and seats allocated. Lower values
            indicate a more proportional outcome. Calculated as the square root of half the sum of
            squares of the difference between votes percentage and seats percentage for each party.
          </dd>
          
          <dt>Effective Number of Parties (ENP)</dt>
          <dd>
            Measures how many "effective" parties compete in the system, accounting for their relative sizes.
            Calculated using the Laakso-Taagepera index, which is the inverse of the sum of squared proportions.
          </dd>
        </dl>
        
        <h3>Methodology Updates</h3>
        <p>
          The methodology and assumptions in this simulator may be updated as new information becomes
          available or as feedback is incorporated. Major updates to the methodology will be noted here.
        </p>
      </div>
    </section>
  );
}

export default MethodologyPage;