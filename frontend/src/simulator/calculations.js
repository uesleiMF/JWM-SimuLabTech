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


// --------------------------------------------------
// CAPACITOR E INDUTOR (RC / RL)
// --------------------------------------------------

/**
 * Converte µF → Farads
 */
export function microFaradsToFarads(uF) {
  if (!isPositiveNumber(uF)) {
    return null;
  }
  return uF * 1e-6;
}

/**
 * Converte mH → Henries
 */
export function milliHenriesToHenries(mH) {
  if (!isPositiveNumber(mH)) {
    return null;
  }
  return mH * 1e-3;
}

/**
 * Constante de tempo RC
 * τ = R × C
 */
export function calculateTauRC(resistance, capacitanceFarads) {
  if (
    !isPositiveNumber(resistance) ||
    !isPositiveNumber(capacitanceFarads)
  ) {
    return null;
  }
  return resistance * capacitanceFarads;
}

/**
 * Constante de tempo RL
 * τ = L / R
 */
export function calculateTauRL(inductanceHenries, resistance) {
  if (
    !isPositiveNumber(inductanceHenries) ||
    !isPositiveNumber(resistance)
  ) {
    return null;
  }
  return inductanceHenries / resistance;
}

/**
 * Carga de capacitor
 * Vc(t) = V × (1 - e^(-t/τ))
 */
export function capacitorChargeVoltage(voltage, time, tau) {
  if (
    !isPositiveNumber(voltage) ||
    !isValidNumber(time) ||
    time < 0 ||
    !isPositiveNumber(tau)
  ) {
    return null;
  }
  return voltage * (1 - Math.exp(-time / tau));
}

/**
 * Descarga de capacitor
 * Vc(t) = V0 × e^(-t/τ)
 */
export function capacitorDischargeVoltage(initialVoltage, time, tau) {
  if (
    !isPositiveNumber(initialVoltage) ||
    !isValidNumber(time) ||
    time < 0 ||
    !isPositiveNumber(tau)
  ) {
    return null;
  }
  return initialVoltage * Math.exp(-time / tau);
}

/**
 * Corrente no indutor (crescimento)
 * IL(t) = (V/R) × (1 - e^(-t/τ))
 */
export function inductorCurrentRise(voltage, resistance, time, tau) {
  if (
    !isPositiveNumber(voltage) ||
    !isPositiveNumber(resistance) ||
    !isValidNumber(time) ||
    time < 0 ||
    !isPositiveNumber(tau)
  ) {
    return null;
  }
  const iFinal = voltage / resistance;
  return iFinal * (1 - Math.exp(-time / tau));
}

/**
 * Corrente no indutor (decrescimento)
 * IL(t) = I0 × e^(-t/τ)
 */
export function inductorCurrentDecay(initialCurrent, time, tau) {
  if (
    !isPositiveNumber(initialCurrent) ||
    !isValidNumber(time) ||
    time < 0 ||
    !isPositiveNumber(tau)
  ) {
    return null;
  }
  return initialCurrent * Math.exp(-time / tau);
}

/**
 * Nível de carga normalizado (0 → 1)
 * Após ~5τ ≈ regime permanente (99%)
 */
export function chargeLevel(time, tau) {
  if (
    !isValidNumber(time) ||
    time < 0 ||
    !isPositiveNumber(tau)
  ) {
    return 0;
  }
  const level = 1 - Math.exp(-time / tau);
  return Math.min(Math.max(level, 0), 1);
}