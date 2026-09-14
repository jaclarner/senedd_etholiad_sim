// src/data/welshHexMap.js
// Hex cartogram layout for the 32 Welsh Westminster constituencies.
//
// Every constituency gets one hexagon of equal size, positioned to roughly
// echo the shape of Wales: Ynys Mon at the north west, Deeside at the north
// east, Pembrokeshire at the south west, and the Cardiff and Newport seats at
// the south east. Mid Wales is thin because it holds few seats, not because
// the land narrows.
//
// The layout is written as a grid so it can be adjusted by hand: each line is
// a row running north to south, cells are separated by whitespace, and a dot
// marks an empty space. Rows use "odd-r" offset, meaning odd-numbered rows sit
// half a hexagon to the right.

export const HEX_GRID = `
.   MON BAN CLN CLE ALY
.   DWY MGL WRX .   .
.   CER BRE .   .   .
PEM CAE MER BGR MMH .
.   LLA NSE RHO CPH TOR
GOW SWW ABM PON NPW NPE
.   .   BRG VOG CDW CDN
.   .   .   .   CDS CDE
`;

// Short code -> constituency name, matching westminsterResults2024.js exactly.
export const HEX_CODES = {
  MON: 'Ynys Môn',
  BAN: 'Bangor Aberconwy',
  CLN: 'Clwyd North',
  CLE: 'Clwyd East',
  ALY: 'Alyn and Deeside',
  DWY: 'Dwyfor Meirionnydd',
  MGL: 'Montgomeryshire and Glyndŵr',
  WRX: 'Wrexham',
  CER: 'Ceredigion Preseli',
  BRE: 'Brecon, Radnor and Cwm Tawe',
  PEM: 'Mid and South Pembrokeshire',
  CAE: 'Caerfyrddin',
  MER: 'Merthyr Tydfil and Aberdare',
  BGR: 'Blaenau Gwent and Rhymney',
  MMH: 'Monmouthshire',
  LLA: 'Llanelli',
  NSE: 'Neath and Swansea East',
  RHO: 'Rhondda and Ogmore',
  CPH: 'Caerphilly',
  TOR: 'Torfaen',
  GOW: 'Gower',
  SWW: 'Swansea West',
  ABM: 'Aberafan Maesteg',
  PON: 'Pontypridd',
  NPW: 'Newport West and Islwyn',
  NPE: 'Newport East',
  BRG: 'Bridgend',
  VOG: 'Vale of Glamorgan',
  CDW: 'Cardiff West',
  CDN: 'Cardiff North',
  CDS: 'Cardiff South and Penarth',
  CDE: 'Cardiff East'
};

/**
 * Parse the grid into placed hexes.
 * @returns {Array} [{ code, constituency, col, row }]
 */
export function parseHexGrid() {
  const cells = [];

  HEX_GRID.trim().split('\n').forEach((line, row) => {
    line.trim().split(/\s+/).forEach((code, col) => {
      if (code === '.') return;
      const constituency = HEX_CODES[code];
      if (!constituency) {
        console.warn(`Hex map: unknown code "${code}"`);
        return;
      }
      cells.push({ code, constituency, col, row });
    });
  });

  return cells;
}

const hexCells = parseHexGrid();

export default hexCells;
