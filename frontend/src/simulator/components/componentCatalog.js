import {
  Battery,
  CircleDot,
  Lightbulb,
  Minus,
  Power,
  Zap,
  ToggleLeft,
  ToggleRight,
  Box,
  Circle,
  Shield,
  Flame,
  Gauge,
} from "lucide-react";

import { COMPONENT_TYPES } from "./componentTypes";

export const componentCatalog = [
  /* ==================================================
     FONTES
  ================================================== */
  {
    id: COMPONENT_TYPES.SOURCE,
    name: "Fonte AC/DC",
    description: "Fonte de tensão contínua (DC) ou alternada (AC)",
    category: "fontes",
    icon: Battery,
    color: "#2563eb",
    defaultValue: 12,
    unit: "V",
    /* Modo: "DC" | "AC" */
    defaultMode: "DC",
    defaultFrequency: 60, // Hz (usado em AC)
  },

  /* ==================================================
     PASSIVOS
  ================================================== */
  {
    id: COMPONENT_TYPES.RESISTOR,
    name: "Resistor",
    description: "Resistência elétrica (AC e DC)",
    category: "passivos",
    icon: Minus,
    color: "#f59e0b",
    defaultValue: 50,
    unit: "Ω",
    maxPower: 5,
    maxCurrent: 0.5,
  },
  {
    id: COMPONENT_TYPES.CAPACITOR,
    name: "Capacitor",
    description:
      "AC: reatância XC=1/(2πfC) | DC: aberto em regime permanente",
    category: "passivos",
    icon: CircleDot,
    color: "#06b6d4",
    defaultValue: 100,
    unit: "µF",
  },
  {
    id: COMPONENT_TYPES.INDUCTOR,
    name: "Indutor",
    description:
      "AC: reatância XL=2πfL | DC: curto em regime permanente",
    category: "passivos",
    icon: Zap,
    color: "#8b5cf6",
    defaultValue: 100,
    unit: "mH",
  },

  /* ==================================================
     CONTROLE BÁSICO
  ================================================== */
  {
    id: COMPONENT_TYPES.SWITCH,
    name: "Interruptor",
    description: "Controla a passagem de corrente (AC e DC)",
    category: "controle",
    icon: Power,
    color: "#16a34a",
    defaultValue: false,
    unit: "",
  },

  /* ==================================================
     COMANDOS ELÉTRICOS
  ================================================== */
  {
    id: COMPONENT_TYPES.PUSH_BUTTON_NO,
    name: "Botoeira NA",
    description: "Botão normalmente aberto (AC e DC)",
    category: "comandos",
    icon: ToggleLeft,
    color: "#16a34a",
    defaultValue: false,
    unit: "",
  },
  {
    id: COMPONENT_TYPES.PUSH_BUTTON_NC,
    name: "Botoeira NF",
    description: "Botão normalmente fechado (AC e DC)",
    category: "comandos",
    icon: ToggleRight,
    color: "#dc2626",
    defaultValue: true,
    unit: "",
  },
  {
    id: COMPONENT_TYPES.CONTACTOR,
    name: "Contator",
    description:
      "Bobina A1/A2 + contatos de potência e auxiliar NA (selo). AC e DC.",
    category: "comandos",
    icon: Box,
    color: "#7c3aed",
    defaultValue: false,
    unit: "",
  },
  {
    id: COMPONENT_TYPES.TIMER_ON_DELAY,
    name: "Temporizador TON",
    description:
      "Relé temporizado na energização (AC e DC). Fecha o contato após o atraso.",
    category: "comandos",
    icon: Gauge,
    color: "#0d9488",
    defaultValue: false,
    unit: "",
    thermalDelay: 3, // reutiliza campo de atraso em segundos
  },
  {
    id: COMPONENT_TYPES.BREAKER,
    name: "Disjuntor",
    description: "Proteção e seccionamento (AC e DC)",
    category: "comandos",
    icon: Shield,
    color: "#ea580c",
    defaultValue: true,
    unit: "",
    maxCurrent: 10,
  },
  {
    id: COMPONENT_TYPES.FUSE_ISOLATOR,
    name: "Seccionador FU",
    description: "Seccionador com fusível — proteção AC e DC",
    category: "comandos",
    icon: Flame,
    color: "#dc2626",
    defaultValue: true,
    unit: "",
    maxCurrent: 6,
  },
  {
    id: COMPONENT_TYPES.THERMAL_RELAY,
    name: "Relé térmico RT",
    description: "Relé térmico de sobrecarga (AC e DC)",
    category: "comandos",
    icon: Gauge,
    color: "#b45309",
    defaultValue: true,
    unit: "",
    maxCurrent: 1.5,
    thermalDelay: 3,
  },
  {
    id: COMPONENT_TYPES.INDICATOR,
    name: "Sinalizador",
    description: "Lâmpada de sinalização (AC e DC)",
    category: "comandos",
    icon: Circle,
    color: "#22c55e",
    defaultValue: false,
    unit: "",
    defaultResistance: 20,
    maxPower: 5,
    maxCurrent: 0.5,
    maxVoltage: 24,
  },

  /* ==================================================
     CARGAS
  ================================================== */
  {
    id: COMPONENT_TYPES.LAMP,
    name: "Lâmpada",
    description: "Carga luminosa (AC e DC)",
    category: "cargas",
    icon: Lightbulb,
    color: "#eab308",
    defaultValue: false,
    unit: "",
    /* Resistência e limites nominais (sobrecarga) */
    defaultResistance: 20, // Ω
    maxPower: 10,          // W
    maxCurrent: 1,         // A
    maxVoltage: 24,        // V
  },
  {
    id: COMPONENT_TYPES.MOTOR,
    name: "Motor",
    description: "Motor elétrico (modelo de carga para AC e DC)",
    category: "cargas",
    icon: Zap,
    color: "#7c3aed",
    defaultValue: false,
    unit: "",
    defaultResistance: 10, // Ω
    maxPower: 25,          // W
    maxCurrent: 2,         // A
    maxVoltage: 24,        // V
  },
  {
    id: COMPONENT_TYPES.LED,
    name: "LED",
    description:
      "Diodo emissor de luz (DC nativo; em AC modelo educativo de magnitude)",
    category: "semicondutores",
    icon: CircleDot,
    color: "#ef4444",
    defaultValue: false,
    unit: "",
    defaultResistance: 100, // Ω (com resistor série interno aproximado)
    maxPower: 0.15,         // W
    maxCurrent: 0.03,       // A (30 mA)
    maxVoltage: 5,          // V
  },
];

export function getComponentById(id) {
  return componentCatalog.find(
    (component) => component.id === id
  );
}
