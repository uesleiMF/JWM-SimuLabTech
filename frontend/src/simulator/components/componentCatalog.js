import {
  Battery,
  CircleDot,
  Lightbulb,
  Minus,
  Power,
  Zap,
} from "lucide-react";

import { COMPONENT_TYPES } from "./componentTypes";

export const componentCatalog = [
  {
    id: COMPONENT_TYPES.SOURCE,
    name: "Fonte DC",
    description: "Fonte de tensão contínua",
    category: "fontes",
    icon: Battery,
    color: "#2563eb",
    defaultValue: 12,
    unit: "V",
  },

  {
    id: COMPONENT_TYPES.RESISTOR,
    name: "Resistor",
    description: "Resistência elétrica",
    category: "passivos",
    icon: Minus,
    color: "#f59e0b",
    defaultValue: 50,
    unit: "Ω",
  },

  {
    id: COMPONENT_TYPES.CAPACITOR,
    name: "Capacitor",
    description: "Armazena energia no campo elétrico",
    category: "passivos",
    icon: CircleDot,
    color: "#06b6d4",
    defaultValue: 100,
    unit: "µF",
  },

  {
    id: COMPONENT_TYPES.INDUCTOR,
    name: "Indutor",
    description: "Armazena energia no campo magnético",
    category: "passivos",
    icon: Zap,
    color: "#8b5cf6",
    defaultValue: 100,
    unit: "mH",
  },

  {
    id: COMPONENT_TYPES.SWITCH,
    name: "Interruptor",
    description: "Controla a passagem de corrente",
    category: "controle",
    icon: Power,
    color: "#16a34a",
    defaultValue: false,
    unit: "",
  },

  {
    id: COMPONENT_TYPES.LAMP,
    name: "Lâmpada",
    description: "Carga luminosa",
    category: "cargas",
    icon: Lightbulb,
    color: "#eab308",
    defaultValue: false,
    unit: "",
  },

  {
    id: COMPONENT_TYPES.MOTOR,
    name: "Motor DC",
    description: "Motor elétrico de corrente contínua",
    category: "cargas",
    icon: Zap,
    color: "#7c3aed",
    defaultValue: false,
    unit: "",
  },

  {
    id: COMPONENT_TYPES.LED,
    name: "LED",
    description: "Diodo emissor de luz",
    category: "semicondutores",
    icon: CircleDot,
    color: "#ef4444",
    defaultValue: false,
    unit: "",
  },
];

export function getComponentById(id) {
  return componentCatalog.find(
    (component) => component.id === id
  );
}