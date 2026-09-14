// src/data/seneddResults2026.js
// Actual results of the 2026 Senedd election, the first held under the new
// 16-constituency, 96-member closed-list D'Hondt system.
//
// Vote shares are percentages of VALID votes cast in each constituency.
// Minor parties and independents that won no seats are grouped into 'Other'.
// Source: official constituency declarations (ConstituencyResults_All.csv).

// Vote share (% of valid votes) by party in each of the 16 Senedd constituencies.
const seneddBaseline = {
  "Bangor Conwy Môn": {"Labour": 6.43, "Conservatives": 12.38, "PlaidCymru": 44.93, "LibDems": 2.3, "Greens": 4.49, "Reform": 28.12, "Other": 1.36},
  "Clwyd": {"Labour": 10.42, "Conservatives": 20.3, "PlaidCymru": 28.31, "LibDems": 2.95, "Greens": 5.29, "Reform": 32.27, "Other": 0.44},
  "Fflint Wrecsam": {"Labour": 12.22, "Conservatives": 12.88, "PlaidCymru": 26.34, "LibDems": 3.78, "Greens": 7.34, "Reform": 36.21, "Other": 1.21},
  "Gwynedd Maldwyn": {"Labour": 5.47, "Conservatives": 6.92, "PlaidCymru": 44.18, "LibDems": 5.57, "Greens": 5.01, "Reform": 27.75, "Other": 5.11},
  "Ceredigion Penfro": {"Labour": 7.29, "Conservatives": 16.59, "PlaidCymru": 35.83, "LibDems": 5.17, "Greens": 7.09, "Reform": 25.8, "Other": 2.23},
  "Sir Gaerfyrddin": {"Labour": 7.69, "Conservatives": 6.97, "PlaidCymru": 43.06, "LibDems": 1.98, "Greens": 4.56, "Reform": 32.79, "Other": 2.95},
  "Gŵyr Abertawe": {"Labour": 14.22, "Conservatives": 9.56, "PlaidCymru": 31.85, "LibDems": 7.95, "Greens": 8.11, "Reform": 27.49, "Other": 0.82},
  "Brycheiniog Tawe Nedd": {"Labour": 8.74, "Conservatives": 8.41, "PlaidCymru": 28.7, "LibDems": 11.77, "Greens": 6.66, "Reform": 33.17, "Other": 2.54},
  "Afan Ogwr Rhondda": {"Labour": 16.74, "Conservatives": 4.26, "PlaidCymru": 36.93, "LibDems": 2.71, "Greens": 3.85, "Reform": 33.63, "Other": 1.88},
  "Pontypridd Cynon Merthyr": {"Labour": 12.87, "Conservatives": 5.97, "PlaidCymru": 39.5, "LibDems": 1.92, "Greens": 4.77, "Reform": 30.59, "Other": 4.38},
  "Blaenau Gwent Caerffili Rhymni": {"Labour": 11.08, "Conservatives": 4.8, "PlaidCymru": 41.98, "LibDems": 1.84, "Greens": 3.5, "Reform": 34.3, "Other": 2.49},
  "Sir Fynwy Torfaen": {"Labour": 15.02, "Conservatives": 17.24, "PlaidCymru": 23.52, "LibDems": 3.53, "Greens": 8.2, "Reform": 31.09, "Other": 1.41},
  "Casnewydd Islwyn": {"Labour": 13.67, "Conservatives": 11.39, "PlaidCymru": 29.69, "LibDems": 3.45, "Greens": 7.59, "Reform": 32.91, "Other": 1.3},
  "Caerdydd Penarth": {"Labour": 12.39, "Conservatives": 7.74, "PlaidCymru": 41.04, "LibDems": 2.57, "Greens": 13.76, "Reform": 17.63, "Other": 4.88},
  "Caerdydd Ffynnon Taf": {"Labour": 12.76, "Conservatives": 9.61, "PlaidCymru": 36.97, "LibDems": 9.57, "Greens": 10.24, "Reform": 19.65, "Other": 1.19},
  "Pen-y-bont Bro Morgannwg": {"Labour": 11.64, "Conservatives": 15.24, "PlaidCymru": 33.5, "LibDems": 2.66, "Greens": 5.16, "Reform": 30.08, "Other": 1.73},
};

