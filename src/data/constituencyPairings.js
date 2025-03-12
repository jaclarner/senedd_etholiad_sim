// src/data/constituencyPairings.js
const constituencyPairings = [
  {
    ukConstituencies: ["Bangor Aberconwy", "Ynys Môn"],
    seneddName: "Bangor Conwy Môn"
  },
  {
    ukConstituencies: ["Clwyd East", "Clwyd North"],
    seneddName: "Clwyd"
  },
  {
    ukConstituencies: ["Alyn and Deeside", "Wrexham"],
    seneddName: "Fflint Wrecsam"
  },
  {
    ukConstituencies: ["Dwyfor Meirionnydd", "Montgomeryshire and Glyndŵr"],
    seneddName: "Gwynedd Maldwyn"
  },
  {
    ukConstituencies: ["Ceredigion Preseli", "Mid and South Pembrokeshire"],
    seneddName: "Ceredigion Penfro"
  },
  {
    ukConstituencies: ["Caerfyrddin", "Llanelli"],
    seneddName: "Sir Gaerfyrddin"
  },
  {
    ukConstituencies: ["Gower", "Swansea West"],
    seneddName: "Gŵyr Abertawe"
  },
  {
    ukConstituencies: ["Brecon, Radnor and Cwm Tawe", "Neath and Swansea East"],
    seneddName: "Brycheiniog Tawe Nedd"
  },
  {
    ukConstituencies: ["Aberafan Maesteg", "Rhondda and Ogmore"],
    seneddName: "Afan Ogwr Rhondda"
  },
  {
    ukConstituencies: ["Merthyr Tydfil and Aberdare", "Pontypridd"],
    seneddName: "Pontypridd Cynon Merthyr"
  },
  {
    ukConstituencies: ["Blaenau Gwent and Rhymney", "Caerphilly"],
    seneddName: "Blaenau Gwent Caerffili Rhymni"
  },
  {
    ukConstituencies: ["Monmouthshire", "Torfaen"],
    seneddName: "Sir Fynwy Torfaen"
  },
  {
    ukConstituencies: ["Newport East", "Newport West and Islwyn"],
    seneddName: "Casnewydd Islwyn"
  },
  {
    ukConstituencies: ["Cardiff West", "Cardiff South and Penarth"],
    seneddName: "Caerdydd Penarth"
  },
  {
    ukConstituencies: ["Cardiff North", "Cardiff East"],
    seneddName: "Caerdydd Ffynnon Taf"
  },
  {
    ukConstituencies: ["Bridgend", "Vale of Glamorgan"],
    seneddName: "Pen-y-bont Bro Morgannwg"
  }
];

// For backward compatibility with existing code
export const simpleConstituencyPairings = constituencyPairings.map(item => item.ukConstituencies);

// For getting Senedd names from UK constituency pairs
export const getSeneddNameFromPairing = (ukConstituency1, ukConstituency2) => {
  const match = constituencyPairings.find(
    item => item.ukConstituencies.includes(ukConstituency1) && item.ukConstituencies.includes(ukConstituency2)
  );
  return match ? match.seneddName : `${ukConstituency1} and ${ukConstituency2}`;
};

// Get all Senedd constituency names in order
export const seneddConstituencyNames = constituencyPairings.map(item => item.seneddName);

export default constituencyPairings;