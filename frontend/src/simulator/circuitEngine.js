import {
  calculateCurrent,
  calculatePower,
  roundValue,
  microFaradsToFarads,
  milliHenriesToHenries,
  calculateTauRC,
  calculateTauRL,
  chargeLevel,
} from "./calculations";

import { COMPONENT_TYPES } from "./components/componentTypes";


/* ==================================================
   LOCALIZAR COMPONENTE
================================================== */

export function findComponent(
  circuit,
  type
) {
  if (!Array.isArray(circuit?.components)) {
    return null;
  }

  return (
    circuit.components.find(
      (component) =>
        component?.type === type
    ) || null
  );
}


/* ==================================================
   COMPONENTES PRINCIPAIS
================================================== */

export function getSource(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.SOURCE
  );
}


export function getResistor(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.RESISTOR
  );
}


export function getSwitch(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.SWITCH
  );
}


export function getLamp(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.LAMP
  );
}


export function getMotor(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.MOTOR
  );
}


export function getLed(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.LED
  );
}


export function getCapacitor(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.CAPACITOR
  );
}


export function getInductor(circuit) {
  return findComponent(
    circuit,
    COMPONENT_TYPES.INDUCTOR
  );
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
      component?.type === COMPONENT_TYPES.LAMP ||
      component?.type === COMPONENT_TYPES.MOTOR ||
      component?.type === COMPONENT_TYPES.LED
  );
}


export function getLoad(circuit) {
  return (
    getLamp(circuit) ||
    getMotor(circuit) ||
    getLed(circuit) ||
    null
  );
}


/* ==================================================
   WIRES
================================================== */

export function getConnections(circuit) {
  return Array.isArray(circuit?.wires)
    ? circuit.wires
    : [];
}


/* ==================================================
   TERMINAIS
================================================== */

