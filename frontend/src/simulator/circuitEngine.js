import {
  calculateCurrent,
  calculatePower,
  roundValue,
  microFaradsToFarads,
  milliHenriesToHenries,
  calculateTauRC,
  calculateTauRL,
  chargeLevel,
  capacitorChargeVoltage,
  inductorCurrentRise,
  calculateCapacitorEnergy,
  calculateInductorEnergy,
} from "./calculations";

import { COMPONENT_TYPES } from "./components/componentTypes";

/* ==================================================
   CONSTANTES
================================================== */

const CONTROL_TYPES = [
  COMPONENT_TYPES.SWITCH,
  COMPONENT_TYPES.PUSH_BUTTON_NO,
  COMPONENT_TYPES.PUSH_BUTTON_NC,
  COMPONENT_TYPES.CONTACTOR,
  COMPONENT_TYPES.BREAKER,
];

const LOAD_TYPES = [
  COMPONENT_TYPES.LAMP,
  COMPONENT_TYPES.INDICATOR,
  COMPONENT_TYPES.MOTOR,
  COMPONENT_TYPES.LED,
];

/* ==================================================
   LOCALIZAR COMPONENTE
================================================== */

export function findComponent(circuit, type) {
  if (!Array.isArray(circuit?.components)) {
    return null;
  }

  return (
    circuit.components.find(
      (component) => component?.type === type
    ) || null
  );
}

/* ==================================================
   COMPONENTES PRINCIPAIS
================================================== */

export function getSource(circuit) {
  return findComponent(circuit, COMPONENT_TYPES.SOURCE);
}

export function getResistor(circuit) {
  return findComponent(circuit, COMPONENT_TYPES.RESISTOR);
}

export function getSwitch(circuit) {
  if (!Array.isArray(circuit?.components)) {
    return null;
  }

  /*
   * Dá preferência ao interruptor convencional.
   * Se não existir, procura outro dispositivo
   * de comando compatível com o modelo atual.
   */

  return (
    circuit.components.find(
      (component) =>
        component?.type === COMPONENT_TYPES.SWITCH
    ) ||
    circuit.components.find(
      (component) =>
        CONTROL_TYPES.includes(component?.type)
    ) ||
    null
  );
}

export function getLamp(circuit) {
  return findComponent(circuit, COMPONENT_TYPES.LAMP);
}

export function getMotor(circuit) {
  return findComponent(circuit, COMPONENT_TYPES.MOTOR);
}

export function getLed(circuit) {
  return findComponent(circuit, COMPONENT_TYPES.LED);
}

export function getCapacitor(circuit) {
  return findComponent(circuit, COMPONENT_TYPES.CAPACITOR);
}

export function getInductor(circuit) {
  return findComponent(circuit, COMPONENT_TYPES.INDUCTOR);
}

/* ==================================================
   CARGAS
================================================== */

export function getLoads(circuit) {
  if (!Array.isArray(circuit?.components)) {
    return [];
  }

  return circuit.components.filter(
    (component) =>
      LOAD_TYPES.includes(component?.type)
  );
}

export function getLoad(circuit) {
  return (
    getLamp(circuit) ||
    getMotor(circuit) ||
    getLed(circuit) ||
    findComponent(circuit, COMPONENT_TYPES.INDICATOR) ||
    null
  );
}

/* ==================================================
   FIOS
================================================== */

export function getConnections(circuit) {
  return Array.isArray(circuit?.wires)
    ? circuit.wires
    : [];
}

/* ==================================================
   TERMINAIS
================================================== */

export function createNodeKey(componentId, terminalId) {
  if (
    componentId === undefined ||
    componentId === null ||
    terminalId === undefined ||
    terminalId === null ||
    componentId === "" ||
    terminalId === ""
  ) {
    return null;
  }

  return `${componentId}:${terminalId}`;
}

