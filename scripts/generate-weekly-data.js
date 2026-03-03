var XLSX = require('xlsx');
var path = require('path');
var fs = require('fs');

// ─── Reference Data ───

var locations = [
  { id: 'PHARM-PREP-LAF',   name: 'בית מרקחת-חדר הכנות-מנדף',    grade: 'Grade A', iso: 'ISO 5' },
  { id: 'PHARM-PREP-CART',  name: 'בית מרקחת-חדר הכנות-עגלה',    grade: 'Grade B', iso: 'ISO 6' },
  { id: 'PHARM-PREP-FLOOR', name: 'בית מרקחת-חדר הכנות-רצפה',    grade: 'Grade C', iso: 'ISO 7' },
  { id: 'PHARM-ANTE-AIR',   name: 'בית מרקחת-מבואה-אוויר',       grade: 'Grade C', iso: 'ISO 7' },
  { id: 'PHARM-ANTE-HANDS', name: 'בית מרקחת-מבואה-ידיים רוקח',   grade: 'Grade B', iso: 'ISO 6' },
  { id: 'ONCO-PREP-LAF',    name: 'אונקולוגי-חדר הכנות-מנדף',    grade: 'Grade A', iso: 'ISO 5' },
  { id: 'ONCO-PREP-TABLE',  name: 'אונקולוגי-חדר הכנות-שולחן',   grade: 'Grade B', iso: 'ISO 6' },
  { id: 'ONCO-PREP-FLOOR',  name: 'אונקולוגי-חדר הכנות-רצפה',    grade: 'Grade C', iso: 'ISO 7' },
  { id: 'ONCO-ANTE-AIR',    name: 'אונקולוגי-מבואה-אוויר',       grade: 'Grade C', iso: 'ISO 7' },
  { id: 'ONCO-ANTE-GOWN',   name: 'אונקולוגי-מבואה-חלוק רוקח',   grade: 'Grade B', iso: 'ISO 6' },
];

var sampleTypes = ['Active Air', 'Surface (Contact)', 'Passive Air (Settle Plate)', 'Personnel'];

var organisms = [
  { name: 'No Growth',        gram: 'N/A',           risk: 'Low' },
  { name: 'Micrococcus sp.',   gram: 'Gram-positive', risk: 'Low' },
  { name: 'Penicillium sp.',   gram: 'Fungi',         risk: 'Medium' },
  { name: 'Staphylococcus sp.',gram: 'Gram-positive', risk: 'Medium' },
  { name: 'Bacillus sp.',      gram: 'Gram-positive', risk: 'Medium' },
  { name: 'Aspergillus sp.',   gram: 'Fungi',         risk: 'High' },
];

var shifts = ['Morning', 'Afternoon', 'Night'];

var contamSources = ['N/A', 'Personnel', 'Fungi', 'Environmental'];

// Alert/Action limits per grade
var gradeLimits = {
  'Grade A': { alert: 0, action: 1 },
  'Grade B': { alert: 2, action: 5 },
  'Grade C': { alert: 12, action: 25 },
  'Grade D': { alert: 25, action: 50 },
};

// ─── Helper functions ───