export function createNodeKey(
  componentId,
  terminalId
) {
  if (
    !componentId ||
    !terminalId
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
    node.componentId &&
    node.terminalId
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
   CONEXÃO INTERNA
================================================== */

function addInternalConnection(
  graph,
  componentId,
  firstTerminal,
  secondTerminal
) {
  const first =
    createNodeKey(
      componentId,
      firstTerminal
    );

  const second =
    createNodeKey(
      componentId,
      secondTerminal
    );

  if (
    !first ||
    !second
  ) {
    return;
  }

  if (!graph.has(first)) {
    graph.set(
      first,
      new Set()
    );
  }

  if (!graph.has(second)) {
    graph.set(
      second,
      new Set()
    );
  }

  graph
    .get(first)
    .add(second);

  graph
    .get(second)
    .add(first);
}


/* ==================================================
   REMOVER CONEXÃO DO GRAFO
================================================== */

function removeGraphConnection(
  graph,
  first,
  second
) {
  if (!graph) {
    return;
  }

  if (graph.has(first)) {
    graph
      .get(first)
      .delete(second);
  }

  if (graph.has(second)) {
    graph
      .get(second)
      .delete(first);
  }
}


/* ==================================================
   REMOVER CONEXÃO INTERNA DE UM COMPONENTE
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

  const first =
    createNodeKey(
      component.id,
      firstTerminal
    );

  const second =
    createNodeKey(
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
   COMPONENTE ESTÁ HABILITADO
================================================== */

function isComponentEnabled(
  component
) {
  return (
    Boolean(component) &&
    component.enabled !== false
  );
}


/* ==================================================
   INTERRUPTOR ESTÁ FECHADO
================================================== */

function isSwitchClosed(
  switchComponent
) {
  if (!switchComponent) {
    return false;
  }

  return (
    switchComponent.value === true ||
    switchComponent.value === "true" ||
    switchComponent.value === 1 ||
    switchComponent.value === "1"
  );
}


/* ==================================================
   FONTE ESTÁ LIGADA
================================================== */

function isSourceEnabled(
  source
) {
  if (!source) {
    return false;
  }

  /*
   * Se enabled não existir, consideramos
   * a fonte habilitada.
   *
   * Isso evita que um componente criado
   * anteriormente sem essa propriedade
   * fique inutilmente desligado.
   */
  return (
    source.enabled !== false
  );
}


/* ==================================================
   CONEXÕES INTERNAS DOS COMPONENTES
================================================== */

function addComponentInternalConnections(
  graph,
  component
) {
  if (!component?.id) {
    return;
  }

  const componentId =
    component.id;

  switch (component.type) {

    /* ==========================================
       RESISTOR
    ========================================== */

    case COMPONENT_TYPES.RESISTOR:

      if (
        isComponentEnabled(component)
      ) {
        addInternalConnection(
          graph,
          componentId,
          "input",
          "output"
        );
      }

      break;


    /* ==========================================
       INTERRUPTOR
    ========================================== */

    case COMPONENT_TYPES.SWITCH:

      /*
       * O interruptor somente conduz
       * quando está fechado.
       */

      if (
        isSwitchClosed(component) &&
        isComponentEnabled(component)
      ) {
        addInternalConnection(
          graph,
          componentId,
          "input",
          "output"
        );
      }

      break;


    /* ==========================================
       LÂMPADA
    ========================================== */

    case COMPONENT_TYPES.LAMP:

      if (
        isComponentEnabled(component)
      ) {
        addInternalConnection(
          graph,
          componentId,
          "input",
          "output"
        );
      }

      break;


    /* ==========================================
       MOTOR
    ========================================== */

    case COMPONENT_TYPES.MOTOR:

      if (
        isComponentEnabled(component)
      ) {
        addInternalConnection(
          graph,
          componentId,
          "input",
          "output"
        );
      }

      break;


    /* ==========================================
       LED
    ========================================== */

    case COMPONENT_TYPES.LED:

      if (
        isComponentEnabled(component)
      ) {
        addInternalConnection(
          graph,
          componentId,
          "anode",
          "cathode"
        );
      }

      break;


    /* ==========================================
       INDUTOR
       Em regime DC permanente comporta-se
       como curto-circuito (conduz).
    ========================================== */

    case COMPONENT_TYPES.INDUCTOR:

      if (
        isComponentEnabled(component)
      ) {
        addInternalConnection(
          graph,
          componentId,
          "input",
          "output"
        );
      }

      break;


    /* ==========================================
       CAPACITOR
       Em regime DC permanente comporta-se
       como circuito aberto (não conduz).
       Por isso NÃO adicionamos conexão interna.
    ========================================== */

    case COMPONENT_TYPES.CAPACITOR:
      break;


    /* ==========================================
       FONTE
    ========================================== */

    case COMPONENT_TYPES.SOURCE:

      /*
       * Positivo e negativo NÃO são
       * conectados internamente.
       */

      break;


    default:
      break;
  }
}


/* ==================================================
   CONSTRUIR GRAFO ELÉTRICO
================================================== */

export function buildCircuitGraph(
  circuit
) {
  const graph =
    new Map();

  const addNode = (
    node
  ) => {
    if (!node) {
      return;
    }

    if (!graph.has(node)) {
      graph.set(
        node,
        new Set()
      );
    }
  };


  const components =
    Array.isArray(
      circuit?.components
    )
      ? circuit.components
      : [];


  /* ==========================================
     ADICIONAR COMPONENTES
  ========================================== */

  components.forEach(
    (component) => {

      if (!component?.id) {
        return;
      }

      let terminals = [];


      switch (component.type) {

        case COMPONENT_TYPES.SOURCE:

          terminals = [
            "positive",
            "negative",
          ];

          break;


        case COMPONENT_TYPES.LED:

          terminals = [
            "anode",
            "cathode",
          ];

          break;


        case COMPONENT_TYPES.RESISTOR:
        case COMPONENT_TYPES.SWITCH:
        case COMPONENT_TYPES.LAMP:
        case COMPONENT_TYPES.MOTOR:

          terminals = [
            "input",
            "output",
          ];

          break;


        default:

          terminals = [
            "input",
            "output",
          ];

          break;
      }


      terminals.forEach(
        (terminalId) => {

          addNode(
            createNodeKey(
              component.id,
              terminalId
            )
          );

        }
      );


      addComponentInternalConnections(
        graph,
        component
      );

    }
  );


  /* ==========================================
     ADICIONAR FIOS
  ========================================== */

  const wires =
    getConnections(
      circuit
    );


  wires.forEach(
    (wire) => {

      if (!wire) {
        return;
      }


      /*
       * Somente conexões elétricas.
       */

      if (
        wire.type &&
        wire.type !== "electrical"
      ) {
        return;
      }


      /*
       * Somente conexões ativas.
       */

      if (
        wire.status &&
        wire.status !== "active"
      ) {
        return;
      }


      const from =
        getWireNodeKey(
          wire.from
        );


      const to =
        getWireNodeKey(
          wire.to
        );


      if (
        !from ||
        !to
      ) {
        return;
      }


      addNode(from);
      addNode(to);


      graph
        .get(from)
        .add(to);

      graph
        .get(to)
        .add(from);

    }
  );


  return graph;
}


/* ==================================================
   BUSCAR CAMINHO
================================================== */

export function hasPath(
  graph,
  start,
  target
) {
  if (
    !graph ||
    !start ||
    !target
  ) {
    return false;
  }


  if (
    start === target
  ) {
    return true;
  }


  if (
    !graph.has(start) ||
    !graph.has(target)
  ) {
    return false;
  }


  const visited =
    new Set();

  const queue = [
    start,
  ];


  visited.add(
    start
  );


  while (
    queue.length > 0
  ) {

    const current =
      queue.shift();


    const neighbors =
      graph.get(current) ||
      new Set();


    for (
      const neighbor
      of neighbors
    ) {

      if (
        neighbor === target
      ) {
        return true;
      }


      if (
        !visited.has(
          neighbor
        )
      ) {

        visited.add(
          neighbor
        );

        queue.push(
          neighbor
        );

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
  const graph =
    buildCircuitGraph(
      circuit
    );

  const firstKey =
    getWireNodeKey(
      first
    );

  const secondKey =
    getWireNodeKey(
      second
    );

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
  const key =
    createNodeKey(
      componentId,
      terminalId
    );

  if (!key) {
    return false;
  }

  const graph =
    buildCircuitGraph(
      circuit
    );

  const neighbors =
    graph.get(key);

  return Boolean(
    neighbors &&
    neighbors.size > 0
  );
}


/* ==================================================
   CIRCUITO COMPLETO
================================================== */

export function isCircuitComplete(
  circuit
) {
  const source =
    getSource(
      circuit
    );

  const switchComponent =
    getSwitch(
      circuit
    );

  const loads =
    getLoads(
      circuit
    );

  return Boolean(
    source &&
    switchComponent &&
    loads.length > 0
  );
}


/* ==================================================
   TERMINAIS DA CARGA
================================================== */

export function getLoadTerminals(
  load
) {
  if (!load?.id) {
    return null;
  }


  if (
    load.type ===
    COMPONENT_TYPES.LED
  ) {

    return {
      input:
        createNodeKey(
          load.id,
          "anode"
        ),

      output:
        createNodeKey(
          load.id,
          "cathode"
        ),
    };
  }


  if (
    load.type ===
      COMPONENT_TYPES.LAMP ||
    load.type ===
      COMPONENT_TYPES.MOTOR
  ) {

    return {
      input:
        createNodeKey(
          load.id,
          "input"
        ),

      output:
        createNodeKey(
          load.id,
          "output"
        ),
    };
  }


  return null;
}


/* ==================================================
   CARGA HABILITADA
================================================== */

function isLoadEnabled(
  load
) {
  return (
    Boolean(load) &&
    load.enabled !== false
  );
}


/* ==================================================
   CARGA CONECTADA À FONTE
================================================== */

export function isLoadConnected(
  circuit,
  load
) {
  const source =
    getSource(
      circuit
    );

  if (
    !source ||
    !isLoadEnabled(load)
  ) {
    return false;
  }


  const terminals =
    getLoadTerminals(
      load
    );

  if (!terminals) {
    return false;
  }


  const graph =
    buildCircuitGraph(
      circuit
    );


  const sourcePositive =
    createNodeKey(
      source.id,
      "positive"
    );

  const sourceNegative =
    createNodeKey(
      source.id,
      "negative"
    );


  /*
   * Retiramos temporariamente a
   * conexão interna da própria carga.
   *
   * Isso é importante porque o grafo
   * é bidirecional. Sem isso, o BFS
   * poderia atravessar a carga e
   * "enganar" a validação.
   */

  if (
    load.type ===
    COMPONENT_TYPES.LED
  ) {

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


  const positiveToInput =
    hasPath(
      graph,
      sourcePositive,
      terminals.input
    );


  const outputToNegative =
    hasPath(
      graph,
      terminals.output,
      sourceNegative
    );


  return (
    positiveToInput &&
    outputToNegative
  );
}


/* ==================================================
   INTERRUPTOR NO CAMINHO
================================================== */

export function isSwitchInCircuitPath(
  circuit,
  load
) {
  const source =
    getSource(
      circuit
    );

  const switchComponent =
    getSwitch(
      circuit
    );


  if (
    !source ||
    !switchComponent ||
    !load
  ) {
    return false;
  }


  if (
    !isSwitchClosed(
      switchComponent
    )
  ) {
    return false;
  }


  const terminals =
    getLoadTerminals(
      load
    );


  if (!terminals) {
    return false;
  }


  const graph =
    buildCircuitGraph(
      circuit
    );


  const sourcePositive =
    createNodeKey(
      source.id,
      "positive"
    );

  const sourceNegative =
    createNodeKey(
      source.id,
      "negative"
    );


  const switchInput =
    createNodeKey(
      switchComponent.id,
      "input"
    );

  const switchOutput =
    createNodeKey(
      switchComponent.id,
      "output"
    );


  /*
   * Removemos temporariamente:
   *
   * 1. a ligação interna do interruptor
   * 2. a ligação interna da carga
   *
   * Assim somos obrigados a provar
   * que o caminho passa realmente
   * pelo interruptor e pela carga.
   */

  removeComponentInternalConnection(
    graph,
    switchComponent,
    "input",
    "output"
  );


  if (
    load.type ===
    COMPONENT_TYPES.LED
  ) {

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
   * Caminho A:
   *
   * Fonte +
   *    ↓
   * Switch input
   *
   * Switch output
   *    ↓
   * Carga input
   *
   * Carga output
   *    ↓
   * Fonte -
   */

  const pathA =
    hasPath(
      graph,
      sourcePositive,
      switchInput
    ) &&
    hasPath(
      graph,
      switchOutput,
      terminals.input
    ) &&
    hasPath(
      graph,
      terminals.output,
      sourceNegative
    );


  /*
   * Caminho B:
   *
   * Fonte +
   *    ↓
   * Switch output
   *
   * Switch input
   *    ↓
   * Carga input
   *
   * Carga output
   *    ↓
   * Fonte -
   */

  const pathB =
    hasPath(
      graph,
      sourcePositive,
      switchOutput
    ) &&
    hasPath(
      graph,
      switchInput,
      terminals.input
    ) &&
    hasPath(
      graph,
      terminals.output,
      sourceNegative
    );


  return (
    pathA ||
    pathB
  );
}


/* ==================================================
   CARGA ENERGIZADA INDIVIDUALMENTE
================================================== */

export function isLoadEnergized(
  circuit,
  load
) {
  const source =
    getSource(
      circuit
    );

  const switchComponent =
    getSwitch(
      circuit
    );


  if (
    !source ||
    !switchComponent ||
    !load
  ) {
    return false;
  }


  /*
   * Fonte desligada.
   */

  if (
    !isSourceEnabled(
      source
    )
  ) {
    return false;
  }


  /*
   * Interruptor aberto.
   */

  if (
    !isSwitchClosed(
      switchComponent
    )
  ) {
    return false;
  }


  /*
   * Fonte sem tensão.
   */

  const voltage =
    Number(
      source.value
    ) || 0;


  if (
    voltage <= 0
  ) {
    return false;
  }


  /*
   * Carga desabilitada.
   */

  if (
    !isLoadEnabled(load)
  ) {
    return false;
  }


  /*
   * Primeiro verificamos se a carga
   * possui caminho elétrico até a fonte.
   */

  const connected =
    isLoadConnected(
      circuit,
      load
    );


  if (!connected) {
    return false;
  }


  /*
   * Depois verificamos se o
   * interruptor realmente participa
   * desse caminho.
   */

  const switchInPath =
    isSwitchInCircuitPath(
      circuit,
      load
    );


  if (!switchInPath) {
    return false;
  }


  return true;
}


/* ==================================================
   CIRCUITO FECHADO
================================================== */

export function hasClosedCircuit(
  circuit
) {
  const source =
    getSource(
      circuit
    );

  const switchComponent =
    getSwitch(
      circuit
    );

  const loads =
    getLoads(
      circuit
    );


  if (
    !source ||
    !switchComponent ||
    loads.length === 0
  ) {
    return false;
  }


  if (
    !isSourceEnabled(
      source
    )
  ) {
    return false;
  }


  if (
    !isSwitchClosed(
      switchComponent
    )
  ) {
    return false;
  }


  /*
   * Basta existir pelo menos uma carga
   * com caminho elétrico completo.
   */

  return loads.some(
    (load) =>
      isLoadEnergized(
        circuit,
        load
      )
  );
}


/* ==================================================
   CAMINHO BÁSICO
================================================== */

export function hasBasicCircuitPath(
  circuit
) {
  return hasClosedCircuit(
    circuit
  );
}


/* ==================================================
   CIRCUITO ENERGIZADO
================================================== */

export function isCircuitEnergized(
  circuit
) {
  if (
    !isCircuitComplete(
      circuit
    )
  ) {
    return false;
  }


  const source =
    getSource(
      circuit
    );


  if (
    !source ||
    !isSourceEnabled(
      source
    )
  ) {
    return false;
  }


  const voltage =
    Number(
      source.value
    ) || 0;


  if (
    voltage <= 0
  ) {
    return false;
  }


  return hasClosedCircuit(
    circuit
  );
}


/* ==================================================
   RESISTÊNCIA EFETIVA
================================================== */

function getEffectiveResistance(
  circuit
) {
  const resistor =
    getResistor(
      circuit
    );


  /*
   * Resistor principal.
   */

  if (resistor) {

    const resistance =
      Number(
        resistor.value
      );


    if (
      resistance > 0
    ) {
      return resistance;
    }
  }


  /*
   * Procurar resistência específica
   * nas cargas energizadas.
   */

  const loads =
    getLoads(
      circuit
    );


  const connectedLoads =
    loads.filter(
      (load) =>
        isLoadEnergized(
          circuit,
          load
        )
    );


  const resistances =
    connectedLoads
      .map(
        (load) =>
          Number(
            load.resistance
          )
      )
      .filter(
        (value) =>
          value > 0
      );


  /*
   * Resistências em paralelo.
   *
   * R equivalente =
   *
   * 1 / (1/R1 + 1/R2...)
   */

  if (
    resistances.length > 0
  ) {

    const inverseResistance =
      resistances.reduce(
        (
          total,
          resistance
        ) =>
          total +
          1 / resistance,
        0
      );


    if (
      inverseResistance > 0
    ) {

      return (
        1 /
        inverseResistance
      );

    }
  }


  /*
   * Valores padrão.
   */

  const hasMotor =
    connectedLoads.some(
      (load) =>
        load.type ===
        COMPONENT_TYPES.MOTOR
    );


  const hasLamp =
    connectedLoads.some(
      (load) =>
        load.type ===
        COMPONENT_TYPES.LAMP
    );


  const hasLed =
    connectedLoads.some(
      (load) =>
        load.type ===
        COMPONENT_TYPES.LED
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


  /*
   * Resistência explicitamente
   * definida.
   */

  const resistance =
    Number(
      load.resistance
    );


  if (
    resistance > 0 &&
    voltage > 0
  ) {

    const loadCurrent =
      voltage /
      resistance;


    return roundValue(
      voltage *
        loadCurrent,
      2
    );
  }


  /*
   * Sem resistência configurada,
   * usamos a potência total.
   */

  if (
    totalPower > 0 &&
    totalCurrent > 0
  ) {

    return roundValue(
      totalPower,
      2
    );
  }


  return 0;
}


/* ==================================================
   ESTADO DAS CARGAS
================================================== */

export function getLoadStates(
  circuit,
  energized
) {
  const loads =
    getLoads(
      circuit
    );


  const states = {};


  loads.forEach(
    (load) => {

      const connected =
        energized &&
        isLoadEnergized(
          circuit,
          load
        );


      states[load.id] = {

        id:
          load.id,

        type:
          load.type,

        energized:
          connected,

        /*
         * MOTOR
         *
         * Somente gira quando
         * realmente recebe energia.
         */

        running:
          connected &&
          load.type ===
            COMPONENT_TYPES.MOTOR,

        power:
          0,
      };

    }
  );


  return states;
}


/* ==================================================
   IDS ENERGIZADOS
================================================== */

export function getEnergizedLoadIds(
  circuit,
  energized
) {
  const states =
    getLoadStates(
      circuit,
      energized
    );


  return Object.values(
    states
  )
    .filter(
      (state) =>
        state.energized
    )
    .map(
      (state) =>
        state.id
    );
}


/* ==================================================
   SIMULAÇÃO
================================================== */


/* ==================================================
   ANÁLISE REATIVA (RC / RL)
================================================== */

/**
 * Calcula constante de tempo e nível de carga
 * para capacitor e indutor presentes no circuito.
 *
 * - Capacitor: valor em µF no component.value
 * - Indutor: valor em mH no component.value
 * - Usa a resistência efetiva do circuito
 *
 * elapsedSeconds: tempo desde que o circuito
 * foi energizado (passado pelo caller ou 0).
 */
export function getReactiveAnalysis(
  circuit,
  resistance,
  elapsedSeconds = 0
) {
  const capacitor = getCapacitor(circuit);
  const inductor = getInductor(circuit);

  const result = {
    capacitor: null,
    inductor: null,
  };

  const R = Number(resistance) || 0;

  if (capacitor) {
    const uF = Number(capacitor.value) || 0;
    const C = microFaradsToFarads(uF);
    const tau = (R > 0 && C) ? calculateTauRC(R, C) : null;
    const level = tau ? chargeLevel(elapsedSeconds, tau) : 0;

    result.capacitor = {
      id: capacitor.id,
      valueuF: uF,
      capacitanceF: C,
      tau,
      tauMs: tau != null ? roundValue(tau * 1000, 3) : null,
      chargeLevel: level,
      chargePercent: roundValue(level * 100, 1),
      // Em DC permanente: circuito aberto
      behaviorDC: "open",
    };
  }

  if (inductor) {
    const mH = Number(inductor.value) || 0;
    const L = milliHenriesToHenries(mH);
    const tau = (R > 0 && L) ? calculateTauRL(L, R) : null;
    const level = tau ? chargeLevel(elapsedSeconds, tau) : 0;

    result.inductor = {
      id: inductor.id,
      valuemH: mH,
      inductanceH: L,
      tau,
      tauMs: tau != null ? roundValue(tau * 1000, 3) : null,
      chargeLevel: level,
      chargePercent: roundValue(level * 100, 1),
      // Em DC permanente: curto-circuito
      behaviorDC: "short",
    };
  }

  return result;
}


export function simulateCircuit(
  circuit
) {
  const source =
    getSource(
      circuit
    );


  const complete =
    isCircuitComplete(
      circuit
    );


  /* ==========================================
     INCOMPLETO
  ========================================== */

  if (!complete) {

    return {

      complete: false,

      energized: false,

      status:
        "incompleto",

      voltage: 0,

      current: 0,

      resistance: 0,

      power: 0,

      loads: {},

      energizedLoadIds: [],

    };
  }


  /* ==========================================
     VALORES DA FONTE
  ========================================== */

  const voltage =
    Number(
      source?.value
    ) || 0;


  const resistance =
    getEffectiveResistance(
      circuit
    );


  /* ==========================================
     ENERGIZAÇÃO
  ========================================== */

  const energized =
    isCircuitEnergized(
      circuit
    );


  /* ==========================================
     CIRCUITO ABERTO
  ========================================== */

  if (
    !energized ||
    voltage <= 0 ||
    resistance <= 0
  ) {

    const loads =
      getLoadStates(
        circuit,
        false
      );


    return {

      complete: true,

      energized: false,

      status:
        "aberto",

      voltage:
        roundValue(
          voltage,
          2
        ),

      current: 0,

      resistance:
        roundValue(
          resistance,
          2
        ),

      power: 0,

      loads,

      energizedLoadIds: [],

    };
  }


  /* ==========================================
     CORRENTE TOTAL
  ========================================== */

  const current =
    calculateCurrent(
      voltage,
      resistance
    ) ?? 0;


  /* ==========================================
     POTÊNCIA TOTAL
  ========================================== */

  const power =
    calculatePower({
      voltage,
      current,
      resistance,
    }) ?? 0;


  /* ==========================================
     ESTADOS DAS CARGAS
  ========================================== */

  const loads =
    getLoadStates(
      circuit,
      true
    );


  /* ==========================================
     POTÊNCIA DAS CARGAS
  ========================================== */

  Object.values(
    loads
  ).forEach(
    (loadState) => {

      if (
        !loadState.energized
      ) {

        loadState.power = 0;

        return;
      }


      const component =
        circuit.components?.find(
          (item) =>
            item.id ===
            loadState.id
        );


      loadState.power =
        getLoadPower(
          component,
          power,
          current,
          voltage
        );

    }
  );


  /* ==========================================
     IDS ENERGIZADOS
  ========================================== */

  const energizedLoadIds =
    Object.values(
      loads
    )
      .filter(
        (loadState) =>
          loadState.energized
      )
      .map(
        (loadState) =>
          loadState.id
      );


  /* ==========================================
     RESULTADO
  ========================================== */

  return {

    complete: true,

    energized: true,

    status:
      "ligado",

    voltage:
      roundValue(
        voltage,
        2
      ),

    current:
      roundValue(
        current,
        2
      ),

    resistance:
      roundValue(
        resistance,
        2
      ),

    power:
      roundValue(
        power,
        2
      ),

    loads,

    energizedLoadIds,
    reactive:
      getReactiveAnalysis(
        circuit,
        resistance,
        0
      ),


  };
}