export function getWireNodeKey(node) {
  if (!node) {
    return null;
  }

  if (
    node.componentId !== undefined &&
    node.componentId !== null &&
    node.terminalId !== undefined &&
    node.terminalId !== null
  ) {
    return createNodeKey(
      node.componentId,
      node.terminalId
    );
  }

  if (
    typeof node === "string" &&
    node.includes(":")
  ) {
    return node;
  }

  return null;
}

/* ==================================================
   GARANTIR EXISTÊNCIA DE NÓ
================================================== */

function ensureGraphNode(graph, node) {
  if (!graph || !node) {
    return;
  }

  if (!graph.has(node)) {
    graph.set(node, new Set());
  }
}

/* ==================================================
   ADICIONAR CONEXÃO AO GRAFO
================================================== */

function addGraphConnection(graph, first, second) {
  if (
    !graph ||
    !first ||
    !second ||
    first === second
  ) {
    return;
  }

  ensureGraphNode(graph, first);
  ensureGraphNode(graph, second);

  graph.get(first).add(second);
  graph.get(second).add(first);
}

/* ==================================================
   CONEXÃO INTERNA
================================================== */

function addInternalConnection(
  graph,
  componentId,
  firstTerminal,
  secondTerminal
) {
  const first = createNodeKey(
    componentId,
    firstTerminal
  );

  const second = createNodeKey(
    componentId,
    secondTerminal
  );

  addGraphConnection(
    graph,
    first,
    second
  );
}

/* ==================================================
   REMOVER CONEXÃO DO GRAFO
================================================== */

function removeGraphConnection(
  graph,
  first,
  second
) {
  if (!graph || !first || !second) {
    return;
  }

  graph.get(first)?.delete(second);
  graph.get(second)?.delete(first);
}

/* ==================================================
   REMOVER CONEXÃO INTERNA DE COMPONENTE
================================================== */

function removeComponentInternalConnection(
  graph,
  component,
  firstTerminal,
  secondTerminal
) {
  if (!component?.id) {
    return;
  }

  const first = createNodeKey(
    component.id,
    firstTerminal
  );

  const second = createNodeKey(
    component.id,
    secondTerminal
  );

  removeGraphConnection(
    graph,
    first,
    second
  );
}

/* ==================================================
   COMPONENTE HABILITADO
================================================== */

function isComponentEnabled(component) {
  return Boolean(component) &&
    component.enabled !== false;
}

/* ==================================================
   ESTADO LÓGICO
================================================== */

function normalizeBoolean(value, fallback = false) {
  if (value === true || value === 1 || value === "1") {
    return true;
  }

  if (value === false || value === 0 || value === "0") {
    return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true" || normalized === "on") {
      return true;
    }

    if (normalized === "false" || normalized === "off") {
      return false;
    }
  }

  return fallback;
}

/* ==================================================
   INTERRUPTOR FECHADO
================================================== */

function isSwitchClosed(switchComponent) {
  if (!switchComponent) {
    return false;
  }

  return normalizeBoolean(
    switchComponent.value,
    false
  );
}

/* ==================================================
   DISPOSITIVO DE COMANDO FECHADO
================================================== */

/*
 * Neste modelo, value === true significa
 * que os terminais input e output conduzem.
 *
 * Para a botoeira normalmente fechada, o estado
 * padrão precisa ser configurado no próprio
 * componente como true quando não pressionada.
 */

function isControlDeviceClosed(component) {
  if (
    !component ||
    !CONTROL_TYPES.includes(component.type)
  ) {
    return false;
  }

  if (!isComponentEnabled(component)) {
    return false;
  }

  return isSwitchClosed(component);
}

/* ==================================================
   FONTE LIGADA
================================================== */

function isSourceEnabled(source) {
  return Boolean(source) &&
    source.enabled !== false;
}

/* ==================================================
   ADICIONAR CONEXÕES INTERNAS DOS COMPONENTES
================================================== */

