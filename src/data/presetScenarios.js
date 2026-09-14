// src/data/presetScenarios.js
// Preset scenarios for the Senedd Election Simulator
//
// The 'baseline' preset is the actual 2026 Senedd election result and is the
// starting point the simulator loads with. Figures come from seneddResults2026.js.

import { baselineNationalVotes } from './seneddResults2026';

const presetScenarios = [
    {
      id: 'baseline',
      name: '2026 Senedd Election (actual result)',
      description: 'The real Wales-wide result of the 2026 Senedd election, the first under the new system',
      votes: { ...baselineNationalVotes },
      source: 'Official 2026 Senedd election results',
      date: '2026-05-07',
      category: 'historical'
    },
    {
      id: '2021-senedd',
      name: '2021 Senedd Election',
      description: 'Vote shares from the 2021 Senedd election, held under the old system',
      votes: {
        'Labour': 38.4,
        'Conservatives': 25.1,
        'PlaidCymru': 22.4,
        'LibDems': 4.2,
        'Greens': 3.6,
        'Reform': 4.1,
        'Other': 2.2
      },
      source: '2021 Senedd election. Reform combines the 2021 Reform UK and Abolish the Welsh Assembly votes',
      date: '2021-05-06',
      category: 'historical'
    },
    {
      id: '2024-ge',
      name: '2024 General Election',
      description: 'Welsh vote shares from the 2024 Westminster election',
      votes: {
        'Labour': 37.0,
        'Conservatives': 18.2,
        'PlaidCymru': 14.8,
        'LibDems': 6.5,
        'Greens': 4.7,
        'Reform': 16.9,
        'Other': 1.9
      },
      source: '2024 Westminster election, Wales',
      date: '2024-07-04',
      category: 'historical'
    },
    {
      id: 'labour-recovery',
      name: 'Labour Recovery',
      description: 'Labour claws back support from both Plaid Cymru and Reform',
      votes: {
        'Labour': 25.0,
        'Conservatives': 10.0,
        'PlaidCymru': 28.0,
        'LibDems': 5.0,
        'Greens': 6.0,
        'Reform': 24.0,
        'Other': 2.0
      },
      source: 'Hypothetical scenario',
      category: 'hypothetical'
    },
    {
      id: 'reform-largest',
      name: 'Reform Overtakes Plaid',
      description: 'Reform edges ahead of Plaid Cymru to become the largest party',
      votes: {
        'Labour': 11.0,
        'Conservatives': 9.0,
        'PlaidCymru': 30.0,
        'LibDems': 4.0,
        'Greens': 8.0,
        'Reform': 36.0,
        'Other': 2.0
      },
      source: 'Hypothetical scenario',
      category: 'hypothetical'
    },
    {
      id: 'plaid-majority',
      name: 'Plaid Cymru Push for a Majority',
      description: 'Plaid Cymru extends its lead and closes in on an overall majority',
      votes: {
        'Labour': 11.0,
        'Conservatives': 8.0,
        'PlaidCymru': 44.0,
        'LibDems': 4.0,
        'Greens': 6.0,
        'Reform': 25.0,
        'Other': 2.0
      },
      source: 'Hypothetical scenario',
      category: 'hypothetical'
    },
    {
      id: 'conservative-revival',
      name: 'Conservative Revival',
      description: 'The Conservatives win back voters who went to Reform in 2026',
      votes: {
        'Labour': 13.0,
        'Conservatives': 22.0,
        'PlaidCymru': 30.0,
        'LibDems': 5.0,
        'Greens': 6.0,
        'Reform': 22.0,
        'Other': 2.0
      },
      source: 'Hypothetical scenario',
      category: 'hypothetical'
    },
    {
      id: 'four-way-split',
      name: 'Four-Way Split',
      description: 'A much more evenly divided Wales with four competitive parties',
      votes: {
        'Labour': 20.0,
        'Conservatives': 16.0,
        'PlaidCymru': 27.0,
        'LibDems': 5.0,
        'Greens': 5.0,
        'Reform': 25.0,
        'Other': 2.0
      },
      source: 'Hypothetical scenario',
      category: 'hypothetical'
    }

    // ── Polling presets ──
    // Post-election polling goes here, with category: 'polling'. Example shape:
    // {
    //   id: 'poll-yougov-2026-09',
    //   name: 'YouGov / ITV Wales, September 2026',
    //   description: 'Most recent Welsh voting intention poll',
    //   votes: { Labour: 0, Conservatives: 0, PlaidCymru: 0, LibDems: 0, Greens: 0, Reform: 0, Other: 0 },
    //   source: 'YouGov for ITV Wales / Cardiff University',
    //   date: '2026-09-01',
    //   category: 'polling'
    // },
  ];
  
  export default presetScenarios;
