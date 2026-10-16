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
  COMPONENT_TYPES.FUSE_ISOLATOR,
  COMPONENT_TYPES.THERMAL_RELAY,
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

  // Fusível queimado ou proteção desarmada não conduzem
  if (
    component.burned === true ||
    component.tripped === true
  ) {
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

function getSourceModeFromCircuit(circuit) {
  const source = Array.isArray(circuit?.components)
    ? circuit.components.find(
        (c) => c?.type === COMPONENT_TYPES.SOURCE
      )
    : null;
  return String(source?.mode || "DC").toUpperCase() === "AC"
    ? "AC"
    : "DC";
}

function getSourceFrequencyFromCircuit(circuit) {
  const source = Array.isArray(circuit?.components)
    ? circuit.components.find(
        (c) => c?.type === COMPONENT_TYPES.SOURCE
      )
    : null;
  if (getSourceModeFromCircuit(circuit) !== "AC") {
    return 0;
  }
  const f = Number(source?.frequency);
  return Number.isFinite(f) && f > 0 ? f : 60;
}

function addComponentInternalConnections(
  graph,
  component,
  options = {}
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
    case COMPONENT_TYPES.BREAKER:
    case COMPONENT_TYPES.FUSE_ISOLATOR:
    case COMPONENT_TYPES.THERMAL_RELAY:
      if (isControlDeviceClosed(component)) {
        addInternalConnection(
          graph,
          componentId,
          "input",
          "output"
        );
      }
      break;

    /* Contator: contatos fechados só se bobina energizada
       (aplicado depois no buildCircuitGraph) */
    case COMPONENT_TYPES.CONTACTOR:
      break;

    /* Temporizador: contato fecha após atraso (value === true) */
    case COMPONENT_TYPES.TIMER_ON_DELAY:
      if (isSwitchClosed(component)) {
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
       * DC: curto (regime permanente).
       * AC: caminho existe; impedância XL na análise.
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
       * DC: aberto (regime permanente).
       * AC: caminho existe; impedância XC na análise.
       */
      if (options?.sourceMode === "AC") {
        addInternalConnection(
          graph,
          componentId,
          "input",
          "output"
        );
      }
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
      return ["a1", "a2", "input", "output", "aux_in", "aux_out"];

    case COMPONENT_TYPES.TIMER_ON_DELAY:
      return ["a1", "a2", "input", "output"];

    case COMPONENT_TYPES.BREAKER:
    case COMPONENT_TYPES.FUSE_ISOLATOR:
    case COMPONENT_TYPES.THERMAL_RELAY:
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
  // Usa grafo base com iteração de selo do contator
  return buildBaseGraphWithoutContactorContacts(circuit);
}

/**
 * Verifica se a bobina A1/A2 de um contator ou temporizador
 * está alimentada (caminho até a fonte).
 */
export function isCoilEnergized(
  graph,
  component,
  sourcePos,
  sourceNeg
) {
  if (!graph || !component || !sourcePos || !sourceNeg) {
    return false;
  }

  const a1 = createNodeKey(component.id, "a1");
  const a2 = createNodeKey(component.id, "a2");

  if (!a1 || !a2) {
    return false;
  }

  // Polaridade livre: A1 no + e A2 no −, ou o inverso
  const path1 =
    hasPath(graph, sourcePos, a1) &&
    hasPath(graph, a2, sourceNeg);

  const path2 =
    hasPath(graph, sourcePos, a2) &&
    hasPath(graph, a1, sourceNeg);

  return path1 || path2;
}

/**
 * Lista contatores com bobina energizada no circuito atual.
 */
export function getEnergizedContactors(circuit) {
  const components = Array.isArray(circuit?.components)
    ? circuit.components
    : [];

  const source = components.find(
    (c) => c?.type === COMPONENT_TYPES.SOURCE
  );

  if (!source || !isSourceEnabled(source)) {
    return [];
  }

  // Grafo sem fechar contatores pela bobina ainda é construído
  // dentro de buildCircuitGraph (que já fecha se bobina ok).
  // Aqui usamos um grafo "base" sem contatos do contator:
  const graph = buildBaseGraphWithoutContactorContacts(circuit);
  const sourcePos = createNodeKey(source.id, "positive");
  const sourceNeg = createNodeKey(source.id, "negative");

  return components.filter(
    (c) =>
      c?.type === COMPONENT_TYPES.CONTACTOR &&
      isComponentEnabled(c) &&
      isCoilEnergized(graph, c, sourcePos, sourceNeg)
  );
}

/**
 * Grafo apenas com fios + dispositivos de comando simples
 * (sem fechar contatos de contator pela bobina).
 * Usado para avaliar bobinas e temporizadores.
 */
function buildBaseGraphWithoutContactorContacts(circuit) {
  const graph = new Map();
  const components = Array.isArray(circuit?.components)
    ? circuit.components
    : [];

  components.forEach((component) => {
    if (!component?.id) return;
    const terminals = getComponentTerminalIds(component);
    terminals.forEach((terminalId) => {
      ensureGraphNode(
        graph,
        createNodeKey(component.id, terminalId)
      );
    });
  });

  const graphOptions = {
    sourceMode: getSourceModeFromCircuit(circuit),
    frequency: getSourceFrequencyFromCircuit(circuit),
  };

  components.forEach((component) => {
    if (component?.type === COMPONENT_TYPES.CONTACTOR) {
      return; // não fecha contatos aqui
    }
    addComponentInternalConnections(
      graph,
      component,
      graphOptions
    );
  });

  const wires = getConnections(circuit);
  wires.forEach((wire) => {
    if (!wire) return;
    if (wire.type && wire.type !== "electrical") return;
    if (wire.status && wire.status !== "active") return;
    const from = getWireNodeKey(wire.from);
    const to = getWireNodeKey(wire.to);
    if (!from || !to) return;
    addGraphConnection(graph, from, to);
  });

  // Auto-selo: se algum contator já tinha bobina alimentada
  // via caminho que inclui seu próprio auxiliar, precisamos
  // de iteração. Fazemos até 3 passes.
  const source = components.find(
    (c) => c?.type === COMPONENT_TYPES.SOURCE
  );
  if (source && isSourceEnabled(source)) {
    const sourcePos = createNodeKey(source.id, "positive");
    const sourceNeg = createNodeKey(source.id, "negative");

    for (let pass = 0; pass < 3; pass += 1) {
      let changed = false;
      components.forEach((component) => {
        if (
          component?.type !== COMPONENT_TYPES.CONTACTOR ||
          !isComponentEnabled(component)
        ) {
          return;
        }
        if (
          isCoilEnergized(
            graph,
            component,
            sourcePos,
            sourceNeg
          )
        ) {
          const before = graph.get(
            createNodeKey(component.id, "aux_in")
          );
          addInternalConnection(
            graph,
            component.id,
            "aux_in",
            "aux_out"
          );
          addInternalConnection(
            graph,
            component.id,
            "input",
            "output"
          );
          const after = graph.get(
            createNodeKey(component.id, "aux_in")
          );
          if (before?.size !== after?.size) {
            changed = true;
          }
        }
      });
      if (!changed) break;
    }
  }

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

  if (!source || loads.length === 0) {
    return false;
  }

  // Não basta haver uma fonte e uma carga no quadro:
  // pelo menos uma carga precisa estar ligada aos dois
  // polos da fonte por caminhos elétricos válidos.
  return loads.some((load) => isLoadConnected(circuit, load));
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

/**
 * Impedância de magnitude de um componente (Ω).
 * AC: inclui XC e XL; DC: resistor/cargas, indutor ~0, capacitor aberto.
 */
function getComponentImpedanceMagnitude(
  component,
  sourceMode,
  frequencyHz
) {
  if (!component || component.enabled === false) {
    return null;
  }

  const mode = sourceMode === "AC" ? "AC" : "DC";
  const f = Math.max(Number(frequencyHz) || 60, 1);
  const omega = 2 * Math.PI * f;

  switch (component.type) {
    case COMPONENT_TYPES.RESISTOR: {
      const R = Number(component.value);
      return Number.isFinite(R) && R > 0 ? R : null;
    }

    case COMPONENT_TYPES.CAPACITOR: {
      if (mode !== "AC") {
        return null; // aberto em DC
      }
      const uF = Number(component.value);
      if (!Number.isFinite(uF) || uF <= 0) {
        return null;
      }
      const C = uF * 1e-6;
      const XC = 1 / (omega * C);
      return Number.isFinite(XC) && XC > 0 ? XC : null;
    }

    case COMPONENT_TYPES.INDUCTOR: {
      const mH = Number(component.value);
      if (!Number.isFinite(mH) || mH < 0) {
        return null;
      }
      if (mode === "DC") {
        return 0.01; // quase curto
      }
      const L = mH * 1e-3;
      const XL = omega * L;
      return Number.isFinite(XL) && XL > 0 ? XL : 0.01;
    }

    case COMPONENT_TYPES.MOTOR: {
      const R = Number(component.resistance);
      return Number.isFinite(R) && R > 0 ? R : 10;
    }

    case COMPONENT_TYPES.LAMP:
    case COMPONENT_TYPES.INDICATOR: {
      const R = Number(component.resistance);
      return Number.isFinite(R) && R > 0 ? R : 20;
    }

    case COMPONENT_TYPES.LED: {
      // Modelo educativo: conduz em AC e DC (magnitude)
      const R = Number(component.resistance);
      return Number.isFinite(R) && R > 0 ? R : 100;
    }

    default:
      return null;
  }
}

function getEffectiveResistance(circuit) {
  const sourceMode = getSourceModeFromCircuit(circuit);
  const frequency = getSourceFrequencyFromCircuit(circuit);
  const components = Array.isArray(circuit?.components)
    ? circuit.components
    : [];

  const magnitudes = [];

  // Resistor / capacitor / indutor no quadro
  components.forEach((comp) => {
    if (
      ![
        COMPONENT_TYPES.RESISTOR,
        COMPONENT_TYPES.CAPACITOR,
        COMPONENT_TYPES.INDUCTOR,
      ].includes(comp?.type)
    ) {
      return;
    }
    // Capacitor em DC não entra
    if (
      comp.type === COMPONENT_TYPES.CAPACITOR &&
      sourceMode !== "AC"
    ) {
      return;
    }
    // Só conta se houver caminho (carga/passivo energizável)
    const z = getComponentImpedanceMagnitude(
      comp,
      sourceMode,
      frequency
    );
    if (z != null && z > 0) {
      // Resistor sempre conta se presente; C/L se no circuito fechado
      if (comp.type === COMPONENT_TYPES.RESISTOR) {
        magnitudes.push(z);
      } else if (
        isLoadEnergized(circuit, comp) ||
        hasClosedCircuit(circuit)
      ) {
        magnitudes.push(z);
      }
    }
  });

  // Cargas energizadas
  const connectedLoads = getLoads(circuit).filter(
    (load) => isLoadEnergized(circuit, load)
  );

  connectedLoads.forEach((load) => {
    const z = getComponentImpedanceMagnitude(
      load,
      sourceMode,
      frequency
    );
    if (z != null && z > 0) {
      magnitudes.push(z);
    }
  });

  // Paralelo das magnitudes (aproximação educativa)
  if (magnitudes.length > 0) {
    const inverse = magnitudes.reduce(
      (total, z) => total + 1 / z,
      0
    );
    if (inverse > 0) {
      return 1 / inverse;
    }
  }

  if (connectedLoads.some((l) => l.type === COMPONENT_TYPES.MOTOR)) {
    return 10;
  }
  if (
    connectedLoads.some(
      (l) =>
        l.type === COMPONENT_TYPES.LAMP ||
        l.type === COMPONENT_TYPES.INDICATOR
    )
  ) {
    return 20;
  }
  if (connectedLoads.some((l) => l.type === COMPONENT_TYPES.LED)) {
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

/**
 * Avalia se um componente está em sobrecarga com base
 * na corrente, potência e tensão aplicadas vs limites nominais.
 *
 * Retorna { overloaded, reasons[], current, power, voltage }
 */
export function evaluateOverload(component, {
  voltage = 0,
  current = 0,
  power = 0,
} = {}) {
  if (!component) {
    return {
      overloaded: false,
      reasons: [],
      current: 0,
      power: 0,
      voltage: 0,
    };
  }

  const V = Math.max(Number(voltage) || 0, 0);
  const I = Math.max(Number(current) || 0, 0);
  const P = Math.max(Number(power) || 0, 0);

  const maxCurrent = Number(component.maxCurrent);
  const maxPower = Number(component.maxPower);
  const maxVoltage = Number(component.maxVoltage);

  const reasons = [];

  if (
    Number.isFinite(maxCurrent) &&
    maxCurrent > 0 &&
    I > maxCurrent
  ) {
    reasons.push(
      `corrente ${I.toFixed(3)} A > limite ${maxCurrent} A`
    );
  }

  if (
    Number.isFinite(maxPower) &&
    maxPower > 0 &&
    P > maxPower
  ) {
    reasons.push(
      `potência ${P.toFixed(2)} W > limite ${maxPower} W`
    );
  }

  if (
    Number.isFinite(maxVoltage) &&
    maxVoltage > 0 &&
    V > maxVoltage
  ) {
    reasons.push(
      `tensão ${V.toFixed(2)} V > limite ${maxVoltage} V`
    );
  }

  return {
    overloaded: reasons.length > 0,
    reasons,
    current: I,
    power: P,
    voltage: V,
  };
}

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
      current: 0,
      overloaded: false,
      overloadReasons: [],
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
  const sourceMode = getSourceModeFromCircuit(circuit);
  const frequency = getSourceFrequencyFromCircuit(circuit);

  const result = {
    capacitor: null,
    inductor: null,
    sourceMode,
    frequency,
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

  // AC: XC / XL em regime senoidal
  if (sourceMode === "AC" && frequency > 0) {
    const omega = 2 * Math.PI * frequency;

    if (capacitor) {
      const uF = Math.max(Number(capacitor.value) || 0, 0);
      const C = uF * 1e-6;
      const XC =
        C > 0 && omega > 0 ? 1 / (omega * C) : null;
      result.capacitor = {
        value: uF,
        unit: "µF",
        mode: "AC",
        frequency,
        reactance: XC != null ? roundValue(XC, 3) : null,
        impedanceLabel: "XC",
        voltage: roundValue(V, 2),
        current:
          XC > 0 ? roundValue(V / XC, 4) : 0,
        note: "Capacitor em AC: XC = 1/(2πfC)",
      };
    }

    if (inductor) {
      const mH = Math.max(Number(inductor.value) || 0, 0);
      const L = mH * 1e-3;
      const XL = L > 0 ? omega * L : null;
      result.inductor = {
        value: mH,
        unit: "mH",
        mode: "AC",
        frequency,
        reactance: XL != null ? roundValue(XL, 3) : null,
        impedanceLabel: "XL",
        voltage: roundValue(V, 2),
        current:
          XL > 0 ? roundValue(V / XL, 4) : 0,
        note: "Indutor em AC: XL = 2πfL",
      };
    }

    return result;
  }

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


/* ==================================================
   DETECÇÃO DE CURTO-CIRCUITO
================================================== */

/**
 * Detecta curto quando há caminho elétrico entre os polos
 * da fonte com resistência efetiva muito baixa (< 0.05 Ω)
 * ou caminho direto sem carga/resistência significativa.
 */
export function detectShortCircuit(circuit, resistance) {
  const source = getSource(circuit);
  if (!source || !isSourceEnabled(source)) {
    return { isShort: false, reason: null };
  }

  const voltage = Number(source.value) || 0;
  if (voltage <= 0) {
    return { isShort: false, reason: null };
  }

  const R = Number(resistance);
  // Resistência muito baixa com circuito fechado = curto
  if (Number.isFinite(R) && R > 0 && R < 0.05) {
    return {
      isShort: true,
      reason: `Curto-circuito: resistência efetiva ~${R.toFixed(3)} Ω (limite < 0,05 Ω)`,
    };
  }

  // Caminho direto entre polos (sem passar por carga com R significativa)
  try {
    const graph = buildCircuitGraph(circuit);
    const pos = createNodeKey(source.id, "positive");
    const neg = createNodeKey(source.id, "negative");
    if (hasPath(graph, pos, neg)) {
      const loads = getLoads(circuit).filter((l) => isLoadEnergized(circuit, l));
      const hasResistor = (circuit.components || []).some(
        (c) =>
          c?.type === COMPONENT_TYPES.RESISTOR &&
          Number(c.value) > 0.05
      );
      // Se há caminho e nenhuma carga energizada e nenhum resistor significativo
      if (loads.length === 0 && !hasResistor) {
        // Pode ser só interruptor fechado ligando + e - via fios
        // Verifica se resistance calculada é absurda
        if (!Number.isFinite(R) || R < 0.5) {
          return {
            isShort: true,
            reason:
              "Curto-circuito: polos da fonte conectados sem carga/resistência adequada",
          };
        }
      }
    }
  } catch {
    /* ignore graph errors */
  }

  return { isShort: false, reason: null };
}

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

      shortCircuit: false,

      voltage: 0,

      current: 0,

      resistance: 0,

      power: 0,

      loads: {},

      energizedLoadIds: [],

      warnings: ["Circuito incompleto: conecte fonte e pelo menos uma carga."],

      protections: {
        trips: [],
        thermalPending: [],
        totalCurrent: 0,
        maxMotorCurrent: 0,
        voltage: 0,
      },

      coils: {},

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
  const sourceMode =
    String(source?.mode || "DC").toUpperCase() === "AC"
      ? "AC"
      : "DC";
  const sourceFrequency =
    sourceMode === "AC"
      ? Math.max(Number(source?.frequency) || 60, 1)
      : 0;

  /* ==========================================
     ESTADOS DAS CARGAS (pelo caminho elétrico)
  ========================================== */

  const loadStates = getLoadStates(circuit);
  const anyLoadOn = Object.values(loadStates).some(
    (state) => state.energized
  );

  const resistance = getEffectiveResistance(circuit);

  /* ==========================================
     CURTO-CIRCUITO
  ========================================== */

  const shortInfo = detectShortCircuit(circuit, resistance);

  /* ==========================================
     ENERGIZAÇÃO
  ========================================== */

  const energized =
    voltage > 0 &&
    anyLoadOn &&
    !shortInfo.isShort;

  /* ==========================================
     CIRCUITO ABERTO
  ========================================== */

  if (!energized) {
    return {
      complete: true,

      energized: false,

      status: "aberto",

      shortCircuit: false,

      voltage: roundValue(voltage, 2),

      current: 0,

      resistance: roundValue(
        resistance,
        2
      ),

      power: 0,

      loads: loadStates,

      energizedLoadIds: [],

      warnings: [],

      protections: {
        trips: [],
        thermalPending: [],
        totalCurrent: 0,
        maxMotorCurrent: 0,
        voltage: roundValue(voltage, 2),
      },

      coils: getCoilStates(circuit),

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
     CURTO: interrompe simulação normal
  ========================================== */

  if (shortInfo.isShort) {
    return {
      complete: true,
      energized: false,
      status: "curto",
      shortCircuit: true,
      shortReason: shortInfo.reason,
      voltage: roundValue(voltage, 2),
      current: 0,
      resistance: roundValue(Number.isFinite(resistance) ? resistance : 0, 4),
      power: 0,
      loads: loadStates,
      energizedLoadIds: [],
      protections: {
        trips: [],
        thermalPending: [],
        shortCircuit: true,
        shortReason: shortInfo.reason,
      },
      coils: getCoilStates(circuit),
      warnings: [shortInfo.reason],
      reactive: getReactiveAnalysis(circuit, resistance || 0, 0, voltage, 0),
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
     DIVISÃO DE CORRENTE ENTRE CARGAS
     (paralelo aproximado com R individuais)
  ========================================== */

  const defaultRByType = {
    [COMPONENT_TYPES.MOTOR]: 10,
    [COMPONENT_TYPES.LAMP]: 20,
    [COMPONENT_TYPES.INDICATOR]: 20,
    [COMPONENT_TYPES.LED]: 100,
  };

  const energizedLoads = Object.values(loadStates).filter(
    (s) => s.energized
  );

  // Condutâncias para rateio da corrente total
  let totalConductance = 0;
  const loadMeta = energizedLoads.map((loadState) => {
    const component = circuit.components?.find(
      (item) => item.id === loadState.id
    );
    let R = Number(component?.resistance);
    if (!Number.isFinite(R) || R <= 0) {
      R = defaultRByType[component?.type] || 20;
    }
    const G = 1 / R;
    totalConductance += G;
    return { loadState, component, R, G };
  });

  loadMeta.forEach(({ loadState, component, R, G }) => {
    // Fração da corrente total neste ramo
    const share =
      totalConductance > 0 ? G / totalConductance : 0;
    const loadCurrent =
      totalConductance > 0 ? current * share : current;

    // Tensão no ramo (aproximação: mesma V nas cargas em paralelo)
    const branchVoltage =
      Number.isFinite(R) && R > 0
        ? loadCurrent * R
        : voltage;

    const loadPower = roundValue(
      branchVoltage * loadCurrent,
      2
    );

    loadState.current = roundValue(loadCurrent, 4);
    loadState.power = loadPower;
    loadState.running =
      component?.type === COMPONENT_TYPES.MOTOR;

    const overload = evaluateOverload(component, {
      voltage: branchVoltage,
      current: loadCurrent,
      power: loadPower,
    });

    loadState.overloaded = overload.overloaded;
    loadState.overloadReasons = overload.reasons;
  });

  // Cargas não energizadas
  Object.values(loadStates).forEach((loadState) => {
    if (loadState.energized) return;
    loadState.power = 0;
    loadState.current = 0;
    loadState.running = false;
    loadState.overloaded = false;
    loadState.overloadReasons = [];
  });

  // Sobrecarga no resistor (série / equivalente)
  const resistor = getResistor(circuit);
  if (resistor && voltage > 0 && current > 0) {
    const resistorPower =
      Number.isFinite(Number(resistor.value)) &&
      Number(resistor.value) > 0
        ? roundValue(
            current * current * Number(resistor.value),
            2
          )
        : roundValue(power, 2);

    const resistorOverload = evaluateOverload(resistor, {
      voltage,
      current,
      power: resistorPower,
    });

    loadStates[`__resistor__${resistor.id}`] = {
      id: resistor.id,
      type: COMPONENT_TYPES.RESISTOR,
      energized: true,
      running: false,
      power: resistorPower,
      current: roundValue(current, 4),
      overloaded: resistorOverload.overloaded,
      overloadReasons: resistorOverload.reasons,
    };
  }

  /* ==========================================
     PROTEÇÕES: FUSÍVEL / RELÉ TÉRMICO / DISJUNTOR
  ========================================== */

  const protections = evaluateProtections(circuit, {
    totalCurrent: current,
    loadStates,
    voltage,
  });

  const coilStates = getCoilStates(circuit);

  /* ==========================================
     IDS ENERGIZADOS
  ========================================== */

  const energizedLoadIds = Object.values(loadStates)
    .filter((loadState) => loadState.energized)
    .map((loadState) => loadState.id);

  /* ==========================================
     RESULTADO FINAL
  ========================================== */

  // Coleta avisos de sobrecarga
  const warnings = [];
  Object.values(loadStates).forEach((ls) => {
    if (ls?.overloaded && Array.isArray(ls.overloadReasons)) {
      ls.overloadReasons.forEach((r) => warnings.push(r));
    }
  });
  if (Array.isArray(protections?.trips)) {
    protections.trips.forEach((t) => {
      if (t?.reason) warnings.push(t.reason);
    });
  }

  return {
    complete: true,

    energized: true,

    status: "ligado",

    shortCircuit: false,

    voltage: roundValue(voltage, 2),

    current: roundValue(current, 2),

    resistance: roundValue(resistance, 2),

    power: roundValue(power, 2),

    sourceMode,

    frequency: sourceFrequency,

    // Em AC, V e I são valores eficazes (RMS) na aproximação educativa
    voltageLabel:
      sourceMode === "AC" ? "Vrms" : "V",
    currentLabel:
      sourceMode === "AC" ? "Irms" : "A",

    loads: loadStates,

    energizedLoadIds,

    protections,

    coils: coilStates,

    warnings,

    reactive: getReactiveAnalysis(
      circuit,
      resistance,
      0,
      voltage,
      current
    ),
  };
}

/**
 * Estado das bobinas (contatores e temporizadores).
 */
export function getCoilStates(circuit) {
  const components = Array.isArray(circuit?.components)
    ? circuit.components
    : [];

  const source = components.find(
    (c) => c?.type === COMPONENT_TYPES.SOURCE
  );

  const result = {};

  if (!source || !isSourceEnabled(source)) {
    return result;
  }

  const graph = buildBaseGraphWithoutContactorContacts(circuit);
  const sourcePos = createNodeKey(source.id, "positive");
  const sourceNeg = createNodeKey(source.id, "negative");

  components.forEach((comp) => {
    if (
      comp?.type !== COMPONENT_TYPES.CONTACTOR &&
      comp?.type !== COMPONENT_TYPES.TIMER_ON_DELAY
    ) {
      return;
    }

    const coilOn = isCoilEnergized(
      graph,
      comp,
      sourcePos,
      sourceNeg
    );

    result[comp.id] = {
      id: comp.id,
      type: comp.type,
      coilEnergized: coilOn,
      // Contator: contatos seguem a bobina
      contactsClosed:
        comp.type === COMPONENT_TYPES.CONTACTOR
          ? coilOn
          : Boolean(comp.value) && coilOn,
      // Temporizador aguardando atraso
      timerPending:
        comp.type === COMPONENT_TYPES.TIMER_ON_DELAY &&
        coilOn &&
        !comp.value,
    };
  });

  return result;
}

/**
 * Avalia dispositivos de proteção e indica quais devem
 * desarmar / queimar com base na corrente medida.
 *
 * - Fusível (FUSE_ISOLATOR): queima imediatamente se I_total > maxCurrent
 * - Disjuntor (BREAKER): desarma imediatamente se I_total > maxCurrent
 * - Relé térmico (THERMAL_RELAY): entra em aquecimento se corrente do
 *   motor > maxCurrent; o desarme com atraso é aplicado na UI
 *   (campo thermalPending + delaySeconds)
 */
export function evaluateProtections(
  circuit,
  { totalCurrent = 0, loadStates = {}, voltage = 0 } = {}
) {
  const components = Array.isArray(circuit?.components)
    ? circuit.components
    : [];

  const trips = [];
  const thermalPending = [];
  const I = Math.max(Number(totalCurrent) || 0, 0);

  // Correntes de motores energizados
  const motorCurrents = Object.values(loadStates)
    .filter(
      (s) =>
        s?.energized &&
        s?.type === COMPONENT_TYPES.MOTOR
    )
    .map((s) => ({
      id: s.id,
      current: Math.max(Number(s.current) || 0, 0),
    }));

  const maxMotorCurrent =
    motorCurrents.length > 0
      ? Math.max(...motorCurrents.map((m) => m.current))
      : 0;

  components.forEach((comp) => {
    if (!comp || !isComponentEnabled(comp)) return;
    // Já desarmado / queimado
    if (comp.tripped === true || comp.burned === true) return;
    if (!isSwitchClosed(comp)) return;

    const limit = Number(comp.maxCurrent);

    if (comp.type === COMPONENT_TYPES.FUSE_ISOLATOR) {
      const tripLimit =
        Number.isFinite(limit) && limit > 0 ? limit : 6;
      if (I > tripLimit) {
        trips.push({
          id: comp.id,
          type: comp.type,
          action: "burn",
          reason: `Fusível queimou: ${I.toFixed(3)} A > ${tripLimit} A`,
          current: I,
          limit: tripLimit,
        });
      }
    }

    if (comp.type === COMPONENT_TYPES.BREAKER) {
      const tripLimit =
        Number.isFinite(limit) && limit > 0 ? limit : 10;
      if (I > tripLimit) {
        trips.push({
          id: comp.id,
          type: comp.type,
          action: "trip",
          reason: `Disjuntor desarmou: ${I.toFixed(3)} A > ${tripLimit} A`,
          current: I,
          limit: tripLimit,
        });
      }
    }

    if (comp.type === COMPONENT_TYPES.THERMAL_RELAY) {
      const tripLimit =
        Number.isFinite(limit) && limit > 0 ? limit : 1.5;
      // Prioriza corrente do motor; se não houver motor, usa corrente total
      const senseCurrent =
        maxMotorCurrent > 0 ? maxMotorCurrent : I;

      // Atraso térmico configurável (padrão 3 s)
      let delaySeconds = Number(comp.thermalDelay);
      if (!Number.isFinite(delaySeconds) || delaySeconds < 0) {
        delaySeconds = 3;
      }

      if (senseCurrent > tripLimit) {
        // Quanto maior a sobrecarga, mais rápido desarma (mín. 0,5 s)
        const overloadRatio = senseCurrent / tripLimit;
        const effectiveDelay = Math.max(
          0.5,
          delaySeconds / Math.max(overloadRatio, 1)
        );

        thermalPending.push({
          id: comp.id,
          type: comp.type,
          action: "thermal_heat",
          reason: `Relé térmico aquecendo: ${senseCurrent.toFixed(3)} A > ${tripLimit} A`,
          current: senseCurrent,
          limit: tripLimit,
          delaySeconds: effectiveDelay,
          baseDelaySeconds: delaySeconds,
          overloadRatio: roundValue(overloadRatio, 2),
        });
      }
    }
  });

  return {
    trips,
    thermalPending,
    totalCurrent: I,
    maxMotorCurrent,
    voltage: Number(voltage) || 0,
  };
}