function addComponentInternalConnections(
  graph,
  component
) {
  if (
    !component?.id ||
    !isComponentEnabled(component)
  ) {
    return;
  }

  const componentId = component.id;

  switch (component.type) {
    /* ==========================================
       RESISTOR
    ========================================== */

    case COMPONENT_TYPES.RESISTOR:
      addInternalConnection(
        graph,
        componentId,
        "input",
        "output"
      );
      break;

    /* ==========================================
       DISPOSITIVOS DE COMANDO
    ========================================== */

    case COMPONENT_TYPES.SWITCH:
    case COMPONENT_TYPES.PUSH_BUTTON_NO:
    case COMPONENT_TYPES.PUSH_BUTTON_NC:
    case COMPONENT_TYPES.CONTACTOR:
    case COMPONENT_TYPES.BREAKER:
      if (isControlDeviceClosed(component)) {
        addInternalConnection(
          graph,
          componentId,
          "input",
          "output"
        );
      }
      break;

    /* ==========================================
       LÂMPADA E SINALIZADOR
    ========================================== */

    case COMPONENT_TYPES.LAMP:
    case COMPONENT_TYPES.INDICATOR:
      addInternalConnection(
        graph,
        componentId,
        "input",
        "output"
      );
      break;

    /* ==========================================
       MOTOR
    ========================================== */

    case COMPONENT_TYPES.MOTOR:
      addInternalConnection(
        graph,
        componentId,
        "input",
        "output"
      );
      break;

    /* ==========================================
       LED
    ========================================== */

    case COMPONENT_TYPES.LED:
      addInternalConnection(
        graph,
        componentId,
        "anode",
        "cathode"
      );
      break;

    /* ==========================================
       INDUTOR
    ========================================== */

    case COMPONENT_TYPES.INDUCTOR:
      /*
       * Aproximação de regime permanente DC:
       * o indutor é representado como condutor.
       */
      addInternalConnection(
        graph,
        componentId,
        "input",
        "output"
      );
      break;

    /* ==========================================
       CAPACITOR
    ========================================== */

    case COMPONENT_TYPES.CAPACITOR:
      /*
       * Aproximação de regime permanente DC:
       * o capacitor é representado como circuito aberto.
       *
       * A análise transitória RC é calculada separadamente
       * por getReactiveAnalysis().
       */
      break;

    /* ==========================================
       FONTE
    ========================================== */

    case COMPONENT_TYPES.SOURCE:
      /*
       * Não conectar positivo e negativo internamente.
       */
      break;

    default:
      break;
  }
}

/* ==================================================
   TERMINAIS DE CADA COMPONENTE
================================================== */

function getComponentTerminalIds(component) {
  switch (component?.type) {
    case COMPONENT_TYPES.SOURCE:
      return ["positive", "negative"];

    case COMPONENT_TYPES.LED:
      return ["anode", "cathode"];

    case COMPONENT_TYPES.RESISTOR:
    case COMPONENT_TYPES.SWITCH:
    case COMPONENT_TYPES.PUSH_BUTTON_NO:
    case COMPONENT_TYPES.PUSH_BUTTON_NC:
    case COMPONENT_TYPES.CONTACTOR:
    case COMPONENT_TYPES.BREAKER:
    case COMPONENT_TYPES.LAMP:
    case COMPONENT_TYPES.INDICATOR:
    case COMPONENT_TYPES.MOTOR:
    case COMPONENT_TYPES.CAPACITOR:
    case COMPONENT_TYPES.INDUCTOR:
      return ["input", "output"];

    default:
      return ["input", "output"];
  }
}

/* ==================================================
   CONSTRUIR GRAFO ELÉTRICO
================================================== */

