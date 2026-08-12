window.CODE_JOBS = [
  {
    id: "deck-repair",
    name: "Repair or modify a deck",
    scope: "core",
    scopeLabel: "Core handyman / carpentry",
    scopeNote: "Code, permit, structural-load, and local AHJ checks can still apply.",
    matchGroups: [["deck", "porch"], ["repair", "replace", "build", "modify", "ledger", "joist", "beam"]],
    ruleIds: ["deck-beam-bearing", "deck-joist-span", "deck-joist-cantilever", "deck-ledger-basics", "deck-ledger-fasteners", "deck-ledger-flashing", "deck-lateral-connection", "deck-footing-frost", "guards-required", "guards-height-openings"]
  },
  {
    id: "stairs-repair",
    name: "Build or repair stairs",
    scope: "core",
    scopeLabel: "Core handyman / carpentry",
    scopeNote: "Structural changes and permit requirements should be checked with the local AHJ.",
    matchGroups: [["stair", "stairs", "steps", "staircase"], ["repair", "replace", "build", "install", "rebuild"]],
    ruleIds: ["stairs-width", "stairs-headroom", "stairs-riser", "stairs-tread", "stairs-nosing", "stairs-landings", "stairs-handrail-required", "stairs-handrail-height", "guards-required", "guards-height-openings"]
  },
  {
    id: "guard-handrail",
    name: "Install or repair a guard / handrail",
    scope: "core",
    scopeLabel: "Core handyman / carpentry",
    scopeNote: "Confirm attachment and structural adequacy, especially on elevated decks and stairs.",
    matchGroups: [["guard", "railing", "handrail", "baluster"], ["install", "repair", "replace", "build"]],
    ruleIds: ["stairs-handrail-required", "stairs-handrail-height", "guards-required", "guards-height-openings"]
  },
  {
    id: "joist-hole",
    name: "Drill a floor joist",
    scope: "core",
    scopeLabel: "Core handyman / framing",
    scopeNote: "Engineered joists and LVLs must follow manufacturer or engineered instructions instead of sawn-lumber rules.",
    matchGroups: [["joist"], ["drill", "hole", "bore", "boring"]],
    ruleIds: ["struct-joist-holes", "struct-engineered-cuts"]
  },
  {
    id: "joist-notch",
    name: "Notch a floor joist",
    scope: "core",
    scopeLabel: "Core handyman / framing",
    scopeNote: "Engineered joists and LVLs require manufacturer or engineered guidance.",
    matchGroups: [["joist"], ["notch", "cut"]],
    ruleIds: ["struct-joist-notches", "struct-engineered-cuts"]
  },
  {
    id: "stud-hole-notch",
    name: "Drill or notch a wall stud",
    scope: "core",
    scopeLabel: "Core handyman / framing",
    scopeNote: "Bearing versus nonbearing conditions change allowable cuts and holes.",
    matchGroups: [["stud", "wall framing"], ["drill", "hole", "bore", "notch", "cut"]],
    ruleIds: ["struct-bearing-stud-notch", "struct-nonbearing-stud-notch", "struct-stud-holes", "struct-top-plate-cut"]
  },
  {
    id: "garage-drywall",
    name: "Repair garage drywall / separation",
    scope: "core",
    scopeLabel: "Core handyman / drywall",
    scopeNote: "Do not reduce a required garage-to-dwelling separation assembly when patching or replacing gypsum.",
    matchGroups: [["garage"], ["drywall", "gypsum", "sheetrock", "patch", "ceiling"]],
    ruleIds: ["fire-garage-separation", "fire-garage-door"]
  },
  {
    id: "replace-toilet",
    name: "Replace a toilet",
    scope: "incidental",
    scopeLabel: "Minor / incidental plumbing — verify scope",
    scopeNote: "NH rules provide an exemption for a property owner or owner's agent making incidental plumbing installations, repairs, or replacements to the owner's property; code, permit, and inspection requirements still apply.",
    matchGroups: [["toilet", "water closet"], ["replace", "swap", "install", "reset"]],
    ruleIds: ["plumb-fixture-clearance"]
  },
  {
    id: "replace-ptrap",
    name: "Replace a sink trap / slip-joint drain",
    scope: "incidental",
    scopeLabel: "Minor / incidental plumbing — verify scope",
    scopeNote: "Treat this as incidental repair/replacement only; broader drainage or vent-system changes should go to a licensed plumber.",
    matchGroups: [["p-trap", "ptrap", "trap", "sink drain", "slip joint"], ["replace", "repair", "install", "leak"]],
    ruleIds: ["plumb-slip-joints", "plumb-trap-seal", "plumb-drain-slope"]
  },
  {
    id: "replace-bath-receptacle",
    name: "Replace a bathroom receptacle",
    scope: "incidental",
    scopeLabel: "Minor / incidental electrical — verify scope",
    scopeNote: "NH exempts some incidental electrical work done during miscellaneous manual-labor jobs, but electrical installations for compensation are otherwise licensed. Keep this to genuinely minor replacement work and verify the local interpretation before offering it.",
    matchGroups: [["outlet", "receptacle", "plug"], ["bathroom", "bath", "vanity"], ["replace", "swap", "change"]],
    ruleIds: ["elec-gfci-bath", "elec-bath-receptacle-location", "elec-bath-circuit", "elec-tamper-resistant"]
  },
  {
    id: "replace-kitchen-receptacle",
    name: "Replace a kitchen receptacle",
    scope: "incidental",
    scopeLabel: "Minor / incidental electrical — verify scope",
    scopeNote: "Keep the work to a genuinely minor replacement; new wiring, circuit design, or load calculations should be referred to a licensed electrician.",
    matchGroups: [["outlet", "receptacle", "plug"], ["kitchen", "countertop"], ["replace", "swap", "change"]],
    ruleIds: ["elec-gfci-kitchen-laundry", "elec-countertop-spacing", "elec-tamper-resistant", "elec-kitchen-small-appliance"]
  },
  {
    id: "replace-garage-outdoor-receptacle",
    name: "Replace a garage or outdoor receptacle",
    scope: "incidental",
    scopeLabel: "Minor / incidental electrical — verify scope",
    scopeNote: "Replacement may be incidental; new wiring or circuit work should be referred to a licensed electrician.",
    matchGroups: [["outlet", "receptacle", "plug"], ["garage", "outdoor", "outside", "exterior"], ["replace", "swap", "change"]],
    ruleIds: ["elec-gfci-garage-outdoor", "elec-tamper-resistant"]
  },
  {
    id: "new-receptacle",
    name: "Add a new receptacle / outlet",
    scope: "referral",
    scopeLabel: "Licensed-electrician referral",
    scopeNote: "A new outlet commonly involves an electrical installation rather than incidental replacement work. Treat this as licensed-trade work unless a qualified NH authority confirms a specific exemption applies.",
    matchGroups: [["outlet", "receptacle", "plug"], ["add", "new", "install", "run"]],
    ruleIds: ["elec-receptacle-spacing", "elec-tamper-resistant", "elec-nh-afci"]
  },
  {
    id: "water-heater-work",
    name: "Install or replace a water heater",
    scope: "referral",
    scopeLabel: "Licensed-plumber / mechanical-trade referral",
    scopeNote: "Water-heater work can involve plumbing, fuel gas, venting, electrical, and safety requirements. Refer unless you hold the applicable NH license(s).",
    matchGroups: [["water heater", "hot water tank"], ["install", "replace", "repair", "change"]],
    ruleIds: ["plumb-tpr-discharge", "plumb-water-heater-pan"]
  },
  {
    id: "shower-valve-work",
    name: "Install or replace a shower valve",
    scope: "referral",
    scopeLabel: "Licensed-plumber referral",
    scopeNote: "Changing a shower control valve modifies the plumbing system and should be treated as licensed plumbing work unless a specific exemption is confirmed.",
    matchGroups: [["shower valve", "mixing valve", "tub valve"], ["install", "replace", "repair", "change"]],
    ruleIds: ["plumb-shower-temp"]
  }
];
