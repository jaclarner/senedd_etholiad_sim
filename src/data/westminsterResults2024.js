// src/data/westminsterResults2024.js
// Actual results of the 2024 UK general election in Wales.
//
// Wales returns 32 MPs, one per constituency, elected by first past the post.
// Vote shares are percentages of valid votes cast in each constituency.
// Parties that won no seats across Wales are grouped into 'Other'.
// Source: parliament.uk candidate-level results, 4 July 2024.

// Vote share (% of valid votes) by party in each Welsh Westminster constituency.
const westminsterBaseline = {
  "Aberafan Maesteg": {"Labour": 49.89, "Conservatives": 8.12, "PlaidCymru": 13.2, "LibDems": 2.56, "Greens": 3.06, "Reform": 20.93, "Other": 2.24},
  "Alyn and Deeside": {"Labour": 42.39, "Conservatives": 18.19, "PlaidCymru": 4.47, "LibDems": 4.76, "Greens": 4.44, "Reform": 22.13, "Other": 3.63},
  "Bangor Aberconwy": {"Labour": 33.62, "Conservatives": 21.69, "PlaidCymru": 21.87, "LibDems": 3.66, "Greens": 3.27, "Reform": 14.62, "Other": 1.27},
  "Blaenau Gwent and Rhymney": {"Labour": 53.56, "Conservatives": 12.62, "PlaidCymru": 12.85, "LibDems": 4.24, "Greens": 5.74, "Reform": 0.0, "Other": 10.99},
  "Brecon, Radnor and Cwm Tawe": {"Labour": 21.28, "Conservatives": 26.35, "PlaidCymru": 4.9, "LibDems": 29.51, "Greens": 2.55, "Reform": 14.11, "Other": 1.31},
  "Bridgend": {"Labour": 39.92, "Conservatives": 16.35, "PlaidCymru": 8.77, "LibDems": 3.49, "Greens": 4.25, "Reform": 19.14, "Other": 8.07},
  "Caerfyrddin": {"Labour": 24.09, "Conservatives": 19.35, "PlaidCymru": 34.03, "LibDems": 3.2, "Greens": 3.01, "Reform": 15.23, "Other": 1.09},
  "Caerphilly": {"Labour": 38.02, "Conservatives": 11.47, "PlaidCymru": 21.24, "LibDems": 4.68, "Greens": 4.32, "Reform": 20.28, "Other": 0.0},
  "Cardiff East": {"Labour": 40.47, "Conservatives": 10.0, "PlaidCymru": 9.07, "LibDems": 17.22, "Greens": 10.01, "Reform": 12.73, "Other": 0.5},
  "Cardiff North": {"Labour": 43.92, "Conservatives": 20.31, "PlaidCymru": 9.84, "LibDems": 6.67, "Greens": 6.66, "Reform": 12.61, "Other": 0.0},
  "Cardiff South and Penarth": {"Labour": 44.49, "Conservatives": 13.93, "PlaidCymru": 8.24, "LibDems": 7.42, "Greens": 14.45, "Reform": 11.47, "Other": 0.0},
  "Cardiff West": {"Labour": 36.74, "Conservatives": 15.27, "PlaidCymru": 21.05, "LibDems": 4.29, "Greens": 7.05, "Reform": 12.57, "Other": 3.02},
  "Ceredigion Preseli": {"Labour": 11.63, "Conservatives": 10.29, "PlaidCymru": 46.95, "LibDems": 15.01, "Greens": 4.03, "Reform": 11.61, "Other": 0.49},
  "Clwyd East": {"Labour": 38.65, "Conservatives": 28.99, "PlaidCymru": 7.81, "LibDems": 3.89, "Greens": 3.47, "Reform": 15.95, "Other": 1.25},
  "Clwyd North": {"Labour": 35.54, "Conservatives": 32.67, "PlaidCymru": 7.59, "LibDems": 4.05, "Greens": 3.34, "Reform": 16.82, "Other": 0.0},
  "Dwyfor Meirionnydd": {"Labour": 14.64, "Conservatives": 11.66, "PlaidCymru": 53.94, "LibDems": 3.42, "Greens": 3.58, "Reform": 12.02, "Other": 0.74},
  "Gower": {"Labour": 43.36, "Conservatives": 18.87, "PlaidCymru": 8.35, "LibDems": 5.49, "Greens": 5.27, "Reform": 18.06, "Other": 0.6},
  "Llanelli": {"Labour": 31.3, "Conservatives": 10.49, "PlaidCymru": 23.34, "LibDems": 3.08, "Greens": 2.71, "Reform": 27.6, "Other": 1.47},
  "Merthyr Tydfil and Aberdare": {"Labour": 44.84, "Conservatives": 7.63, "PlaidCymru": 13.54, "LibDems": 3.62, "Greens": 3.5, "Reform": 23.69, "Other": 3.17},
  "Mid and South Pembrokeshire": {"Labour": 35.4, "Conservatives": 31.37, "PlaidCymru": 6.35, "LibDems": 5.09, "Greens": 3.55, "Reform": 16.79, "Other": 1.46},
  "Monmouthshire": {"Labour": 41.32, "Conservatives": 34.76, "PlaidCymru": 2.5, "LibDems": 4.48, "Greens": 4.64, "Reform": 10.7, "Other": 1.6},
  "Montgomeryshire and Glyndŵr": {"Labour": 29.38, "Conservatives": 17.97, "PlaidCymru": 13.1, "LibDems": 14.96, "Greens": 4.03, "Reform": 20.56, "Other": 0.0},
  "Neath and Swansea East": {"Labour": 41.85, "Conservatives": 9.38, "PlaidCymru": 13.33, "LibDems": 5.84, "Greens": 4.26, "Reform": 25.34, "Other": 0.0},
  "Newport East": {"Labour": 42.49, "Conservatives": 16.84, "PlaidCymru": 5.81, "LibDems": 5.31, "Greens": 5.43, "Reform": 19.1, "Other": 5.03},
  "Newport West and Islwyn": {"Labour": 41.5, "Conservatives": 15.99, "PlaidCymru": 8.41, "LibDems": 4.97, "Greens": 4.95, "Reform": 20.36, "Other": 3.81},
  "Pontypridd": {"Labour": 41.2, "Conservatives": 9.59, "PlaidCymru": 13.4, "LibDems": 4.08, "Greens": 4.74, "Reform": 19.87, "Other": 7.13},
  "Rhondda and Ogmore": {"Labour": 47.81, "Conservatives": 5.73, "PlaidCymru": 14.52, "LibDems": 2.61, "Greens": 3.29, "Reform": 26.05, "Other": 0.0},
  "Swansea West": {"Labour": 41.4, "Conservatives": 9.92, "PlaidCymru": 11.51, "LibDems": 12.25, "Greens": 6.46, "Reform": 17.52, "Other": 0.95},
  "Torfaen": {"Labour": 42.5, "Conservatives": 16.07, "PlaidCymru": 7.2, "LibDems": 4.6, "Greens": 4.78, "Reform": 22.0, "Other": 2.85},
  "Vale of Glamorgan": {"Labour": 38.71, "Conservatives": 29.51, "PlaidCymru": 7.08, "LibDems": 3.52, "Greens": 4.1, "Reform": 15.22, "Other": 1.86},
  "Wrexham": {"Labour": 39.22, "Conservatives": 24.49, "PlaidCymru": 10.25, "LibDems": 4.4, "Greens": 3.32, "Reform": 17.13, "Other": 1.19},
  "Ynys Môn": {"Labour": 23.35, "Conservatives": 30.5, "PlaidCymru": 32.46, "LibDems": 1.35, "Greens": 1.85, "Reform": 9.88, "Other": 0.61},
};