export function buildCircuitGraph(circuit) {
  const graph = new Map();

  const components = Array.isArray(circuit?.components)
    ? circuit.components
    : [];

  /*
   * 1. Criar os nós dos terminais.
   */

  components.forEach((component) => {
    if (!component?.id) {
      return;
    }

    const terminals = getComponentTerminalIds(component);

    terminals.forEach((terminalId) => {
      const node = createNodeKey(
        component.id,
        terminalId
      );

      ensureGraphNode(graph, node);
    });
  });

  /*
   * 2. Adicionar as conexões internas.
   */

  components.forEach((component) => {
    addComponentInternalConnections(
      graph,
      component
    );
  });

  /*
   * 3. Adicionar os fios elétricos.
   */

  const wires = getConnections(circuit);

  wires.forEach((wire) => {
    if (!wire) {
      return;
    }

    if (
      wire.type &&
      wire.type !== "electrical"
    ) {
      return;
    }

    if (
      wire.status &&
      wire.status !== "active"
    ) {
      return;
    }

    const from = getWireNodeKey(wire.from);
    const to = getWireNodeKey(wire.to);

    if (!from || !to) {
      return;
    }

    addGraphConnection(
      graph,
      from,
      to
    );
  });

  return graph;
}

/* ==================================================
   BUSCAR CAMINHO NO GRAFO
================================================== */

