'use strict';
/**
 * Generates 65 "How to..." SEO guide pages for each vertical (2027).
 * Run: node fixit-ai/generate-guides.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'guides');
const YEAR = 2027;
// Public site URL used for sitemap and canonical links (set for production indexing).
const BASE = (process.env.SITE_BASE_URL || 'https://fixit.ai').replace(/\/+$/, '');

const verticals = [
  {
    slug: 'roofing',
    name: 'Roofing',
    service: 'Roofing',
    intro: 'Your roof is your home’s first line of defense. These 2027 roofing how-to guides help you understand common issues, handle safe basic upkeep, and know when to bring in a licensed roofer.',
    topics: [
      'inspect your roof safely from the ground','spot early signs of roof damage','find a roof leak from inside your attic','temporarily cover a roof leak before help arrives','clean roof gutters to prevent water backup',
      'remove debris from roof valleys','check shingles after a windstorm','identify hail damage on asphalt shingles','replace a single damaged asphalt shingle','reseal a loose roof flashing',
      'check chimney flashing for leaks','inspect roof vents and boots for cracks','clear moss and algae from shingles safely','prevent ice dams on your roof in winter','improve attic ventilation for roof health',
      'check your roof after heavy snow','document roof damage for an insurance claim','choose the right roofing material for your climate','compare asphalt shingles vs metal roofing','understand roof underlayment and why it matters',
      'maintain a flat roof drain system','inspect a low-slope roof for ponding water','check skylight seals for leaks','clean and maintain roof skylights','trim overhanging branches to protect your roof',
      'prepare your roof for hurricane season','prepare your roof for wildfire season','check soffit and fascia for rot','spot signs of a sagging roof structure','understand roof decking and sheathing basics',
      'maintain roof ridge vents','inspect pipe boots around plumbing vents','choose the right roof sealant for small repairs','safely use a roof rake in winter','check for animal damage on your roof',
      'prevent birds and pests from nesting in eaves','inspect drip edge for proper water runoff','plan a roof replacement timeline','budget for roof repair vs replacement','understand roof warranty coverage',
      'hire a qualified roofing contractor','ask the right questions before a roof repair','read a roofing estimate line by line','maintain a tile roof without cracking tiles','check metal roof fasteners for looseness',
      'prevent rust on a metal roof','inspect roof coatings on a flat roof','recoat a flat roof for longer life','check flashing around a satellite mount','seal nail pops on your roof safely',
      'maintain gutters and downspouts with your roof','spot granule loss on aging shingles','extend the lifespan of an asphalt roof','prepare for a professional roof inspection','handle emergency roof tarping safely',
      'check attic insulation impact on your roof','identify ventilation problems causing roof heat','maintain a green or living roof section','inspect solar panel mounts on your roof','clean around roof-mounted solar panels safely',
      'understand local roof permit basics','schedule seasonal roof maintenance','create a yearly roof care checklist','reduce storm damage risk to your roof','decide when a roof leak needs emergency service','inspect a roof after fallen tree debris'
    ]
  },
  {
    slug: 'gutters',
    name: 'Gutters',
    service: 'Gutter Services',
    intro: 'Healthy gutters move water away from your roof, siding, and foundation. These 2027 gutter guides cover cleaning, repairs, upgrades, and knowing when to call a gutter pro.',
    topics: [
      'clean your gutters safely step by step','know how often to clean your gutters','flush downspouts to clear hidden clogs','remove leaves and debris from gutter guards','install basic mesh gutter guards',
      'fix a sagging gutter section','reseal a leaking gutter seam','reattach a loose gutter hanger','patch a small hole in an aluminum gutter','correct gutter slope for proper drainage',
      'extend downspouts away from your foundation','install a downspout splash block','connect a downspout to a drain extension','prevent gutters from overflowing in heavy rain','clear ice from frozen gutters safely',
      'prevent ice dams with better gutter flow','check gutters for rust and corrosion','maintain vinyl gutters through the seasons','maintain aluminum gutters for long life','inspect copper gutters for patina and leaks',
      'clean gutters on a two-story home safely','choose the right ladder for gutter work','spot fascia damage behind gutters','repair fascia before rehanging gutters','stop gutters from pulling away from the house',
      'install a rain barrel to a downspout','divert roof runoff away from landscaping','protect your foundation with proper drainage','identify gutter sizing for your roof area','compare K-style vs half-round gutters',
      'choose seamless gutters vs sectional gutters','plan a gutter replacement project','budget for gutter installation in 2027','hire a reliable gutter contractor','read a gutter installation estimate',
      'maintain gutter guards year-round','remove pests nesting in gutters','stop birds from nesting in gutter corners','check gutter miters for leaks','seal end caps on sectional gutters',
      'repaint aluminum gutters the right way','prepare gutters for winter weather','prepare gutters for spring storms','inspect underground drain ties from downspouts','clear a buried downspout drain line',
      'spot basement leaks caused by bad gutters','prevent soil erosion from gutter overflow','check gutters after installing a new roof','maintain gutters around roof valleys','clean gutters near overhanging pine trees',
      'reduce ladder risk during gutter cleaning','use a gutter cleaning tool from the ground','inspect hidden hangers inside gutters','fix gutter noise during heavy rain','stop water from dripping behind gutters',
      'maintain box gutters on older homes','check commercial-style gutters on large homes','create a seasonal gutter maintenance checklist','schedule professional gutter cleaning','decide when to repair vs replace gutters','clean out gutter strainers at downspout openings','tighten loose gutter spikes and ferrules','prevent staining on siding from gutter leaks','maintain heated gutter cables safely','compare gutter guard types for your home','plan a fall gutter cleanup routine'
    ]
  },
  {
    slug: 'plumbing',
    name: 'Plumbing',
    service: 'Plumbing',
    intro: 'From drips to drain clogs, small plumbing know-how can prevent big damage. These 2027 plumbing how-to guides focus on safe DIY basics and clear signs it’s time to call a licensed plumber.',
    topics: [
      'shut off your home’s main water supply','shut off water to a sink or toilet','find and fix a dripping faucet','replace a worn faucet washer','unclog a sink drain safely without harsh chemicals',
      'use a plunger correctly on a sink','unclog a shower drain full of hair','unclog a toilet without making a mess','stop a running toilet','replace a toilet flapper valve',
      'fix a weak toilet flush','replace a toilet fill valve','stop a leaking toilet at the base','insulate exposed pipes before a freeze','thaw a frozen pipe safely',
      'prevent pipes from freezing overnight','check under sinks for hidden leaks','replace a P-trap under a sink','tighten a loose supply line connection','replace a braided faucet supply line',
      'fix low water pressure at one faucet','clean a clogged faucet aerator','flush sediment from a water heater','test your water heater temperature setting','relight a pilot light safely if applicable',
      'spot signs your water heater is failing','check for a leaking water heater valve','maintain a tankless water heater','clear a slow bathtub drain','replace a showerhead for better flow',
      'reseal a showerhead connection with tape','fix a dripping shower handle','replace a bathtub drain stopper','caulk around a tub to prevent leaks','find the source of a water leak in a wall',
      'detect a hidden slab leak warning signs','read your water meter to spot leaks','reduce water hammer noise in pipes','quiet banging pipes in your home','maintain a garbage disposal safely',
      'unjam a stuck garbage disposal','freshen a smelly garbage disposal','prevent kitchen drain grease clogs','care for pipes with a water softener','replace an under-sink water filter',
      'check washing machine hoses for wear','replace old washing machine supply hoses','install a leak detector near appliances','prepare plumbing for a vacation away','winterize outdoor faucets and hose bibs',
      'fix a leaking outdoor spigot','maintain a sump pump before storm season','test a sump pump backup system','know when a clog needs a professional plumber','handle a burst pipe emergency before help arrives',
      'understand basic plumbing pipe materials','choose the right plumber for repairs','read a plumbing repair estimate','prevent sewer line backups at home','create a yearly home plumbing checklist','test your home water pressure with a gauge','adjust a pressure reducing valve safely','fix a constantly running sump pump','maintain a basement floor drain trap','replace a cracked toilet tank lid or handle','label your home shutoff valves for emergencies'
    ]
  },
  {
    slug: 'hvac',
    name: 'HVAC',
    service: 'HVAC Installation',
    intro: 'A well-maintained heating and cooling system keeps your home comfortable and efficient. These 2027 HVAC how-to guides cover simple upkeep, troubleshooting, and when to call an HVAC professional.',
    topics: [
      'replace your HVAC air filter the right way','choose the correct air filter size and rating','set your thermostat for energy savings in 2027','program a smart thermostat schedule','troubleshoot an AC that is not cooling',
      'check a tripped breaker for your AC unit','clear debris around an outdoor condenser unit','clean an outdoor AC condenser coil safely','unclog an AC condensate drain line','stop water leaking from your indoor AC unit',
      'improve airflow from weak AC vents','balance airflow between rooms in your home','seal leaky air ducts you can access','insulate exposed ductwork for efficiency','check return air vents for blockages',
      'reduce dust with better HVAC maintenance','troubleshoot a furnace that will not start','replace a furnace filter before heating season','check thermostat batteries and settings','bleed air from hot water radiators',
      'test your carbon monoxide detectors','prepare your furnace for winter','prepare your AC for summer heat','listen for unusual HVAC noises and causes','reduce HVAC noise in your home',
      'eliminate musty smells from AC vents','prevent mold in your HVAC system','maintain a heat pump through the seasons','switch a heat pump between heat and cool modes','defrost a frozen heat pump safely',
      'troubleshoot short cycling in an HVAC system','improve indoor humidity with your HVAC','use a whole-home humidifier correctly','maintain a whole-home dehumidifier','clean HVAC supply and return grilles',
      'check attic insulation to help your HVAC','seal air leaks around windows and doors','use ceiling fans to support your HVAC','understand SEER2 ratings when buying AC','compare heat pump vs furnace options',
      'decide between HVAC repair and replacement','budget for a new HVAC system in 2027','choose the right size HVAC system for your home','hire a licensed HVAC contractor','read an HVAC installation estimate',
      'understand HVAC maintenance plans','schedule seasonal HVAC tune-ups','maintain a ductless mini-split system','clean a mini-split filter and coil area','troubleshoot a mini-split not heating or cooling',
      'check refrigerant leak warning signs','improve home air quality with HVAC upgrades','replace an old thermostat with a smart model','maintain a smart ventilation system','check dryer vent impact on indoor air',
      'protect your outdoor unit from storm debris','keep plants clear of your condenser unit','handle an HVAC burning smell safely','know when to call emergency HVAC service','create a yearly HVAC maintenance checklist','test your HVAC system before peak season','change batteries in a smart thermostat','clean dust from baseboard heaters safely','check for blocked exterior exhaust vents','understand HVAC airflow and static pressure basics','prepare HVAC records for a home sale'
    ]
  },
  {
    slug: 'windows',
    name: 'Windows',
    service: 'Window Installation',
    intro: 'Good windows improve comfort, efficiency, and security. These 2027 window how-to guides help you maintain, repair, and plan upgrades for the windows in your home.',
    topics: [
      'inspect your windows for drafts and leaks','find air leaks around window frames','weatherstrip a drafty window','apply caulk around window trim','replace worn window weatherstripping',
      'clean window tracks for smooth operation','lubricate sticking window tracks','fix a window that will not stay open','adjust a tilt-in window sash','replace a broken window screen',
      'patch a small tear in a window screen','install a new window screen frame','clean double-pane windows without streaks','remove hard water stains from glass','prevent window condensation in winter',
      'reduce indoor humidity to stop window fog','check for failed window seals and fogging','maintain wooden window frames','repaint wooden window trim for protection','protect vinyl windows from warping',
      'clean and care for aluminum window frames','maintain window locks for home security','upgrade to modern window lock hardware','install a window sash lock','childproof windows for safety',
      'install window stops for child safety','maintain casement window cranks','fix a stiff casement window operator','maintain sliding windows and tracks','replace rollers on a sliding window',
      'seal gaps around a window AC unit','remove and store a window AC safely','prepare windows for hurricane season','install temporary storm window protection','board up a window safely in an emergency',
      'measure windows accurately for replacement','choose energy-efficient windows in 2027','understand double-pane vs triple-pane windows','compare window frame materials','choose Low-E glass for your climate',
      'decide between window repair and replacement','budget for window replacement in 2027','plan a whole-home window upgrade','hire a professional window installer','read a window replacement estimate',
      'understand window warranty coverage','maintain bay and bow windows','check flashing around exterior windows','prevent water leaks at window sills','fix a rotting window sill',
      'maintain skylight windows from indoors','clean window wells for basement windows','improve basement window security','install window film for privacy and UV protection','remove old window film without damage',
      'maintain egress windows for safety','test window operation before storm season','soundproof windows with simple upgrades','improve natural light with window choices','create a seasonal window maintenance checklist',
      'schedule a professional window inspection','maintain historic windows with care','prevent insects from entering around windows','choose impact windows for storm zones','know when a broken window needs emergency service','clean window weep holes to prevent leaks'
    ]
  },
  {
    slug: 'appliance-repair',
    name: 'Appliance Repair',
    service: 'Appliance Repair',
    intro: 'When a home appliance acts up, quick checks can save time and money. These 2027 appliance repair how-to guides cover safe troubleshooting, maintenance, and when to call a certified technician.',
    topics: [
      'troubleshoot a refrigerator that is not cooling','clean refrigerator condenser coils safely','check a refrigerator door seal for leaks','replace a worn refrigerator door gasket','stop a refrigerator from leaking water',
      'unclog a refrigerator defrost drain','set the right temperature for fridge and freezer','troubleshoot an ice maker not making ice','replace a refrigerator water filter','fix a noisy refrigerator fan sound',
      'troubleshoot a dishwasher that will not start','clean a dishwasher filter and spray arms','fix a dishwasher that will not drain','stop a dishwasher from leaking','eliminate odors from your dishwasher',
      'load a dishwasher for better cleaning','troubleshoot a washing machine that will not spin','clean a washing machine drain pump filter','stop a washing machine from vibrating','fix a washing machine that will not drain',
      'clean mold and odor from a front-load washer','maintain a top-load washing machine','troubleshoot a dryer that will not heat','clean a dryer lint trap and housing','clean a dryer vent to prevent fires',
      'check a dryer vent for airflow problems','stop a squeaking dryer drum','troubleshoot a dryer that takes too long','maintain a gas dryer safely','troubleshoot an oven that will not heat',
      'calibrate an oven temperature accurately','replace an oven bake element safely','troubleshoot a stove burner not working','clean electric stove drip pans and coils','maintain a glass cooktop without scratches',
      'troubleshoot a microwave not heating','clean a microwave safely and effectively','replace a microwave turntable motor or roller','troubleshoot a garbage disposal that hums','reset a tripped garbage disposal safely',
      'maintain a range hood filter','troubleshoot a range hood fan not working','check a freezer that is not freezing','defrost a freezer safely','organize a freezer to improve airflow',
      'troubleshoot a wine cooler temperature issue','maintain a dehumidifier for best performance','clean a portable air conditioner filter','troubleshoot a portable AC not cooling well','descale a coffee maker for better taste',
      'maintain a tankless water dispenser','check appliance power cords for damage','reset an appliance after a power outage','use surge protection for home appliances','read appliance error codes',
      'decide between appliance repair and replacement','budget for appliance repair in 2027','find a certified appliance repair technician','read an appliance repair estimate','prepare appliance info before a service call',
      'maintain appliances under manufacturer warranty','extend the life of kitchen appliances','extend the life of laundry appliances','create a home appliance maintenance schedule','know when an appliance issue is an emergency','level a wobbly refrigerator or range safely'
    ]
  },
  {
    slug: 'water-damage-restoration',
    name: 'Water Damage Restoration',
    service: 'Water Damage Restoration',
    intro: 'Fast action matters when water gets into your home. These 2027 water damage restoration guides help you respond safely, limit damage, and know when to call certified restoration professionals.',
    topics: [
      'shut off water during a home leak emergency','stay safe around standing water and electricity','document water damage for insurance in 2027','remove standing water with a wet vacuum safely','dry out a wet room after a leak','set up fans and dehumidifiers after water damage','protect furniture and belongings from water damage','pull up wet carpet to prevent mold','dry wet drywall and know when to remove it','disinfect surfaces after clean water leaks','handle a flooded basement safely','respond to a burst pipe water emergency','clean up after a washing machine overflow','deal with water damage from a leaking water heater','dry out cabinets after an under-sink leak','spot hidden moisture behind walls','use a moisture meter for water damage checks','prevent mold after water damage','remove musty odors after flooding','clean and dry hardwood floors after water exposure','save important documents after water damage','protect electrical outlets after water intrusion','respond to roof leak water damage indoors','handle water damage from a clogged AC drain line','clean up after a toilet overflow safely','know the difference between clean gray and black water','sanitize after contaminated water exposure','dispose of water-damaged materials safely','check insulation for water saturation','dry out a crawl space after flooding','prevent future basement water intrusion','improve grading to keep water away from your home','maintain a sump pump for flood prevention','test sump pump alarms and backups','respond to storm flooding around your home','protect your home before heavy rain','create a home water emergency plan','pack a basic water damage response kit','work with a water damage restoration company','read a water mitigation estimate','understand the water damage drying process','know how long structural drying takes','monitor humidity levels during drying','prevent secondary damage after a leak','check for warped floors after water damage','restore belongings after minor water damage','handle water damage in an apartment or condo','respond to ceiling leaks from upstairs plumbing','dry out a bathroom after persistent leaks','protect your foundation after flooding','clean HVAC vents after water exposure','replace water-damaged baseboards safely','know when materials can be dried vs replaced','schedule professional moisture inspections','avoid common mistakes during water cleanup','coordinate water damage repairs and restoration','understand mold risks after water damage','ventilate your home after a flood','check exterior drainage after water issues','create a yearly water damage prevention checklist','store valuables to reduce flood risk','respond quickly to small leaks before damage spreads','find reliable emergency water restoration help','decide when water damage needs emergency service','follow up after professional water restoration'
    ]
  },
  {
    slug: 'electrical',
    name: 'Electrical & Panels',
    service: 'Electrical & Panels',
    intro: 'Electrical work demands caution. These 2027 electrical how-to guides cover safe homeowner checks, simple upkeep, and clear signs you need a licensed electrician.',
    topics: [
      'reset a tripped circuit breaker safely','find out why a breaker keeps tripping','label your electrical panel clearly','test a GFCI outlet the right way','reset a GFCI outlet after it trips','test AFCI breakers in your panel','replace a standard light switch safely','install a dimmer switch on compatible lights','replace a worn electrical outlet safely','replace a broken outlet cover plate','troubleshoot a dead electrical outlet','identify a loose outlet and stay safe','replace a light fixture safely','change hard-to-reach light bulbs safely','choose the right LED bulbs for your home','fix a flickering light bulb issue','troubleshoot flickering lights in one room','test smoke detectors monthly','replace smoke detector batteries and units','install carbon monoxide detectors correctly','plan safe outdoor lighting for your home','replace an outdoor light fixture safely','troubleshoot outdoor outlets not working','use extension cords safely at home','avoid overloaded power strips and outlets','spot signs of outdated wiring in a home','recognize aluminum wiring warning signs','understand when to upgrade an electrical panel','prepare for an EV charger installation','choose a location for a home EV charger','understand dedicated circuits for appliances','troubleshoot a ceiling fan not working','balance a wobbly ceiling fan safely','install a smart light switch safely','set up smart bulbs and hubs','add childproof outlet covers','protect electronics with surge protection','check your home after a power surge','safely use a portable generator at home','install a transfer switch with a pro','troubleshoot partial power loss in your home','identify burning smells from outlets safely','respond to sparking outlets or switches','understand GFCI protection in kitchens and baths','understand electrical permits and inspections','map circuits in your home','replace a doorbell transformer safely','troubleshoot a wired doorbell not working','install low-voltage landscape lighting','maintain exterior GFCI outlets','weatherproof outdoor electrical covers','choose tamper-resistant outlets for safety','plan lighting upgrades for energy savings','read an electrical repair estimate','hire a licensed electrician with confidence','prepare questions for an electrical inspection','budget for electrical panel upgrades in 2027','know when an electrical issue is an emergency','create a home electrical safety checklist','maintain safe clearances around your electrical panel','understand whole-home surge protection','check extension cord ratings for tools','label appliance circuits for quick shutoff','upgrade to USB outlets safely','schedule routine electrical safety checks'
    ]
  },
  {
    slug: 'locksmith',
    name: 'Locksmith',
    service: 'Locksmith',
    intro: 'Good locks protect your home and give you peace of mind. These 2027 locksmith how-to guides cover everyday lock care, upgrades, and what to do in lock and key emergencies.',
    topics: [
      'choose the right deadbolt for your front door','install a standard deadbolt lock','rekey a door lock after moving in','replace a worn door lock cylinder','lubricate a sticky door lock properly','fix a door that will not latch correctly','align a strike plate for smoother locking','tighten a loose door handle or knob','replace an interior privacy door knob','secure a sliding patio door','install a patio door security bar','reinforce a door frame against forced entry','install a peephole in your front door','upgrade to a smart door lock in 2027','set up keypad codes on a smart lock','change batteries in a smart door lock','troubleshoot a smart lock not responding','rekey locks instead of replacing them','choose keyed-alike locks for convenience','maintain high-security door locks','protect locks from freezing in winter','unfreeze a frozen door lock safely','care for locks in coastal or humid climates','choose weather-resistant outdoor padlocks','secure a backyard gate with a quality lock','install a mailbox lock','replace a broken mailbox lock','secure windows with auxiliary locks','install child-safe window locks','lock down a garage side entry door','maintain a garage door manual lock','choose the right lock for a shed','secure a storage unit with a strong padlock','organize and label spare keys safely','create a key control plan for your household','use a lockbox for emergency access','know what to do when locked out of your house','avoid damage during a home lockout','find a trustworthy local locksmith','verify a locksmith’s credentials and pricing','read a locksmith service estimate','understand rekeying vs replacing locks','improve home security after losing keys','resecure your home after a break-in','choose bump-resistant lock cylinders','understand ANSI lock grades for doors','maintain mortise locks on older doors','care for antique or vintage door hardware','install a door chain or guard latch','secure French doors properly','upgrade strike plates with longer screws','check exterior doors for security gaps','plan a home lock upgrade on a budget','prepare your locks for vacation travel','create a yearly home lock maintenance checklist','keyless entry options for families','secure sliding windows with track locks','protect spare keys from theft','choose locks for rental properties','know when to call an emergency locksmith','install a smart lock bridge or hub','maintain keypad door locks for reliability','secure a home office or safe room','choose padlock sizes for gates and sheds','audit your home entry points for security'
    ]
  },
  {
    slug: 'garage-door-repair',
    name: 'Garage Door Repair',
    service: 'Garage Door Repair',
    intro: 'Your garage door is heavy, complex, and used every day. These 2027 garage door guides cover safe maintenance, simple fixes, and when to call a trained garage door technician.',
    topics: [
      'test your garage door balance safely','lubricate garage door rollers and hinges','tighten loose garage door hardware','clean and maintain garage door tracks','align garage door safety sensors','troubleshoot a garage door that will not close','fix a garage door remote not working','replace a garage door remote battery','reprogram a garage door keypad','reset a garage door opener safely','silence a noisy garage door','replace worn garage door weatherstripping','seal gaps at the bottom of a garage door','insulate a garage door for comfort','maintain a steel garage door finish','clean and protect a wood garage door','test the garage door auto-reverse feature','check garage door photo-eye sensors','clear obstructions from garage door sensors','troubleshoot a garage door opener light','choose the right garage door opener type','maintain a belt-drive garage door opener','maintain a chain-drive garage door opener','replace a garage door opener wall button','install smart garage door controls in 2027','secure your garage door against intruders','use the garage door emergency release safely','manually open a garage door during an outage','prepare your garage door for winter','prepare your garage door for summer heat','spot signs of worn garage door rollers','identify frayed garage door cables safely','recognize a broken garage door spring danger','know why spring repairs require a pro','troubleshoot a garage door off its track signs','prevent dents and damage to garage panels','wash and maintain garage door windows','replace cracked garage door window inserts','paint a garage door for curb appeal','choose a new garage door style','understand garage door insulation R-values','budget for garage door repair in 2027','budget for garage door replacement in 2027','read a garage door repair estimate','hire a qualified garage door technician','schedule annual garage door maintenance','maintain side-mounted garage door openers','troubleshoot Wi-Fi issues with smart openers','replace garage door bottom seals','adjust garage door travel limits carefully','check garage door hinges for wear','maintain a quiet garage door system','protect garage doors in coastal climates','childproof garage door controls','create a garage door safety checklist','improve garage security lighting','inspect garage door brackets and fasteners','handle a garage door stuck halfway open','maintain a detached garage door','know when a garage door issue is an emergency','choose weather seals for uneven garage floors','test backup battery on a garage opener','keep garage door tracks free of debris','understand garage door warranty basics','prepare for a professional garage door tune-up'
    ]
  },
  {
    slug: 'bath-remodeling',
    name: 'Bath Remodeling',
    service: 'Bath Remodeling',
    intro: 'A bathroom remodel can boost comfort and home value. These 2027 bath remodeling how-to guides help you plan, choose materials, and manage upgrades from small refreshes to full renovations.',
    topics: [
      'plan a bathroom remodel step by step','set a realistic bathroom remodel budget in 2027','create a bathroom remodel timeline','choose a bathroom layout that fits your space','measure your bathroom for a remodel','decide between a tub and a walk-in shower','choose the right bathroom vanity size','select durable bathroom countertop materials','pick bathroom flooring that handles moisture','choose slip-resistant shower floor tile','plan bathroom lighting layers effectively','select a bathroom exhaust fan size','improve bathroom ventilation to prevent mold','choose water-efficient toilets in 2027','compare one-piece vs two-piece toilets','pick the right bathroom faucet style','choose a showerhead for pressure and savings','plan storage in a small bathroom','design a bathroom for aging in place','choose grab bar placements for safety','plan a curbless shower entry','select waterproofing for a shower remodel','understand bathroom backer board options','choose grout and sealant for wet areas','plan niche storage in a shower','select bathroom tile patterns and sizes','coordinate bathroom fixtures and finishes','choose mirrors and medicine cabinets','plan electrical outlets in a bathroom','add task lighting around a vanity mirror','choose paint that resists bathroom humidity','prepare walls for bathroom painting','remove old caulk and recaulk a bathtub','refresh a bathroom without a full remodel','refinish a bathtub vs replacing it','reglaze bathroom tile for a quick update','replace a bathroom vanity step by step','install a new bathroom faucet during a remodel','swap out dated bathroom hardware','upgrade towel bars and hooks for function','plan a kid-friendly bathroom design','design a guest bathroom that feels welcoming','choose eco-friendly materials for bath remodels','plan accessible clearances in a bathroom','select a frameless vs framed shower door','understand bathroom remodel permits','hire a bathroom remodeling contractor','read a bathroom remodel estimate','avoid common bathroom remodeling mistakes','plan for plumbing changes in a remodel','manage a bathroom remodel while living at home','protect nearby rooms during demolition','choose low-maintenance bathroom surfaces','plan radiant floor heating in a bathroom','add smart features to a bathroom in 2027','select quiet and efficient bath fans','design storage for linen and toiletries','choose lighting color temperature for bathrooms','plan a powder room refresh','decide when to DIY vs hire a bath pro','inspect bathroom waterproofing before tiling','compare acrylic vs tile shower walls','choose a bathtub material that lasts','plan ventilation for windowless bathrooms','create a bathroom remodel checklist'
    ]
  },
  {
    slug: 'kitchen-remodeling',
    name: 'Kitchen Remodeling',
    service: 'Kitchen Remodeling',
    intro: 'A well-planned kitchen remodel improves how your home cooks, gathers, and functions. These 2027 kitchen remodeling how-to guides help you plan layouts, choose materials, and manage a successful renovation.',
    topics: [
      'plan a kitchen remodel from start to finish','set a kitchen remodel budget in 2027','create a realistic kitchen renovation timeline','choose an efficient kitchen layout','apply the kitchen work triangle in modern designs','measure your kitchen for new cabinets','choose kitchen cabinet styles and finishes','decide between stock semi-custom and custom cabinets','plan pantry storage in a kitchen remodel','select durable kitchen countertop materials','compare quartz granite and laminate counters','choose a kitchen backsplash that lasts','pick kitchen flooring for heavy traffic','plan layered kitchen lighting','choose under-cabinet lighting for tasks','select energy-efficient kitchen appliances in 2027','plan appliance placement for better workflow','choose the right kitchen sink size and style','pick a kitchen faucet for function and style','decide on a single vs double-bowl sink','plan a kitchen island with seating','choose ventilation and range hood options','improve kitchen ventilation for cooking','plan electrical outlets for modern kitchens','add dedicated circuits for kitchen appliances','choose cabinet hardware that fits your style','organize deep drawers for kitchen storage','design a kitchen for small spaces','plan an open-concept kitchen remodel','refresh a kitchen without replacing cabinets','paint kitchen cabinets for a durable finish','refinish or replace cabinet doors','update a kitchen backsplash on a budget','replace countertops without a full remodel','choose eco-friendly kitchen materials','plan for plumbing changes in a kitchen remodel','select low-maintenance kitchen surfaces','design a family-friendly kitchen layout','plan accessible kitchen features for aging in place','choose slip-resistant kitchen flooring','coordinate finishes across a kitchen remodel','manage a kitchen remodel while living at home','prepare for kitchen demolition day','understand kitchen remodel permits','hire a kitchen remodeling contractor','read a kitchen remodeling estimate','avoid common kitchen remodeling mistakes','plan waste and recycling storage in cabinets','choose lighting color temperature for kitchens','add smart kitchen features in 2027','select a quiet and powerful dishwasher','plan a coffee or beverage station','design a kitchen mudroom transition','protect floors during a kitchen renovation','schedule inspections during a kitchen remodel','choose durable grout and sealants for kitchens','plan for proper task and ambient lighting','compare induction and gas cooktops','decide when to DIY vs hire a kitchen pro','handle unexpected issues during a remodel','maximize storage in corner cabinets','select window treatments for kitchens','plan a kitchen remodel checklist','evaluate return on investment for kitchen upgrades','prepare your home for a kitchen renovation'
    ]
  },
  {
    slug: 'landscaping',
    name: 'Landscaping',
    service: 'Landscaping',
    intro: 'Thoughtful landscaping makes your outdoor space healthier and more enjoyable. These 2027 landscaping how-to guides cover lawn care, planting, hardscape basics, and when to hire a landscaping professional.',
    topics: [
      'plan a simple landscape design for your yard','create a low-maintenance landscaping plan','test your soil before planting','improve garden soil with compost','choose the right grass for your climate','start a new lawn from seed','lay sod for an instant lawn','mow your lawn at the right height','water your lawn efficiently in 2027','fix bare patches in your lawn','control weeds in lawns and beds naturally','aerate your lawn for healthier growth','dethatch a lawn when needed','fertilize your lawn safely through seasons','edge lawn borders for a clean look','mulch garden beds the right way','choose mulch types for your landscape','plant shrubs for year-round structure','plant trees at the correct depth','prune shrubs without harming growth','trim small trees safely','care for newly planted trees','design a drought-tolerant landscape','choose native plants for easy care','plan a pollinator-friendly garden','install a simple drip irrigation system','set a sprinkler schedule that saves water','fix common sprinkler head problems','build a raised garden bed','prepare garden beds for spring planting','clean up your yard for fall','protect plants from frost and freezes','install landscape edging for clean lines','lay stepping stones for a garden path','plan a paver patio layout','maintain a paver patio over time','build a simple retaining wall safely','improve yard drainage with grading','prevent soil erosion on slopes','install outdoor landscape lighting','maintain outdoor lighting fixtures','choose plants for shady areas','choose plants for full sun areas','control common garden pests responsibly','spot signs of tree disease early','remove small stumps safely','care for hedges and privacy screens','plan a kid- and pet-friendly yard','design low-water landscaping for hot climates','refresh curb appeal with simple landscaping','maintain gravel paths and beds','clean and seal outdoor stone surfaces','prepare your landscape for storm season','budget for landscaping projects in 2027','hire a professional landscaping service','read a landscaping estimate carefully','plan seasonal landscaping maintenance','choose ground covers to reduce mowing','install a simple garden border','create a yearly landscaping checklist','maintain healthy shrubs through pruning cycles','winterize your irrigation system','compost yard waste effectively','select outdoor plants for containers','know when to call a tree care professional'
    ]
  },
  {
    slug: 'cleaning-maintenance',
    name: 'Cleaning & Maintenance',
    service: 'Cleaning & Maintenance',
    intro: 'Regular cleaning and upkeep keep your home healthy and comfortable. These 2027 cleaning and maintenance how-to guides offer practical routines, deep-clean tips, and advice on when to hire professional help.',
    topics: [
      'build a weekly home cleaning routine','create a monthly home maintenance checklist','deep clean your kitchen step by step','clean and degrease kitchen cabinets','sanitize kitchen counters safely','clean a stainless steel sink and fixtures','deep clean your bathroom effectively','remove soap scum from shower glass','clean grout lines in tile surfaces','prevent and remove bathroom mildew','clean and disinfect high-touch surfaces','dust your home efficiently room by room','vacuum carpets for a deeper clean','remove common stains from carpet','clean area rugs safely at home','mop hard floors without streaks','care for hardwood floors during cleaning','clean laminate and vinyl flooring safely','wash windows inside for a clear finish','clean window screens and tracks','clean blinds and window treatments','wash curtains and drapes properly','clean ceiling fans without spreading dust','wipe down baseboards and trim','clean air vents and return grilles','replace HVAC filters on a schedule','clean a dryer lint trap and vent area','maintain a clean and fresh refrigerator','clean inside your oven safely','degrease a range hood and filter','clean and freshen a garbage disposal','descale a kettle and coffee maker','organize and clean under the kitchen sink','declutter and clean closets seasonally','clean and organize a garage space','pressure wash a driveway safely','pressure wash siding without damage','clean outdoor patio furniture','sweep and maintain a deck surface','clean gutters as part of home maintenance','wash exterior windows safely','remove pet hair from furniture and floors','eliminate pet odors from your home','clean upholstery safely at home','freshen mattresses and bedding','prepare your home for seasonal deep cleaning','use eco-friendly cleaning products effectively','store cleaning supplies safely at home','disinfect after household illness','clean safely around kids and pets','maintain a clean entryway and mudroom','prevent clutter from building up daily','set a 15-minute daily tidy routine','hire a professional cleaning service','read a house cleaning estimate','prepare your home for professional cleaners','decide between DIY and professional deep cleaning','clean before moving into a new home','clean when moving out of a home','create a yearly home maintenance calendar','maintain cleaning tools for better results','remove hard water stains around the home','clean light fixtures safely','sanitize trash cans and recycling bins','keep indoor air fresh with simple habits'
    ]
  },
  {
    slug: 'moving-services',
    name: 'Moving Services',
    service: 'Moving Services',
    intro: 'A smooth move comes down to planning and organization. These 2027 moving how-to guides help you pack, prepare, and settle in while knowing when to bring in professional movers.',
    topics: [
      'create a moving checklist and timeline','set a moving budget for 2027','decide between DIY moving and hiring movers','choose the right moving company','read and compare moving estimates','spot and avoid moving scams','declutter your home before a move','donate or sell items before moving','gather packing supplies for a move','pack a room efficiently step by step','label moving boxes clearly','pack fragile items safely','pack dishes and glassware without breaks','pack clothes for an easy move','pack electronics and cables securely','prepare large appliances for moving','move a refrigerator safely','protect furniture during a move','disassemble furniture for transport','pack a first-night essentials box','pack important documents for moving day','move houseplants safely','prepare pets for moving day','keep kids comfortable during a move','plan a move with a tight timeline','reserve a moving truck in advance','load a moving truck efficiently','drive and park a moving truck safely','plan parking and access on moving day','protect floors and walls while moving','handle stairs and tight hallways during a move','move safely in bad weather','coordinate utilities for move-in day','change your address before moving','transfer internet and home services','prepare for a local move','plan a long-distance move in 2027','understand moving insurance options','inventory your belongings before a move','take photos for a moving inventory','pack and move valuables securely','handle specialty items like pianos or safes','store items temporarily during a move','unpack efficiently after moving in','set up essential rooms first after a move','clean your old home before move-out','do a final walkthrough before leaving','clean your new home before unpacking','meet neighbors and learn your new area','dispose of packing materials responsibly','return moving equipment on time','review your move and file claims if needed','update home records after moving','plan a move during peak season','move on a budget with smart planning','coordinate building or HOA move rules','prepare for an apartment move','manage a last-minute move calmly','create a moving day schedule','settle into your new home smoothly','measure doorways and furniture before moving','pack a home office for a smooth move','protect TVs and monitors during a move','plan a move with storage in between','tip movers and handle moving day etiquette'
    ]
  },
  {
    slug: 'painting',
    name: 'Painting',
    service: 'Painting',
    intro: 'A fresh coat of paint can transform your home inside and out. These 2027 painting how-to guides cover preparation, techniques, and when to hire professional painters for the best results.',
    topics: [
      'choose the right interior paint finish','pick paint colors that work in your home','test paint samples before committing','calculate how much paint you need','gather essential painting tools and supplies','prepare a room for interior painting','protect floors and furniture while painting','repair nail holes and wall dents before painting','clean walls before applying paint','tape trim and edges for clean lines','prime walls before painting when needed','cut in paint edges like a pro','roll paint on walls for even coverage','apply a second coat of paint correctly','paint ceilings without streaks','paint interior trim and baseboards','paint interior doors smoothly','paint window frames without sticking','paint kitchen cabinets for durability','paint a bathroom to resist moisture','remove old wallpaper before painting','paint over dark colors effectively','fix paint drips and streaks','store leftover paint properly','clean paint brushes and rollers','choose exterior paint for your climate','plan an exterior painting project','prepare exterior surfaces for painting','scrape and sand peeling exterior paint','caulk exterior gaps before painting','prime exterior wood and siding','paint exterior siding evenly','paint exterior trim and fascia','paint a front door for curb appeal','stain or paint a deck safely','paint a fence for long-lasting protection','choose the right weather for exterior painting','use ladders safely while painting','paint stair railings and balusters','refresh a garage floor with paint or coating','paint concrete surfaces correctly','use painter’s tape for sharp patterns','create an accent wall with paint','paint over mold stains safely after treatment','ventilate rooms while painting indoors','choose low-VOC paints for healthier air','budget for a painting project in 2027','hire professional painters with confidence','read a painting estimate line by line','avoid common painting mistakes','touch up painted walls seamlessly','maintain painted surfaces over time','remove paint spills and splatters','paint metal surfaces without rust issues','paint brick surfaces the right way','plan a whole-home interior repaint','schedule exterior repainting for your home','decide between DIY and professional painting','prepare kids and pets during painting projects','dispose of paint and supplies responsibly','understand paint drying and curing times','choose primers for problem surfaces','paint closets and small spaces efficiently','update trim color for a modern look','create a yearly painting maintenance plan'
    ]
  },
  {
    slug: 'flooring',
    name: 'Flooring',
    service: 'Flooring',
    intro: 'The right flooring adds comfort, style, and durability to your home. These 2027 flooring how-to guides cover care, repairs, material choices, and when to hire a flooring professional.',
    topics: [
      'choose the best flooring for each room','compare hardwood laminate and vinyl flooring','understand engineered vs solid hardwood','choose waterproof flooring for kitchens and baths','select pet-friendly flooring options','budget for new flooring in 2027','measure rooms accurately for flooring','prepare a subfloor for new flooring','check a subfloor for moisture problems','acclimate flooring materials before installation','remove old carpet before new flooring','remove old vinyl or tile flooring safely','clean hardwood floors without damage','protect hardwood floors from scratches','fix squeaky hardwood floors','repair small scratches in hardwood floors','refinish hardwood floors step by step','clean laminate floors the right way','fix chipped or swollen laminate planks','replace a damaged laminate floor board','clean luxury vinyl plank flooring','repair scratches on vinyl flooring','replace a damaged vinyl plank','clean tile floors and keep grout fresh','seal grout to protect tile floors','repair cracked floor tiles safely','replace a broken floor tile','clean and maintain natural stone floors','care for concrete floors in your home','polish concrete floors for a clean finish','choose carpet styles for your home','clean and maintain carpeted floors','remove tough stains from carpet','stretch loose carpet to remove wrinkles','repair a small carpet burn or tear','reduce floor noise with underlayment','choose underlayment for different floors','install transition strips between floors','maintain baseboards during flooring projects','protect floors during home renovations','prevent water damage to flooring','handle spills quickly on wood floors','choose slip-resistant flooring for safety','select eco-friendly flooring materials','plan radiant heating under new floors','compare DIY and professional floor installation','hire a flooring contractor you can trust','read a flooring installation estimate','prepare your home for flooring installers','care for floors after installation','maintain floors in high-traffic areas','use rugs and pads to protect floors','move furniture without scratching floors','clean floors safely for kids and pets','fix gaps between floorboards','deal with cupping or buckling hardwood','choose flooring for basements','maintain stairs and stair treads','match new flooring to existing rooms','create a yearly floor care checklist','remove odors trapped in flooring','restore shine to dull floors safely','choose durable entryway flooring','plan a whole-home flooring update','know when flooring damage needs a pro'
    ]
  },
  {
    slug: 'foundation-concrete',
    name: 'Foundation & Concrete',
    service: 'Foundation & Concrete',
    intro: 'A solid foundation and well-kept concrete protect your home’s structure and safety. These 2027 how-to guides help you spot issues early, handle small repairs, and know when to call a foundation or concrete professional.',
    topics: [
      'spot early signs of foundation problems','check for cracks in your foundation walls','tell cosmetic cracks from structural cracks','monitor foundation cracks over time','look for signs of foundation settling','check doors and windows for foundation shifts','inspect your basement for moisture and cracks','improve drainage around your foundation','extend downspouts to protect your foundation','grade soil away from your house','clean and seal a concrete driveway','fill small cracks in a concrete driveway','repair spalling concrete surfaces','resurface worn concrete safely','remove oil stains from concrete','pressure wash concrete without causing damage','seal concrete steps and walkways','fix a small chip in concrete steps','level a sunken concrete slab with guidance','prevent trip hazards on uneven concrete','maintain concrete patio surfaces','clean and seal a concrete patio','repair cracks in a concrete patio','protect concrete from freeze-thaw damage','use de-icer safely on concrete in winter','control weeds in concrete joints and cracks','maintain expansion joints in concrete','check a garage floor for cracks and pitting','apply an epoxy coating to a garage floor','maintain a coated concrete garage floor','inspect retaining walls for leaning or cracks','improve drainage behind a retaining wall','maintain concrete block walls','check crawl space vents and moisture','reduce humidity in a crawl space','install a vapor barrier in a crawl space basics','spot signs of water intrusion in foundations','maintain a sump pit and discharge line','protect your foundation during heavy rain','prepare your foundation for drought conditions','prevent tree roots from damaging concrete','plan a new concrete walkway project','understand concrete curing and drying times','choose the right concrete mix for small projects','pour a small concrete pad safely','budget for foundation repair in 2027','budget for concrete repair or replacement','hire a foundation repair specialist','read a foundation inspection report','hire a concrete contractor you can trust','read a concrete project estimate','understand foundation repair methods','know when a foundation crack is an emergency','prepare your home for foundation work','maintain exterior waterproofing on foundations','check for efflorescence on concrete walls','repair mortar joints in concrete block','keep basement window wells clear and dry','protect concrete from heavy vehicle loads','create a yearly foundation and concrete checklist','document foundation changes for future reference','understand permits for concrete projects','choose finishes for decorative concrete','prevent erosion near slabs and footings','schedule a professional foundation inspection'
    ]
  }
];

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

function makeSteps(topic, vName) {
  const base = topic.replace(/^how to /i,'');
  return [
    `Understand the situation: take a moment to assess ${base} and note any safety risks, active leaks, burning smells, or electrical hazards before you begin.`,
    `Gather what you need: prepare basic tools and materials suited to ${vName.toLowerCase()} work, and keep the area clear so you can work safely.`,
    `Follow a safe step-by-step approach: address the most accessible part of the issue first, test as you go, and avoid forcing parts that feel stuck or unsafe.`,
    `Check your results: confirm the issue is improved, clean up the workspace, and monitor the area over the next day for any returning signs of trouble.`,
    `Know when to stop: if the problem involves gas, major electrical work, structural concerns, or keeps coming back, contact a qualified ${vName.toLowerCase()} professional.`
  ];
}

function makeMistakes(vName) {
  return [
    `Skipping safety steps or working without turning off power/water when the job requires it.`,
    `Using the wrong tools or materials, which can worsen ${vName.toLowerCase()} problems or void warranties.`,
    `Ignoring small warning signs until they become expensive emergencies.`,
    `Attempting complex repairs that are better handled by a licensed ${vName.toLowerCase()} pro.`
  ];
}

function makeFaqs(title, vName) {
  const short = title.replace(/^How to /i,'');
  return [
    { q: `Is it safe to ${short} on my own?`, a: `Many basic checks and simple maintenance tasks are safe for homeowners, but you should stop and call a professional if you encounter gas lines, exposed wiring, structural damage, or anything beyond your comfort level.` },
    { q: `How often should I handle ${vName.toLowerCase()} maintenance?`, a: `A quick visual check every season and a deeper review once a year works well for most homes. Homes in harsh climates or with older systems may need more frequent attention.` },
    { q: `When should I call a ${vName.toLowerCase()} professional?`, a: `Call a pro if the issue is recurring, getting worse, involves safety risks, or requires specialized tools, permits, or licensed work.` },
    { q: `Can Top Shield Home Services help me with ${vName.toLowerCase()} service in ${YEAR}?`, a: `Yes. Chat with Top Shield Home Services, describe what’s going on, and we’ll help connect you with the right local ${vName.toLowerCase()} service.` }
  ];
}

function renderPage(v, topic, idx, total) {
  const rawTitle = topic.startsWith('How to') ? topic : `How to ${topic}`;
  const title = `${cap(rawTitle)} (${YEAR} Guide)`;
  const slug = slugify(rawTitle);
  const desc = `Learn ${rawTitle.toLowerCase()} with this practical ${YEAR} guide from Top Shield Home Services. Step-by-step tips, common mistakes to avoid, and when to call a ${v.name.toLowerCase()} pro.`;
  const steps = makeSteps(rawTitle, v.name);
  const mistakes = makeMistakes(v.name);
  const faqs = makeFaqs(rawTitle, v.name);
  const canonical = `${BASE}/guides/${v.slug}/${slug}.html`;
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  };
  const howToSchema = {
    '@context': 'https://schema.org', '@type': 'HowTo', name: cap(rawTitle),
    description: desc, step: steps.map((s,i) => ({ '@type': 'HowToStep', position: i+1, text: s }))
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | Top Shield Home Services</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${canonical}">
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(howToSchema)}</script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#fff;--bg-alt:#f5f5f7;--text:#1d1d1f;--text-2:#6e6e73;--blue:#0071e3;--blue-dark:#0066cc;--line:#d2d2d7;--radius:18px;--font:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Helvetica Neue',Helvetica,Arial,sans-serif}
    body{font-family:var(--font);color:var(--text);line-height:1.6;background:var(--bg);font-size:17px;-webkit-font-smoothing:antialiased}
    a{color:var(--blue);text-decoration:none} a:hover{text-decoration:underline}
    .topbar{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;height:52px;padding:0 22px;background:rgba(251,251,253,.8);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}
    .brand{display:flex;align-items:center;gap:9px;font-weight:600;font-size:19px;color:var(--text)} .brand .logo{width:28px;height:28px;border-radius:8px;background:var(--text);display:grid;place-items:center;color:#fff;font-size:.8rem} .brand em{font-style:normal;color:var(--text-2)}
    .btn{background:var(--blue);color:#fff;padding:8px 16px;border-radius:980px;font-size:14px;font-weight:500} .btn:hover{background:var(--blue-dark);text-decoration:none}
    .wrap{width:min(820px,88%);margin:0 auto} .hero{background:var(--bg-alt);padding:56px 0 44px}
    .eyebrow{font-size:14px;color:var(--blue);font-weight:600;margin-bottom:10px}
    h1{font-size:clamp(30px,5vw,48px);line-height:1.08;letter-spacing:-.02em;font-weight:600;margin-bottom:16px}
    .lede{font-size:19px;color:var(--text-2);line-height:1.5;max-width:65ch}
    main{padding:44px 0 80px} h2{font-size:28px;letter-spacing:-.01em;margin:36px 0 12px} h3{font-size:20px;margin:22px 0 8px}
    p,li{color:var(--text-2);font-size:17px} p{margin:10px 0} ul,ol{padding-left:22px;margin:10px 0;display:grid;gap:8px}
    .card{background:var(--bg-alt);border-radius:var(--radius);padding:22px 24px;margin:18px 0}
    .cta{background:var(--text);color:#fff;border-radius:var(--radius);padding:28px;margin:36px 0;text-align:center}
    .cta h2{color:#fff;margin:0 0 8px;font-size:26px} .cta p{color:#d1d1d6;margin:0 0 16px}
    .cta .btn{display:inline-block;background:#fff;color:var(--text)} .cta .btn:hover{background:#e8e8ed}
    .faq{margin:12px 0} .faq h3{margin:0 0 6px;font-size:18px;color:var(--text)} .faq p{margin:0}
    .navlinks{display:flex;justify-content:space-between;gap:12px;margin-top:34px;font-size:15px}
    footer{background:var(--bg-alt);color:var(--text-2);padding:30px 0;font-size:13px;text-align:center}
  </style>
</head>
<body>
  <header class="topbar">
    <a class="brand" href="/index.html"><span class="logo">🔧</span><span>Top Shield<em>.home</em></span></a>
    <a class="btn" href="/index.html">Chat with AI</a>
  </header>
  <section class="hero"><div class="wrap">
    <div class="eyebrow"><a href="/guides/index.html">Home Guides</a> · <a href="/guides/${v.slug}/index.html">${esc(v.name)}</a> · Guide ${idx} of ${total} · Updated for ${YEAR}</div>
    <h1>${esc(cap(rawTitle))}</h1>
    <p class="lede">${esc(desc)}</p>
  </div></section>
  <main><div class="wrap">
    <p>${esc(v.intro)}</p>
    <p>If you’re dealing with this right now, a calm, step-by-step approach can prevent extra damage. Below is a practical ${YEAR} guide to help you handle the basics safely and understand when it’s best to bring in a professional.</p>

    <h2>Step-by-step: ${esc(cap(rawTitle))}</h2>
    <ol>
${steps.map(s => `      <li>${esc(s)}</li>`).join('\n')}
    </ol>

    <div class="card">
      <h2 style="margin-top:0">Tools &amp; supplies you may need</h2>
      <ul>
        <li>Basic hand tools appropriate for ${esc(v.name.toLowerCase())} tasks (for example a screwdriver, adjustable wrench, flashlight, or tape measure).</li>
        <li>Safety gear such as gloves and eye protection; use a sturdy ladder and a spotter only when it’s safe to do so.</li>
        <li>Cleaning supplies and a container or towel to manage dust, debris, or minor drips.</li>
        <li>Replacement parts or sealant that match your specific model or material, if a minor fix is appropriate.</li>
      </ul>
    </div>

    <h2>Common mistakes to avoid</h2>
    <ul>
${mistakes.map(m => `      <li>${esc(m)}</li>`).join('\n')}
    </ul>

    <h2>When to call a professional</h2>
    <p>Some ${esc(v.name.toLowerCase())} problems are signs of a bigger issue. Call a qualified pro if you notice persistent leaks, water damage, burning or gas smells, sparking or exposed wiring, structural concerns, or if the fix requires permits or specialized equipment. A pro can diagnose the root cause and help you avoid repeat repairs.</p>

    <div class="cta">
      <h2>Need help with ${esc(v.name.toLowerCase())}?</h2>
      <p>Chat with Top Shield Home Services to explain the issue and get connected with the right local service.</p>
      <a class="btn" href="/index.html">Talk to the AI</a>
    </div>

    <h2>Frequently asked questions</h2>
${faqs.map(f => `    <div class="faq"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('\n')}

    <p style="margin-top:28px;font-size:14px">Guide ${idx} of ${total} in our ${esc(v.name)} series. Informational only — always follow product instructions and local codes, and prioritize safety.</p>
    <div class="navlinks">
      <a href="/guides/${v.slug}/index.html">← All ${esc(v.name)} guides</a>
      <a href="/guides/index.html">Home Guides</a>
    </div>
  </div></main>
  <footer><div class="wrap">© ${YEAR} Top Shield Home Services · <a href="/index.html">Home</a> · <a href="/guides/index.html">Guides</a></div></footer>
</body>
</html>`;
}

function renderVerticalIndex(v, pages) {
  const items = pages.map(p => `      <li><a href="/guides/${v.slug}/${p.slug}.html">${esc(p.title)}</a></li>`).join('\n');
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(v.name)} How-To Guides ${YEAR} | Top Shield Home Services</title>
<meta name="description" content="${esc(v.intro)} Browse ${pages.length} step-by-step ${v.name.toLowerCase()} how-to guides for ${YEAR}.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#fff;--bg-alt:#f5f5f7;--text:#1d1d1f;--text-2:#6e6e73;--blue:#0071e3;--radius:18px;--font:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif}
body{font-family:var(--font);color:var(--text);background:var(--bg);font-size:17px;line-height:1.6}
a{color:var(--blue);text-decoration:none} a:hover{text-decoration:underline}
.topbar{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;height:52px;padding:0 22px;background:rgba(251,251,253,.85);backdrop-filter:saturate(180%) blur(20px)}
.brand{display:flex;align-items:center;gap:9px;font-weight:600;font-size:19px;color:var(--text)} .brand .logo{width:28px;height:28px;border-radius:8px;background:var(--text);display:grid;place-items:center;color:#fff;font-size:.8rem} .brand em{font-style:normal;color:var(--text-2)}
.btn{background:var(--blue);color:#fff;padding:8px 16px;border-radius:980px;font-size:14px}
.wrap{width:min(980px,88%);margin:0 auto} .hero{background:var(--bg-alt);padding:56px 0 40px}
h1{font-size:clamp(32px,5vw,52px);letter-spacing:-.02em;margin-bottom:12px} .lede{color:var(--text-2);font-size:19px;max-width:70ch}
main{padding:40px 0 80px} ul{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
li a{display:block;background:var(--bg-alt);padding:14px 16px;border-radius:14px;color:var(--text);font-size:15px} li a:hover{background:#e8e8ed;text-decoration:none}
footer{text-align:center;color:var(--text-2);font-size:13px;padding:30px 0;background:var(--bg-alt)}
</style></head><body>
<header class="topbar"><a class="brand" href="/index.html"><span class="logo">🔧</span><span>Top Shield<em>.home</em></span></a><a class="btn" href="/index.html">Chat with AI</a></header>
<section class="hero"><div class="wrap"><p style="color:#0071e3;font-weight:600;font-size:14px;margin-bottom:8px"><a href="/guides/index.html">Home Guides</a> · ${YEAR}</p>
<h1>${esc(v.name)} How-To Guides</h1><p class="lede">${esc(v.intro)} Browse all ${pages.length} guides below.</p></div></section>
<main><div class="wrap"><ul>
${items}
</ul></div></main>
<footer><div class="wrap">© ${YEAR} FixIt.ai · <a href="/index.html">Home</a> · <a href="/guides/index.html">All Guides</a></div></footer>
</body></html>`;
}

function renderHub(verticalData) {
  const sections = verticalData.map(v => {
    const some = v.pages.slice(0,8).map(p => `<li><a href="/guides/${v.slug}/${p.slug}.html">${esc(p.title)}</a></li>`).join('');
    return `<section class="v"><h2>${esc(v.name)}</h2><p>${esc(v.intro)}</p><ul>${some}</ul><p style="margin-top:10px"><a href="/guides/${v.slug}/index.html">View all ${v.pages.length} ${esc(v.name)} guides →</a></p></section>`;
  }).join('\n');
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Home Service How-To Guides ${YEAR} | FixIt.ai</title>
<meta name="description" content="Browse ${verticalData.reduce((a,v)=>a+v.pages.length,0)} practical how-to guides for roofing, gutters, plumbing, HVAC, windows, and appliance repair — updated for ${YEAR}.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#fff;--bg-alt:#f5f5f7;--text:#1d1d1f;--text-2:#6e6e73;--blue:#0071e3;--radius:18px;--font:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif}
body{font-family:var(--font);color:var(--text);background:var(--bg);font-size:17px;line-height:1.6}
a{color:var(--blue);text-decoration:none} a:hover{text-decoration:underline}
.topbar{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;height:52px;padding:0 22px;background:rgba(251,251,253,.85);backdrop-filter:saturate(180%) blur(20px)}
.brand{display:flex;align-items:center;gap:9px;font-weight:600;font-size:19px;color:var(--text)} .brand .logo{width:28px;height:28px;border-radius:8px;background:var(--text);display:grid;place-items:center;color:#fff;font-size:.8rem} .brand em{font-style:normal;color:var(--text-2)}
.btn{background:var(--blue);color:#fff;padding:8px 16px;border-radius:980px;font-size:14px}
.wrap{width:min(980px,88%);margin:0 auto} .hero{background:var(--bg-alt);padding:56px 0 40px}
h1{font-size:clamp(34px,5vw,56px);letter-spacing:-.02em;margin-bottom:12px} .lede{color:var(--text-2);font-size:19px;max-width:70ch}
main{padding:40px 0 80px;display:grid;gap:28px} .v{background:var(--bg-alt);border-radius:var(--radius);padding:26px}
h2{font-size:28px;letter-spacing:-.01em;margin-bottom:8px} p{color:var(--text-2);margin:6px 0}
ul{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;margin-top:12px}
li a{display:block;background:#fff;padding:12px 14px;border-radius:12px;color:var(--text);font-size:15px}
footer{text-align:center;color:var(--text-2);font-size:13px;padding:30px 0;background:var(--bg-alt)}
</style></head><body>
<header class="topbar"><a class="brand" href="/index.html"><span class="logo">🔧</span><span>Top Shield<em>.home</em></span></a><a class="btn" href="/index.html">Chat with AI</a></header>
<section class="hero"><div class="wrap"><h1>Home How-To Guides for ${YEAR}</h1><p class="lede">Practical, step-by-step guides across ${verticalData.length} home service categories — ${verticalData.reduce((a,v)=>a+v.pages.length,0)} guides to help you troubleshoot, maintain, and know when to call a pro.</p></div></section>
<main class="wrap">${sections}</main>
<footer><div class="wrap">© ${YEAR} FixIt.ai · <a href="/index.html">Home</a></div></footer>
</body></html>`;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const verticalData = [];
  let totalPages = 0;
  for (const v of verticals) {
    const dir = path.join(OUT, v.slug);
    fs.mkdirSync(dir, { recursive: true });
    const topics = v.topics.slice(0, 65);
    const pages = topics.map((t, i) => {
      const rawTitle = t.startsWith('How to') ? t : `How to ${t}`;
      const slug = slugify(rawTitle);
      const title = `${cap(rawTitle)} (${YEAR} Guide)`;
      const html = renderPage(v, t, i + 1, topics.length);
      fs.writeFileSync(path.join(dir, slug + '.html'), html, 'utf8');
      return { slug, title };
    });
    fs.writeFileSync(path.join(dir, 'index.html'), renderVerticalIndex(v, pages), 'utf8');
    verticalData.push({ ...v, pages });
    totalPages += pages.length;
    console.log(v.slug, pages.length);
  }
  fs.writeFileSync(path.join(OUT, 'index.html'), renderHub(verticalData), 'utf8');

  // Sitemap + robots so search engines can discover and index every page.
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    `${BASE}/`,
    `${BASE}/chat.html`,
    `${BASE}/privacy.html`,
    `${BASE}/terms.html`,
    `${BASE}/guides/index.html`,
  ];
  for (const v of verticalData) {
    urls.push(`${BASE}/guides/${v.slug}/index.html`);
    for (const p of v.pages) urls.push(`${BASE}/guides/${v.slug}/${p.slug}.html`);
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');
  console.log('sitemap:', urls.length, 'urls -> sitemap.xml, robots.txt written');
  console.log('TOTAL', totalPages, 'pages in', verticalData.length, 'verticals');
}
main();