function seededRandom(seed) {
  // Simple LCG PRNG for reproducibility
  var state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function generateCFU(rng, grade) {
  var limits = gradeLimits[grade];
  // ~75% of the time: compliant (below alert)
  // ~18% of the time: alert zone
  // ~7% of the time: action excursion
  var roll = rng();
  if (grade === 'Grade A') {
    // Grade A: alert=0, action=1. CFU is 0 most of the time.
    if (roll < 0.85) return 0;
    if (roll < 0.95) return 0; // still 0 but alert (alert limit is 0, so CFU=0 means >= alert)
    return 1; // action
  }
  if (roll < 0.75) {
    // Compliant: 0 to alertLimit-1
    return Math.floor(rng() * limits.alert);
  } else if (roll < 0.93) {
    // Alert zone: alertLimit to actionLimit-1
    return limits.alert + Math.floor(rng() * (limits.action - limits.alert));
  } else {
    // Action: >= actionLimit
    return limits.action + Math.floor(rng() * Math.ceil(limits.action * 0.5));
  }
}

function pickOrganism(rng, cfu) {
  if (cfu === 0) return organisms[0]; // No Growth
  // Higher CFU = higher chance of riskier organisms
  var pool;
  if (cfu <= 2) {
    pool = [organisms[1], organisms[1], organisms[2], organisms[3]]; // mostly low/medium
  } else if (cfu <= 10) {
    pool = [organisms[1], organisms[2], organisms[3], organisms[4], organisms[5]];
  } else {
    pool = [organisms[2], organisms[3], organisms[4], organisms[5], organisms[5]];
  }
  return pick(rng, pool);
}

function pickContamSource(rng, org) {
  if (org.name === 'No Growth') return 'N/A';
  if (org.gram === 'Fungi') return 'Fungi';
  if (org.risk === 'High') return pick(rng, ['Personnel', 'Environmental']);
  return pick(rng, ['Personnel', 'Environmental', 'N/A']);
}

function formatDate(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function monthAbbr(m) {
  return ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m];
}

// ─── Generate weeks ───

// 3 months: Jan 6 2025 to Mar 30 2025 (Mon-Sun weeks)
var startDate = new Date(2025, 0, 6); // Mon Jan 6 2025
var endDate = new Date(2025, 2, 30);  // Sun Mar 30 2025

var outputDir = path.join(__dirname, '..', 'mock-data');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

var weekStart = new Date(startDate);
var fileCount = 0;

while (weekStart < endDate) {
  var weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
  if (weekEnd > endDate) weekEnd = new Date(endDate);

  // File name: e.g. JAN06-JAN12.xlsx
  var fname = monthAbbr(weekStart.getMonth()) + String(weekStart.getDate()).padStart(2,'0')
    + '-' + monthAbbr(weekEnd.getMonth()) + String(weekEnd.getDate()).padStart(2,'0') + '.xlsx';

  // Seed RNG per week for reproducibility
  var seed = weekStart.getFullYear() * 10000 + (weekStart.getMonth()+1) * 100 + weekStart.getDate();
  var rng = seededRandom(seed);

  var rows = [];

  // For each day in the week
  var day = new Date(weekStart);
  while (day <= weekEnd) {
    var dateStr = formatDate(day);

    // Each location, one of each sample type
    for (var li = 0; li < locations.length; li++) {
      var loc = locations[li];
      var limits = gradeLimits[loc.grade];

      for (var ti = 0; ti < sampleTypes.length; ti++) {
        var sType = sampleTypes[ti];
        var shift = pick(rng, shifts);
        var cfu = generateCFU(rng, loc.grade);
        var org = pickOrganism(rng, cfu);
        var contamSrc = pickContamSource(rng, org);

        rows.push({
          Sample_Date: dateStr,
          Location_ID: loc.id,
          Location_Name: loc.name,
          Sample_Type: sType,
          CFU_Count: cfu,
          Alert_Limit: limits.alert,
          Action_Limit: limits.action,
          Organism: org.name,
          GMP_Grade: loc.grade,
          ISO_Classification: loc.iso,
          Shift: shift,
          Gram_Type: org.gram,
          Risk_Level: org.risk,
          Contamination_Source: contamSrc,
        });
      }
    }

    day.setDate(day.getDate() + 1);
  }

  // Write Excel file
  var ws = XLSX.utils.json_to_sheet(rows);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'EM Data');
  var filePath = path.join(outputDir, fname);
  XLSX.writeFile(wb, filePath);

  console.log(fname + ': ' + rows.length + ' rows (' + (Math.round((weekEnd - weekStart) / 86400000) + 1) + ' days)');
  fileCount++;

  // Next Monday
  weekStart.setDate(weekStart.getDate() + 7);
}

console.log('\nGenerated ' + fileCount + ' files in ' + outputDir);