// The party that actually won each seat in 2024.
export const actualWinners2024 = {
  "Aberafan Maesteg": "Labour",
  "Alyn and Deeside": "Labour",
  "Bangor Aberconwy": "Labour",
  "Blaenau Gwent and Rhymney": "Labour",
  "Brecon, Radnor and Cwm Tawe": "LibDems",
  "Bridgend": "Labour",
  "Caerfyrddin": "PlaidCymru",
  "Caerphilly": "Labour",
  "Cardiff East": "Labour",
  "Cardiff North": "Labour",
  "Cardiff South and Penarth": "Labour",
  "Cardiff West": "Labour",
  "Ceredigion Preseli": "PlaidCymru",
  "Clwyd East": "Labour",
  "Clwyd North": "Labour",
  "Dwyfor Meirionnydd": "PlaidCymru",
  "Gower": "Labour",
  "Llanelli": "Labour",
  "Merthyr Tydfil and Aberdare": "Labour",
  "Mid and South Pembrokeshire": "Labour",
  "Monmouthshire": "Labour",
  "Montgomeryshire and Glyndŵr": "Labour",
  "Neath and Swansea East": "Labour",
  "Newport East": "Labour",
  "Newport West and Islwyn": "Labour",
  "Pontypridd": "Labour",
  "Rhondda and Ogmore": "Labour",
  "Swansea West": "Labour",
  "Torfaen": "Labour",
  "Vale of Glamorgan": "Labour",
  "Wrexham": "Labour",
  "Ynys Môn": "PlaidCymru",
};

