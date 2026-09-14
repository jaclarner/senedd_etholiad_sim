// src/data/seneddConstituencies.js
// The 16 Senedd constituencies used from the 2026 election onwards.
//
// Each returns 6 members by closed-list D'Hondt, giving a 96-member Senedd.
// Each constituency was formed by pairing two Westminster constituencies; those
// are recorded in `westminsterConstituencies` for reference and display only —
// all vote data now lives at Senedd-constituency level in seneddResults2026.js.

const seneddConstituencies = [
  {
    name: "Bangor Conwy Môn",
    westminsterConstituencies: ["Bangor Aberconwy", "Ynys Môn"],
    region: "North Wales"
  },
  {
    name: "Clwyd",
    westminsterConstituencies: ["Clwyd East", "Clwyd North"],
    region: "North Wales"
  },
  {
    name: "Fflint Wrecsam",
    westminsterConstituencies: ["Alyn and Deeside", "Wrexham"],
    region: "North Wales"
  },
  {
    name: "Gwynedd Maldwyn",
    westminsterConstituencies: ["Dwyfor Meirionnydd", "Montgomeryshire and Glyndŵr"],
    region: "North Wales"
  },
  {
    name: "Ceredigion Penfro",
    westminsterConstituencies: ["Ceredigion Preseli", "Mid and South Pembrokeshire"],
    region: "Mid and West Wales"
  },
  {
    name: "Sir Gaerfyrddin",
    westminsterConstituencies: ["Caerfyrddin", "Llanelli"],
    region: "Mid and West Wales"
  },
  {
    name: "Brycheiniog Tawe Nedd",
    westminsterConstituencies: ["Brecon, Radnor and Cwm Tawe", "Neath and Swansea East"],
    region: "Mid and West Wales"
  },
  {
    name: "Gŵyr Abertawe",
    westminsterConstituencies: ["Gower", "Swansea West"],
    region: "South Wales West"
  },
  {
    name: "Afan Ogwr Rhondda",
    westminsterConstituencies: ["Aberafan Maesteg", "Rhondda and Ogmore"],
    region: "South Wales West"
  },
  {
    name: "Pen-y-bont Bro Morgannwg",
    westminsterConstituencies: ["Bridgend", "Vale of Glamorgan"],
    region: "South Wales West"
  },
  {
    name: "Pontypridd Cynon Merthyr",
    westminsterConstituencies: ["Merthyr Tydfil and Aberdare", "Pontypridd"],
    region: "South Wales Central"
  },
  {
    name: "Caerdydd Penarth",
    westminsterConstituencies: ["Cardiff West", "Cardiff South and Penarth"],
    region: "South Wales Central"
  },
  {
    name: "Caerdydd Ffynnon Taf",
    westminsterConstituencies: ["Cardiff North", "Cardiff East"],
    region: "South Wales Central"
  },
  {
    name: "Blaenau Gwent Caerffili Rhymni",
    westminsterConstituencies: ["Blaenau Gwent and Rhymney", "Caerphilly"],
    region: "South Wales East"
  },
  {
    name: "Sir Fynwy Torfaen",
    westminsterConstituencies: ["Monmouthshire", "Torfaen"],
    region: "South Wales East"
  },
  {
    name: "Casnewydd Islwyn",
    westminsterConstituencies: ["Newport East", "Newport West and Islwyn"],
    region: "South Wales East"
  }
];

// Number of members returned by every Senedd constituency.
export const SEATS_PER_CONSTITUENCY = 6;

// Total size of the Senedd.
export const TOTAL_SEATS = seneddConstituencies.length * SEATS_PER_CONSTITUENCY;

// Constituency names, in the order used throughout the app.
export const seneddConstituencyNames = seneddConstituencies.map(c => c.name);

// Lookup of constituency name -> region, used by the regional swing model.
export const constituencyRegions = seneddConstituencies.reduce((acc, c) => {
  acc[c.name] = c.region;
  return acc;
}, {});

// Region -> list of constituency names.
export const regionDefinitions = seneddConstituencies.reduce((acc, c) => {
  (acc[c.region] = acc[c.region] || []).push(c.name);
  return acc;
}, {});

// The region a constituency belongs to.
export const getRegionForConstituency = (name) => constituencyRegions[name] || 'Wales';

// The Westminster constituencies a Senedd constituency was built from.
export const getWestminsterConstituencies = (name) => {
  const match = seneddConstituencies.find(c => c.name === name);
  return match ? match.westminsterConstituencies : [];
};

export default seneddConstituencies;
