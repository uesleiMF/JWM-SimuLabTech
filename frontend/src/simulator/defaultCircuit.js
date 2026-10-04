import { COMPONENT_TYPES } from "./components/componentTypes";


/* ==================================================
   CIRCUITO PADRÃO DO LABORATÓRIO
================================================== */

export const defaultCircuit = {
  id: "circuito-padrao",

  name: "Circuito de Laboratório",

  description:
    "Circuito DC com fonte, interruptor, resistor, lâmpada, motor e LED.",


  /* ==================================================
     COMPONENTES
  ================================================== */

  components: [
    {
      id: "source-1",

      type: COMPONENT_TYPES.SOURCE,

      name: "Fonte DC",

      value: 12,

      unit: "V",

      enabled: true,

      position: {
        x: 30,
        y: 190,
      },
    },

    {
      id: "switch-1",

      type: COMPONENT_TYPES.SWITCH,

      name: "Interruptor",

      value: false,

      enabled: true,

      position: {
        x: 200,
        y: 190,
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
        x: 370,
        y: 190,
      },
    },

    {
      id: "lamp-1",

      type: COMPONENT_TYPES.LAMP,

      name: "Lâmpada",

      value: false,

      enabled: true,

      position: {
        x: 560,
        y: 50,
      },
    },

    {
      id: "motor-1",

      type: COMPONENT_TYPES.MOTOR,

      name: "Motor DC",

      value: false,

      enabled: true,

      position: {
        x: 560,
        y: 190,
      },
    },

    {
      id: "led-1",

      type: COMPONENT_TYPES.LED,

      name: "LED",

      value: false,

      enabled: true,

      position: {
        x: 560,
        y: 330,
      },
    },
  ],


  /* ==================================================
     CONEXÕES

     Topologia em paralelo após a chave:

     Fonte (+)
       │
       ▼
     Chave
       │
       ├────────► Resistor ────────┐
       │                           │
       ├────────► Lâmpada ─────────┤
       │                           │
       ├────────► Motor ───────────┤
       │                           │
       └────────► LED ─────────────┤
                                   │
                                   ▼
                             Fonte (-)

     Assim as cargas (motor, lâmpada, LED)
     funcionam mesmo sem o resistor.
  ================================================== */

  wires: [
    /* ------------------------------------------------
       FONTE → CHAVE
    ------------------------------------------------ */

    {
      id: "wire-source-switch",

      type: "electrical",

      from: {
        componentId: "source-1",
        terminalId: "positive",
      },

      to: {
        componentId: "switch-1",
        terminalId: "input",
      },

      status: "active",
    },

    /* ------------------------------------------------
       CHAVE → RESISTOR
    ------------------------------------------------ */

    {
      id: "wire-switch-resistor",

      type: "electrical",

      from: {
        componentId: "switch-1",
        terminalId: "output",
      },

      to: {
        componentId: "resistor-1",
        terminalId: "input",
      },

      status: "active",
    },

    /* ------------------------------------------------
       RESISTOR → FONTE NEGATIVA
    ------------------------------------------------ */

    {
      id: "wire-resistor-source",

      type: "electrical",

      from: {
        componentId: "resistor-1",
        terminalId: "output",
      },

      to: {
        componentId: "source-1",
        terminalId: "negative",
      },

      status: "active",
    },

    /* ------------------------------------------------
       CHAVE → LÂMPADA
    ------------------------------------------------ */

    {
      id: "wire-switch-lamp",

      type: "electrical",

      from: {
        componentId: "switch-1",
        terminalId: "output",
      },

      to: {
        componentId: "lamp-1",
        terminalId: "input",
      },

      status: "active",
    },

    /* ------------------------------------------------
       LÂMPADA → FONTE NEGATIVA
    ------------------------------------------------ */

    {
      id: "wire-lamp-source",

      type: "electrical",

      from: {
        componentId: "lamp-1",
        terminalId: "output",
      },

      to: {
        componentId: "source-1",
        terminalId: "negative",
      },

      status: "active",
    },

    /* ------------------------------------------------
       CHAVE → MOTOR
    ------------------------------------------------ */

    {
      id: "wire-switch-motor",

      type: "electrical",

      from: {
        componentId: "switch-1",
        terminalId: "output",
      },

      to: {
        componentId: "motor-1",
        terminalId: "input",
      },

      status: "active",
    },

    /* ------------------------------------------------
       MOTOR → FONTE NEGATIVA
    ------------------------------------------------ */

    {
      id: "wire-motor-source",

      type: "electrical",

      from: {
        componentId: "motor-1",
        terminalId: "output",
      },

      to: {
        componentId: "source-1",
        terminalId: "negative",
      },

      status: "active",
    },

    /* ------------------------------------------------
       CHAVE → LED
    ------------------------------------------------ */

    {
      id: "wire-switch-led",

      type: "electrical",

      from: {
        componentId: "switch-1",
        terminalId: "output",
      },

      to: {
        componentId: "led-1",
        terminalId: "anode",
      },

      status: "active",
    },

    /* ------------------------------------------------
       LED → FONTE NEGATIVA
    ------------------------------------------------ */

    {
      id: "wire-led-source",

      type: "electrical",

      from: {
        componentId: "led-1",
        terminalId: "cathode",
      },

      to: {
        componentId: "source-1",
        terminalId: "negative",
      },

      status: "active",
    },
  ],


  /* ==================================================
     ESTADO INICIAL
  ================================================== */

  selectedComponent: null,

  selectedTerminal: null,

  connectionStart: null,

  isRunning: false,
};