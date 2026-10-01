import { COMPONENT_TYPES } from "./components/componentTypes";

export const defaultCircuit = {
  components: [
    {
      id: "source-1",
      type: COMPONENT_TYPES.SOURCE,
      name: "Fonte DC",
      value: 12,
      unit: "V",
      enabled: true,
      position: {
        x: 80,
        y: 120,
      },
    },

    {
      id: "switch-1",
      type: COMPONENT_TYPES.SWITCH,
      name: "Interruptor",
      value: true,
      unit: "",
      enabled: true,
      position: {
        x: 300,
        y: 120,
      },
    },

    {
      id: "resistor-1",
      type: COMPONENT_TYPES.RESISTOR,
      name: "Resistor",
      value: 50,
      unit: "Ω",
      enabled: true,
      position: {
        x: 520,
        y: 120,
      },
    },

    {
      id: "lamp-1",
      type: COMPONENT_TYPES.LAMP,
      name: "Lâmpada",
      value: false,
      unit: "",
      enabled: true,
      position: {
        x: 740,
        y: 120,
      },
    },
  ],

  wires: [
    {
      id: "wire-1",
      from: "source-1",
      to: "switch-1",
    },

    {
      id: "wire-2",
      from: "switch-1",
      to: "resistor-1",
    },

    {
      id: "wire-3",
      from: "resistor-1",
      to: "lamp-1",
    },

    {
      id: "wire-4",
      from: "lamp-1",
      to: "source-1",
    },
  ],

  selectedComponent: null,
};