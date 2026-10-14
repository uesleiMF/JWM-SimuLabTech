export const COMPONENT_TYPES = {
  SOURCE: "source",
  RESISTOR: "resistor",
  SWITCH: "switch",
  LAMP: "lamp",
  MOTOR: "motor",
  LED: "led",
  CAPACITOR: "capacitor",
  INDUCTOR: "inductor",
  WIRE: "wire",

  /* ==================================================
     COMANDOS ELÉTRICOS (estilo CADe SIMU)
  ================================================== */
  PUSH_BUTTON_NO: "push_button_no", // Botoeira NA (Normalmente Aberta)
  PUSH_BUTTON_NC: "push_button_nc", // Botoeira NF (Normalmente Fechada)
  CONTACTOR: "contactor",           // Contator (bobina A1/A2 + contatos)
  INDICATOR: "indicator",           // Sinalizador luminoso
  BREAKER: "breaker",               // Disjuntor
  FUSE_ISOLATOR: "fuse_isolator",   // Seccionador com fusível (FU / NH)
  THERMAL_RELAY: "thermal_relay",   // Relé térmico de sobrecarga (RT)
  TIMER_ON_DELAY: "timer_on_delay", // Relé temporizado na energização (TON)
};
