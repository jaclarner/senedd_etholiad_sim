// src/data/presetScenarios.js
// Preset scenarios for the Senedd Election Simulator

const presetScenarios = [
    {
      id: 'baseline',
      name: 'Baseline (2021)',
      description: 'Estimated results from the 2021 Senedd election adjusted to new boundaries',
      votes: {
        'Labour': 38.4,
        'Conservatives': 25.1,
        'PlaidCymru': 22.4,
        'LibDems': 4.2,
        'Greens': 3.6,
        'Reform': 4.1,
        'Other': 2.2
      },
      source: '2021 Senedd Election with adjustments for new boundaries',
      date: '2021-05-06',
      category: 'historical'
    },
    {
      id: 'recent-polling',
      name: 'Most recent ITV Wales YouGov Poll',
      description: 'Based on recent Welsh polling data',
      votes: {
        'Labour': 18.0,
        'Conservatives': 13.0,
        'PlaidCymru': 30.0,
        'LibDems': 7.0,
        'Greens': 5.0,
        'Reform': 25.0,
        'Other': 2.0
      },
      source: 'Most recent YouGov poll',
      date: '2025-05-01',
      category: 'polling'
    },
    {
      id: '2024 GE',
      name: '2024 General Election Shares',
      description: 'Vote shares from 2024 Westminster Election',
      votes: {
        'Labour': 37.0,
        'Conservatives': 18.2,
        'PlaidCymru': 14.8,
        'LibDems': 6.5,
        'Greens': 4.7,
        'Reform': 16.9,
        'Other': 1.9
      },
      source: '2024 Westminster Election',
      category: 'historical'
    },
    {
      id: 'Labour-surge',
      name: 'Labour Surge',
      description: 'Hypothetical scenario with increased Labour support',
      votes: {
        'Labour': 35.0,
        'Conservatives': 15.0,
        'PlaidCymru': 20.0,
        'LibDems': 4.0,
        'Greens': 3.0,
        'Reform': 20.0,
        'Other': 3.0
      },
      source: 'Hypothetical scenario',
      category: 'hypothetical'
    },
    {
      id: 'plaid-surge',
      name: 'Plaid Cymru Surge',
      description: 'Hypothetical scenario with increased Plaid Cymru support',
      votes: {
        'Labour': 20.0,
        'Conservatives': 15.0,
        'PlaidCymru': 35.0,
        'LibDems': 4.0,
        'Greens': 3.0,
        'Reform': 20.0,
        'Other': 3.0
      },
      source: 'Hypothetical scenario',
      category: 'hypothetical'
    },
    {
      id: 'reform-surge',
      name: 'Reform Surge',
      description: 'Hypothetical scenario with increased Reform support',
      votes: {
        'Labour': 20.0,
        'Conservatives': 10.0,
        'PlaidCymru': 27.0,
        'LibDems': 3.0,
        'Greens': 3.0,
        'Reform': 35.0,
        'Other': 2.0
      },
      source: 'Hypothetical scenario',
      category: 'hypothetical'
    },
    {
      id: 'green-libdem-surge',
      name: 'Green/LibDem Surge',
      description: 'Hypothetical scenario with increased support for Greens and Liberal Democrats',
      votes: {
        'Labour': 20.0,
        'Conservatives': 10.0,
        'PlaidCymru': 25.0,
        'LibDems': 12.0,
        'Greens': 12.0,
        'Reform': 20.0,
        'Other': 1.0
      },
      source: 'Hypothetical scenario',
      category: 'hypothetical'
    },
    {
      id: 'polling_average',
      name: 'Polling average',
      description: 'Average of last three opinion polls (with N>1000)',
      votes: {
        'Labour': 16.6,
        'Conservatives': 11.6,
        'PlaidCymru': 29.0,
        'LibDems': 7.0,
        'Greens': 6.0,
        'Reform': 27.6,
        'Other': 2.2
      },
      source: 'Polling average',
      category: 'polling'
    }
  ];
  
  export default presetScenarios;
