/**
 * FixIt.ai — visitor AI chat + lead capture backend.
 *
 * Run with Node (v18+):
 *   node server.js
 *
 * Reads keys from the project's .env (never logs them). Serves the static
 * site, runs the AI chat (Mercury 3 via an OpenAI-compatible API), and saves
 * leads locally, optionally posting them to Proaxis (your lead buyer/network).
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname; // fixit-ai/
const LEADS_FILE = path.join(ROOT, 'leads.json');

// ---------------------------------------------------------------------------
// Config from .env
// ---------------------------------------------------------------------------
function loadEnv() {
  const env = {};
  const f = path.join(__dirname, '..', '.env');
  if (fs.existsSync(f)) {
    for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  // Real environment variables override .env values (useful when hosting).
  for (const k of Object.keys(process.env)) {
    if (/^[A-Z0-9_]+$/.test(k)) env[k] = process.env[k];
  }
  return env;
}

const env = loadEnv();
const PORT = parseInt(env.PORT || process.env.PORT || '3000', 10);

const CFG = {
  llmKey: env.LLM_API_KEY || '',
  llmBase: (env.LLM_BASE_URL || 'https://api.inception.ai/v1').replace(/\/+$/, ''),
  llmModel: env.LLM_MODEL || 'mercury-3',
  proaxisEndpoint: (env.PROAXIS_ENDPOINT || 'https://api.proaxis.ai/api/cx/rtb').replace(/\/+$/, ''),
  proaxisKey: env.PROAXIS_API_KEY || '',
  proaxisSecret: env.PROAXIS_API_SECRET || '',
  // One Proaxis campaign per vertical (campaign IDs from your integration PDFs).
  proaxisCampaigns: {
    roofing: (env.PROAXIS_CAMPAIGN_ID || '').trim(),
    plumbing: (env.PROAXIS_CAMPAIGN_PLUMBING || '').trim(),
    hvac: (env.PROAXIS_CAMPAIGN_HVAC || '').trim(),
    gutter: (env.PROAXIS_CAMPAIGN_GUTTER || '').trim(),
    windows: (env.PROAXIS_CAMPAIGN_WINDOWS || '').trim(),
    appliance_repair: (env.PROAXIS_CAMPAIGN_APPLIANCE || '').trim(),
    dumpster: (env.PROAXIS_CAMPAIGN_DUMPSTER || '').trim(),
    electrical: (env.PROAXIS_CAMPAIGN_ELECTRICAL || '').trim(),
    final_expense: (env.PROAXIS_CAMPAIGN_FINAL_EXPENSE || '').trim(),
    garage_door: (env.PROAXIS_CAMPAIGN_GARAGE_DOOR || '').trim(),
    handyman: (env.PROAXIS_CAMPAIGN_HANDYMAN || '').trim(),
    locksmith: (env.PROAXIS_CAMPAIGN_LOCKSMITH || '').trim(),
    siding: (env.PROAXIS_CAMPAIGN_SIDING || '').trim(),
    portable_toilet: (env.PROAXIS_CAMPAIGN_PORTABLE_TOILET || '').trim(),
    pest_control: (env.PROAXIS_CAMPAIGN_PEST_CONTROL || '').trim(),
  },
  // Lead Router — pre-call data (call-data/write) so an inbound call is
  // attributed to the service/landing the visitor came from.
  leadrouterEndpoint: (env.LEADROUTER_BASE_URL || 'https://theleadrouter.com').replace(/\/+$/, ''),
  leadrouterKey: env.LEADROUTER_API_KEY || '',
};

// Dynamic Number Insertion (DNI): per-service campaign spec tokens used to mint a
// unique per-visitor tracking number (Lead Router public impressions endpoint).
const SERVICE_DNI_SPEC = {
  'Window Installation':      'a45edd28-3fba-48a3-a35f-918a7cfb2355',
  'HVAC Installation':        'f16a516e-f8ac-485b-a6f7-f9051296ea32',
  'Plumbing':                 '4fb20651-3798-4b77-a619-6568e73add87',
  'Roofing':                  'b86c909a-1ace-4dd9-9b0a-ac875b4cac26',
  'Appliance Repair':         'eb40a024-2df5-4485-9163-7589269b49ea',
  'Gutter Services':          'b4a9e675-9512-459b-9835-3b5a04c277d6',
  'Mold Removal':             'd7b116cf-6413-4cff-a2aa-96d9dd8c7ce5',
  'Water Damage Restoration': '2341c2b1-3ae5-478f-84bc-96d7aa4f8330',
  'Pest Control':             '448ad36a-569a-4c54-8d25-7f38036dc66b',
  'Dumpster Rental':          'ab2ba647-777f-46d4-8304-93bf1defc596',
  'Electrical & Panels':      '1a1c9ab8-f4c7-4f80-8056-69fff14baea2',
  'Final Expense':            '7b4898e7-ff3c-4fd4-a91d-f796e068ae5f',
  'Garage Door Repair':       'e9bec8fa-17a2-44bd-82d7-e2e20fd21790',
  'Handyman':                 '0b1d3b0b-6798-4eeb-9c1a-de5da39e1009',
  'Locksmith':                '34dfe33a-6f28-4206-8569-38c0abc43cd4',
  'Portable Toilet':          '6afb96ec-6904-4047-95fb-6c84c0e2377c',
  'Siding':                   '526722e5-e322-4a7b-9d2e-b64f897acab9',
};

// Business + service phone routing (800Calls numbers clients can dial).
const BUSINESS = { name: 'Top Shield Home Services' };

// Direct call numbers by matched service (used in chat replies and "Who to call" cards).
const SERVICE_PHONES = {
  'Window Installation':      { e164: '+12137875602', display: '(213) 787-5602' },
  'HVAC Installation':        { e164: '+12136523458', display: '(213) 652-3458' },
  'Plumbing':                 { e164: '+12136527656', display: '(213) 652-7656' },
  'Roofing':                  { e164: '+12136522493', display: '(213) 652-2493' },
  'Appliance Repair':         { e164: '+12137871823', display: '(213) 787-1823' },
  'Gutter Services':          { e164: '+12024746791', display: '(202) 474-6791' },
  'Mold Removal':             { e164: '+12139711121', display: '(213) 971-1121' },
  'Water Damage Restoration': { e164: '+12139356658', display: '(213) 935-6658' },
  'Pest Control':             { e164: '+12139356917', display: '(213) 935-6917' },
  'Dumpster Rental':          { e164: '+17382011019', display: '(738) 201-1019' },
  'Electrical & Panels':      { e164: '+17382011020', display: '(738) 201-1020' },
  'Final Expense':            { e164: '+17382011017', display: '(738) 201-1017' },
  'Garage Door Repair':       { e164: '+17382011021', display: '(738) 201-1021' },
  'Handyman':                 { e164: '+17382011022', display: '(738) 201-1022' },
  'Locksmith':                { e164: '+17382011023', display: '(738) 201-1023' },
  'Portable Toilet':          { e164: '+17382011025', display: '(738) 201-1025' },
  'Siding':                   { e164: '+17382011026', display: '(738) 201-1026' },
};

function getServicePhone(service) {
  return SERVICE_PHONES[service] || null;
}

// ---------------------------------------------------------------------------
// Services the assistant knows about (used for the prompt + fallback triage).
// ---------------------------------------------------------------------------
const SERVICES = [
  ['Mold Removal', ['mold', 'mildew', 'black mold', 'mold removal', 'mold remediation']],
  ['Pest Control', ['pest', 'pests', 'rodent', 'rats', 'mice', 'mouse', 'ants', 'ant infestation', 'roaches', 'cockroach', 'termites', 'termite', 'bed bugs', 'bedbug', 'wasps', 'spiders', 'exterminator', 'infestation']],
  ['Water Damage Restoration', ['water damage', 'flood', 'flooded', 'pipe burst', 'burst pipe', 'sewage', 'sewage backup']],
  ['Plumbing', ['plumb', 'pipe', 'faucet', 'drain', 'clog', 'toilet running', 'sewer', 'water heater', 'water leak']],
  ['Roofing', ['roof', 'shingle', 'shingles']],
  ['Gutter Services', ['gutter', 'gutters', 'downspout']],
  ['Window Installation', ['window', 'windows', 'impact windows', 'window replacement', 'new windows', 'window install', 'broken window']],
  ['HVAC Installation', ['hvac', 'heating', 'cooling', 'furnace', 'ac', 'air condition', 'air conditioner', 'heater', 'thermostat', 'duct']],
  ['Electrical & Panels', ['electrical', 'electrician', 'breaker', 'panel', 'wiring', 'outlet', 'ev charger', 'light switch']],
  ['Garage Door Repair', ['garage door', 'opener', 'spring', 'garage', 'door won', 'door not']],
  ['Bath Remodeling', ['bath', 'bathroom', 'shower', 'tub', 'tile', 'vanity', 'toilet']],
  ['Locksmith', ['lock', 'key', 'door locked', 'locked out', 'rekey', 'deadbolt', 'ignition']],
  ['Kitchen Remodeling', ['kitchen', 'cabinet', 'counter', 'backsplash', 'sink']],
  ['Landscaping', ['landscape', 'tree', 'lawn', 'garden', 'yard', 'shrub', 'mulch']],
  ['Cleaning & Maintenance', ['cleaning', 'carpet cleaning', 'upholstery', 'chimney', 'dryer vent', 'pressure wash', 'maid']],
  ['Appliance Repair', ['appliance', 'dishwasher', 'refrigerator', 'fridge', 'oven', 'stove', 'microwave', 'washer not', 'dryer not', 'ice maker']],
  ['Moving Services', ['move', 'moving', 'pack', 'transport', 'relocation']],
  ['Painting', ['paint', 'paint', 'wall color', 'repaint']],
  ['Flooring', ['floor', 'hardwood', 'laminate', 'vinyl', 'carpet install']],
  ['Foundation & Concrete', ['foundation', 'concrete', 'driveway', 'crack', 'settling']],
  ['Dumpster Rental', ['dumpster', 'dumpsters', 'junk removal', 'junk', 'debris', 'roll-off', 'rolloff', 'waste removal', 'haul away', 'trash removal', 'container']],
  ['Final Expense', ['final expense', 'life insurance', 'funeral', 'burial', 'cremation', 'life insurance policy', 'death benefit', 'beneficiary', 'insurance quote']],
  ['Handyman', ['handyman', 'odd job', 'odd jobs', 'small repair', 'hang a tv', 'hang tv', 'furniture assembly', 'minor repair', 'general repair', 'around the house']],
  ['Portable Toilet', ['portable toilet', 'porta potty', 'porta-potty', 'restroom rental', 'toilet rental', 'event restroom', 'portable restroom']],
  ['Siding', ['siding', 'vinyl siding', 'exterior wall', 'cladding', 'soffit', 'fascia']],
];

// Words that are clearly NOT a person's first name. Used to reject a name the
// AI mis-read from an answer about the problem (e.g. "roof", "basement").
const NOT_A_NAME = new Set([
  'roof','roofing','shingle','shingles','gutter','gutters','downspout',
  'plumbing','pipe','pipes','faucet','drain','clog','sewer','water','heater','leak','leaking','flood','flooded','sewage','burst','toilet','running',
  'hvac','heating','cooling','furnace','ac','air','conditioner','thermostat','duct','ducts',
  'electrical','electrician','breaker','panel','panels','wiring','outlet','outlets','ev','charger','light','switch','switches',
  'garage','door','opener','spring','springs',
  'bath','bathroom','shower','tub','tile','vanity','tiles',
  'lock','key','keys','deadbolt','ignition','locked',
  'kitchen','cabinet','cabinets','counter','counters','backsplash','sink',
  'landscape','landscaping','tree','trees','lawn','garden','yard','shrub','shrubs','mulch',
  'cleaning','carpet','upholstery','chimney','dryer','vent','pressure','wash','maid',
  'appliance','appliances','dishwasher','refrigerator','fridge','oven','stove','microwave','washer','ice','maker',
  'move','moving','pack','transport','relocation','movers',
  'paint','painting','floor','flooring','hardwood','laminate','vinyl','wall','walls','color',
  'foundation','concrete','driveway','crack','settling',
  'dumpster','dumpsters','junk','debris','rolloff','roll-off','waste','trash','container','haul',
  'final','expense','life','insurance','funeral','burial','cremation','death','benefit','beneficiary','quote','quotes',
  'handyman','odd','job','jobs','small','repair','repairs','hang','tv','furniture','assembly','minor','general','around','house','home',
  'portable','toilet','porta','potty','restroom','event',
  'siding','cladding','soffit','fascia',
  'mold','mildew','pest','pests','rodent','rodents','rats','mice','mouse','ants','roaches','cockroach','cockroaches','termites','termite','bedbugs','bed','bugs','wasps','spiders','exterminator','infestation'
]);

function classifyByKeywords(text) {
  const t = text.toLowerCase();
  // Strong, specific overrides: a leaking/broken roof or gutter is that trade,
  // not "water damage" or mold cleanup, even if water is coming in.
  if (/\broof|\bshingle/.test(t)) return 'Roofing';
  if (/\bgutter|\bdownspout/.test(t)) return 'Gutter Services';
  // Pick the category with the most keyword hits for a better guess.
  let best = null, bestCount = 0;
  for (const [name, kws] of SERVICES) {
    let c = 0;
    for (const k of kws) if (t.includes(k)) c++;
    if (c > bestCount) { bestCount = c; best = name; }
  }
  return bestCount > 0 ? best : null;
}

// ---------------------------------------------------------------------------
// Lead storage
// ---------------------------------------------------------------------------
function loadLeads() {
  try { return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8') || '[]'); }
  catch { return []; }
}

function saveLead(lead) {
  const leads = loadLeads();
  leads.push({ ...lead, capturedAt: new Date().toISOString() });
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// ---------------------------------------------------------------------------
// Proaxis — universal RTB auction (call-buying network, one campaign per vertical)
// ---------------------------------------------------------------------------
// Proaxis requires the caller's real number in E.164 (+1XXXXXXXXXX).
function toE164(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length === 10) return '+1' + d;
  if (d.length === 11 && d.startsWith('1')) return '+' + d;
  return String(raw || '').trim().startsWith('+') ? String(raw).trim() : '';
}

// Derive a US state from a ZIP code. First 3 digits map to a state; falls
// back to the first digit when the prefix is unknown. Returns '' if no match.
const ZIP_STATE = {
  // 0xx
  '004': 'NY', '005': 'NY', '006': 'PR', '007': 'PR', '008': 'VI', '009': 'PR',
  '010': 'MA', '011': 'MA', '012': 'MA', '013': 'MA', '014': 'MA', '015': 'MA', '016': 'MA', '017': 'MA', '018': 'MA', '019': 'MA',
  '020': 'MA', '021': 'MA', '022': 'MA', '023': 'MA', '024': 'MA', '025': 'MA', '026': 'MA', '027': 'MA',
  '028': 'RI', '029': 'RI',
  '030': 'NH', '031': 'NH', '032': 'NH', '033': 'NH', '034': 'NH', '035': 'NH', '036': 'NH', '037': 'NH', '038': 'NH',
  '039': 'ME',
  '040': 'ME', '041': 'ME', '042': 'ME', '043': 'ME', '044': 'ME', '045': 'ME', '046': 'ME', '047': 'ME', '048': 'ME', '049': 'ME',
  '050': 'VT', '051': 'VT', '052': 'VT', '053': 'VT', '054': 'VT', '055': 'VT', '056': 'VT', '057': 'VT', '058': 'VT', '059': 'VT',
  '060': 'CT', '061': 'CT', '062': 'CT', '063': 'CT', '064': 'CT', '065': 'CT', '066': 'CT', '067': 'CT', '068': 'CT', '069': 'CT',
  '070': 'NJ', '071': 'NJ', '072': 'NJ', '073': 'NJ', '074': 'NJ', '075': 'NJ', '076': 'NJ', '077': 'NJ', '078': 'NJ', '079': 'NJ',
  '080': 'NJ', '081': 'NJ', '082': 'NJ', '083': 'NJ', '084': 'NJ', '085': 'NJ', '086': 'NJ', '087': 'NJ', '088': 'NJ', '089': 'NJ',
  // 1xx
  '100': 'NY', '101': 'NY', '102': 'NY', '103': 'NY', '104': 'NY', '105': 'NY', '106': 'NY', '107': 'NY', '108': 'NY', '109': 'NY',
  '110': 'NY', '111': 'NY', '112': 'NY', '113': 'NY', '114': 'NY', '115': 'NY', '116': 'NY', '117': 'NY', '118': 'NY', '119': 'NY',
  '120': 'NY', '121': 'NY', '122': 'NY', '123': 'NY', '124': 'NY', '125': 'NY', '126': 'NY', '127': 'NY', '128': 'NY', '129': 'NY',
  '130': 'NY', '131': 'NY', '132': 'NY', '133': 'NY', '134': 'NY', '135': 'NY', '136': 'NY', '137': 'NY', '138': 'NY', '139': 'NY',
  '140': 'NY', '141': 'NY', '142': 'NY', '143': 'NY', '144': 'NY', '145': 'NY', '146': 'NY', '147': 'NY', '148': 'NY', '149': 'NY',
  '150': 'PA', '151': 'PA', '152': 'PA', '153': 'PA', '154': 'PA', '155': 'PA', '156': 'PA', '157': 'PA', '158': 'PA', '159': 'PA',
  '160': 'PA', '161': 'PA', '162': 'PA', '163': 'PA', '164': 'PA', '165': 'PA', '166': 'PA', '167': 'PA', '168': 'PA', '169': 'PA',
  '170': 'PA', '171': 'PA', '172': 'PA', '173': 'PA', '174': 'PA', '175': 'PA', '176': 'PA', '177': 'PA', '178': 'PA', '179': 'PA',
  '180': 'PA', '181': 'PA', '182': 'PA', '183': 'PA', '184': 'PA', '185': 'PA', '186': 'PA', '187': 'PA', '188': 'PA', '189': 'PA',
  '190': 'PA', '191': 'PA', '192': 'PA', '193': 'PA', '194': 'PA', '195': 'PA', '196': 'PA', '197': 'DE', '198': 'DE', '199': 'DE',
  // 2xx
  '200': 'DC', '201': 'DC', '202': 'DC', '203': 'DC', '204': 'DC', '205': 'DC', '206': 'DC', '207': 'DC', '208': 'DC', '209': 'DC',
  '210': 'MD', '211': 'MD', '212': 'MD', '213': 'MD', '214': 'MD', '215': 'MD', '216': 'MD', '217': 'MD', '218': 'MD', '219': 'MD',
  '220': 'VA', '221': 'VA', '222': 'VA', '223': 'VA', '224': 'VA', '225': 'VA', '226': 'VA', '227': 'VA', '228': 'VA', '229': 'VA',
  '230': 'VA', '231': 'VA', '232': 'VA', '233': 'VA', '234': 'VA', '235': 'VA', '236': 'VA', '237': 'VA', '238': 'VA', '239': 'VA',
  '240': 'VA', '241': 'VA', '242': 'VA', '243': 'VA', '244': 'VA', '245': 'VA', '246': 'VA', '247': 'WV', '248': 'WV', '249': 'WV',
  '250': 'WV', '251': 'WV', '252': 'WV', '253': 'WV', '254': 'WV', '255': 'WV', '256': 'WV', '257': 'WV', '258': 'WV', '259': 'WV',
  '260': 'WV', '261': 'WV', '262': 'WV', '263': 'WV', '264': 'WV', '265': 'WV', '266': 'WV', '267': 'WV', '268': 'WV', '269': 'WV',
  '270': 'NC', '271': 'NC', '272': 'NC', '273': 'NC', '274': 'NC', '275': 'NC', '276': 'NC', '277': 'NC', '278': 'NC', '279': 'NC',
  '280': 'NC', '281': 'NC', '282': 'NC', '283': 'NC', '284': 'NC', '285': 'NC', '286': 'NC', '287': 'NC', '288': 'NC', '289': 'NC',
  '290': 'SC', '291': 'SC', '292': 'SC', '293': 'SC', '294': 'SC', '295': 'SC', '296': 'SC', '297': 'SC', '298': 'SC', '299': 'SC',
  // 3xx
  '300': 'GA', '301': 'GA', '302': 'GA', '303': 'GA', '304': 'GA', '305': 'GA', '306': 'GA', '307': 'GA', '308': 'GA', '309': 'GA',
  '310': 'GA', '311': 'GA', '312': 'GA', '313': 'GA', '314': 'GA', '315': 'GA', '316': 'GA', '317': 'GA', '318': 'GA', '319': 'GA',
  '320': 'FL', '321': 'FL', '322': 'FL', '323': 'FL', '324': 'FL', '325': 'FL', '326': 'FL', '327': 'FL', '328': 'FL', '329': 'FL',
  '330': 'FL', '331': 'FL', '332': 'FL', '333': 'FL', '334': 'FL', '335': 'FL', '336': 'FL', '337': 'FL', '338': 'FL', '339': 'FL',
  '340': 'FL', '341': 'FL', '342': 'FL', '343': 'FL', '344': 'FL', '345': 'FL', '346': 'FL', '347': 'FL', '348': 'FL', '349': 'FL',
  '350': 'AL', '351': 'AL', '352': 'AL', '353': 'AL', '354': 'AL', '355': 'AL', '356': 'AL', '357': 'AL', '358': 'AL', '359': 'AL',
  '360': 'AL', '361': 'AL', '362': 'AL', '363': 'AL', '364': 'AL', '365': 'AL', '366': 'AL', '367': 'AL', '368': 'AL', '369': 'AL',
  '370': 'TN', '371': 'TN', '372': 'TN', '373': 'TN', '374': 'TN', '375': 'TN', '376': 'TN', '377': 'TN', '378': 'TN', '379': 'TN',
  '380': 'TN', '381': 'TN', '382': 'TN', '383': 'TN', '384': 'TN', '385': 'TN', '386': 'MS', '387': 'MS', '388': 'MS', '389': 'MS',
  '390': 'MS', '391': 'MS', '392': 'MS', '393': 'MS', '394': 'MS', '395': 'MS', '396': 'MS', '397': 'MS', '398': 'MS', '399': 'MS',
  // 4xx
  '400': 'KY', '401': 'KY', '402': 'KY', '403': 'KY', '404': 'KY', '405': 'KY', '406': 'KY', '407': 'KY', '408': 'KY', '409': 'KY',
  '410': 'KY', '411': 'KY', '412': 'KY', '413': 'KY', '414': 'KY', '415': 'KY', '416': 'KY', '417': 'KY', '418': 'KY', '419': 'KY',
  '420': 'KY', '421': 'KY', '422': 'KY', '423': 'KY', '424': 'KY', '425': 'KY', '426': 'KY', '427': 'KY', '428': 'KY', '429': 'KY',
  '430': 'OH', '431': 'OH', '432': 'OH', '433': 'OH', '434': 'OH', '435': 'OH', '436': 'OH', '437': 'OH', '438': 'OH', '439': 'OH',
  '440': 'OH', '441': 'OH', '442': 'OH', '443': 'OH', '444': 'OH', '445': 'OH', '446': 'OH', '447': 'OH', '448': 'OH', '449': 'OH',
  '450': 'OH', '451': 'OH', '452': 'OH', '453': 'OH', '454': 'OH', '455': 'OH', '456': 'OH', '457': 'OH', '458': 'OH', '459': 'OH',
  '460': 'IN', '461': 'IN', '462': 'IN', '463': 'IN', '464': 'IN', '465': 'IN', '466': 'IN', '467': 'IN', '468': 'IN', '469': 'IN',
  '470': 'IN', '471': 'IN', '472': 'IN', '473': 'IN', '474': 'IN', '475': 'IN', '476': 'IN', '477': 'IN', '478': 'IN', '479': 'IN',
  '480': 'MI', '481': 'MI', '482': 'MI', '483': 'MI', '484': 'MI', '485': 'MI', '486': 'MI', '487': 'MI', '488': 'MI', '489': 'MI',
  '490': 'MI', '491': 'MI', '492': 'MI', '493': 'MI', '494': 'MI', '495': 'MI', '496': 'MI', '497': 'MI', '498': 'MI', '499': 'MI',
  // 5xx
  '500': 'IA', '501': 'IA', '502': 'IA', '503': 'IA', '504': 'IA', '505': 'IA', '506': 'IA', '507': 'IA', '508': 'IA', '509': 'IA',
  '510': 'IA', '511': 'IA', '512': 'IA', '513': 'IA', '514': 'IA', '515': 'IA', '516': 'IA', '517': 'IA', '518': 'IA', '519': 'IA',
  '520': 'IA', '521': 'IA', '522': 'IA', '523': 'IA', '524': 'IA', '525': 'IA', '526': 'IA', '527': 'IA', '528': 'IA', '529': 'IA',
  '530': 'WI', '531': 'WI', '532': 'WI', '533': 'WI', '534': 'WI', '535': 'WI', '536': 'WI', '537': 'WI', '538': 'WI', '539': 'WI',
  '540': 'WI', '541': 'WI', '542': 'WI', '543': 'WI', '544': 'WI', '545': 'WI', '546': 'WI', '547': 'WI', '548': 'WI', '549': 'WI',
  '550': 'MN', '551': 'MN', '552': 'MN', '553': 'MN', '554': 'MN', '555': 'MN', '556': 'MN', '557': 'MN', '558': 'MN', '559': 'MN',
  '560': 'MN', '561': 'MN', '562': 'MN', '563': 'MN', '564': 'MN', '565': 'MN', '566': 'MN', '567': 'MN', '568': 'MN', '569': 'MN',
  '570': 'SD', '571': 'SD', '572': 'SD', '573': 'SD', '574': 'SD', '575': 'SD', '576': 'SD', '577': 'SD', '578': 'SD', '579': 'SD',
  '580': 'ND', '581': 'ND', '582': 'ND', '583': 'ND', '584': 'ND', '585': 'ND', '586': 'ND', '587': 'ND', '588': 'ND', '589': 'ND',
  '590': 'MT', '591': 'MT', '592': 'MT', '593': 'MT', '594': 'MT', '595': 'MT', '596': 'MT', '597': 'MT', '598': 'MT', '599': 'MT',
  // 6xx
  '600': 'IL', '601': 'IL', '602': 'IL', '603': 'IL', '604': 'IL', '605': 'IL', '606': 'IL', '607': 'IL', '608': 'IL', '609': 'IL',
  '610': 'IL', '611': 'IL', '612': 'IL', '613': 'IL', '614': 'IL', '615': 'IL', '616': 'IL', '617': 'IL', '618': 'IL', '619': 'IL',
  '620': 'IL', '621': 'IL', '622': 'IL', '623': 'IL', '624': 'IL', '625': 'IL', '626': 'IL', '627': 'IL', '628': 'IL', '629': 'IL',
  '630': 'MO', '631': 'MO', '632': 'MO', '633': 'MO', '634': 'MO', '635': 'MO', '636': 'MO', '637': 'MO', '638': 'MO', '639': 'MO',
  '640': 'MO', '641': 'MO', '642': 'MO', '643': 'MO', '644': 'MO', '645': 'MO', '646': 'MO', '647': 'MO', '648': 'MO', '649': 'MO',
  '650': 'MO', '651': 'MO', '652': 'MO', '653': 'MO', '654': 'MO', '655': 'MO', '656': 'MO', '657': 'MO', '658': 'MO', '659': 'MO',
  '660': 'KS', '661': 'KS', '662': 'KS', '663': 'KS', '664': 'KS', '665': 'KS', '666': 'KS', '667': 'KS', '668': 'KS', '669': 'KS',
  '670': 'KS', '671': 'KS', '672': 'KS', '673': 'KS', '674': 'KS', '675': 'KS', '676': 'KS', '677': 'KS', '678': 'KS', '679': 'KS',
  '680': 'NE', '681': 'NE', '682': 'NE', '683': 'NE', '684': 'NE', '685': 'NE', '686': 'NE', '687': 'NE', '688': 'NE', '689': 'NE',
  '690': 'NE', '691': 'NE', '692': 'NE', '693': 'NE', '694': 'NE', '695': 'NE', '696': 'NE', '697': 'NE', '698': 'NE', '699': 'NE',
  // 7xx
  '700': 'LA', '701': 'LA', '702': 'LA', '703': 'LA', '704': 'LA', '705': 'LA', '706': 'LA', '707': 'LA', '708': 'LA', '709': 'LA',
  '710': 'LA', '711': 'LA', '712': 'LA', '713': 'LA', '714': 'LA', '715': 'LA', '716': 'LA', '717': 'LA', '718': 'LA', '719': 'LA',
  '720': 'AR', '721': 'AR', '722': 'AR', '723': 'AR', '724': 'AR', '725': 'AR', '726': 'AR', '727': 'AR', '728': 'AR', '729': 'AR',
  '730': 'OK', '731': 'OK', '732': 'OK', '733': 'OK', '734': 'OK', '735': 'OK', '736': 'OK', '737': 'OK', '738': 'OK', '739': 'OK',
  '740': 'OK', '741': 'OK', '742': 'OK', '743': 'OK', '744': 'OK', '745': 'OK', '746': 'OK', '747': 'OK', '748': 'OK', '749': 'OK',
  '750': 'TX', '751': 'TX', '752': 'TX', '753': 'TX', '754': 'TX', '755': 'TX', '756': 'TX', '757': 'TX', '758': 'TX', '759': 'TX',
  '760': 'TX', '761': 'TX', '762': 'TX', '763': 'TX', '764': 'TX', '765': 'TX', '766': 'TX', '767': 'TX', '768': 'TX', '769': 'TX',
  '770': 'TX', '771': 'TX', '772': 'TX', '773': 'TX', '774': 'TX', '775': 'TX', '776': 'TX', '777': 'TX', '778': 'TX', '779': 'TX',
  '780': 'TX', '781': 'TX', '782': 'TX', '783': 'TX', '784': 'TX', '785': 'TX', '786': 'TX', '787': 'TX', '788': 'TX', '789': 'TX',
  '790': 'TX', '791': 'TX', '792': 'TX', '793': 'TX', '794': 'TX', '795': 'TX', '796': 'TX', '797': 'TX', '798': 'TX', '799': 'TX',
  // 8xx
  '800': 'CO', '801': 'CO', '802': 'CO', '803': 'CO', '804': 'CO', '805': 'CO', '806': 'CO', '807': 'CO', '808': 'CO', '809': 'CO',
  '810': 'CO', '811': 'CO', '812': 'CO', '813': 'CO', '814': 'CO', '815': 'CO', '816': 'CO', '817': 'CO', '818': 'CO', '819': 'CO',
  '820': 'WY', '821': 'WY', '822': 'WY', '823': 'WY', '824': 'WY', '825': 'WY', '826': 'WY', '827': 'WY', '828': 'WY', '829': 'WY',
  '830': 'WY', '831': 'WY', '832': 'ID', '833': 'ID', '834': 'ID', '835': 'ID', '836': 'ID', '837': 'ID', '838': 'ID', '839': 'ID',
  '840': 'UT', '841': 'UT', '842': 'UT', '843': 'UT', '844': 'UT', '845': 'UT', '846': 'UT', '847': 'UT', '848': 'UT', '849': 'UT',
  '850': 'AZ', '851': 'AZ', '852': 'AZ', '853': 'AZ', '854': 'AZ', '855': 'AZ', '856': 'AZ', '857': 'AZ', '858': 'AZ', '859': 'AZ',
  '860': 'AZ', '861': 'AZ', '862': 'AZ', '863': 'AZ', '864': 'AZ', '865': 'AZ', '866': 'AZ', '867': 'AZ', '868': 'AZ', '869': 'AZ',
  '870': 'NM', '871': 'NM', '872': 'NM', '873': 'NM', '874': 'NM', '875': 'NM', '876': 'NM', '877': 'NM', '878': 'NM', '879': 'NM',
  '880': 'NM', '881': 'NM', '882': 'NM', '883': 'NM', '884': 'NM', '885': 'NM', '886': 'NM', '887': 'NM', '888': 'NM', '889': 'NM',
  '890': 'NV', '891': 'NV', '892': 'NV', '893': 'NV', '894': 'NV', '895': 'NV', '896': 'NV', '897': 'NV', '898': 'NV', '899': 'NV',
  // 9xx
  '900': 'CA', '901': 'CA', '902': 'CA', '903': 'CA', '904': 'CA', '905': 'CA', '906': 'CA', '907': 'CA', '908': 'CA', '909': 'CA',
  '910': 'CA', '911': 'CA', '912': 'CA', '913': 'CA', '914': 'CA', '915': 'CA', '916': 'CA', '917': 'CA', '918': 'CA', '919': 'CA',
  '920': 'CA', '921': 'CA', '922': 'CA', '923': 'CA', '924': 'CA', '925': 'CA', '926': 'CA', '927': 'CA', '928': 'CA', '929': 'CA',
  '930': 'CA', '931': 'CA', '932': 'CA', '933': 'CA', '934': 'CA', '935': 'CA', '936': 'CA', '937': 'CA', '938': 'CA', '939': 'CA',
  '940': 'CA', '941': 'CA', '942': 'CA', '943': 'CA', '944': 'CA', '945': 'CA', '946': 'CA', '947': 'CA', '948': 'CA', '949': 'CA',
  '950': 'CA', '951': 'CA', '952': 'CA', '953': 'CA', '954': 'CA', '955': 'CA', '956': 'CA', '957': 'CA', '958': 'CA', '959': 'CA',
  '960': 'CA', '961': 'CA', '962': 'CA', '963': 'CA', '964': 'CA', '965': 'CA', '966': 'CA', '967': 'HI', '968': 'HI', '969': 'HI',
  '970': 'OR', '971': 'OR', '972': 'OR', '973': 'OR', '974': 'OR', '975': 'OR', '976': 'OR', '977': 'OR', '978': 'OR', '979': 'OR',
  '980': 'WA', '981': 'WA', '982': 'WA', '983': 'WA', '984': 'WA', '985': 'WA', '986': 'WA', '987': 'WA', '988': 'WA', '989': 'WA',
  '990': 'WA', '991': 'WA', '992': 'WA', '993': 'WA', '994': 'WA', '995': 'AK', '996': 'AK', '997': 'AK', '998': 'AK', '999': 'AK',
};
function stateFromZip(zip) {
  const d = String(zip || '').replace(/\D/g, '');
  if (d.length < 3) return '';
  const p3 = d.slice(0, 3);
  if (ZIP_STATE[p3]) return ZIP_STATE[p3];
  const p1 = d[0];
  const byFirst = { '0': 'PR', '1': 'NY', '2': 'DC', '3': 'GA', '4': 'MI', '5': 'IA', '6': 'IL', '7': 'TX', '8': 'CO', '9': 'CA' };
  return byFirst[p1] || '';
}

// Which Proaxis campaign each matched service is bid into. Services not listed
// here have no buyer configured — the lead is still saved locally.
const PROAXIS_VERTICALS = {
  'Roofing':                  { vertical: 'roofing',          campaignKey: 'roofing' },
  'Gutter Services':          { vertical: 'gutter',           campaignKey: 'gutter' },
  'Plumbing':                 { vertical: 'plumbing',         campaignKey: 'plumbing' },
  'Water Damage Restoration': { vertical: 'plumbing',         campaignKey: 'plumbing' },
  'HVAC Installation':        { vertical: 'hvac',             campaignKey: 'hvac' },
  'Window Installation':      { vertical: 'windows',          campaignKey: 'windows' },
  'Appliance Repair':         { vertical: 'appliance_repair', campaignKey: 'appliance_repair' },
  'Dumpster Rental':          { vertical: 'dumpster',          campaignKey: 'dumpster' },
  'Electrical & Panels':      { vertical: 'electrical',        campaignKey: 'electrical' },
  'Final Expense':            { vertical: 'final_expense',     campaignKey: 'final_expense' },
  'Garage Door Repair':       { vertical: 'garage_door',       campaignKey: 'garage_door' },
  'Handyman':                 { vertical: 'handyman',           campaignKey: 'handyman' },
  'Locksmith':                { vertical: 'locksmith',          campaignKey: 'locksmith' },
  'Siding':                   { vertical: 'siding',             campaignKey: 'siding' },
  'Portable Toilet':          { vertical: 'portable_toilet',    campaignKey: 'portable_toilet' },
  'Pest Control':             { vertical: 'pest_control',       campaignKey: 'pest_control' },
};

async function postToProaxis(lead) {
  // Route the lead to the Proaxis campaign for its service (if one exists).
  const v = PROAXIS_VERTICALS[lead.service];
  if (!v) {
    return { ok: false, reason: 'no_buyer_for_service' };
  }
  const campaignId = CFG.proaxisCampaigns[v.campaignKey];
  if (!CFG.proaxisKey || !CFG.proaxisSecret || !campaignId) {
    return { ok: false, reason: 'not_configured' };
  }

  const payload = {
    campaignId,
    zip: (lead.zipCode || '').trim(),
    state: (lead.state || '').toUpperCase().slice(0, 2),
    callerPhone: toE164(lead.phone),
    vertical: v.vertical,
    firstName: lead.firstName || '',
    lastName: lead.lastName || '',
  };

  // Proaxis requires campaignId, zip, state and callerPhone — don't send a
  // half-empty lead.
  if (!payload.zip || !payload.state || !payload.callerPhone) {
    return { ok: false, reason: 'incomplete_lead' };
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Vendor-API-Key': CFG.proaxisKey,
    'X-Vendor-API-Secret': CFG.proaxisSecret,
  };

  const res = await fetch(CFG.proaxisEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const raw = await res.text().catch(() => '');
  let json = null;
  try { json = JSON.parse(raw); } catch {}

  // Send back Proaxis's decision so the calling system can bridge, if accepted.
  return {
    ok: res.ok,
    status: res.status,
    body: json || raw.slice(0, 500),
    vertical: v.vertical,
    accepted: !!(json && json.accepted),
    bid: (json && json.bid) || null,
    bridgePhone: (json && json.phoneNumber) || null,
    pingToken: (json && json.pingToken) || null,
  };
}

// ---------------------------------------------------------------------------
// Lead Router — pre-call data write. Called when a chat lead is captured so
// that if the visitor dials our tracking number, the Lead Router can attach
// the service/landing context to that call (only the caller's number + tags
// are sent; never the API key).
// ---------------------------------------------------------------------------
async function postCallData(rec) {
  // Need a caller phone to match on, and the Lead Router key to authenticate.
  if (!CFG.leadrouterKey || !rec.phone) {
    return { ok: false, reason: 'missing_key_or_phone' };
  }
  const callerNumber = toE164(rec.phone);
  if (!callerNumber) {
    return { ok: false, reason: 'no_e164_phone' };
  }
  const payload = {
    callerNumber,
    source: 'fixit-ai-chat',
    tags: { service: rec.service || '', vertical: rec.service || '', src: 'fixit-ai' },
  };
  try {
    const res = await fetch(CFG.leadrouterEndpoint + '/api/v1/call-data/write', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + CFG.leadrouterKey,
      },
      body: JSON.stringify(payload),
    });
    if (res.status === 200 || res.status === 201) {
      return { ok: true };
    }
    return { ok: false, status: res.status, reason: (await res.text().catch(() => '')).slice(0, 200) };
  } catch (e) {
    return { ok: false, reason: 'network' };
  }
}

// ---------------------------------------------------------------------------
// AI call (OpenAI-compatible), built for Mercury 3
// ---------------------------------------------------------------------------
const SERVICE_PHONE_TABLE = Object.entries(SERVICE_PHONES)
  .map(([name, p]) => `- ${name}: ${p.display}`)
  .join('\n');

const SYSTEM_PROMPT = `
You are the friendly front-desk assistant for ${BUSINESS.name}, a home-services company.
A homeowner has messaged you. Your job: run a short qualification chat, then connect them
with the right service. Services you cover:
${SERVICES.map(s => '- ' + s[0]).join('\n')}

Service phone numbers (use the correct one for the matched service):
${SERVICE_PHONE_TABLE}

QUALIFICATION FLOW (in order — exactly one question per reply):
1. Understand the issue first. Ask what's going on; if the first answer is thin, ask ONE
   follow-up (which room / what happened / how urgent).
2. Ask for their FIRST NAME, then use it in every later reply.
3. Ask for their ZIP CODE (5 digits).
4. Ask for their best PHONE NUMBER to reach them (required — do not accept email instead).

Before you have all four pieces (issue, first name, ZIP, phone):
- Do NOT mention any phone number — not ours, not a contractor's.
- Do NOT say a team member will call, and do not offer to connect them.
- Just acknowledge the answer and ask the next question. Keep each reply short and warm.

ONLY AFTER all four pieces are in hand:
- Give a one-line summary to confirm ("Got it, John — leaking water heater in 90210, and
  the team can reach you at the number you provided").
- Then tell them which ${BUSINESS.name} service it is, ask them to call right away — a
  technician is standing by — and say the number to call is shown in the call card on the
  page. Do NOT spell out or type any phone number yourself — the card provides it.

Other rules:
- Pick the RIGHT service. A leaking roof, missing shingles, or roof damage is **Roofing** (not Water Damage Restoration), even if water is coming inside. Clogged/broken gutters are **Gutter Services**. **Water Damage Restoration** is for flooding, burst pipes, sewage, or mold/water cleanup inside the home (not a roof/gutter issue). A water heater or pipe leak is **Plumbing**. Mold/mildew growth or mold cleanup is **Mold Removal**. Pests, rodents, or insects are **Pest Control**. When in doubt, match the thing that needs to be repaired.
- Do NOT ask for information the visitor has already provided. If they gave their name, ZIP, or phone/email at any point (even a short answer like just "Dave"), record it in "lead" and move to the next missing piece — never ask for it again.
- If the visitor volunteers several answers at once, you may skip ahead — but still confirm
  each piece and still show the summary before revealing the number.
- One question at a time. Do not list all services.
- NEVER treat the answer to a question about the problem as the visitor's name
  (e.g. "roof", "basement", "kitchen"). A name is only a real person's first name,
  given in answer to "what's your first name?" or phrased like "my name is ...".
- NEVER invent pricing, appointments, or credit-card details. You do not schedule.

FORMAT (strict): End your reply with a single line starting with @@JSON@@ followed by one
JSON object with exactly these keys:
{"reply":"what you say to the visitor","service":"matched service name or null","lead":{"firstName":"...","lastName":"...","phone":"...","zipCode":"...","state":"...","email":"..."},"complete":true_or_false}
- "lead" should contain only fields the visitor has actually provided (others empty strings).
- "complete" is true ONLY when you have a matched service AND first name AND ZIP code AND a
  phone number, AND your reply in this turn contains the confirming summary.
- Put ALL your visible text in "reply". Nothing else before the @@JSON@@ line.
`;

function extractJson(content) {
  let idx = content.indexOf('@@JSON@@');
  if (idx >= 0) {
    content = content.slice(idx + '@@JSON@@'.length);
  }
  // Strip markdown fences if present.
  content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try { return JSON.parse(content.slice(start, end + 1)); }
  catch {
    // The footer might be the last {...} block even if reply text contains braces.
    const s2 = content.lastIndexOf('{');
    if (s2 > start) {
      try { return JSON.parse(content.slice(s2, end + 1)); } catch { return null; }
    }
    return null;
  }
}

async function callLlm(messages) {
  if (!CFG.llmKey) return null;
  const res = await fetch(CFG.llmBase + '/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + CFG.llmKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CFG.llmModel,
      temperature: 0.4,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    console.log(`[ai] HTTP ${res.status} from model provider`);
    if (res.status === 401 || res.status === 403) {
      console.log('[ai] Model request unauthorized — check LLM_API_KEY / endpoint.');
    } else if (t) { console.log('[ai] body:', t.slice(0, 300)); }
    return null;
  }
  const j = await res.json().catch(() => null);
  const content = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  return typeof content === 'string' ? content : null;
}

// ---------------------------------------------------------------------------
// Chat engine
// ---------------------------------------------------------------------------
async function handleChat(messages) {
  const text = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
  let callNow = null; // { phone, bid } when Proaxis accepts a roofing lead

  // Try the real AI first (with one retry — the model occasionally skips its
  // JSON footer on short first turns).
  let parsed = null;
  let lastContent = null;
  if (CFG.llmKey) {
    let content = await callLlm(messages);
    lastContent = content;
    if (content) parsed = extractJson(content);
    if (!parsed) {
      content = await callLlm(messages);
      lastContent = content || lastContent;
      if (content) parsed = extractJson(content);
    }
    if (!parsed && lastContent) {
      // Model replied but its output was unusable — keep a short trace.
      console.log('[ai] unparsed reply head:', String(lastContent).replace(/\s+/g, ' ').slice(0, 220));
    }
  }

  // Extract contact details from everything the visitor has said so far. Used to
  // enrich the AI's JSON (it sometimes omits fields) and to drive the fallback.
  const allUserText = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
  const lastUserText = (messages.filter(m => m.role === 'user').slice(-1)[0] || {}).content || '';
  function matchIn(text, patterns) {
    for (const re of patterns) { const m = text.match(re); if (m && m[1]) return m[1].trim(); }
    return '';
  }
  let exFirstName = matchIn(allUserText, [/(?:my name is|my name'?s|i am|i'?m|this is|call me|it'?s)\s+([A-Za-z][A-Za-z'-]{1,20})/i]);
  if (!exFirstName) {
    // Accept a bare-name reply (e.g. user answered "Igor" when asked). Scan
    // newest-to-oldest so a later correction wins.
    const userMsgs = messages.filter(m => m.role === 'user').map(m => m.content || '');
    for (let i = userMsgs.length - 1; i >= 0 && !exFirstName; i--) {
      const trimmed = userMsgs[i].trim().replace(/[.!?,]+$/g, '');
      if (/^[A-Za-z][A-Za-z'-]{1,20}(?:\s+[A-Za-z][A-Za-z'-]{1,20})?$/.test(trimmed) && !/\b(my|roof|leak|water|ac|heat|door|help|need|hi|hello|hey|yes|no|ok|okay|sure|thanks|thank|pipe|flood|broken|window|gutter|fix|repair|install|replace)\b/i.test(trimmed)) {
        exFirstName = trimmed.split(/\s+/)[0];
      }
    }
  }
  const exZipCode = matchIn(allUserText, [/\b(\d{5})\b/]);
  const exPhone = matchIn(allUserText, [/(\+?1?[\s.\-]?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/]);
  const exEmail = matchIn(allUserText, [/([\w.+-]+@[\w-]+\.[\w.-]+)/]);
  // State extraction: only accept a 2-letter token as a state when it appears
  // right next to the ZIP (e.g. "80201 CO" or "CO 80201"). This avoids false
  // positives from common words like "hi", "in", "or", "me".
  const STATE_SET = new Set(['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']);
  let exState = '';
  if (exZipCode) {
    const zi = allUserText.indexOf(exZipCode);
    const around = allUserText.slice(Math.max(0, zi - 4), zi + 5 + 4);
    const m = around.match(/\b([A-Za-z]{2})\b/);
    if (m && STATE_SET.has(m[1].toUpperCase())) exState = m[1].toUpperCase();
  }
  // If no ZIP-adjacent state, derive it from the ZIP.
  if (!exState) exState = stateFromZip(exZipCode);

  if (parsed) {
    const lead = parsed.lead || {};
    // Safety net: fill in anything the model heard but forgot to put in JSON.
    lead.firstName = lead.firstName || exFirstName;
    lead.zipCode = lead.zipCode || exZipCode;
    lead.phone = lead.phone || exPhone;
    lead.email = lead.email || exEmail;
    lead.state = lead.state || exState;

    // Safety net: never accept a service word / object keyword as a person's
    // name. If the model mistook an answer like "roof" for the first name, drop
    // it and ask for the name properly instead of jumping ahead to ZIP/phone.
    let badName = false;
    if (lead.firstName) {
      const fn = String(lead.firstName).trim().toLowerCase();
      if (fn.length < 2 || NOT_A_NAME.has(fn)) { lead.firstName = ''; badName = true; }
    }

    const service = typeof parsed.service === 'string' && parsed.service ? parsed.service : null;
    const complete = !!parsed.complete;

    if (badName) {
      const svc = service ? ` — that sounds like our ${service} team` : '';
      return { reply: `Thanks for telling me about that${svc}. What's your first name, so I know who I'm helping?`, service: null, complete: false };
    }

    // Qualification gate: the assistant must have gathered (issue, first name, ZIP,
    // phone) over at least 3 exchanges before we capture a lead, run the auction,
    // or show any number to call. Phone is required for every service.
    const userTurns = messages.filter(m => m.role === 'user').length;
    const contactComplete = !!(lead.firstName && lead.zipCode && lead.phone);
    const enoughTurns = userTurns >= 3 || (contactComplete && userTurns >= 2);
    const qualified = complete && enoughTurns;

    if (qualified) {
      const rec = {
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        phone: lead.phone || '',
        zipCode: lead.zipCode || '',
        state: (lead.state || '').toUpperCase().slice(0, 2),
        email: lead.email || '',
        service: service || 'Unclassified',
        transcript: messages.filter(m => m.role === 'user').map(m => m.content).join(' | '),
      };
      if (rec.phone) {
        saveLead(rec);
        // Tell the Lead Router about the caller so an inbound call to our
        // tracking number is attributed to this service (best-effort).
        if (rec.phone) {
          const lr = await postCallData(rec);
          if (!lr.ok) {
            console.log('[leadrouter] call-data write skipped/failed reason=', lr.reason, 'status=', lr.status);
          }
        }
        // Run the Proaxis auction for roofing leads (your system uses the result to bridge).
        const r = await postToProaxis(rec);
        if (!r.ok) {
          console.log('[proaxis] auction skipped/failed vertical=', r.vertical, 'reason=', r.reason, 'status=', r.status);
        } else if (!r.accepted) {
          console.log('[proaxis] auction ran, not accepted vertical=', r.vertical, ':', JSON.stringify(r.body).slice(0, 200));
        } else {
          console.log('[proaxis] ACCEPTED vertical=', r.vertical, 'bid=', r.bid);
          const recWithBid = { ...rec, proaxis: { accepted: r.accepted, bid: r.bid, bridgePhone: r.bridgePhone, vertical: r.vertical } };
          // Update the stored lead with Proaxis's decision.
          const leads = loadLeads();
          if (leads.length) {
            leads[leads.length - 1].proaxis = recWithBid.proaxis;
            fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
          }
          // Make the bridge number available to the chat UI so the visitor
          // can tap "Call now" to reach the matched contractor immediately.
          if (r.accepted && r.bridgePhone) {
            callNow = { phone: r.bridgePhone, bid: r.bid };
          }
        }
      }
    }

    const servicePhone = qualified ? getServicePhone(service) : null;
    return { reply: parsed.reply || 'Thanks for your message!', service: qualified ? service : null, complete: qualified, servicePhone };
  }

  // -----------------------------------------------------------------------
  // Fallback qualification (used when there is no AI key, or the model's
  // reply was unusable). Asks the same questions in the same order as the AI
  // and never reveals a phone number until name + issue + ZIP + phone/email
  // are all in hand.
  // -----------------------------------------------------------------------
  const userTurns = messages.filter(m => m.role === 'user').length;
  const service = classifyByKeywords(allUserText);
  const firstName = exFirstName;
  const zipCode = exZipCode;
  const phone = exPhone;
  const email = exEmail;
  const state = exState;

  const need = !firstName ? 'name' : !zipCode ? 'zip' : !phone ? 'phone' : null;
  if (need === 'name') {
    return {
      reply: `Thanks for telling me about that${service ? ` — that sounds like our ${service} team` : ''}. What's your first name, so I know who I'm helping?`,
      service: null, complete: false,
    };
  }
  if (need === 'zip') {
    return {
      reply: `Thanks, ${firstName}. And what's the 5-digit ZIP code where you need the work done?`,
      service: null, complete: false,
    };
  }
  if (need === 'phone') {
    return {
      reply: `Got it. Last thing, ${firstName}: what's the best phone number to reach you on?`,
      service: null, complete: false,
    };
  }

  // Everything is in hand — only now confirm, save the lead, and offer the number.
  const enoughTurns = userTurns >= 3 || (firstName && zipCode && phone && userTurns >= 2);
  if (enoughTurns && phone) {
    const rec = {
      firstName,
      lastName: '',
      phone,
      zipCode,
      state,
      email,
      service: service || 'Unclassified',
      transcript: messages.filter(m => m.role === 'user').map(m => m.content).join(' | '),
    };
    saveLead(rec);
    if (rec.phone) {
      const lr = await postCallData(rec);
      if (!lr.ok) {
        console.log('[leadrouter] call-data write skipped/failed reason=', lr.reason, 'status=', lr.status);
      }
    }
    const r = await postToProaxis(rec);
    let callNow = null;
    if (r.ok && r.accepted && r.bridgePhone) callNow = { phone: r.bridgePhone, bid: r.bid };
    const servicePhone = getServicePhone(rec.service);
    const callText = ' Please call us now — a technician is standing by. The number to call is shown in the call card on the page.';
    return {
      reply: `Thanks, ${firstName || 'there'} — that's a ${rec.service} job in ${zipCode || 'your area'}.${callText}`,
      service: rec.service,
      complete: true,
      servicePhone,
    };
  }
  return {
    reply: `I'm here and ready when you are — tell me a bit more about what's going on at home.`,
    service: null,
    complete: false,
  };
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

// Simple in-memory rate limiter (per-IP) to stop chat abuse.
const RATE_LIMIT = { windowMs: 60 * 1000, max: 60 };
const rateBuckets = new Map();
function rateLimit(ip) {
  const now = Date.now();
  const b = rateBuckets.get(ip) || { count: 0, resetAt: now + RATE_LIMIT.windowMs };
  if (now > b.resetAt) { b.count = 0; b.resetAt = now + RATE_LIMIT.windowMs; }
  b.count++;
  rateBuckets.set(ip, b);
  return b.count <= RATE_LIMIT.max;
}

// Basic security headers applied to every response.
function addSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; connect-src 'self'");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');

    // API: health
    if (url.pathname === '/api/health') {
      addSecurityHeaders(res);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, ai: !!CFG.llmKey, proaxis: Object.values(CFG.proaxisCampaigns).filter(Boolean).length + ' campaigns' }));
      return;
    }

    // API: DNI — return a unique per-visitor tracking number for a service
    if (url.pathname === '/api/dni') {
      const service = (url.searchParams.get('service') || '').trim();
      const visitorId = (url.searchParams.get('visitorId') || '').trim().slice(0, 120);
      const specToken = SERVICE_DNI_SPEC[service];
      if (!specToken) {
        addSecurityHeaders(res);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'no_spec_for_service' }));
        return;
      }
      try {
        const body = JSON.stringify({ specToken, visitorId: visitorId || undefined, url: 'https://fixit.ai/' });
        const lr = await fetch(CFG.leadrouterEndpoint + '/api/public/dni/impressions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
        const txt = await lr.text().catch(() => '');
        let json = null;
        try { json = JSON.parse(txt); } catch {}
        addSecurityHeaders(res);
        res.writeHead(lr.status, { 'Content-Type': 'application/json' });
        if (json && json.data && json.data.number) {
          const num = json.data.number;
          const digits = String(num).replace(/\D/g, '');
          const pretty = digits.length >= 10 ? `(${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}` : num;
          res.end(JSON.stringify({ ok: true, e164: num, display: pretty, impressionId: json.data.impressionId }));
        } else {
          res.end(JSON.stringify({ error: 'dni_failed', detail: txt.slice(0, 200) }));
        }
      } catch (e) {
        addSecurityHeaders(res);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'dni_network' }));
      }
      return;
    }

    // API: chat
    if (url.pathname === '/api/chat' && req.method === 'POST') {
      const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
      if (!rateLimit(ip)) {
        addSecurityHeaders(res);
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Too many requests. Please try again shortly.' }));
        return;
      }
      let body = '';
      req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
      req.on('end', async () => {
        let messages;
        try { messages = JSON.parse(body || '{}').messages || []; }
        catch { messages = []; }
        if (!Array.isArray(messages) || messages.length === 0) {
          addSecurityHeaders(res);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'no messages' }));
          return;
        }
        try {
          const result = await handleChat(messages);
          addSecurityHeaders(res);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (e) {
          console.log('[chat] handler error:', e && e.message);
          addSecurityHeaders(res);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Server error' }));
        }
      });
      return;
    }

    // Static files
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/' || pathname === '') pathname = '/index.html';
    const filePath = path.join(ROOT, path.normalize(pathname).replace(/^([/\\])+/, ''));
    const ext = path.extname(filePath).toLowerCase();
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const data = fs.readFileSync(filePath);
      addSecurityHeaders(res);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
      return;
    }

    addSecurityHeaders(res);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  } catch (e) {
    console.log('[http] error:', e && e.message);
    addSecurityHeaders(res);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log('Top Shield chat server running at http://localhost:' + PORT);
  const campaigns = Object.entries(CFG.proaxisCampaigns).filter(([, id]) => id).map(([k]) => k).join(',');
  console.log('AI model:', CFG.llmModel, '| AI configured:', !!CFG.llmKey, '| Proaxis configured:', !!CFG.proaxisKey && !!CFG.proaxisSecret, '| campaigns:', campaigns);
});
