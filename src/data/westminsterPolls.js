// src/data/westminsterPolls.js
// Welsh Westminster voting intention polls since the 2024 general election.
//
// These are UK general election voting intention in Wales, not Senedd voting
// intention, so they belong to the Westminster projection rather than the
// Senedd simulator.
//
// Figures are as published. Rounding means they rarely total exactly 100%,
// and the projection normalises before use.

const westminsterPolls = [
  {
    id: 'yougov-2026-03',
    pollster: 'YouGov',
    client: 'ITV Cymru Wales / Cardiff University',
    dates: '12–19 March 2026',
    date: '2026-03-19',
    sampleSize: 1082,
    votes: { Labour: 12, Conservatives: 12, PlaidCymru: 29, LibDems: 5, Greens: 14, Reform: 24, Other: 4 }
  },
  {
    id: 'yougov-2026-01',
    pollster: 'YouGov',
    client: 'Barn Cymru',
    dates: '5–12 January 2026',
    date: '2026-01-12',
    sampleSize: 1205,
    votes: { Labour: 13, Conservatives: 12, PlaidCymru: 29, LibDems: 6, Greens: 12, Reform: 25, Other: 2 }
  },
  {
    id: 'yougov-2025-12',
    pollster: 'YouGov',
    client: 'Cardiff University',
    dates: '28 November – 10 December 2025',
    date: '2025-12-10',
    sampleSize: 2500,
    votes: { Labour: 15, Conservatives: 13, PlaidCymru: 19, LibDems: 8, Greens: 14, Reform: 30, Other: 2 }
  },
  {
    id: 'yougov-2025-09',
    pollster: 'YouGov',
    client: 'Barn Cymru',
    dates: '4–10 September 2025',
    date: '2025-09-10',
    sampleSize: 1220,
    votes: { Labour: 18, Conservatives: 11, PlaidCymru: 23, LibDems: 9, Greens: 7, Reform: 29, Other: 4 }
  },
  {
    id: 'yougov-2025-04',
    pollster: 'YouGov',
    client: 'Barn Cymru',
    dates: '23–30 April 2025',
    date: '2025-04-30',
    sampleSize: 1248,
    // NOTE: these figures total 95%, further from 100 than rounding explains.
    // Worth checking against the published tables.
    votes: { Labour: 20, Conservatives: 9, PlaidCymru: 24, LibDems: 9, Greens: 7, Reform: 24, Other: 2 }
  },
  {
    id: 'survation-2025-04',
    pollster: 'Survation',
    client: null,
    dates: '10 March – 3 April 2025',
    date: '2025-04-03',
    sampleSize: 844,
    votes: { Labour: 29, Conservatives: 15, PlaidCymru: 18, LibDems: 6, Greens: 6, Reform: 25, Other: 1 }
  },
  {
    id: 'survation-2024-11',
    pollster: 'Survation',
    client: 'Reform UK',
    dates: '18 October – 4 November 2024',
    date: '2024-11-04',
    sampleSize: 2006,
    votes: { Labour: 33, Conservatives: 18, PlaidCymru: 13, LibDems: 9, Greens: 5, Reform: 21, Other: 0 }
  }
];

// A short label for each poll, used in the selector.
export const pollLabel = (poll) =>
  `${poll.pollster}, ${poll.dates}${poll.client ? ` (${poll.client})` : ''}`;

export default westminsterPolls;
