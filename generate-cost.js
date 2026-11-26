'use strict';
/**
 * Generates "[service] cost in [city]" pages with an interactive calculator.
 * 50 largest US cities x 16 services = 800 pages + 1 hub.
 * Run: node generate-cost.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'cost');
const YEAR = 2027;
const BASE = (process.env.SITE_BASE_URL || 'https://topshieldhome.com').replace(/\/+$/, '');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function money(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}
function pct(n) {
  const v = Math.round(Math.abs(n) * 100);
  return v + '%';
}

// ---------------------------------------------------------------- cities
// idx = local labor cost multiplier vs. the national average (1.00)
const CITIES = [
  { name: 'New York', st: 'NY', slug: 'new-york-ny', idx: 1.45, pop: 8336817, region: 'Northeast', note: 'Manhattan and outer-borough labor rates run well above the national average, and building rules can add permit time to every job.' },
  { name: 'Los Angeles', st: 'CA', slug: 'los-angeles-ca', idx: 1.30, pop: 3971883, region: 'Pacific', note: 'Older housing stock and strict permitting make skilled trades expensive, and most structural or system work needs an inspection.' },
  { name: 'Chicago', st: 'IL', slug: 'chicago-il', idx: 1.15, pop: 2746388, region: 'Midwest', note: 'A strong union labor market and cold winters push heating and plumbing costs above the Midwest average.' },
  { name: 'Houston', st: 'TX', slug: 'houston-tx', idx: 0.95, pop: 2304580, region: 'Texas', note: 'A hot, humid climate drives heavy year-round demand for AC repair, water-damage work and mold prevention.' },
  { name: 'Phoenix', st: 'AZ', slug: 'phoenix-az', idx: 0.98, pop: 1608139, region: 'Southwest', note: 'Extreme summer heat shortens HVAC equipment life, so cooling repairs are in constant demand.' },
  { name: 'Philadelphia', st: 'PA', slug: 'philadelphia-pa', idx: 1.12, pop: 1603797, region: 'Northeast', note: 'Row-house construction and older plumbing make access work slower and more labor-intensive than in newer suburbs.' },
  { name: 'San Antonio', st: 'TX', slug: 'san-antonio-tx', idx: 0.92, pop: 1434625, region: 'Texas', note: 'A lower cost of living keeps labor rates below the national average, though summer cooling demand is high.' },
  { name: 'San Diego', st: 'CA', slug: 'san-diego-ca', idx: 1.28, pop: 1386932, region: 'Pacific', note: 'Coastal salt air and strict coastal permits raise costs for roofing, windows and exterior work.' },
  { name: 'Dallas', st: 'TX', slug: 'dallas-tx', idx: 0.98, pop: 1304379, region: 'Texas', note: 'Rapid metro growth keeps contractor demand high, though rates stay close to the national average.' },
  { name: 'San Jose', st: 'CA', slug: 'san-jose-ca', idx: 1.45, pop: 1013240, region: 'Pacific', note: 'Silicon Valley labor rates are among the highest in the country for every trade.' },
  { name: 'Austin', st: 'TX', slug: 'austin-tx', idx: 1.02, pop: 961855, region: 'Texas', note: 'A sustained building boom has pushed contractor demand and pricing slightly above the Texas average.' },
  { name: 'Jacksonville', st: 'FL', slug: 'jacksonville-fl', idx: 0.93, pop: 949611, region: 'Southeast', note: 'Humidity and hurricane season make water damage, roofing and mold work the most in-demand trades.' },
  { name: 'Fort Worth', st: 'TX', slug: 'fort-worth-tx', idx: 0.95, pop: 918915, region: 'Texas', note: 'Fort Worth shares Dallas pricing trends but typically runs a little cheaper on labor.' },
  { name: 'Columbus', st: 'OH', slug: 'columbus-oh', idx: 0.98, pop: 905748, region: 'Midwest', note: 'Rates sit near the national average, with steady demand from a large stock of older housing.' },
  { name: 'Charlotte', st: 'NC', slug: 'charlotte-nc', idx: 0.97, pop: 874579, region: 'Southeast', note: 'Rapid growth has tightened the labor market, but rates remain close to the national average.' },
  { name: 'Indianapolis', st: 'IN', slug: 'indianapolis-in', idx: 0.95, pop: 887642, region: 'Midwest', note: 'Lower overhead keeps rates modest, though winter heating and frozen-pipe work spikes in season.' },
  { name: 'San Francisco', st: 'CA', slug: 'san-francisco-ca', idx: 1.50, pop: 873965, region: 'Pacific', note: 'San Francisco is the most expensive labor market in the country for home services.' },
  { name: 'Seattle', st: 'WA', slug: 'seattle-wa', idx: 1.28, pop: 737015, region: 'Pacific', note: 'High wages and a wet climate push roofing, gutter and mold work above the national average.' },
  { name: 'Denver', st: 'CO', slug: 'denver-co', idx: 1.08, pop: 715522, region: 'Mountain', note: 'Hail season makes roof repairs unusually frequent, and steady demand pushes prices up.' },
  { name: 'Washington', st: 'DC', slug: 'washington-dc', idx: 1.22, pop: 689545, region: 'Northeast', note: 'A high cost of living and strict permitting raise both labor and inspection costs.' },
  { name: 'Nashville', st: 'TN', slug: 'nashville-tn', idx: 1.00, pop: 689447, region: 'Southeast', note: 'Growth keeps demand strong and pricing right around the national average.' },
  { name: 'Oklahoma City', st: 'OK', slug: 'oklahoma-city-ok', idx: 0.88, pop: 681054, region: 'Midwest', note: 'One of the lowest labor costs among major metros, with hail damage driving steady roofing demand.' },
  { name: 'El Paso', st: 'TX', slug: 'el-paso-tx', idx: 0.85, pop: 678815, region: 'Texas', note: 'A low cost of living makes El Paso one of the cheapest major metros for home services.' },
  { name: 'Boston', st: 'MA', slug: 'boston-ma', idx: 1.30, pop: 675647, region: 'Northeast', note: 'Old housing stock, tight permits and high wages push every trade well above average.' },
  { name: 'Portland', st: 'OR', slug: 'portland-or', idx: 1.12, pop: 652503, region: 'Pacific', note: 'Wet winters drive gutter, roofing and mold work, with rates above the national average.' },
  { name: 'Las Vegas', st: 'NV', slug: 'las-vegas-nv', idx: 1.00, pop: 641903, region: 'Southwest', note: 'Desert heat and hard water shorten equipment life, and rates sit near the national average.' },
  { name: 'Detroit', st: 'MI', slug: 'detroit-mi', idx: 0.92, pop: 639111, region: 'Midwest', note: 'A lower cost of living keeps rates down, though older homes often mean more repair work.' },
  { name: 'Memphis', st: 'TN', slug: 'memphis-tn', idx: 0.88, pop: 633104, region: 'Southeast', note: 'Low labor costs, with strong seasonal demand for HVAC and roofing work.' },
  { name: 'Louisville', st: 'KY', slug: 'louisville-ky', idx: 0.90, pop: 633045, region: 'Southeast', note: 'Rates run below average, and older housing often needs more access and repair work.' },
  { name: 'Baltimore', st: 'MD', slug: 'baltimore-md', idx: 1.05, pop: 585708, region: 'Northeast', note: 'Rowhouses and older systems make jobs more labor-intensive than the national average.' },
  { name: 'Milwaukee', st: 'WI', slug: 'milwaukee-wi', idx: 0.98, pop: 577222, region: 'Midwest', note: 'Cold winters make heating, insulation and frozen-pipe work the busiest categories.' },
  { name: 'Albuquerque', st: 'NM', slug: 'albuquerque-nm', idx: 0.88, pop: 564559, region: 'Southwest', note: 'A dry climate and low labor costs keep rates well below the national average.' },
  { name: 'Tucson', st: 'AZ', slug: 'tucson-az', idx: 0.90, pop: 542629, region: 'Southwest', note: 'Desert heat is brutal on cooling systems, and rates stay below average.' },
  { name: 'Fresno', st: 'CA', slug: 'fresno-ca', idx: 0.95, pop: 542107, region: 'Pacific', note: 'Central Valley rates are lower than coastal California but still above the national average.' },
  { name: 'Sacramento', st: 'CA', slug: 'sacramento-ca', idx: 1.10, pop: 524943, region: 'Pacific', note: 'A growing metro and hot summers push HVAC and remodeling costs up.' },
  { name: 'Kansas City', st: 'MO', slug: 'kansas-city-mo', idx: 0.95, pop: 508090, region: 'Midwest', note: 'Slightly below average, with hail and freeze events driving roofing and plumbing work.' },
  { name: 'Mesa', st: 'AZ', slug: 'mesa-az', idx: 0.98, pop: 504258, region: 'Southwest', note: 'Mesa shares Phoenix pricing, with heavy summer demand for cooling repair.' },
  { name: 'Atlanta', st: 'GA', slug: 'atlanta-ga', idx: 1.02, pop: 498715, region: 'Southeast', note: 'Growth and humidity make HVAC, mold and water damage the busiest trades.' },
  { name: 'Omaha', st: 'NE', slug: 'omaha-ne', idx: 0.92, pop: 486051, region: 'Midwest', note: 'Low overhead and a strong insurance market keep rates below average.' },
  { name: 'Colorado Springs', st: 'CO', slug: 'colorado-springs-co', idx: 1.00, pop: 478961, region: 'Mountain', note: 'Hail and freeze-thaw cycles make roofing and exterior work common at near-average rates.' },
  { name: 'Raleigh', st: 'NC', slug: 'raleigh-nc', idx: 1.00, pop: 467665, region: 'Southeast', note: 'Tech-driven growth keeps contractor demand and pricing at the national average.' },
  { name: 'Virginia Beach', st: 'VA', slug: 'virginia-beach-va', idx: 0.98, pop: 459470, region: 'Southeast', note: 'Coastal humidity and storm seasons drive roofing and water-damage demand at average rates.' },
  { name: 'Long Beach', st: 'CA', slug: 'long-beach-ca', idx: 1.30, pop: 466742, region: 'Pacific', note: 'Long Beach shares Los Angeles labor rates, with coastal permits adding cost to exterior work.' },
  { name: 'Miami', st: 'FL', slug: 'miami-fl', idx: 1.10, pop: 442241, region: 'Southeast', note: 'Hurricane codes, humidity and mold risk make exterior and restoration work expensive.' },
  { name: 'Oakland', st: 'CA', slug: 'oakland-ca', idx: 1.32, pop: 440646, region: 'Pacific', note: 'Bay Area wages and older housing push every trade well above average.' },
  { name: 'Minneapolis', st: 'MN', slug: 'minneapolis-mn', idx: 1.08, pop: 429954, region: 'Midwest', note: 'Winters make heating, frozen pipes and roof ice dams a seasonal priority.' },
  { name: 'Tulsa', st: 'OK', slug: 'tulsa-ok', idx: 0.88, pop: 413066, region: 'Midwest', note: 'Low labor costs and hail-prone weather make roofing the most requested service.' },
  { name: 'Bakersfield', st: 'CA', slug: 'bakersfield-ca', idx: 0.95, pop: 403455, region: 'Pacific', note: 'Inland rates are lower than coastal California but still above the national average.' },
  { name: 'Wichita', st: 'KS', slug: 'wichita-ks', idx: 0.87, pop: 397532, region: 'Midwest', note: 'Some of the lowest rates in the country, with wind and hail driving roof work.' },
  { name: 'Arlington', st: 'TX', slug: 'arlington-tx', idx: 0.95, pop: 394266, region: 'Texas', note: 'Arlington shares Dallas-Fort Worth pricing, slightly below the national average.' },
];

// --------------------------------------------------- state licensing notes
const STATE_NOTES = {
  NY: 'New York registers home-improvement contractors through the state, and New York City adds its own permit and licensing requirements. Ask for the license number and verify it before work starts.',
  CA: 'California requires most contractors to hold a state license from the CSLB. Check any license number at cslb.ca.gov, and confirm permits for structural, electrical, plumbing or roofing work.',
  IL: 'Illinois licenses roofers and plumbers at the state level, while most other trades are regulated by the city or county. Chicago has some of the strictest permit rules in the country.',
  TX: 'Texas does not license most home-service contractors statewide. Cities like Houston, Dallas and Austin issue their own registrations and permits, so always confirm local registration and insurance.',
  AZ: 'Arizona licenses residential contractors through the Registrar of Contractors (ROC). Verify the ROC number, and note that permits are issued by the city.',
  PA: 'Pennsylvania requires home-improvement contractor registration with the state Attorney General\'s office, and Philadelphia adds its own licensing and permits.',
  FL: 'Florida licenses contractors through the DBPR and enforces some of the strictest hurricane and building codes in the country, especially for roofing and windows.',
  OH: 'Ohio does not license most trades statewide; licensing and permits are handled by the city or county.',
  NC: 'North Carolina licenses general contractors, plumbers and electricians through state licensing boards, and local permits are required for most work.',
  IN: 'Indiana requires state licensing for plumbers and electricians; other trades are regulated locally.',
  WA: 'Washington requires contractors to register with the state Department of Labor and Industries (L&I), and permits are issued by the city or county.',
  CO: 'Colorado does not license most contractors statewide; licensing and permits are handled by the city or county, and Denver has its own rules.',
  DC: 'Washington, DC licenses contractors through the Department of Consumer and Regulatory Affairs (DCRA) and requires permits for most work.',
  TN: 'Tennessee licenses contractors at the state level for projects above a set threshold, and local permits are issued by the county or city.',
  OK: 'Oklahoma requires state licensing for plumbers and electricians; general contractors are licensed locally.',
  MA: 'Massachusetts requires a state Home Improvement Contractor (HIC) registration and separate trade licenses for plumbing and electrical work.',
  OR: 'Oregon licenses contractors through the Construction Contractors Board (CCB). Ask for the CCB number before hiring.',
  NV: 'Nevada licenses contractors through the State Contractors Board (NSCB), and Clark County issues the permits for Las Vegas-area work.',
  MI: 'Michigan requires state licensing for plumbers and electricians; other trades are licensed locally.',
  KY: 'Kentucky requires state licensing for plumbers and electricians, plus local permits for most work.',
  MD: 'Maryland licenses contractors through the state Home Improvement Commission (MHIC), and Baltimore adds its own permits.',
  WI: 'Wisconsin requires state certification for plumbers and electricians; other trades are licensed locally.',
  NM: 'New Mexico licenses contractors through the Regulation and Licensing Department (RLD), and permits are issued locally.',
  MO: 'Missouri does not license most contractors statewide; Kansas City issues its own licenses and permits.',
  GA: 'Georgia licenses contractors through the state licensing board, and local permits are required for most work.',
  NE: 'Nebraska requires state licensing for plumbers and electricians, with local permits for other work.',
  VA: 'Virginia licenses contractors through the Department of Professional and Occupational Regulation (DPOR), and local permits are required.',
  MN: 'Minnesota requires state licensing for most building contractors and separate licenses for plumbing and electrical work.',
  KS: 'Kansas does not license most contractors statewide; Wichita issues its own licenses and permits.',
};

// ---------------------------------------------------------------- services
const SERVICES = [
  {
    slug: 'plumber', name: 'Plumbing', h1: 'a Plumber', short: 'Plumber',
    unit: 'hour', unitPlural: 'hours', rate: 95, low: 85, high: 155, min: 120, defQty: 2,
    guide: 'plumbing',
    jobs: [['Drain cleaning', 150, 350], ['Water heater replacement', 950, 2600], ['Leak repair', 150, 550], ['Toilet replacement', 250, 650], ['Whole-home repiping', 4000, 15000]],
    affects: ['Whether the job is an emergency or an after-hours call', 'Access - pipes behind walls or under a slab cost more to reach', 'Whether a permit and inspection are required', 'The age and material of your existing pipes'],
  },
  {
    slug: 'electrician', name: 'Electrical', h1: 'an Electrician', short: 'Electrician',
    unit: 'hour', unitPlural: 'hours', rate: 95, low: 85, high: 150, min: 110, defQty: 2,
    guide: 'electrical',
    jobs: [['Outlet or switch replacement', 120, 350], ['Electrical panel upgrade', 1300, 3500], ['EV charger installation', 700, 2000], ['Ceiling fan installation', 150, 400], ['Whole-home rewiring', 8000, 20000]],
    affects: ['Panel capacity - older panels may need upgrading first', 'Whether walls must be opened to run new wire', 'Permit and inspection requirements', 'Emergency or after-hours scheduling'],
  },
  {
    slug: 'hvac', name: 'HVAC', h1: 'HVAC Repair', short: 'HVAC repair',
    unit: 'hour', unitPlural: 'hours', rate: 110, low: 95, high: 180, min: 130, defQty: 2,
    guide: 'hvac',
    jobs: [['AC repair', 180, 650], ['Furnace repair', 180, 650], ['AC installation', 3500, 8500], ['Furnace installation', 3000, 7500], ['Seasonal tune-up', 100, 250]],
    affects: ['System age and whether parts are still available', 'Refrigerant type - older R-22 systems cost more to service', 'Ductwork condition and accessibility', 'Peak-season demand in summer and winter'],
  },
  {
    slug: 'roofer', name: 'Roofing', h1: 'a Roofer', short: 'Roofing',
    unit: 'hour', unitPlural: 'hours', rate: 90, low: 75, high: 140, min: 150, defQty: 3,
    guide: 'roofing',
    jobs: [['Minor roof repair', 300, 1500], ['Asphalt roof replacement', 6000, 15000], ['Roof inspection', 150, 500], ['Flashing repair', 250, 800], ['Storm damage repair', 500, 3000]],
    affects: ['Roof pitch and height - steep roofs need more safety setup', 'Number of layers being removed', 'Material choice: asphalt, metal or tile', 'Whether insurance covers storm damage'],
  },
  {
    slug: 'garage-door', name: 'Garage Door', h1: 'Garage Door Repair', short: 'Garage door repair',
    unit: 'hour', unitPlural: 'hours', rate: 90, low: 80, high: 140, min: 100, defQty: 1,
    guide: 'garage-door-repair',
    jobs: [['Spring replacement', 150, 400], ['Opener installation', 300, 700], ['New door installation', 800, 3000], ['Panel replacement', 200, 600], ['Track realignment', 120, 350]],
    affects: ['Whether one or both springs need replacing', 'Door material and size', 'Opener type and smart features', 'Emergency same-day scheduling'],
  },
  {
    slug: 'locksmith', name: 'Locksmith', h1: 'a Locksmith', short: 'Locksmith service',
    unit: 'hour', unitPlural: 'hours', rate: 85, low: 70, high: 140, min: 90, defQty: 1,
    guide: 'locksmith',
    jobs: [['House lockout', 75, 200], ['Rekeying locks', 75, 250], ['Deadbolt installation', 100, 300], ['Smart lock installation', 150, 400], ['Car lockout', 75, 250]],
    affects: ['Time of day - lockouts at night cost more', 'Lock type and security rating', 'Number of locks being serviced', 'Whether the door or frame is damaged'],
  },
  {
    slug: 'water-damage-restoration', name: 'Water Damage Restoration', h1: 'Water Damage Restoration', short: 'Water damage restoration',
    unit: 'hour', unitPlural: 'hours', rate: 110, low: 90, high: 175, min: 250, defQty: 4,
    guide: 'water-damage-restoration',
    jobs: [['Water extraction', 1200, 3500], ['Structural drying', 1000, 3000], ['Sewage cleanup', 2000, 6000], ['Mold prevention treatment', 500, 1500], ['Content cleaning', 300, 1500]],
    affects: ['Category of water - clean, grey or black water changes the process', 'Square footage affected', 'How long the water sat before extraction', 'Whether insurance is covering the claim'],
  },
  {
    slug: 'mold-removal', name: 'Mold Removal', h1: 'Mold Remediation', short: 'Mold remediation',
    unit: 'hour', unitPlural: 'hours', rate: 100, low: 85, high: 160, min: 250, defQty: 4,
    guide: 'mold-removal',
    jobs: [['Small area (under 10 sq ft)', 500, 1500], ['Medium area (10-100 sq ft)', 1500, 4000], ['Large area (100+ sq ft)', 4000, 10000], ['Attic or crawlspace', 2000, 6000], ['Air quality testing', 300, 800]],
    affects: ['Size of the affected area', 'Where the mold is - attics and crawlspaces cost more', 'Whether the moisture source has been fixed', 'Whether containment and negative air machines are needed'],
  },
  {
    slug: 'appliance-repair', name: 'Appliance Repair', h1: 'Appliance Repair', short: 'Appliance repair',
    unit: 'hour', unitPlural: 'hours', rate: 95, low: 80, high: 150, min: 100, defQty: 1,
    guide: 'appliance-repair',
    jobs: [['Refrigerator repair', 150, 450], ['Washing machine repair', 150, 400], ['Dryer repair', 150, 400], ['Dishwasher repair', 150, 350], ['Oven or range repair', 150, 450]],
    affects: ['Brand - premium brands carry higher parts costs', 'Age of the appliance and parts availability', 'Whether the unit is gas or electric', 'Whether the diagnostic fee is waived on repair'],
  },
  {
    slug: 'handyman', name: 'Handyman', h1: 'a Handyman', short: 'Handyman service',
    unit: 'hour', unitPlural: 'hours', rate: 75, low: 60, high: 120, min: 75, defQty: 2,
    guide: null,
    jobs: [['Furniture assembly', 75, 250], ['Drywall patching', 150, 450], ['Interior painting (one room)', 250, 700], ['TV mounting', 100, 300], ['Deck repair', 300, 1200]],
    affects: ['Whether the work needs a licensed trade', 'Number of small tasks bundled into one visit', 'Materials you supply versus the handyman supplies', 'Minimum visit charges'],
  },
  {
    slug: 'dumpster-rental', name: 'Dumpster Rental', h1: 'Dumpster Rental', short: 'Dumpster rental',
    unit: 'day', unitPlural: 'days', rate: 55, low: 45, high: 90, min: 250, defQty: 7,
    guide: null,
    jobs: [['10-yard dumpster (one week)', 300, 500], ['20-yard dumpster (one week)', 400, 650], ['30-yard dumpster (one week)', 500, 800], ['40-yard dumpster (one week)', 600, 950], ['Extra weight overage (per ton)', 50, 120]],
    affects: ['Dumpster size and rental length', 'Weight limits - heavy debris like concrete costs more', 'Delivery distance and permit needs', 'Whether hazardous or restricted items are included'],
  },
  {
    slug: 'portable-toilet-rental', name: 'Portable Toilet Rental', h1: 'Portable Toilet Rental', short: 'Portable toilet rental',
    unit: 'day', unitPlural: 'days', rate: 45, low: 35, high: 75, min: 100, defQty: 7,
    guide: null,
    jobs: [['Standard unit (weekend)', 100, 200], ['Standard unit (one week)', 150, 300], ['Deluxe unit with sink (one week)', 250, 450], ['Hand-wash station', 75, 175], ['Extra servicing visit', 50, 120]],
    affects: ['Rental length and number of units', 'Servicing frequency for events or job sites', 'Delivery distance and site access', 'Whether a hand-wash station or lighting is added'],
  },
  {
    slug: 'window-installation', name: 'Window Installation', h1: 'Window Replacement', short: 'Window replacement',
    unit: 'window', unitPlural: 'windows', rate: 550, low: 350, high: 1200, min: 350, defQty: 5,
    guide: 'windows',
    jobs: [['Single window replacement', 350, 1200], ['Whole-home (10 windows)', 4000, 12000], ['Bay or picture window', 1500, 5000], ['Impact windows (each)', 800, 2500], ['Window repair (not replacement)', 150, 500]],
    affects: ['Window material: vinyl, wood or fiberglass', 'Whether the full frame is replaced or an insert is used', 'Glass type - impact or energy-rated glass costs more', 'Number of windows and access from outside'],
  },
  {
    slug: 'siding', name: 'Siding', h1: 'Siding Installation', short: 'Siding installation',
    unit: 'sq ft', unitPlural: 'sq ft', rate: 9, low: 6, high: 16, min: 1500, defQty: 500,
    guide: 'siding',
    jobs: [['Vinyl siding (per sq ft)', 6, 12], ['Fiber-cement siding (per sq ft)', 9, 16], ['Wood siding (per sq ft)', 8, 15], ['Siding repair (small area)', 300, 1200], ['Siding removal and disposal (per sq ft)', 1, 3]],
    affects: ['Material choice: vinyl, fiber-cement or wood', 'Whether old siding must be removed first', 'Square footage and number of stories', 'Trim, soffit and fascia work included'],
  },
  {
    slug: 'gutter-services', name: 'Gutter Services', h1: 'Gutter Installation', short: 'Gutter work',
    unit: 'linear ft', unitPlural: 'linear ft', rate: 8, low: 6, high: 15, min: 150, defQty: 150,
    guide: 'gutters',
    jobs: [['Gutter cleaning', 150, 400], ['Gutter installation (per linear ft)', 6, 15], ['Gutter guards (per linear ft)', 8, 20], ['Downspout installation', 100, 300], ['Seamless gutter replacement (per linear ft)', 8, 18]],
    affects: ['Linear footage and number of stories', 'Seamless versus sectional gutters', 'Whether guards or heaters are added', 'Access and roofline complexity'],
  },
  {
    slug: 'pest-control', name: 'Pest Control', h1: 'Pest Control', short: 'Pest control',
    unit: 'treatment', unitPlural: 'treatments', rate: 120, low: 100, high: 220, min: 100, defQty: 4,
    guide: 'pest-control',
    jobs: [['One-time treatment', 150, 400], ['Quarterly plan (per visit)', 100, 220], ['Termite treatment', 500, 2500], ['Rodent exclusion', 300, 1200], ['Bed bug treatment', 300, 1500]],
    affects: ['Pest type - termites and bed bugs cost the most', 'Severity of the infestation', 'Whether it is a one-time or recurring plan', 'Square footage and number of structures treated'],
  },
];

// ------------------------------------------------------------- neighbors
function neighborsOf(city) {
  return CITIES
    .filter(c => c !== city && c.region === city.region)
    .sort((a, b) => Math.abs(a.pop - city.pop) - Math.abs(b.pop - city.pop))
    .slice(0, 6);
}

function cityRate(service, city) {
  return service.rate * city.idx;
}

// ------------------------------------------------------------- rendering
const SHARED_CSS = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#fff;--bg-alt:#f5f5f7;--text:#1d1d1f;--text-2:#6e6e73;--blue:#0071e3;--blue-dark:#0066cc;--green:#34c759;--line:#d2d2d7;--radius:18px;--font:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Helvetica Neue',Helvetica,Arial,sans-serif}
    body{font-family:var(--font);color:var(--text);line-height:1.6;background:var(--bg);font-size:17px;-webkit-font-smoothing:antialiased}
    a{color:var(--blue);text-decoration:none} a:hover{text-decoration:underline}
    .topbar{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;height:52px;padding:0 22px;background:rgba(251,251,253,.8);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}
    .brand{display:flex;align-items:center;gap:9px;font-weight:600;font-size:19px;color:var(--text)}
    .topnav{display:flex;align-items:center;gap:16px;font-size:13px;color:var(--text-2);font-weight:500}
    .btn{background:var(--blue);color:#fff;padding:8px 16px;border-radius:980px;font-size:14px;font-weight:500} .btn:hover{background:var(--blue-dark);text-decoration:none}
    .wrap{width:min(820px,88%);margin:0 auto} .hero{background:var(--bg-alt);padding:48px 0 40px}
    .crumbs{font-size:14px;color:var(--text-2);margin-bottom:12px}
    h1{font-size:clamp(30px,5vw,46px);line-height:1.08;letter-spacing:-.02em;font-weight:600;margin-bottom:14px}
    .lede{font-size:19px;color:var(--text-2);line-height:1.5;max-width:65ch}
    main{padding:40px 0 80px} h2{font-size:27px;letter-spacing:-.01em;margin:36px 0 12px} h3{font-size:19px;margin:20px 0 8px}
    p,li{color:var(--text-2);font-size:17px} p{margin:10px 0} ul,ol{padding-left:22px;margin:10px 0;display:grid;gap:8px}
    .card{background:var(--bg-alt);border-radius:var(--radius);padding:22px 24px;margin:18px 0}
    .calc{background:linear-gradient(180deg,#f5f9ff,#eef4fd);border:1px solid #d6e6fb;border-radius:var(--radius);padding:24px;margin:22px 0}
    .calc h2{margin:0 0 6px;font-size:22px}
    .calc .row{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin-top:14px}
    .calc label{display:block;font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px}
    .calc input{font-family:var(--font);font-size:17px;padding:11px 14px;border:1px solid var(--line);border-radius:12px;width:170px;background:#fff;color:var(--text)}
    .calc button{font-family:var(--font);font-size:15px;font-weight:600;background:var(--blue);color:#fff;border:0;border-radius:980px;padding:12px 22px;cursor:pointer}
    .calc button:hover{background:var(--blue-dark)}
    .out{margin-top:16px;font-size:30px;font-weight:600;letter-spacing:-.02em;color:var(--text)}
    .outnote{font-size:14px;color:var(--text-2);margin-top:2px}
    table{width:100%;border-collapse:collapse;margin:14px 0;font-size:16px}
    th,td{text-align:left;padding:11px 10px;border-bottom:1px solid var(--line);color:var(--text-2)}
    th{font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--text);font-weight:600}
    td:last-child,th:last-child{text-align:right;color:var(--text);font-weight:600}
    .cta{background:var(--text);color:#fff;border-radius:var(--radius);padding:28px;margin:36px 0;text-align:center}
    .cta h2{color:#fff;margin:0 0 8px;font-size:25px} .cta p{color:#d1d1d6;margin:0 0 16px}
    .cta .btn{display:inline-block;background:#fff;color:var(--text)} .cta .btn:hover{background:#e8e8ed}
    .faq{margin:14px 0} .faq h3{margin:0 0 6px;font-size:18px;color:var(--text)} .faq p{margin:0}
    .links{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:12px}
    .links a{display:block;background:var(--bg-alt);padding:12px 14px;border-radius:12px;color:var(--text);font-size:15px}
    .links a:hover{background:#e8e8ed;text-decoration:none}
    .note{font-size:14px;color:var(--text-2);background:var(--bg-alt);border-radius:12px;padding:14px 16px;margin-top:24px}
    footer{background:var(--bg-alt);color:var(--text-2);padding:34px 0;font-size:13px;text-align:center}
    footer a{color:var(--text-2)}
    @media(max-width:640px){.calc input{width:100%}.calc .row{display:grid}.calc button{width:100%}}
`;

function topbar() {
  return `  <header class="topbar">
    <a class="brand" href="/index.html"><span>Top Shield Home Services</span></a>
    <nav class="topnav">
      <a href="/cost/index.html">Costs</a>
      <a href="/guides/index.html">Guides</a>
      <a class="btn" href="/index.html#chat">Chat with AI</a>
    </nav>
  </header>`;
}

function footer() {
  return `  <footer><div class="wrap">
    <p><a href="/index.html">Home</a> &nbsp;|&nbsp; <a href="/cost/index.html">Cost Guides</a> &nbsp;|&nbsp; <a href="/guides/index.html">How-to Guides</a> &nbsp;|&nbsp; <a href="/privacy.html">Privacy</a> &nbsp;|&nbsp; <a href="/terms.html">Terms</a></p>
    <p style="margin-top:8px">(c) ${YEAR} Top Shield Home Services. 6920 S Cimarron Rd, Suite 100, Las Vegas, NV 89113. Estimates only - actual quotes vary.</p>
  </div></footer>`;
}

function renderCostPage(service, city) {
  const rate = cityRate(service, city);
  const rateLow = service.low * city.idx;
  const rateHigh = service.high * city.idx;
  const diff = city.idx - 1;
  const vsNational = diff === 0 ? 'right at the national average'
    : `${pct(diff)} ${diff > 0 ? 'above' : 'below'} the national average of ${money(service.rate)}`;
  const unitLabel = service.unitPlural;
  const neigh = neighborsOf(city);
  const otherServices = SERVICES.filter(s => s !== service).slice(0, 8);
  const title = `How Much Does ${service.h1} Cost in ${city.name}, ${city.st}? (${YEAR} Prices)`;
  const desc = `${service.name} in ${city.name}, ${city.st} costs about ${money(rate)} per ${service.unit} (range ${money(rateLow)}-${money(rateHigh)}). Use our free calculator to estimate your job in seconds.`;
  const canonical = `${BASE}/cost/${service.slug}-cost-in-${city.slug}.html`;
  const stateNote = STATE_NOTES[city.st] || '';

  const faqs = [
    {
      q: `How much does ${service.h1} cost in ${city.name}?`,
      a: `Expect roughly ${money(rate)} per ${service.unit} in ${city.name}, with most work landing between ${money(rateLow)} and ${money(rateHigh)} per ${service.unit}. A typical minimum service call is about ${money(service.min * city.idx)}. The table above shows real-world ranges for common ${service.name.toLowerCase()} jobs.`
    },
    {
      q: `What is the average hourly rate for ${service.short.toLowerCase()} in ${city.name}?`,
      a: `The local average is about ${money(rate)} per hour, which is ${vsNational}. Rates vary by company size, licensing, insurance and how quickly you need someone on site.`
    },
    {
      q: `Do ${service.name.toLowerCase()} prices go up for emergency or after-hours work?`,
      a: `Yes. Emergency, weekend and overnight calls commonly add 25% to 50% on top of standard rates in ${city.name}. If the job can safely wait until normal business hours, you will usually save money.`
    },
    {
      q: `Do I need a permit for this kind of work in ${city.st}?`,
      a: `${stateNote} Permits, where required, usually add ${money(60 * city.idx)} to ${money(350 * city.idx)} to the total.`
    },
    {
      q: `How can I keep ${service.name.toLowerCase()} costs down in ${city.name}?`,
      a: `Get at least three written quotes, bundle small tasks into one visit to avoid repeat service charges, ask whether the diagnostic fee is credited toward the repair, and schedule non-urgent work outside peak season. Always confirm the contractor is licensed and insured before work begins.`
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  const serviceSchema = {
    '@context': 'https://schema.org', '@type': 'Service',
    name: `${service.name} in ${city.name}, ${city.st}`,
    serviceType: service.name,
    provider: { '@type': 'HomeAndConstructionBusiness', name: 'Top Shield Home Services', telephone: '+12136523458', url: BASE + '/' },
    areaServed: { '@type': 'City', name: city.name, containedInPlace: { '@type': 'State', name: city.st } },
    offers: { '@type': 'Offer', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: Math.round(rate), priceCurrency: 'USD', unitText: service.unit } },
  };
  const crumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Cost Guides', item: BASE + '/cost/index.html' },
      { '@type': 'ListItem', position: 3, name: `${service.name} Cost in ${city.name}, ${city.st}`, item: canonical },
    ],
  };

  const jobRows = service.jobs.map(([label, lo, hi]) =>
    `        <tr><td>${esc(label)}</td><td>${money(lo * city.idx)} - ${money(hi * city.idx)}</td></tr>`
  ).join('\n');

  const affectItems = service.affects.concat([
    'Emergency, weekend or after-hours scheduling',
    'Permit and inspection fees where required',
    'Access, age of the home and condition of existing systems',
  ]).map(a => `      <li>${esc(a)}</li>`).join('\n');

  const nearbyLinks = neigh.map(n =>
    `        <a href="/cost/${service.slug}-cost-in-${n.slug}.html">${esc(service.name)} cost in ${esc(n.name)}, ${esc(n.st)}</a>`
  ).join('\n');

  const otherLinks = otherServices.map(s =>
    `        <a href="/cost/${s.slug}-cost-in-${city.slug}.html">${esc(s.name)} in ${esc(city.name)}</a>`
  ).join('\n');

  const guideLink = service.guide
    ? `<p><a href="/guides/${service.guide}/index.html">Browse our ${esc(service.name)} how-to guides &rsaquo;</a></p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | Top Shield Home Services</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(crumbSchema)}</script>
  <style>${SHARED_CSS}  </style>
</head>
<body>
${topbar()}
  <section class="hero"><div class="wrap">
    <div class="crumbs"><a href="/index.html">Home</a> &rsaquo; <a href="/cost/index.html">Cost Guides</a> &rsaquo; <a href="/cost/index.html#${esc(city.slug)}">${esc(city.name)}, ${esc(city.st)}</a></div>
    <h1>How Much Does ${esc(service.h1)} Cost in ${esc(city.name)}, ${esc(city.st)}?</h1>
    <p class="lede">${esc(service.name)} in ${esc(city.name)} averages about <strong>${money(rate)} per ${esc(service.unit)}</strong>, typically ranging from ${money(rateLow)} to ${money(rateHigh)}. That is ${esc(vsNational)}. Use the calculator below to estimate your own job.</p>
  </div></section>

  <main><div class="wrap">

    <div class="calc">
      <h2>Cost calculator</h2>
      <p class="outnote" style="margin-top:0">Enter the amount of work you need and we will estimate a price range for ${esc(city.name)}.</p>
      <div class="row">
        <div>
          <label for="qty">${esc(service.unitPlural.charAt(0).toUpperCase() + service.unitPlural.slice(1))} needed</label>
          <input id="qty" type="number" min="0" step="any" value="${service.defQty}">
        </div>
        <button type="button" id="calcBtn">Calculate</button>
      </div>
      <div class="out" id="out">&nbsp;</div>
      <div class="outnote" id="outnote"></div>
    </div>

    <h2>Typical ${esc(service.name.toLowerCase())} prices in ${esc(city.name)}</h2>
    <p>These ranges reflect what homeowners in ${esc(city.name)}, ${esc(city.st)} commonly pay. Local labor costs here run ${esc(diff === 0 ? 'at about the national average' : (diff > 0 ? pct(diff) + ' above' : pct(diff) + ' below') + ' the national average')}.</p>
    <table>
      <thead><tr><th>Job</th><th>Typical price</th></tr></thead>
      <tbody>
${jobRows}
      </tbody>
    </table>

    <h2>Average ${esc(service.short.toLowerCase())} rate in ${esc(city.name)}</h2>
    <p>The typical rate is <strong>${money(rate)} per ${esc(service.unit)}</strong>, with a normal range of ${money(rateLow)} to ${money(rateHigh)}. A minimum service call in ${esc(city.name)} usually runs about ${money(service.min * city.idx)}.</p>
    <p>${esc(city.note)}</p>

    <h2>What affects the price</h2>
    <ul>
${affectItems}
    </ul>

    <h2>Licensing and permits in ${esc(city.st)}</h2>
    <p>${esc(stateNote)}</p>

    <div class="cta">
      <h2>Need ${esc(service.h1)} in ${esc(city.name)}?</h2>
      <p>Tell our AI assistant what is going on and get connected with a local ${esc(service.name.toLowerCase())} pro.</p>
      <a class="btn" href="/index.html#chat">Talk to the AI</a>
    </div>

    <h2>Frequently asked questions</h2>
${faqs.map(f => `    <div class="faq"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('\n')}

    <h2>${esc(service.name)} costs in nearby cities</h2>
    <div class="links">
${nearbyLinks}
    </div>

    <h2>Other service costs in ${esc(city.name)}</h2>
    <div class="links">
${otherLinks}
    </div>

    ${guideLink}
    <p class="note">How we estimate: we start from national trade cost data for ${esc(service.name.toLowerCase())} work and adjust it for local labor costs in ${esc(city.name)}. Figures are planning estimates, not quotes. Always get written estimates from licensed local contractors before committing to work.</p>
  </div></main>
${footer()}
  <script>
  (function () {
    var RATE = ${rate.toFixed(2)};
    var MIN = ${(service.min * city.idx).toFixed(2)};
    var UNIT = ${JSON.stringify(service.unit)};
    var PLURAL = ${JSON.stringify(service.unitPlural)};
    var CITY = ${JSON.stringify(city.name)};
    function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
    function run() {
      var q = parseFloat(document.getElementById('qty').value);
      if (!isFinite(q) || q <= 0) q = 1;
      var base = q * RATE;
      if (base < MIN) base = MIN;
      var lo = base * 0.85, hi = base * 1.15;
      document.getElementById('out').textContent = fmt(lo) + ' - ' + fmt(hi);
      document.getElementById('outnote').textContent = 'Estimated range for ' + q + ' ' + (q === 1 ? UNIT : PLURAL) + ' in ' + CITY + '. Most jobs fall inside this range.';
    }
    document.getElementById('calcBtn').addEventListener('click', run);
    document.getElementById('qty').addEventListener('input', run);
    run();
  })();
  </script>
</body>
</html>`;
}

function renderHub() {
  const title = `Home Service Cost Guides for ${YEAR}: What You Will Pay in 50 Major US Cities`;
  const desc = `See what plumbers, electricians, roofers, HVAC techs and more charge in the 50 largest US cities. Free calculators and local price ranges for every service.`;
  const canonical = `${BASE}/cost/index.html`;

  const serviceRows = SERVICES.map(s =>
    `        <tr><td><a href="#${esc(CITIES[0].slug)}">${esc(s.name)}</a></td><td>${money(s.low)} - ${money(s.high)} per ${esc(s.unit)}</td></tr>`
  ).join('\n');

  const cityBlocks = CITIES.map(c => {
    const links = SERVICES.map(s =>
      `        <a href="/cost/${s.slug}-cost-in-${c.slug}.html">${esc(s.name)} in ${esc(c.name)}</a>`
    ).join('\n');
    return `    <section class="card" id="${esc(c.slug)}">
      <h2 style="margin-top:0">${esc(c.name)}, ${esc(c.st)}</h2>
      <p>${esc(c.note)}</p>
      <div class="links">
${links}
      </div>
    </section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | Top Shield Home Services</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${canonical}">
  <style>${SHARED_CSS}  </style>
</head>
<body>
${topbar()}
  <section class="hero"><div class="wrap">
    <div class="crumbs"><a href="/index.html">Home</a> &rsaquo; Cost Guides</div>
    <h1>Home Service Cost Guides</h1>
    <p class="lede">What plumbers, electricians, roofers and other home pros charge in the 50 largest US cities - with a free calculator on every page.</p>
  </div></section>
  <main><div class="wrap">
    <h2>Average cost by service (national)</h2>
    <table>
      <thead><tr><th>Service</th><th>Typical range</th></tr></thead>
      <tbody>
${serviceRows}
      </tbody>
    </table>
    <p class="note">Pick your city below. Every page includes local price ranges, a calculator, permit notes for your state, and links to nearby cities.</p>
    <h2>Cities</h2>
${cityBlocks}
  </div></main>
${footer()}
</body>
</html>`;
}

// ------------------------------------------------------------------- main
function injectHomepageData() {
  const file = path.join(ROOT, 'index.html');
  if (!fs.existsSync(file)) return false;
  const payload = {
    services: SERVICES.map(s => ({ s: s.slug, n: s.name, r: s.rate, u: s.unit, up: s.unitPlural, d: s.defQty, m: s.min })),
    cities: CITIES.map(c => ({ s: c.slug, n: c.name + ', ' + c.st, i: c.idx })),
  };
  const html = fs.readFileSync(file, 'utf8');
  const marker = /<!--COSTDATA-->[\s\S]*?<!--\/COSTDATA-->/;
  if (!marker.test(html)) {
    console.warn('WARN: cost data markers not found in index.html - skipping');
    return false;
  }
  fs.writeFileSync(file, html.replace(marker,
    '<!--COSTDATA-->\n  <script id="costData" type="application/json">' + JSON.stringify(payload) + '</script>\n  <!--/COSTDATA-->'
  ), 'utf8');
  return true;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let count = 0;
  for (const city of CITIES) {
    for (const service of SERVICES) {
      const html = renderCostPage(service, city);
      fs.writeFileSync(path.join(OUT, `${service.slug}-cost-in-${city.slug}.html`), html, 'utf8');
      count++;
    }
    console.log('city', city.slug, SERVICES.length);
  }
  fs.writeFileSync(path.join(OUT, 'index.html'), renderHub(), 'utf8');
  count++;

  // Rebuild sitemap.xml: keep existing URLs, add every cost page.
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  let existing = [];
  if (fs.existsSync(sitemapPath)) {
    const sm = fs.readFileSync(sitemapPath, 'utf8');
    existing = (sm.match(/<loc>([^<]+)<\/loc>/g) || []).map(m => m.replace(/<\/?loc>/g, ''));
  }
  const costUrls = [`${BASE}/cost/index.html`];
  for (const city of CITIES) for (const service of SERVICES) costUrls.push(`${BASE}/cost/${service.slug}-cost-in-${city.slug}.html`);
  const all = Array.from(new Set(existing.concat(costUrls)));
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    all.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') + `\n</urlset>\n`;
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');

  console.log('TOTAL', count, 'cost pages written to /cost');
  console.log('sitemap urls:', all.length);
  console.log('homepage calculator data injected:', injectHomepageData());
}

main();