// Valid votes cast in each constituency.
export const westminsterValidVotes = {
  "Aberafan Maesteg": 35755,
  "Alyn and Deeside": 43392,
  "Bangor Aberconwy": 41660,
  "Blaenau Gwent and Rhymney": 29922,
  "Brecon, Radnor and Cwm Tawe": 46548,
  "Bridgend": 41374,
  "Caerfyrddin": 45604,
  "Caerphilly": 38234,
  "Cardiff East": 39123,
  "Cardiff North": 47473,
  "Cardiff South and Penarth": 39176,
  "Cardiff West": 44757,
  "Ceredigion Preseli": 46302,
  "Clwyd East": 47822,
  "Clwyd North": 41627,
  "Dwyfor Meirionnydd": 40395,
  "Gower": 47229,
  "Llanelli": 40744,
  "Merthyr Tydfil and Aberdare": 35215,
  "Mid and South Pembrokeshire": 46629,
  "Monmouthshire": 50844,
  "Montgomeryshire and Glyndŵr": 43259,
  "Neath and Swansea East": 40137,
  "Newport East": 38531,
  "Newport West and Islwyn": 41951,
  "Pontypridd": 39378,
  "Rhondda and Ogmore": 35806,
  "Swansea West": 35657,
  "Torfaen": 35705,
  "Vale of Glamorgan": 45826,
  "Wrexham": 40373,
  "Ynys Môn": 32628,
};

// Registered electorate in each constituency.
export const westminsterElectorate = {
  "Aberafan Maesteg": 72580,
  "Alyn and Deeside": 75790,
  "Bangor Aberconwy": 70527,
  "Blaenau Gwent and Rhymney": 70153,
  "Brecon, Radnor and Cwm Tawe": 73114,
  "Bridgend": 73168,
  "Caerfyrddin": 74005,
  "Caerphilly": 72648,
  "Cardiff East": 72876,
  "Cardiff North": 71460,
  "Cardiff South and Penarth": 73060,
  "Cardiff West": 75697,
  "Ceredigion Preseli": 75690,
  "Clwyd East": 76637,
  "Clwyd North": 75027,
  "Dwyfor Meirionnydd": 73040,
  "Gower": 76123,
  "Llanelli": 71538,
  "Merthyr Tydfil and Aberdare": 74460,
  "Mid and South Pembrokeshire": 79033,
  "Monmouthshire": 74823,
  "Montgomeryshire and Glyndŵr": 74039,
  "Neath and Swansea East": 76291,
  "Newport East": 76683,
  "Newport West and Islwyn": 75785,
  "Pontypridd": 75951,
  "Rhondda and Ogmore": 74493,
  "Swansea West": 74236,
  "Torfaen": 71738,
  "Vale of Glamorgan": 74465,
  "Wrexham": 70269,
  "Ynys Môn": 53141,
};

// Wales-wide vote share in 2024 (% of valid votes). The baseline for swing.
export const baselineNationalVotes2024 = {
  "Labour": 36.97,
  "Conservatives": 18.19,
  "PlaidCymru": 14.77,
  "LibDems": 6.51,
  "Greens": 4.67,
  "Reform": 16.91,
  "Other": 1.97,
};

// Seats each party actually won in Wales in 2024.
export const actualNationalSeats2024 = {
  "Labour": 27,
  "Conservatives": 0,
  "PlaidCymru": 4,
  "LibDems": 1,
  "Greens": 0,
  "Reform": 0,
  "Other": 0,
};

// Constituency names, alphabetical.
export const westminsterConstituencyNames = Object.keys(westminsterBaseline);

// Total seats in Wales at Westminster.
export const TOTAL_WESTMINSTER_SEATS = 32;

// Total valid votes cast in Wales in 2024.
export const totalValidVotes2024 = 1319076;

export default westminsterBaseline;
