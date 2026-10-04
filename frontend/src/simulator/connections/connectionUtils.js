import { COMPONENT_TYPES } from "../components/componentTypes";
import { TERMINAL_TYPES } from "./connectionTypes";

/**
 * Retorna os terminais disponíveis para cada tipo de componente.
 */
export function getComponentTerminals(component) {
  if (!component) {
    return [];
  }

  switch (component.type) {
    /**
     * FONTE
     */
    case COMPONENT_TYPES.SOURCE:
      return [
        {
          id: "positive",
          type: TERMINAL_TYPES.POSITIVE,
          label: "+",
          position: "left",
        },
        {
          id: "negative",
          type: TERMINAL_TYPES.NEGATIVE,
          label: "−",
          position: "right",
        },
      ];

    /**
     * RESISTOR
     */
    case COMPONENT_TYPES.RESISTOR:
      return [
        {
          id: "input",
          type: TERMINAL_TYPES.INPUT,
          label: "A",
          position: "left",
        },
        {
          id: "output",
          type: TERMINAL_TYPES.OUTPUT,
          label: "B",
          position: "right",
        },
      ];

    /**
     * INTERRUPTOR
     */
    case COMPONENT_TYPES.SWITCH:
      return [
        {
          id: "input",
          type: TERMINAL_TYPES.INPUT,
          label: "A",
          position: "left",
        },
        {
          id: "output",
          type: TERMINAL_TYPES.OUTPUT,
          label: "B",
          position: "right",
        },
      ];

    /**
     * LÂMPADA
     */
    case COMPONENT_TYPES.LAMP:
      return [
        {
          id: "input",
          type: TERMINAL_TYPES.INPUT,
          label: "A",
          position: "left",
        },
        {
          id: "output",
          type: TERMINAL_TYPES.OUTPUT,
          label: "B",
          position: "right",
        },
      ];

    /**
     * MOTOR
     */
    case COMPONENT_TYPES.MOTOR:
      return [
        {
          id: "input",
          type: TERMINAL_TYPES.INPUT,
          label: "A",
          position: "left",
        },
        {
          id: "output",
          type: TERMINAL_TYPES.OUTPUT,
          label: "B",
          position: "right",
        },
      ];

    /**
     * LED
     */
    case COMPONENT_TYPES.LED:
      return [
        {
          id: "anode",
          type: TERMINAL_TYPES.ANODE,
          label: "+",
          position: "left",
        },
        {
          id: "cathode",
          type: TERMINAL_TYPES.CATHODE,
          label: "−",
          position: "right",
        },
      ];

    /**
     * CAPACITOR
     */
    case COMPONENT_TYPES.CAPACITOR:
      return [
        {
          id: "input",
          type: TERMINAL_TYPES.INPUT,
          label: "A",
          position: "left",
        },
        {
          id: "output",
          type: TERMINAL_TYPES.OUTPUT,
          label: "B",
          position: "right",
        },
      ];

    /**
     * INDUTOR
     */
    case COMPONENT_TYPES.INDUCTOR:
      return [
        {
          id: "input",
          type: TERMINAL_TYPES.INPUT,
          label: "A",
          position: "left",
        },
        {
          id: "output",
          type: TERMINAL_TYPES.OUTPUT,
          label: "B",
          position: "right",
        },
      ];

    /**
     * PADRÃO
     */
    default:
      return [
        {
          id: "input",
          type: TERMINAL_TYPES.INPUT,
          label: "A",
          position: "left",
        },
        {
          id: "output",
          type: TERMINAL_TYPES.OUTPUT,
          label: "B",
          position: "right",
        },
      ];
  }
}

/**
 * Retorna um terminal específico de um componente.
 */
export function getComponentTerminal(component, terminalId) {
  if (!component || !terminalId) {
    return null;
  }

  const terminals = getComponentTerminals(component);

  return (
    terminals.find((terminal) => terminal.id === terminalId) || null
  );
}

/**
 * Verifica se um componente possui determinado terminal.
 */
export function hasComponentTerminal(component, terminalId) {
  return Boolean(
    getComponentTerminal(component, terminalId)
  );
}

/**
 * Cria um identificador único para um terminal.
 *
 * Exemplo:
 *
 * componentId = resistor-1
 * terminalId = input
 *
 * Resultado:
 * resistor-1:input
 */
export function createTerminalKey(componentId, terminalId) {
  if (!componentId || !terminalId) {
    return null;
  }

  return `${componentId}:${terminalId}`;
}

/**
 * Divide uma chave de terminal.
 *
 * Exemplo:
 *
 * resistor-1:input
 *
 * retorna:
 *
 * {
 *   componentId: "resistor-1",
 *   terminalId: "input"
 * }
 */
export function parseTerminalKey(terminalKey) {
  if (!terminalKey || !terminalKey.includes(":")) {
    return null;
  }

  const [componentId, terminalId] = terminalKey.split(":");

  if (!componentId || !terminalId) {
    return null;
  }

  return {
    componentId,
    terminalId,
  };
}

/**
 * Cria uma conexão elétrica.
 *
 * Uma conexão liga dois terminais.
 */
export function createElectricalConnection({
  from,
  to,
}) {
  if (!from || !to) {
    return null;
  }

  return {
    id: `connection-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,

    type: "electrical",

    from,
    to,

    status: "active",

    createdAt: Date.now(),
  };
}