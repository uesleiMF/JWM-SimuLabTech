import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { simulateCircuit } from "../../../simulator/circuitEngine";
import { defaultCircuit } from "../../../simulator/defaultCircuit";
import { COMPONENT_TYPES } from "../../../simulator/components/componentTypes";

import {
  addComponent,
  removeComponent,
  selectComponent,
  updateComponent,
  updateComponentPosition,
} from "../../../simulator/circuitActions";

import {
  createElectricalConnection,
  createTerminalKey,
} from "../../../simulator/connections/connectionUtils";


/* ==================================================
   CIRCUITO INICIAL
================================================== */

export function createInitialCircuit() {
  // Quadro vazio — o aluno monta o circuito manualmente
  return {
    id: "circuito-vazio",
    name: "Novo Circuito",
    description: "Monte seu circuito do zero.",
    components: [],
    wires: [],
    selectedComponent: null,
    selectedWire: null,
    selectedTerminal: null,
    connectionStart: null,
    isRunning: false,
  };
}


/* ==================================================
   HOOK PRINCIPAL DO LABORATÓRIO
================================================== */

export function useLaboratory() {
  /* ==================================================
     ESTADO PRINCIPAL
  ================================================== */

  const [circuit, setCircuit] = useState(createInitialCircuit);

  const [message, setMessage] = useState(
    "Monte e teste seu circuito elétrico."
  );

  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);

  const boardRef = useRef(null);

  /* ==================================================
     HISTÓRICO (UNDO)
  ================================================== */

  const [history, setHistory] = useState(() => {
    const initial = createInitialCircuit();
    return [JSON.parse(JSON.stringify(initial))];
  });

  const [historyIndex, setHistoryIndex] = useState(0);

  /* ==================================================
     ZOOM
  ================================================== */

  const [zoom, setZoom] = useState(1);

  /* ==================================================
     SIMULAÇÃO
  ================================================== */

  const simulation = useMemo(
    () => simulateCircuit(circuit),
    [circuit]
  );

  /* ==================================================
     COMPONENTES PRINCIPAIS
  ================================================== */

  const source = circuit.components.find(
    (c) => c.type === COMPONENT_TYPES.SOURCE
  );

  const resistor = circuit.components.find(
    (c) => c.type === COMPONENT_TYPES.RESISTOR
  );

  const switchComponent = circuit.components.find(
    (c) => c.type === COMPONENT_TYPES.SWITCH
  );

  const selectedComponent = circuit.components.find(
    (c) => c.id === circuit.selectedComponent
  );

  const switchOn = switchComponent?.value === true;

  /* ==================================================
     HISTÓRICO - HELPERS
  ================================================== */

  const pushHistory = useCallback((nextCircuit) => {
    const snapshot = JSON.parse(JSON.stringify(nextCircuit));

    setHistory((currentHistory) => {
      const nextHistory = [...currentHistory, snapshot].slice(-30);
      setHistoryIndex(nextHistory.length - 1);
      return nextHistory;
    });
  }, []);

  const updateCircuit = useCallback(
    (updater) => {
      setCircuit((current) => {
        const next =
          typeof updater === "function" ? updater(current) : updater;
        pushHistory(next);
        return next;
      });
    },
    [pushHistory]
  );

  /* ==================================================
     DESFAZER
  ================================================== */

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) {
      setMessage("Não há ações para desfazer.");
      return;
    }

    const previousIndex = historyIndex - 1;
    const previousCircuit = history[previousIndex];

    if (!previousCircuit) return;

    setHistoryIndex(previousIndex);
    setCircuit(JSON.parse(JSON.stringify(previousCircuit)));
    setConnectionStart(null);
    setMousePosition(null);
    setMessage("Ação desfeita.");
  }, [history, historyIndex]);

  /* ==================================================
     SALVAR / CARREGAR
  ================================================== */

  const handleSaveCircuit = useCallback(() => {
    try {
      const payload = {
        version: 1,
        savedAt: new Date().toISOString(),
        circuit,
      };

      localStorage.setItem(
        "jwm_simulabtech_circuit",
        JSON.stringify(payload)
      );

      setMessage("Circuito salvo com sucesso.");
    } catch {
      setMessage("Não foi possível salvar o circuito.");
    }
  }, [circuit]);

  const handleLoadCircuit = useCallback(() => {
    try {
      const raw = localStorage.getItem("jwm_simulabtech_circuit");

      if (!raw) {
        setMessage("Nenhum circuito salvo encontrado.");
        return;
      }

      const payload = JSON.parse(raw);

      if (!payload?.circuit?.components) {
        setMessage("Arquivo de circuito inválido.");
        return;
      }

      const loaded = {
        ...payload.circuit,
        selectedComponent: null,
      };

      setCircuit(loaded);
      pushHistory(loaded);
      setConnectionStart(null);
      setMousePosition(null);
      setMessage("Circuito carregado com sucesso.");
    } catch {
      setMessage("Erro ao carregar o circuito.");
    }
  }, [pushHistory]);

  /* ==================================================
     ZOOM
  ================================================== */

  const handleZoomIn = useCallback(() => {
    setZoom((current) =>
      Math.min(1.8, Number((current + 0.1).toFixed(2)))
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((current) =>
      Math.max(0.6, Number((current - 0.1).toFixed(2)))
    );
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  /* ==================================================
     RESET
  ================================================== */

  const handleReset = useCallback(() => {
    const initial = createInitialCircuit();
    setCircuit(initial);
    pushHistory(initial);
    setConnectionStart(null);
    setMousePosition(null);
    setZoom(1);
    setMessage("Laboratório restaurado ao circuito inicial.");
  }, [pushHistory]);

  /* ==================================================
     ESTADO DE SIMULAÇÃO DO COMPONENTE
  ================================================== */

  const getComponentSimulationState = useCallback(
    (component) => {
      if (!component) {
        return { energized: false, running: false, power: 0 };
      }

      if (
        component.type === COMPONENT_TYPES.LAMP ||
        component.type === COMPONENT_TYPES.LED ||
        component.type === COMPONENT_TYPES.MOTOR
      ) {
        const loadState = simulation.loads?.[component.id];

        return {
          energized: loadState?.energized === true,
          running: loadState?.running === true,
          power: Number(loadState?.power) || 0,
        };
      }

      if (component.type === COMPONENT_TYPES.SOURCE) {
        return {
          energized:
            simulation.energized === true && source?.enabled === true,
          running: false,
          power: simulation.energized
            ? Number(simulation.power) || 0
            : 0,
        };
      }

      if (component.type === COMPONENT_TYPES.RESISTOR) {
        return {
          energized: simulation.energized === true,
          running: false,
          power: simulation.energized
            ? Number(simulation.power) || 0
            : 0,
        };
      }

      if (component.type === COMPONENT_TYPES.SWITCH) {
        return {
          energized: simulation.energized === true && switchOn,
          running: false,
          power: 0,
        };
      }

      if (
        component.type === COMPONENT_TYPES.CAPACITOR ||
        component.type === COMPONENT_TYPES.INDUCTOR
      ) {
        return {
          energized: simulation.energized === true,
          running: false,
          power: 0,
        };
      }

      return { energized: false, running: false, power: 0 };
    },
    [simulation, source, switchOn]
  );

  const isComponentEnergized = useCallback(
    (component) => getComponentSimulationState(component).energized,
    [getComponentSimulationState]
  );

  const isMotorRunning = useCallback(
    (component) => {
      if (component?.type !== COMPONENT_TYPES.MOTOR) return false;
      return getComponentSimulationState(component).running === true;
    },
    [getComponentSimulationState]
  );

  const getComponentPower = useCallback(
    (component) => getComponentSimulationState(component).power,
    [getComponentSimulationState]
  );

  /* ==================================================
     SELECIONAR COMPONENTE
  ================================================== */

  const handleSelectComponent = useCallback((componentId) => {
    setCircuit((current) => selectComponent(current, componentId));
  }, []);

  /* ==================================================
     CANCELAR CONEXÃO
  ================================================== */

  const cancelConnection = useCallback(() => {
    setConnectionStart(null);
    setMousePosition(null);
    setMessage("Conexão cancelada.");
  }, []);

  /* ==================================================
     ATALHOS DE TECLADO
  ================================================== */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (connectionStart) {
          cancelConnection();
        }
        return;
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "z"
      ) {
        event.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [connectionStart, handleUndo, cancelConnection]);

  /* ==================================================
     RETORNO DO HOOK
  ================================================== */

  return {
    // Estado
    circuit,
    setCircuit,
    message,
    setMessage,
    connectionStart,
    setConnectionStart,
    mousePosition,
    setMousePosition,
    boardRef,
    simulation,
    zoom,
    historyIndex,

    // Componentes derivados
    source,
    resistor,
    switchComponent,
    selectedComponent,
    switchOn,

    // Helpers de simulação
    getComponentSimulationState,
    isComponentEnergized,
    isMotorRunning,
    getComponentPower,

    // Ações
    updateCircuit,
    pushHistory,
    handleUndo,
    handleSaveCircuit,
    handleLoadCircuit,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleReset,
    handleSelectComponent,
    cancelConnection,

    // Utilitários exportados para uso no componente
    COMPONENT_TYPES,
    addComponent,
    removeComponent,
    updateComponent,
    updateComponentPosition,
    createElectricalConnection,
    createTerminalKey,
  };
}