// Seats actually won in 2026 (6 per constituency, 96 in total).
export const actualSeats2026 = {
  "Bangor Conwy Môn": {"Labour": 0, "Conservatives": 1, "PlaidCymru": 3, "LibDems": 0, "Greens": 0, "Reform": 2, "Other": 0},
  "Clwyd": {"Labour": 0, "Conservatives": 1, "PlaidCymru": 2, "LibDems": 0, "Greens": 0, "Reform": 3, "Other": 0},
  "Fflint Wrecsam": {"Labour": 1, "Conservatives": 1, "PlaidCymru": 2, "LibDems": 0, "Greens": 0, "Reform": 2, "Other": 0},
  "Gwynedd Maldwyn": {"Labour": 0, "Conservatives": 0, "PlaidCymru": 4, "LibDems": 0, "Greens": 0, "Reform": 2, "Other": 0},
  "Ceredigion Penfro": {"Labour": 0, "Conservatives": 1, "PlaidCymru": 3, "LibDems": 0, "Greens": 0, "Reform": 2, "Other": 0},
  "Sir Gaerfyrddin": {"Labour": 0, "Conservatives": 0, "PlaidCymru": 3, "LibDems": 0, "Greens": 0, "Reform": 3, "Other": 0},
  "Gŵyr Abertawe": {"Labour": 1, "Conservatives": 0, "PlaidCymru": 3, "LibDems": 0, "Greens": 0, "Reform": 2, "Other": 0},
  "Brycheiniog Tawe Nedd": {"Labour": 0, "Conservatives": 0, "PlaidCymru": 2, "LibDems": 1, "Greens": 0, "Reform": 3, "Other": 0},
  "Afan Ogwr Rhondda": {"Labour": 1, "Conservatives": 0, "PlaidCymru": 3, "LibDems": 0, "Greens": 0, "Reform": 2, "Other": 0},
  "Pontypridd Cynon Merthyr": {"Labour": 1, "Conservatives": 0, "PlaidCymru": 3, "LibDems": 0, "Greens": 0, "Reform": 2, "Other": 0},
  "Blaenau Gwent Caerffili Rhymni": {"Labour": 0, "Conservatives": 0, "PlaidCymru": 3, "LibDems": 0, "Greens": 0, "Reform": 3, "Other": 0},
  "Sir Fynwy Torfaen": {"Labour": 1, "Conservatives": 1, "PlaidCymru": 2, "LibDems": 0, "Greens": 0, "Reform": 2, "Other": 0},
  "Casnewydd Islwyn": {"Labour": 1, "Conservatives": 1, "PlaidCymru": 2, "LibDems": 0, "Greens": 0, "Reform": 2, "Other": 0},
  "Caerdydd Penarth": {"Labour": 1, "Conservatives": 0, "PlaidCymru": 3, "LibDems": 0, "Greens": 1, "Reform": 1, "Other": 0},
  "Caerdydd Ffynnon Taf": {"Labour": 1, "Conservatives": 0, "PlaidCymru": 3, "LibDems": 0, "Greens": 1, "Reform": 1, "Other": 0},
  "Pen-y-bont Bro Morgannwg": {"Labour": 1, "Conservatives": 1, "PlaidCymru": 2, "LibDems": 0, "Greens": 0, "Reform": 2, "Other": 0},
};

// Valid votes cast in each constituency, used to weight constituency-level
// figures when aggregating to a Wales-wide total.
export const seneddValidVotes = {
  "Bangor Conwy Môn": 69130,
  "Clwyd": 79757,
  "Fflint Wrecsam": 69996,
  "Gwynedd Maldwyn": 81690,
  "Ceredigion Penfro": 89153,
  "Sir Gaerfyrddin": 83983,
  "Gŵyr Abertawe": 78722,
  "Brycheiniog Tawe Nedd": 81096,
  "Afan Ogwr Rhondda": 66449,
  "Pontypridd Cynon Merthyr": 72628,
  "Blaenau Gwent Caerffili Rhymni": 69832,
  "Sir Fynwy Torfaen": 77706,
  "Casnewydd Islwyn": 77698,
  "Caerdydd Penarth": 88053,
  "Caerdydd Ffynnon Taf": 88220,
  "Pen-y-bont Bro Morgannwg": 81801,
};

// Invalid (rejected) ballots by constituency, for reference.
export const seneddInvalidVotes = {
  "Bangor Conwy Môn": 123,
  "Clwyd": 166,
  "Fflint Wrecsam": 171,
  "Gwynedd Maldwyn": 199,
  "Ceredigion Penfro": 247,
  "Sir Gaerfyrddin": 238,
  "Gŵyr Abertawe": 187,
  "Brycheiniog Tawe Nedd": 189,
  "Afan Ogwr Rhondda": 135,
  "Pontypridd Cynon Merthyr": 219,
  "Blaenau Gwent Caerffili Rhymni": 155,
  "Sir Fynwy Torfaen": 170,
  "Casnewydd Islwyn": 193,
  "Caerdydd Penarth": 220,
  "Caerdydd Ffynnon Taf": 222,
  "Pen-y-bont Bro Morgannwg": 152,
};

// Wales-wide vote share in 2026 (% of valid votes). This is the baseline the
// swing models start from.
export const baselineNationalVotes = {
  "Labour": 11.08,
  "Conservatives": 10.74,
  "PlaidCymru": 35.41,
  "LibDems": 4.46,
  "Greens": 6.74,
  "Reform": 29.3,
  "Other": 2.27,
};

// Wales-wide seat totals in 2026.
export const actualNationalSeats2026 = {
  "Labour": 9,
  "Conservatives": 7,
  "PlaidCymru": 43,
  "LibDems": 1,
  "Greens": 2,
  "Reform": 34,
  "Other": 0,
};

// Total valid votes cast across Wales in 2026.
export const totalValidVotes2026 = 1255914;

export default seneddBaseline;
