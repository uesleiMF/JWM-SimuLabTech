import {
  calculateCurrent,
  calculatePower,
  roundValue,
} from "./calculations";

import { COMPONENT_TYPES } from "./components/componentTypes";

/**
 * Localiza um componente pelo tipo.
 */
export function findComponent(
  circuit,
  type
) {
  if (!circuit?.components) {
    return null;
  }

  return (
    circuit.components.find(
      (component) =>
        component.type === type
    ) || null
  );
}

/**
 * Obtém a fonte do circuito.
 */
export function getSource(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.SOURCE
  );
}

/**
 * Obtém o resistor.
 */
export function getResistor(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.RESISTOR
  );
}

/**
 * Obtém o interruptor.
 */
export function getSwitch(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.SWITCH
  );
}

/**
 * Obtém a lâmpada.
 */
export function getLamp(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.LAMP
  );
}

/**
 * Verifica se o circuito possui
 * os componentes básicos.
 */
export function isCircuitComplete(circuit) {
  const source = getSource(circuit);
  const resistor = getResistor(circuit);
  const switchComponent = getSwitch(circuit);

  return Boolean(
    source &&
      resistor &&
      switchComponent
  );
}

/**
 * Verifica se o circuito está energizado.
 */
export function isCircuitEnergized(
  circuit
) {
  if (!isCircuitComplete(circuit)) {
    return false;
  }

  const source = getSource(circuit);
  const switchComponent =
    getSwitch(circuit);

  return (
    source.enabled === true &&
    switchComponent.value === true
  );
}

/**
 * Executa a simulação.
 */
export function simulateCircuit(
  circuit
) {
  const source = getSource(circuit);
  const resistor = getResistor(circuit);

  const complete =
    isCircuitComplete(circuit);

  if (!complete) {
    return {
      complete: false,
      energized: false,
      voltage: 0,
      current: 0,
      resistance: 0,
      power: 0,
    };
  }

  const voltage =
    Number(source.value) || 0;

  const resistance =
    Number(resistor.value) || 0;

  const energized =
    isCircuitEnergized(circuit);

  if (
    !energized ||
    voltage <= 0 ||
    resistance <= 0
  ) {
    return {
      complete: true,
      energized: false,
      voltage,
      current: 0,
      resistance,
      power: 0,
    };
  }

  const current =
    calculateCurrent(
      voltage,
      resistance
    ) ?? 0;

  const power =
    calculatePower({
      voltage,
      current,
      resistance,
    }) ?? 0;

  return {
    complete: true,
    energized: true,

    voltage: roundValue(
      voltage,
      2
    ),

    current: roundValue(
      current,
      2
    ),

    resistance: roundValue(
      resistance,
      2
    ),

    power: roundValue(
      power,
      2
    ),
  };
}