// Exports the ventilator knowledge base to JSON for embedding in the
// offline single-file app (scripts/kb_export.json).
import { VENT_MODES } from "../src/lib/ventilator/modes";
import { PATIENT_SCENARIOS } from "../src/lib/ventilator/scenarios";
import { ARDSNET_LOW_PEEP, ARDSNET_HIGH_PEEP } from "../src/lib/ventilator/calculators";
import {
  VENT_ALARMS, DOPE_STEPS, VAP_BUNDLE, RASS_SCALE, CPOT_SCALE, BERLIN_ARDS,
  MURRAY_LIS, ABG_NORMALS, OXYGEN_DEVICES, PEDIATRIC_TABLE, PEDS_FORMULAS,
  INFUSION_DRUGS, SETUP_STEPS, PRONE_PROTOCOL, ECMO_CRITERIA, SBT_PROTOCOL,
  EXTUBATION_CHECK, EQUATIONS, TAXONOMY, HUMIDIFICATION, CIRCUIT_CARE, NORMAL_RANGES,
} from "../src/lib/ventilator/reference";
import { DEFAULT_SETTINGS, PATHOLOGY_PRESETS, ASYNCHRONY_PATTERNS } from "../src/lib/ventilator/waveforms";
import { QUICK_QUESTIONS } from "../src/lib/ventilator/ai-engine";
import { writeFileSync } from "fs";

const kb = {
  modes: VENT_MODES,
  scenarios: PATIENT_SCENARIOS,
  ardsnetLow: ARDSNET_LOW_PEEP,
  ardsnetHigh: ARDSNET_HIGH_PEEP,
  reference: {
    VENT_ALARMS, DOPE_STEPS, VAP_BUNDLE, RASS_SCALE, CPOT_SCALE, BERLIN_ARDS,
    MURRAY_LIS, ABG_NORMALS, OXYGEN_DEVICES, PEDIATRIC_TABLE, PEDS_FORMULAS,
    INFUSION_DRUGS, SETUP_STEPS, PRONE_PROTOCOL, ECMO_CRITERIA, SBT_PROTOCOL,
    EXTUBATION_CHECK, EQUATIONS, TAXONOMY, HUMIDIFICATION, CIRCUIT_CARE, NORMAL_RANGES,
  },
  sim: { DEFAULT_SETTINGS, PATHOLOGY_PRESETS, ASYNCHRONY_PATTERNS },
  quickQuestions: QUICK_QUESTIONS,
};

writeFileSync("/home/z/my-project/scripts/kb_export.json", JSON.stringify(kb, null, 1));
console.log("KB exported:", {
  modes: VENT_MODES.length,
  scenarios: PATIENT_SCENARIOS.length,
  alarms: VENT_ALARMS.length,
  equations: EQUATIONS.length,
  asynchrony: ASYNCHRONY_PATTERNS.length,
  quickQuestions: QUICK_QUESTIONS.length,
});
