// Entry that exposes the whole ventilator engine + KB on globalThis.VAI
// so the offline single-file app (classic <script>) can use it.
import { askAI, consult, QUICK_QUESTIONS } from "../src/lib/ventilator/ai-engine";
import { VENT_MODES, getMode } from "../src/lib/ventilator/modes";
import { PATIENT_SCENARIOS, getScenario } from "../src/lib/ventilator/scenarios";
import {
  fmt, calcIBW, calcTidalVolumes, calcMinuteVentilation, calcCompliance, interpretCstat,
  calcDrivingPressure, interpretDrivingPressure, ARDSNET_LOW_PEEP, ARDSNET_HIGH_PEEP, ardsnetStep,
  calcRSBI, interpretRSBI, calcPF, interpretPF, calcOI, interpretOI, calcAlveolarGas, calcAaGradient,
  interpretAa, calcDeadSpace, interpretVdVt, calcTimeConstant, expiratoryEmptying, autoPeepRisk,
  calcMeanAirwayPressure, calcIE, calcCorrectedVt, interpretStressIndex, assessWeaning, interpretABG,
  calcInfusionRate, calcInfusionDose, calcETT, calcOxygenContent, interpretDO2, checkExpiratoryTime,
} from "../src/lib/ventilator/calculators";
import {
  VENT_ALARMS, DOPE_STEPS, VAP_BUNDLE, RASS_SCALE, CPOT_SCALE, BERLIN_ARDS, MURRAY_LIS,
  ABG_NORMALS, OXYGEN_DEVICES, PEDIATRIC_TABLE, PEDS_FORMULAS, INFUSION_DRUGS, SETUP_STEPS,
  PRONE_PROTOCOL, ECMO_CRITERIA, SBT_PROTOCOL, EXTUBATION_CHECK, EQUATIONS, TAXONOMY,
  HUMIDIFICATION, CIRCUIT_CARE, NORMAL_RANGES,
} from "../src/lib/ventilator/reference";
import { generateWaveforms, DEFAULT_SETTINGS, PATHOLOGY_PRESETS, ASYNCHRONY_PATTERNS } from "../src/lib/ventilator/waveforms";

(globalThis as any).VAI = {
  askAI, consult, QUICK_QUESTIONS,
  VENT_MODES, getMode, PATIENT_SCENARIOS, getScenario,
  calc: {
    fmt, calcIBW, calcTidalVolumes, calcMinuteVentilation, calcCompliance, interpretCstat,
    calcDrivingPressure, interpretDrivingPressure, ARDSNET_LOW_PEEP, ARDSNET_HIGH_PEEP, ardsnetStep,
    calcRSBI, interpretRSBI, calcPF, interpretPF, calcOI, interpretOI, calcAlveolarGas, calcAaGradient,
    interpretAa, calcDeadSpace, interpretVdVt, calcTimeConstant, expiratoryEmptying, autoPeepRisk,
    calcMeanAirwayPressure, calcIE, calcCorrectedVt, interpretStressIndex, assessWeaning, interpretABG,
    calcInfusionRate, calcInfusionDose, calcETT, calcOxygenContent, interpretDO2, checkExpiratoryTime,
  },
  ref: {
    VENT_ALARMS, DOPE_STEPS, VAP_BUNDLE, RASS_SCALE, CPOT_SCALE, BERLIN_ARDS, MURRAY_LIS,
    ABG_NORMALS, OXYGEN_DEVICES, PEDIATRIC_TABLE, PEDS_FORMULAS, INFUSION_DRUGS, SETUP_STEPS,
    PRONE_PROTOCOL, ECMO_CRITERIA, SBT_PROTOCOL, EXTUBATION_CHECK, EQUATIONS, TAXONOMY,
    HUMIDIFICATION, CIRCUIT_CARE, NORMAL_RANGES,
  },
  sim: { generateWaveforms, DEFAULT_SETTINGS, PATHOLOGY_PRESETS, ASYNCHRONY_PATTERNS },
};
