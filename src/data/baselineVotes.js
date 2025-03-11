// src/data/baselineVotes.js
const baselineVotes = {
    "Aberafan Maesteg": {"Labour": 46, "Conservatives": 14, "PlaidCymru": 23, "LibDems": 3, "Greens": 3, "Reform": 6, "Other": 5},
    "Alyn and Deeside": {"Labour": 41, "Conservatives": 32, "PlaidCymru": 9, "LibDems": 5, "Greens": 3, "Reform": 6, "Other": 4},
    "Bangor Aberconwy": {"Labour": 23, "Conservatives": 25, "PlaidCymru": 31, "LibDems": 4, "Greens": 4, "Reform": 8, "Other": 5},
    "Blaenau Gwent and Rhymney": {"Labour": 50, "Conservatives": 13, "PlaidCymru": 20, "LibDems": 4, "Greens": 2, "Reform": 6, "Other": 5},
    "Brecon, Radnor and Cwm Tawe": {"Labour": 23, "Conservatives": 32, "PlaidCymru": 12, "LibDems": 20, "Greens": 7, "Reform": 3, "Other": 3},
    "Bridgend": {"Labour": 41, "Conservatives": 25, "PlaidCymru": 15, "LibDems": 2, "Greens": 2, "Reform": 8, "Other": 7},
    "Caerfyrddin": {"Labour": 22, "Conservatives": 25, "PlaidCymru": 36, "LibDems": 4, "Greens": 5, "Reform": 4, "Other": 4},
    "Caerphilly": {"Labour": 40, "Conservatives": 15, "PlaidCymru": 26, "LibDems": 2, "Greens": 4, "Reform": 7, "Other": 6},
    "Cardiff East": {"Labour": 38, "Conservatives": 13, "PlaidCymru": 14, "LibDems": 22, "Greens": 8, "Reform": 2, "Other": 3},
    "Cardiff North": {"Labour": 36, "Conservatives": 29, "PlaidCymru": 14, "LibDems": 5, "Greens": 8, "Reform": 4, "Other": 4},
    "Cardiff South and Penarth": {"Labour": 42, "Conservatives": 20, "PlaidCymru": 15, "LibDems": 4, "Greens": 9, "Reform": 4, "Other": 6},
    "Cardiff West": {"Labour": 44, "Conservatives": 17, "PlaidCymru": 22, "LibDems": 3, "Greens": 7, "Reform": 3, "Other": 4},
    "Ceredigion Preseli": {"Labour": 17, "Conservatives": 10, "PlaidCymru": 50, "LibDems": 18, "Greens": 2, "Reform": 1, "Other": 2},
    "Clwyd East": {"Labour": 40, "Conservatives": 38, "PlaidCymru": 10, "LibDems": 4, "Greens": 2, "Reform": 3, "Other":3},
    "Clwyd North": {"Labour": 39, "Conservatives": 38, "PlaidCymru": 12, "LibDems": 3, "Greens": 3, "Reform": 3, "Other": 2},
    "Dwyfor Meirionnydd": {"Labour": 18, "Conservatives": 17, "PlaidCymru": 47, "LibDems": 3, "Greens": 4, "Reform": 6, "Other": 5},
    "Gower": {"Labour": 42, "Conservatives": 25, "PlaidCymru": 16, "LibDems": 3, "Greens": 5, "Reform": 5, "Other": 4},
    "Llanelli": {"Labour": 40, "Conservatives": 14, "PlaidCymru": 33, "LibDems": 2, "Greens": 3, "Reform": 4, "Other": 4},
    "Merthyr Tydfil and Aberdare": {"Labour": 55, "Conservatives": 11, "PlaidCymru": 18, "LibDems": 2, "Greens": 3, "Reform": 6, "Other": 5},
    "Mid and South Pembrokeshire": {"Labour": 30, "Conservatives": 33, "PlaidCymru": 20, "LibDems": 3, "Greens": 3, "Reform": 6, "Other": 5},
    "Monmouthshire": {"Labour": 32, "Conservatives": 39, "PlaidCymru": 7, "LibDems": 6, "Greens": 9, "Reform": 3, "Other": 4},
    "Montgomeryshire and Glyndwr": {"Labour": 17, "Conservatives": 42, "PlaidCymru": 17, "LibDems": 11, "Greens": 3, "Reform": 7, "Other": 3},
    "Neath and Swansea East": {"Labour": 48, "Conservatives": 13, "PlaidCymru": 21, "LibDems": 3, "Greens": 3, "Reform": 7, "Other": 5},
    "Newport East": {"Labour": 44, "Conservatives": 30, "PlaidCymru": 8, "LibDems": 6, "Greens": 5, "Reform": 3, "Other": 4},
    "Newport West and Islwyn": {"Labour": 43, "Conservatives": 27, "PlaidCymru": 16, "LibDems": 3, "Greens": 5, "Reform": 3, "Other": 3},
    "Pontypridd": {"Labour": 39, "Conservatives": 20, "PlaidCymru": 22, "LibDems": 5, "Greens": 4, "Reform": 6, "Other": 4},
    "Rhondda and Ogmore": {"Labour": 49, "Conservatives": 8, "PlaidCymru": 30, "LibDems": 1, "Greens": 3, "Reform": 5, "Other": 4},
    "Swansea West": {"Labour": 42, "Conservatives": 18, "PlaidCymru": 16, "LibDems": 7, "Greens": 6, "Reform": 8, "Other": 3},
    "Torfaen": {"Labour": 44, "Conservatives": 24, "PlaidCymru": 12, "LibDems": 3, "Greens": 3, "Reform": 8, "Other": 6},
    "Vale of Glamorgan": {"Labour": 40, "Conservatives": 35, "PlaidCymru": 12, "LibDems": 3, "Greens": 6, "Reform": 2, "Other": 2},
    "Wrexham": {"Labour": 28, "Conservatives": 27, "PlaidCymru": 22, "LibDems": 9, "Greens": 6, "Reform": 5, "Other": 3},
    "Ynys Môn": {"Labour": 24, "Conservatives": 22, "PlaidCymru": 43, "LibDems": 2, "Greens": 2, "Reform": 4, "Other": 3}
  };
  
  // Baseline national vote share 
  export const baselineNationalVotes = {
    "Labour": 38.4,
    "Conservatives": 25.1,
    "PlaidCymru": 22.4,
    "LibDems": 4.2,
    "Greens": 3.6,
    "Reform": 4.1, // I've added former Abolish votes to this - explain more in Methodology
    "Other": 2.2  
  };
  
  export default baselineVotes;