export function hasPath(graph, start, target) {
  if (
    !graph ||
    !start ||
    !target
  ) {
    return false;
  }

  if (start === target) {
    return true;
  }

  if (
    !graph.has(start) ||
    !graph.has(target)
  ) {
    return false;
  }

  const visited = new Set([start]);
  const queue = [start];

  let index = 0;

  while (index < queue.length) {
    const current = queue[index++];

    const neighbors = graph.get(current) || new Set();

    for (const neighbor of neighbors) {
      if (neighbor === target) {
        return true;
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
}

/* ==================================================
   CONEXÃO ENTRE TERMINAIS
================================================== */

export function areTerminalsConnected(
  circuit,
  first,
  second
) {
  const graph = buildCircuitGraph(circuit);

  const firstKey = getWireNodeKey(first);
  const secondKey = getWireNodeKey(second);

  return hasPath(
    graph,
    firstKey,
    secondKey
  );
}

/* ==================================================
   TERMINAL CONECTADO
================================================== */

export function isTerminalConnected(
  circuit,
  componentId,
  terminalId
) {
  const key = createNodeKey(
    componentId,
    terminalId
  );

  if (!key) {
    return false;
  }

  const graph = buildCircuitGraph(circuit);
  const neighbors = graph.get(key);

  return Boolean(
    neighbors && neighbors.size > 0
  );
}

/* ==================================================
   CIRCUITO COMPLETO
================================================== */

export function isCircuitComplete(circuit) {
  const source = getSource(circuit);
  const loads = getLoads(circuit);

  // Basta ter fonte e pelo menos uma carga.
  // O interruptor é opcional (pode ligar carga direto na fonte).
  return Boolean(source && loads.length > 0);
}

/* ==================================================
   TERMINAIS DA CARGA
================================================== */

export function getLoadTerminals(load) {
  if (!load?.id) {
    return null;
  }

  if (load.type === COMPONENT_TYPES.LED) {
    return {
      input: createNodeKey(load.id, "anode"),
      output: createNodeKey(load.id, "cathode"),
    };
  }

  if (
    load.type === COMPONENT_TYPES.LAMP ||
    load.type === COMPONENT_TYPES.INDICATOR ||
    load.type === COMPONENT_TYPES.MOTOR
  ) {
    return {
      input: createNodeKey(load.id, "input"),
      output: createNodeKey(load.id, "output"),
    };
  }

  return null;
}

/* ==================================================
   CARGA HABILITADA
================================================== */

function isLoadEnabled(load) {
  return Boolean(load) &&
    load.enabled !== false;
}

/* ==================================================
   CARGA CONECTADA À FONTE
================================================== */

export function isLoadConnected(circuit, load) {
  const source = getSource(circuit);

  if (
    !source ||
    !isLoadEnabled(load)
  ) {
    return false;
  }

  const terminals = getLoadTerminals(load);

  if (!terminals) {
    return false;
  }

  const graph = buildCircuitGraph(circuit);

  const sourcePositive = createNodeKey(
    source.id,
    "positive"
  );

  const sourceNegative = createNodeKey(
    source.id,
    "negative"
  );

  /*
   * Remover a conexão interna da própria carga
   * permite testar separadamente os dois lados.
   */

  if (load.type === COMPONENT_TYPES.LED) {
    removeComponentInternalConnection(
      graph,
      load,
      "anode",
      "cathode"
    );
  } else {
    removeComponentInternalConnection(
      graph,
      load,
      "input",
      "output"
    );
  }

  /*
   * Aceita as duas orientações de polaridade:
   * (+) → input e output → (−)
   * ou
   * (+) → output e input → (−)
   *
   * Assim o aluno não precisa adivinhar
   * qual lado do componente é "entrada".
   */

  const positiveToInput = hasPath(
    graph,
    sourcePositive,
    terminals.input
  );

  const outputToNegative = hasPath(
    graph,
    terminals.output,
    sourceNegative
  );

  const orientationA =
    positiveToInput && outputToNegative;

  if (orientationA) {
    return true;
  }

  const positiveToOutput = hasPath(
    graph,
    sourcePositive,
    terminals.output
  );

  const inputToNegative = hasPath(
    graph,
    terminals.input,
    sourceNegative
  );

  return positiveToOutput && inputToNegative;
}

/* ==================================================
   DISPOSITIVO DE COMANDO NO CAMINHO
================================================== */

export function isSwitchInCircuitPath(
  circuit,
  load
) {
  const source = getSource(circuit);
  const switchComponent = getSwitch(circuit);

  if (
    !source ||
    !switchComponent ||
    !load ||
    !isControlDeviceClosed(switchComponent)
  ) {
    return false;
  }

  const terminals = getLoadTerminals(load);

  if (!terminals) {
    return false;
  }

  const graph = buildCircuitGraph(circuit);

  const sourcePositive = createNodeKey(
    source.id,
    "positive"
  );

  const sourceNegative = createNodeKey(
    source.id,
    "negative"
  );

  const controlInput = createNodeKey(
    switchComponent.id,
    "input"
  );

  const controlOutput = createNodeKey(
    switchComponent.id,
    "output"
  );

  /*
   * Remover as conexões internas do comando e da carga
   * para verificar se os caminhos realmente passam
   * pelos dois componentes.
   */

  removeComponentInternalConnection(
    graph,
    switchComponent,
    "input",
    "output"
  );

  if (load.type === COMPONENT_TYPES.LED) {
    removeComponentInternalConnection(
      graph,
      load,
      "anode",
      "cathode"
    );
  } else {
    removeComponentInternalConnection(
      graph,
      load,
      "input",
      "output"
    );
  }

  const pathA =
    hasPath(graph, sourcePositive, controlInput) &&
    hasPath(graph, controlOutput, terminals.input) &&
    hasPath(graph, terminals.output, sourceNegative);

  const pathB =
    hasPath(graph, sourcePositive, controlOutput) &&
    hasPath(graph, controlInput, terminals.input) &&
    hasPath(graph, terminals.output, sourceNegative);

  return pathA || pathB;
}

/* ==================================================
   CARGA ENERGIZADA
================================================== */

export function isLoadEnergized(circuit, load) {
  const source = getSource(circuit);

  if (
    !source ||
    !isSourceEnabled(source) ||
    !isLoadEnabled(load)
  ) {
    return false;
  }

  const voltage = Number(source.value) || 0;

  if (voltage <= 0) {
    return false;
  }

  /*
   * A própria construção do grafo respeita o estado
   * dos interruptores, botoeiras, contatores e
   * disjuntores: um dispositivo aberto não cria
   * conexão interna entre input e output.
   *
   * Assim, a verificação do caminho elétrico considera
   * todos os dispositivos de comando presentes no circuito.
   */

  return isLoadConnected(circuit, load);
}

/* ==================================================
   CIRCUITO FECHADO
================================================== */

export function hasClosedCircuit(circuit) {
  const source = getSource(circuit);
  const loads = getLoads(circuit);

  if (
    !source ||
    loads.length === 0 ||
    !isSourceEnabled(source)
  ) {
    return false;
  }

  const voltage = Number(source.value) || 0;

  if (voltage <= 0) {
    return false;
  }

  return loads.some(
    (load) => isLoadEnergized(circuit, load)
  );
}

/* ==================================================
   CAMINHO BÁSICO
================================================== */

export function hasBasicCircuitPath(circuit) {
  return hasClosedCircuit(circuit);
}

/* ==================================================
   CIRCUITO ENERGIZADO
================================================== */

export function isCircuitEnergized(circuit) {
  if (!isCircuitComplete(circuit)) {
    return false;
  }

  const source = getSource(circuit);

  if (
    !source ||
    !isSourceEnabled(source)
  ) {
    return false;
  }

  const voltage = Number(source.value) || 0;

  if (voltage <= 0) {
    return false;
  }

  return hasClosedCircuit(circuit);
}

/* ==================================================
   RESISTÊNCIA EFETIVA
================================================== */

function getEffectiveResistance(circuit) {
  /*
   * Primeiro, utiliza o resistor explícito,
   * se houver um valor válido.
   */

  const resistor = getResistor(circuit);

  if (resistor) {
    const resistance = Number(resistor.value);

    if (
      Number.isFinite(resistance) &&
      resistance > 0
    ) {
      return resistance;
    }
  }

  /*
   * Depois, considera as resistências informadas
   * nas cargas que estão efetivamente energizadas.
   */

  const connectedLoads = getLoads(circuit).filter(
    (load) => isLoadEnergized(circuit, load)
  );

  const resistances = connectedLoads
    .map((load) => Number(load.resistance))
    .filter(
      (value) =>
        Number.isFinite(value) &&
        value > 0
    );

  /*
   * Aproximação: cargas com resistência configurada
   * são consideradas em paralelo.
   */

  if (resistances.length > 0) {
    const inverseResistance = resistances.reduce(
      (total, resistance) =>
        total + 1 / resistance,
      0
    );

    if (inverseResistance > 0) {
      return 1 / inverseResistance;
    }
  }

  const hasMotor = connectedLoads.some(
    (load) =>
      load.type === COMPONENT_TYPES.MOTOR
  );

  const hasLamp = connectedLoads.some(
    (load) =>
      load.type === COMPONENT_TYPES.LAMP ||
      load.type === COMPONENT_TYPES.INDICATOR
  );

  const hasLed = connectedLoads.some(
    (load) =>
      load.type === COMPONENT_TYPES.LED
  );

  if (hasMotor) {
    return 10;
  }

  if (hasLamp) {
    return 20;
  }

  if (hasLed) {
    return 100;
  }

  return 10;
}

/* ==================================================
   POTÊNCIA INDIVIDUAL DA CARGA
================================================== */

function getLoadPower(
  load,
  totalPower,
  totalCurrent,
  voltage
) {
  if (!load) {
    return 0;
  }

  const resistance = Number(load.resistance);

  if (
    Number.isFinite(resistance) &&
    resistance > 0 &&
    voltage > 0
  ) {
    const loadCurrent = voltage / resistance;

    return roundValue(
      voltage * loadCurrent,
      2
    );
  }

  /*
   * Sem resistência individual configurada,
   * utiliza a potência total como aproximação.
   */

  if (
    totalPower > 0 &&
    totalCurrent > 0
  ) {
    return roundValue(totalPower, 2);
  }

  return 0;
}

/* ==================================================
   ESTADOS DAS CARGAS
================================================== */

export function getLoadStates(circuit, energized = null) {
  const loads = getLoads(circuit);
  const states = {};

  loads.forEach((load) => {
    /*
     * Cada carga é avaliada pelo caminho elétrico real.
     * O parâmetro "energized" global é opcional: se for
     * explicitamente false, força desligado; caso contrário
     * usa a conectividade do grafo.
     */
    const connected =
      energized === false
        ? false
        : isLoadEnergized(circuit, load);

    states[load.id] = {
      id: load.id,
      type: load.type,
      energized: connected,

      running:
        connected &&
        load.type === COMPONENT_TYPES.MOTOR,

      power: 0,
    };
  });

  return states;
}

/* ==================================================
   IDS ENERGIZADOS
================================================== */

export function getEnergizedLoadIds(
  circuit,
  energized
) {
  const states = getLoadStates(
    circuit,
    energized
  );

  return Object.values(states)
    .filter((state) => state.energized)
    .map((state) => state.id);
}

/* ==================================================
   ANÁLISE REATIVA RC / RL
================================================== */

/**
 * Analisa o comportamento aproximado de capacitores
 * e indutores durante um intervalo de tempo.
 *
 * capacitor.value: valor em microfarads (µF).
 * inductor.value: valor em millihenries (mH).
 *
 * elapsedSeconds: tempo transcorrido em segundos.
 *
 * Observação:
 * Esta função calcula o comportamento transitório,
 * mas não altera a topologia do grafo elétrico.
 */

export function getReactiveAnalysis(
  circuit,
  resistance,
  elapsedSeconds = 0,
  voltage = 0,
  current = 0
) {
  const capacitor = getCapacitor(circuit);
  const inductor = getInductor(circuit);

  const result = {
    capacitor: null,
    inductor: null,
  };

  const R = Math.max(
    Number(resistance) || 0,
    0
  );

  const V = Math.max(
    Number(voltage) || 0,
    0
  );

  const I = Math.max(
    Number(current) || 0,
    0
  );

  const elapsed = Math.max(
    Number(elapsedSeconds) || 0,
    0
  );

  /* ==========================================
     CAPACITOR
  ========================================== */

  if (capacitor) {
    const uF = Math.max(
      Number(capacitor.value) || 0,
      0
    );

    const C = microFaradsToFarads(uF);

    const tau =
      R > 0 && C > 0
        ? calculateTauRC(R, C)
        : null;

    const level =
      tau > 0
        ? chargeLevel(elapsed, tau)
        : 0;

    const voltageAtTime =
      tau > 0
        ? capacitorChargeVoltage(
            V,
            elapsed,
            tau
          )
        : 0;

    const safeVoltage = Number.isFinite(
      Number(voltageAtTime)
    )
      ? Number(voltageAtTime)
      : 0;

    const energy =
      C > 0
        ? calculateCapacitorEnergy(
            C,
            safeVoltage
          )
        : null;

    result.capacitor = {
      id: capacitor.id,

      valueuF: uF,

      capacitanceF: C,

      tau,

      tauMs:
        tau != null
          ? roundValue(tau * 1000, 3)
          : null,

      chargeLevel: level,

      chargePercent: roundValue(
        level * 100,
        1
      ),

      voltage: roundValue(
        safeVoltage,
        3
      ),

      energyJ:
        energy != null
          ? roundValue(energy, 6)
          : null,

      referenceResistance:
        R > 0
          ? roundValue(R, 2)
          : null,

      behaviorDC: "open",

      state:
        elapsed > 0
          ? "carregando"
          : "inicial",
    };
  }

  /* ==========================================
     INDUTOR
  ========================================== */

  if (inductor) {
    const mH = Math.max(
      Number(inductor.value) || 0,
      0
    );

    const L = milliHenriesToHenries(mH);

    const tau =
      R > 0 && L > 0
        ? calculateTauRL(L, R)
        : null;

    const level =
      tau > 0
        ? chargeLevel(elapsed, tau)
        : 0;

    let currentAtTime = I;

    if (tau > 0) {
      const calculatedCurrent = inductorCurrentRise(
        V,
        R,
        elapsed,
        tau
      );

      currentAtTime =
        Number.isFinite(Number(calculatedCurrent))
          ? Number(calculatedCurrent)
          : 0;
    }

    const energy =
      L > 0
        ? calculateInductorEnergy(
            L,
            currentAtTime
          )
        : null;

    result.inductor = {
      id: inductor.id,

      valuemH: mH,

      inductanceH: L,

      tau,

      tauMs:
        tau != null
          ? roundValue(tau * 1000, 3)
          : null,

      chargeLevel: level,

      chargePercent: roundValue(
        level * 100,
        1
      ),

      current: roundValue(
        currentAtTime,
        4
      ),

      energyJ:
        energy != null
          ? roundValue(energy, 6)
          : null,

      referenceResistance:
        R > 0
          ? roundValue(R, 2)
          : null,

      behaviorDC: "short",

      state:
        elapsed > 0
          ? "energizando"
          : "inicial",
    };
  }

  return result;
}

/* ==================================================
   SIMULAR CIRCUITO
================================================== */

export function simulateCircuit(circuit) {
  const source = getSource(circuit);

  const complete = isCircuitComplete(circuit);

  /* ==========================================
     CIRCUITO INCOMPLETO
  ========================================== */

  if (!complete) {
    return {
      complete: false,

      energized: false,

      status: "incompleto",

      voltage: 0,

      current: 0,

      resistance: 0,

      power: 0,

      loads: {},

      energizedLoadIds: [],

      reactive: getReactiveAnalysis(
        circuit,
        0,
        0,
        0,
        0
      ),
    };
  }

  /* ==========================================
     VALORES DA FONTE
  ========================================== */

  const voltage = Number(source?.value) || 0;

  /* ==========================================
     ESTADOS DAS CARGAS (pelo caminho elétrico)
  ========================================== */

  const loadStates = getLoadStates(circuit);
  const anyLoadOn = Object.values(loadStates).some(
    (state) => state.energized
  );

  const resistance = getEffectiveResistance(circuit);

  /* ==========================================
     ENERGIZAÇÃO
  ========================================== */

  const energized =
    voltage > 0 &&
    anyLoadOn;

  /* ==========================================
     CIRCUITO ABERTO
  ========================================== */

  if (!energized) {
    return {
      complete: true,

      energized: false,

      status: "aberto",

      voltage: roundValue(voltage, 2),

      current: 0,

      resistance: roundValue(
        resistance,
        2
      ),

      power: 0,

      loads: loadStates,

      energizedLoadIds: [],

      reactive: getReactiveAnalysis(
        circuit,
        resistance,
        0,
        voltage,
        0
      ),
    };
  }

  /* ==========================================
     CORRENTE TOTAL
  ========================================== */

  const calculatedCurrent = calculateCurrent(
    voltage,
    resistance
  );

  const current =
    Number.isFinite(Number(calculatedCurrent))
      ? Number(calculatedCurrent)
      : 0;

  /* ==========================================
     POTÊNCIA TOTAL
  ========================================== */

  const calculatedPower = calculatePower({
    voltage,
    current,
    resistance,
  });

  const power =
    Number.isFinite(Number(calculatedPower))
      ? Number(calculatedPower)
      : 0;

  /* ==========================================
     POTÊNCIA DAS CARGAS
  ========================================== */

  Object.values(loadStates).forEach((loadState) => {
    if (!loadState.energized) {
      loadState.power = 0;
      loadState.running = false;

      return;
    }

    const component = circuit.components?.find(
      (item) => item.id === loadState.id
    );

    loadState.power = getLoadPower(
      component,
      power,
      current,
      voltage
    );

    loadState.running =
      component?.type === COMPONENT_TYPES.MOTOR &&
      loadState.energized;
  });

  /* ==========================================
     IDS ENERGIZADOS
  ========================================== */

  const energizedLoadIds = Object.values(loadStates)
    .filter((loadState) => loadState.energized)
    .map((loadState) => loadState.id);

  /* ==========================================
     RESULTADO FINAL
  ========================================== */

  return {
    complete: true,

    energized: true,

    status: "ligado",

    voltage: roundValue(voltage, 2),

    current: roundValue(current, 2),

    resistance: roundValue(resistance, 2),

    power: roundValue(power, 2),

    loads: loadStates,

    energizedLoadIds,

    reactive: getReactiveAnalysis(
      circuit,
      resistance,
      0,
      voltage,
      current
    ),
  };
}