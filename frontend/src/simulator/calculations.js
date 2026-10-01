/**
 * JWM SimuLabTech
 * Motor básico de cálculos elétricos
 *
 * Lei de Ohm:
 *
 * V = R × I
 * I = V / R
 * R = V / I
 *
 * Potência:
 *
 * P = V × I
 * P = I² × R
 * P = V² / R
 */

// --------------------------------------------------
// Validação
// --------------------------------------------------

function isValidNumber(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function isPositiveNumber(value) {
  return (
    isValidNumber(value) &&
    value > 0
  );
}

// --------------------------------------------------
// LEI DE OHM
// --------------------------------------------------

/**
 * Calcula a corrente.
 *
 * I = V / R
 *
 * @param {number} voltage - Tensão em volts
 * @param {number} resistance - Resistência em ohms
 * @returns {number|null}
 */
export function calculateCurrent(voltage, resistance) {
  if (
    !isPositiveNumber(voltage) ||
    !isPositiveNumber(resistance)
  ) {
    return null;
  }

  return voltage / resistance;
}

/**
 * Calcula a tensão.
 *
 * V = R × I
 *
 * @param {number} resistance - Resistência em ohms
 * @param {number} current - Corrente em amperes
 * @returns {number|null}
 */
export function calculateVoltage(resistance, current) {
  if (
    !isPositiveNumber(resistance) ||
    !isPositiveNumber(current)
  ) {
    return null;
  }

  return resistance * current;
}

/**
 * Calcula a resistência.
 *
 * R = V / I
 *
 * @param {number} voltage - Tensão em volts
 * @param {number} current - Corrente em amperes
 * @returns {number|null}
 */
export function calculateResistance(voltage, current) {
  if (
    !isPositiveNumber(voltage) ||
    !isPositiveNumber(current)
  ) {
    return null;
  }

  return voltage / current;
}

// --------------------------------------------------
// POTÊNCIA ELÉTRICA
// --------------------------------------------------

/**
 * Potência usando tensão e corrente.
 *
 * P = V × I
 *
 * @param {number} voltage - Tensão em volts
 * @param {number} current - Corrente em amperes
 * @returns {number|null}
 */
export function calculatePowerVI(voltage, current) {
  if (
    !isPositiveNumber(voltage) ||
    !isPositiveNumber(current)
  ) {
    return null;
  }

  return voltage * current;
}

/**
 * Potência usando corrente e resistência.
 *
 * P = I² × R
 *
 * @param {number} current - Corrente em amperes
 * @param {number} resistance - Resistência em ohms
 * @returns {number|null}
 */
export function calculatePowerIR(current, resistance) {
  if (
    !isPositiveNumber(current) ||
    !isPositiveNumber(resistance)
  ) {
    return null;
  }

  return current * current * resistance;
}

/**
 * Potência usando tensão e resistência.
 *
 * P = V² / R
 *
 * @param {number} voltage - Tensão em volts
 * @param {number} resistance - Resistência em ohms
 * @returns {number|null}
 */
export function calculatePowerVR(voltage, resistance) {
  if (
    !isPositiveNumber(voltage) ||
    !isPositiveNumber(resistance)
  ) {
    return null;
  }

  return (voltage * voltage) / resistance;
}

// --------------------------------------------------
// CÁLCULO COMPLETO DA LEI DE OHM
// --------------------------------------------------

/**
 * Recebe dois valores conhecidos e calcula o terceiro.
 *
 * Exemplos:
 *
 * calculateOhmLaw({
 *   voltage: 12,
 *   resistance: 50
 * })
 *
 * retorna:
 *
 * {
 *   voltage: 12,
 *   resistance: 50,
 *   current: 0.24
 * }
 */
export function calculateOhmLaw({
  voltage = null,
  current = null,
  resistance = null,
} = {}) {
  const hasVoltage = isPositiveNumber(voltage);
  const hasCurrent = isPositiveNumber(current);
  const hasResistance = isPositiveNumber(resistance);

  // V + R → calcula I
  if (
    hasVoltage &&
    hasResistance &&
    !hasCurrent
  ) {
    const calculatedCurrent =
      calculateCurrent(
        voltage,
        resistance
      );

    return {
      voltage,
      resistance,
      current: calculatedCurrent,
    };
  }

  // R + I → calcula V
  if (
    hasResistance &&
    hasCurrent &&
    !hasVoltage
  ) {
    const calculatedVoltage =
      calculateVoltage(
        resistance,
        current
      );

    return {
      voltage: calculatedVoltage,
      resistance,
      current,
    };
  }

  // V + I → calcula R
  if (
    hasVoltage &&
    hasCurrent &&
    !hasResistance
  ) {
    const calculatedResistance =
      calculateResistance(
        voltage,
        current
      );

    return {
      voltage,
      resistance: calculatedResistance,
      current,
    };
  }

  // Os três valores já foram fornecidos
  if (
    hasVoltage &&
    hasCurrent &&
    hasResistance
  ) {
    return {
      voltage,
      resistance,
      current,
    };
  }

  return null;
}

// --------------------------------------------------
// POTÊNCIA COMPLETA
// --------------------------------------------------

/**
 * Calcula potência utilizando
 * a combinação de valores disponível.
 *
 * Pode utilizar:
 *
 * P = V × I
 * P = I² × R
 * P = V² / R
 */
export function calculatePower({
  voltage = null,
  current = null,
  resistance = null,
} = {}) {
  const hasVoltage = isPositiveNumber(voltage);
  const hasCurrent = isPositiveNumber(current);
  const hasResistance = isPositiveNumber(resistance);

  // V + I
  if (
    hasVoltage &&
    hasCurrent
  ) {
    return calculatePowerVI(
      voltage,
      current
    );
  }

  // I + R
  if (
    hasCurrent &&
    hasResistance
  ) {
    return calculatePowerIR(
      current,
      resistance
    );
  }

  // V + R
  if (
    hasVoltage &&
    hasResistance
  ) {
    return calculatePowerVR(
      voltage,
      resistance
    );
  }

  return null;
}

// --------------------------------------------------
// ARREDONDAMENTO
// --------------------------------------------------

/**
 * Arredonda um número para determinada
 * quantidade de casas decimais.
 *
 * @param {number} value
 * @param {number} decimals
 */
export function roundValue(
  value,
  decimals = 2
) {
  if (!isValidNumber(value)) {
    return null;
  }

  const factor =
    10 ** decimals;

  return (
    Math.round(value * factor) /
    factor
  );
}