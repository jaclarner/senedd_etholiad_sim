import React from 'react';

function AboutPage() {
  return (
    <section className="card about-section">
      <h2 className="section-title">About the Senedd Election Simulator</h2>
      
      <div className="about-content">
        <p>
          This is an informational tool that visualises how votes translate into seats in the Senedd
          under the voting system introduced for the 2026 election. It starts from the actual results
          of the 2026 Senedd election and lets you explore what would happen if those votes changed.
        </p>
        
        <h3>How it works</h3>
        <p>
          Wales elects 96 Members of the Senedd from 16 constituencies, with 6 members returned from
          each using closed party lists and the D'Hondt method of proportional representation. The
          simulator takes the real 2026 vote share in each of those 16 constituencies, applies the
          change you specify, and re-runs the D'Hondt allocation.
        </p>
        
        <h3>Assumptions and limitations</h3>
        <p>
          When allocating seats, the tool makes several assumptions that should be noted:
        </p>
        <ul>
          <li>
            The baseline is the real 2026 result, so the starting point is no longer an estimate.
            Everything after that point is a model, not a forecast.
          </li>
          <li>
            The standard model assumes a uniform swing across all constituencies, which may not be the
            case in a real election. You can swap to proportional swing, but this has its own problems,
            particularly when dealing with large swings in vote intention.
          </li>
          <li>
            Parties that won no seats in 2026, along with independents, are grouped together as
            "Other". They are modelled as a single bloc, which is not how they would behave in reality.
          </li>
          <li>
            The tool does not account for tactical voting or local factors that might influence 
            results in specific areas, and it cannot model who parties place at the top of their lists.
          </li>
        </ul>
        
        <h3>Contact</h3>
        <p>
          If users have feedback or suggested improvements, or spot errors, please contact: 
          larnerJM[at]cardiff.ac.uk
        </p>
      </div>
    </section>
  );
}

export default AboutPage;
