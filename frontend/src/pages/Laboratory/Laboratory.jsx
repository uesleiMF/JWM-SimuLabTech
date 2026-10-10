import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";

import {
  Activity,
  Battery,
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  Minus,
  MousePointer2,
  Power,
  RotateCcw,
  Settings2,
  Trash2,
  Zap,
  Undo2,
  Save,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  ClipboardCheck,
  X,
} from "lucide-react";

import "./Laboratory.css";

import { simulateCircuit } from "../../simulator/circuitEngine";
import { COMPONENT_TYPES } from "../../simulator/components/componentTypes";
import { componentCatalog } from "../../simulator/components/componentCatalog";
import ComponentNode from "../../simulator/ComponentNode";
import ConnectionLayer from "../../components/Laboratory/ConnectionLayer";

import {
  addComponent,
  removeComponent,
  selectComponent,
  updateComponent,
  updateComponentPosition,
} from "../../simulator/circuitActions";

import {
  createElectricalConnection,
  createTerminalKey,
} from "../../simulator/connections/connectionUtils";

import {
  EXERCISES,
  getExerciseById,
  validateExercise,
} from "../../simulator/exercises";

import { createInitialCircuit } from "./hooks/useLaboratory";


/* ==================================================
   MAPA DE ÍCONES
================================================== */

const iconMap = {
  [COMPONENT_TYPES.SOURCE]: Battery,
  [COMPONENT_TYPES.RESISTOR]: Minus,
  [COMPONENT_TYPES.CAPACITOR]: CircleAlert,
  [COMPONENT_TYPES.INDUCTOR]: Activity,
  [COMPONENT_TYPES.SWITCH]: Power,
  [COMPONENT_TYPES.LAMP]: Lightbulb,
  [COMPONENT_TYPES.MOTOR]: Zap,
  [COMPONENT_TYPES.LED]: Lightbulb,
  [COMPONENT_TYPES.PUSH_BUTTON_NO]: Power,
  [COMPONENT_TYPES.PUSH_BUTTON_NC]: Power,
  [COMPONENT_TYPES.CONTACTOR]: Settings2,
  [COMPONENT_TYPES.BREAKER]: CircleAlert,
  [COMPONENT_TYPES.INDICATOR]: Lightbulb,
};


/* ==================================================
   LABORATORY
================================================== */

export default function Laboratory() {

  const [searchParams, setSearchParams] = useSearchParams();

  /* ==================================================
     CIRCUITO
  ================================================== */

  const [circuit, setCircuit] =
    useState(createInitialCircuit);


  /* ==================================================
     MENSAGEM
  ================================================== */

  const [message, setMessage] =
    useState(
      "Quadro vazio. Adicione componentes e ligue os terminais manualmente."
    );


  /* ==================================================
     CONEXÃO TEMPORÁRIA
  ================================================== */

  const [
    connectionStart,
    setConnectionStart,
  ] = useState(null);


  const [
    mousePosition,
    setMousePosition,
  ] = useState(null);


  /* Pontos intermediários (waypoints) para desenho manual do fio */
  const [
    connectionWaypoints,
    setConnectionWaypoints,
  ] = useState([]);


  /* Fio selecionado (para apagar / editar) */
  const [
    selectedWireId,
    setSelectedWireId,
  ] = useState(null);


  /* Exercício ativo + resultado da validação */
  const activeExerciseId =
    searchParams.get("exercicio") || null;

  const activeExercise = useMemo(
    () =>
      activeExerciseId
        ? getExerciseById(activeExerciseId)
        : null,
    [activeExerciseId]
  );

  const [validationResult, setValidationResult] =
    useState(null);


  /* ==================================================
     REFERÊNCIA DO QUADRO
  ================================================== */

  const boardRef =
    useRef(null);


  /* ==================================================
     HISTÓRICO (UNDO)
  ================================================== */

  const [history, setHistory] =
    useState(() => {
      const initial = createInitialCircuit();
      return [JSON.parse(JSON.stringify(initial))];
    });

  const [historyIndex, setHistoryIndex] =
    useState(0);


  /* ==================================================
     ZOOM
  ================================================== */

  const [zoom, setZoom] =
    useState(1);


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

  const source =
    circuit.components.find(
      (component) =>
        component.type ===
        COMPONENT_TYPES.SOURCE
    );


  const resistor =
    circuit.components.find(
      (component) =>
        component.type ===
        COMPONENT_TYPES.RESISTOR
    );


  const switchComponent =
    circuit.components.find(
      (component) =>
        component.type ===
        COMPONENT_TYPES.SWITCH
    );


  /* ==================================================
     COMPONENTE SELECIONADO
  ================================================== */

  const selectedComponent =
    circuit.components.find(
      (component) =>
        component.id ===
        circuit.selectedComponent
    );


  /* ==================================================
     INTERRUPTOR
  ================================================== */

  const switchOn =
    switchComponent?.value === true ||
    switchComponent?.value === 1 ||
    switchComponent?.value === "1" ||
    switchComponent?.value === "true" ||
    switchComponent?.value === "on";


  /* ==================================================
     ESTADO DE SIMULAÇÃO DO COMPONENTE
  ================================================== */

  const getComponentSimulationState = (
    component
  ) => {

    if (!component) {
      return {
        energized: false,
        running: false,
        power: 0,
      };
    }

    /* ==================================================
       CARGAS
    ================================================== */

    if (
      component.type ===
        COMPONENT_TYPES.LAMP ||
      component.type ===
        COMPONENT_TYPES.LED ||
      component.type ===
        COMPONENT_TYPES.MOTOR ||
      component.type ===
        COMPONENT_TYPES.INDICATOR
    ) {

      const loadState =
        simulation.loads?.[
          component.id
        ];

      return {
        energized:
          loadState?.energized === true,

        running:
          loadState?.running === true,

        power:
          Number(
            loadState?.power
          ) || 0,
      };
    }


    /* ==================================================
       FONTE
    ================================================== */

    if (
      component.type ===
      COMPONENT_TYPES.SOURCE
    ) {

      return {
        energized:
          simulation.energized === true &&
          source?.enabled === true,

        running: false,

        power:
          simulation.energized
            ? Number(
                simulation.power
              ) || 0
            : 0,
      };
    }


    /* ==================================================
       RESISTOR
    ================================================== */

    if (
      component.type ===
      COMPONENT_TYPES.RESISTOR
    ) {

      return {
        energized:
          simulation.energized === true,

        running: false,

        power:
          simulation.energized
            ? Number(
                simulation.power
              ) || 0
            : 0,
      };
    }


    /* ==================================================
       INTERRUPTOR
    ================================================== */

    if (
      component.type ===
        COMPONENT_TYPES.SWITCH ||
      component.type ===
        COMPONENT_TYPES.PUSH_BUTTON_NO ||
      component.type ===
        COMPONENT_TYPES.PUSH_BUTTON_NC ||
      component.type ===
        COMPONENT_TYPES.CONTACTOR ||
      component.type ===
        COMPONENT_TYPES.BREAKER
    ) {

      const closed =
        component.value === true ||
        component.value === "true" ||
        component.value === 1;

      return {
        energized:
          simulation.energized === true &&
          closed,

        running: false,

        power: 0,
      };
    }


    /* ==================================================
       CAPACITOR / INDUTOR
    ================================================== */

    if (
      component.type ===
        COMPONENT_TYPES.CAPACITOR ||
      component.type ===
        COMPONENT_TYPES.INDUCTOR
    ) {

      return {
        energized:
          simulation.energized === true,

        running: false,

        power: 0,
      };
    }


    return {
      energized: false,
      running: false,
      power: 0,
    };
  };


  /* ==================================================
     COMPONENTE ENERGIZADO
  ================================================== */

  const isComponentEnergized = (
    component
  ) => {

    return getComponentSimulationState(
      component
    ).energized;
  };


  /* ==================================================
     MOTOR FUNCIONANDO
  ================================================== */

  const isMotorRunning = (
    component
  ) => {

    if (
      component?.type !==
      COMPONENT_TYPES.MOTOR
    ) {
      return false;
    }

    return (
      getComponentSimulationState(
        component
      ).running === true
    );
  };


  /* ==================================================
     POTÊNCIA DO COMPONENTE
  ================================================== */

  const getComponentPower = (
    component
  ) => {

    return getComponentSimulationState(
      component
    ).power;
  };


  /* ==================================================
     HISTÓRICO - SALVAR ESTADO
  ================================================== */

  const pushHistory = (nextCircuit) => {
    const snapshot = JSON.parse(
      JSON.stringify(nextCircuit)
    );

    setHistory((currentHistory) => {
      const nextHistory = [
        ...currentHistory,
        snapshot,
      ].slice(-30);

      setHistoryIndex(nextHistory.length - 1);

      return nextHistory;
    });
  };


  /* ==================================================
     ATUALIZAR CIRCUITO COM HISTÓRICO
  ================================================== */

  const updateCircuit = (updater) => {
    setCircuit((current) => {
      const next =
        typeof updater === "function"
          ? updater(current)
          : updater;

      pushHistory(next);

      return next;
    });
  };


  /* ==================================================
     DESFAZER (UNDO)
  ================================================== */

  const handleUndo = () => {
    if (historyIndex <= 0) {
      setMessage(
        "Não há ações para desfazer."
      );
      return;
    }

    const previousIndex =
      historyIndex - 1;

    const previousCircuit =
      history[previousIndex];

    if (!previousCircuit) {
      return;
    }

    setHistoryIndex(previousIndex);
    setCircuit(
      JSON.parse(
        JSON.stringify(previousCircuit)
      )
    );

    setConnectionStart(null);
    setMousePosition(null);
    setMessage("Ação desfeita.");
  };


  /* ==================================================
     VALIDAÇÃO DE EXERCÍCIO
  ================================================== */

  useEffect(() => {
    if (activeExercise) {
      setMessage(
        `Exercício: ${activeExercise.title}. ${activeExercise.description}`
      );
      setValidationResult(null);
    }
  }, [activeExerciseId]);

  const handleValidateExercise = () => {
    if (!activeExerciseId) {
      // Sem exercício na URL: mostra seletor simples no message
      setMessage(
        "Abra um exercício em /app/exercicios ou use ?exercicio=ex-lamp-switch na URL."
      );
      return;
    }

    const result = validateExercise(circuit, activeExerciseId);
    setValidationResult(result);
    setMessage(result.message);
  };

  const handleClearExercise = () => {
    searchParams.delete("exercicio");
    setSearchParams(searchParams, { replace: true });
    setValidationResult(null);
    setMessage(
      "Quadro livre. Monte qualquer circuito manualmente."
    );
  };

  /* ==================================================
     SALVAR CIRCUITO (localStorage)
  ================================================== */

  const handleSaveCircuit = () => {
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

      setMessage(
        "Circuito salvo com sucesso."
      );
    } catch {
      setMessage(
        "Não foi possível salvar o circuito."
      );
    }
  };


  /* ==================================================
     CARREGAR CIRCUITO (localStorage)
  ================================================== */

  const handleLoadCircuit = () => {
    try {
      const raw = localStorage.getItem(
        "jwm_simulabtech_circuit"
      );

      if (!raw) {
        setMessage(
          "Nenhum circuito salvo encontrado."
        );
        return;
      }

      const payload = JSON.parse(raw);

      if (
        !payload?.circuit?.components
      ) {
        setMessage(
          "Arquivo de circuito inválido."
        );
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
      setConnectionWaypoints([]);
      setSelectedWireId(null);
      setMessage(
        "Circuito carregado com sucesso."
      );
    } catch {
      setMessage(
        "Erro ao carregar o circuito."
      );
    }
  };


  /* ==================================================
     ZOOM
  ================================================== */

  const handleZoomIn = () => {
    setZoom((current) =>
      Math.min(1.8, Number((current + 0.1).toFixed(2)))
    );
  };

  const handleZoomOut = () => {
    setZoom((current) =>
      Math.max(0.6, Number((current - 0.1).toFixed(2)))
    );
  };

  const handleZoomReset = () => {
    setZoom(1);
  };


  /* ==================================================
     ATALHOS DE TECLADO
  ================================================== */

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Esc → cancela conexão ou desmarca fio
      if (event.key === "Escape") {
        if (connectionStart) {
          setConnectionStart(null);
          setMousePosition(null);
          setConnectionWaypoints([]);
          setMessage("Conexão cancelada.");
        } else if (selectedWireId) {
          setSelectedWireId(null);
          setMessage("Seleção de fio removida.");
        }
        return;
      }

      // Delete / Backspace → remove fio selecionado
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedWireId &&
        !connectionStart
      ) {
        // Evita apagar texto se estiver em input
        if (
          event.target.tagName === "INPUT" ||
          event.target.tagName === "TEXTAREA"
        ) {
          return;
        }

        event.preventDefault();
        handleDeleteSelectedWire();
        return;
      }

      // Ctrl+Z ou Cmd+Z → desfazer
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "z"
      ) {
        event.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [connectionStart, selectedWireId, historyIndex, history]);


  /* ==================================================
     SELECIONAR COMPONENTE
  ================================================== */

  const handleSelectComponent = (
    componentId
  ) => {
    setSelectedWireId(null);

    setCircuit((current) =>
      selectComponent(
        current,
        componentId
      )
    );
  };


  /* ==================================================
     ARRASTAR COMPONENTE
  ================================================== */

  const handleStartDrag = (
    event,
    component
  ) => {

    /* ==================================================
       SOMENTE BOTÃO ESQUERDO
    ================================================== */

    if (
      event.button !== undefined &&
      event.button !== 0
    ) {
      return;
    }


    const board =
      boardRef.current;

    if (!board) {
      return;
    }


    const componentElement =
      event.currentTarget;

    if (!componentElement) {
      return;
    }


    /* ==================================================
       IMPEDIR COMPORTAMENTO PADRÃO
    ================================================== */

    event.preventDefault();
    event.stopPropagation();


    /* ==================================================
       SELECIONAR COMPONENTE
    ================================================== */

    setCircuit((current) =>
      selectComponent(
        current,
        component.id
      )
    );


    /* ==================================================
       MEDIDAS DO COMPONENTE
    ================================================== */

    const componentRect =
      componentElement.getBoundingClientRect();


    const componentWidth =
      componentRect.width;


    const componentHeight =
      componentRect.height;


    /* ==================================================
       DISTÂNCIA DO MOUSE ATÉ O CANTO
       DO COMPONENTE
    ================================================== */

    const offsetX =
      event.clientX -
      componentRect.left;


    const offsetY =
      event.clientY -
      componentRect.top;


    /* ==================================================
       MOVIMENTO DO MOUSE
    ================================================== */

    const handleMouseMove = (
      moveEvent
    ) => {

      const currentBoard =
        boardRef.current;

      if (!currentBoard) {
        return;
      }


      const boardRect =
        currentBoard.getBoundingClientRect();


      /* ==================================================
         TAMANHO REAL DA BANCADA
      ================================================== */

      const boardWidth =
        currentBoard.clientWidth;


      const boardHeight =
        currentBoard.clientHeight;


      /* ==================================================
         NOVA POSIÇÃO
      ================================================== */

      let x =
        moveEvent.clientX -
        boardRect.left -
        offsetX;


      let y =
        moveEvent.clientY -
        boardRect.top -
        offsetY;


      /* ==================================================
         LIMITE DIREITO
      ================================================== */

      const maxX =
        Math.max(
          0,
          boardWidth -
          componentWidth
        );


      /* ==================================================
         LIMITE INFERIOR
      ================================================== */

      const maxY =
        Math.max(
          0,
          boardHeight -
          componentHeight
        );


      /* ==================================================
         LIMITAR HORIZONTAL
      ================================================== */

      if (x < 0) {
        x = 0;
      }

      if (x > maxX) {
        x = maxX;
      }


      /* ==================================================
         LIMITAR VERTICAL
      ================================================== */

      if (y < 0) {
        y = 0;
      }

      if (y > maxY) {
        y = maxY;
      }


      /* ==================================================
         ATUALIZAR POSIÇÃO
      ================================================== */

      setCircuit((current) =>
        updateComponentPosition(
          current,
          component.id,
          {
            x,
            y,
          }
        )
      );
    };


    /* ==================================================
       FINALIZAR ARRASTO
    ================================================== */

    const handleMouseUp = () => {

      document.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      document.removeEventListener(
        "mouseup",
        handleMouseUp
      );

      // Registra o estado final do arrasto no histórico
      setCircuit((current) => {
        pushHistory(current);
        return current;
      });
    };


    /* ==================================================
       REGISTRAR EVENTOS
    ================================================== */

    document.addEventListener(
      "mousemove",
      handleMouseMove
    );

    document.addEventListener(
      "mouseup",
      handleMouseUp
    );
  };


  /* ==================================================
     LOCALIZAR TERMINAL SOB O MOUSE
  ================================================== */

  const getTerminalUnderPointer = (
    event
  ) => {

    if (!event) {
      return null;
    }


    const element =
      document.elementFromPoint(
        event.clientX,
        event.clientY
      );


    if (!element) {
      return null;
    }


    const terminalElement =
      element.closest(
        '[data-terminal="true"]'
      );


    if (!terminalElement) {
      return null;
    }


    const componentId =
      terminalElement.dataset
        .componentId;


    const terminalId =
      terminalElement.dataset
        .terminalId;


    if (
      !componentId ||
      !terminalId
    ) {
      return null;
    }


    return {
      componentId,
      terminalId,
    };
  };


  /* ==================================================
     INICIAR CONEXÃO
  ================================================== */

  const handleStartConnection = (
    event,
    component,
    terminal
  ) => {

    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }


    if (
      !component ||
      !terminal
    ) {
      return;
    }


    const terminalKey =
      createTerminalKey(
        component.id,
        terminal.id
      );


    if (!terminalKey) {
      return;
    }


    setConnectionStart({
      componentId:
        component.id,

      terminalId:
        terminal.id,

      terminalType:
        terminal.type,

      terminalLabel:
        terminal.label,

      terminalPosition:
        null,

      terminalKey,
    });

    // Limpa waypoints ao iniciar nova conexão
    setConnectionWaypoints([]);


    if (
      event &&
      boardRef.current
    ) {

      const rect =
        boardRef.current
          .getBoundingClientRect();


      setMousePosition({
        x:
          event.clientX -
          rect.left,

        y:
          event.clientY -
          rect.top,
      });
    }


    setMessage(
      `Conexão iniciada em ${component.name} — terminal ${terminal.label}. Clique no quadro para adicionar pontos ou em um terminal para finalizar.`
    );
  };


  /* ==================================================
     FINALIZAR CONEXÃO
  ================================================== */

  const handleCompleteConnection = (
    event,
    targetComponent = null,
    targetTerminal = null
  ) => {

    if (!connectionStart) {
      return;
    }


    event?.preventDefault();


    let target = null;


    /* ==================================================
       TERMINAL RECEBIDO DIRETAMENTE
    ================================================== */

    if (
      targetComponent &&
      targetTerminal
    ) {

      target = {
        componentId:
          targetComponent.id,

        terminalId:
          targetTerminal.id,
      };

    } else {

      /* ==================================================
         TENTAR LOCALIZAR TERMINAL PELO MOUSE
      ================================================== */

      target =
        getTerminalUnderPointer(
          event
        );
    }


    if (!target) {
      return;
    }


    /* ==================================================
       MESMO TERMINAL
    ================================================== */

    if (
      target.componentId ===
        connectionStart.componentId &&
      target.terminalId ===
        connectionStart.terminalId
    ) {

      setMessage(
        "Não é possível conectar um terminal a ele mesmo."
      );

      setConnectionStart(null);
      setMousePosition(null);
      setConnectionWaypoints([]);

      return;
    }


    /* ==================================================
       LOCALIZAR COMPONENTES
    ================================================== */

    const fromComponent =
      circuit.components.find(
        (component) =>
          component.id ===
          connectionStart.componentId
      );


    const toComponent =
      circuit.components.find(
        (component) =>
          component.id ===
          target.componentId
      );


    if (
      !fromComponent ||
      !toComponent
    ) {

      setMessage(
        "Não foi possível concluir a conexão."
      );

      setConnectionStart(null);
      setMousePosition(null);
      setConnectionWaypoints([]);

      return;
    }


    /* ==================================================
       VERIFICAR DUPLICIDADE
    ================================================== */

    const wires =
      circuit.wires || [];


    const alreadyConnected =
      wires.some((wire) => {

        if (
          !wire?.from ||
          !wire?.to
        ) {
          return false;
        }


        const fromKey =
          createTerminalKey(
            wire.from.componentId,
            wire.from.terminalId
          );


        const toKey =
          createTerminalKey(
            wire.to.componentId,
            wire.to.terminalId
          );


        const newFromKey =
          connectionStart.terminalKey;


        const newToKey =
          createTerminalKey(
            target.componentId,
            target.terminalId
          );


        return (
          (
            fromKey === newFromKey &&
            toKey === newToKey
          )
          ||
          (
            fromKey === newToKey &&
            toKey === newFromKey
          )
        );
      });


    if (alreadyConnected) {

      setMessage(
        "Esses terminais já estão conectados."
      );

      setConnectionStart(null);
      setMousePosition(null);
      setConnectionWaypoints([]);

      return;
    }


    /* ==================================================
       CRIAR CONEXÃO (com waypoints manuais)
    ================================================== */

    const connection =
      createElectricalConnection({
        from: {
          componentId:
            connectionStart.componentId,

          terminalId:
            connectionStart.terminalId,
        },

        to: {
          componentId:
            target.componentId,

          terminalId:
            target.terminalId,
        },

        points: connectionWaypoints,
      });


    if (!connection) {

      setMessage(
        "Não foi possível criar a conexão."
      );

      setConnectionStart(null);
      setMousePosition(null);
      setConnectionWaypoints([]);

      return;
    }


    /* ==================================================
       ADICIONAR AO CIRCUITO
    ================================================== */

    updateCircuit((current) => ({
      ...current,

      wires: [
        ...(current.wires || []),
        connection,
      ],
    }));


    setMessage(
      `Conexão criada: ${fromComponent.name} → ${toComponent.name}${connectionWaypoints.length > 0 ? ` (${connectionWaypoints.length} ponto${connectionWaypoints.length > 1 ? "s" : ""})` : ""}.`
    );


    setConnectionStart(null);
    setMousePosition(null);
    setConnectionWaypoints([]);
  };


  /* ==================================================
     MOVIMENTO DO MOUSE DURANTE CONEXÃO
  ================================================== */

  const handleBoardMouseMove = (
    event
  ) => {

    if (!connectionStart) {
      return;
    }


    const board =
      boardRef.current;


    if (!board) {
      return;
    }


    const rect =
      board.getBoundingClientRect();


    setMousePosition({
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    });
  };


  /* ==================================================
     CANCELAR CONEXÃO
  ================================================== */

  const cancelConnection = () => {

    if (!connectionStart) {
      return;
    }


    setConnectionStart(null);
    setMousePosition(null);
    setConnectionWaypoints([]);


    setMessage(
      "Conexão cancelada."
    );
  };


  /* ==================================================
     SELECIONAR FIO
  ================================================== */

  const handleSelectWire = (wireId) => {
    if (connectionStart) {
      return;
    }

    setSelectedWireId(wireId);
    setCircuit((current) => ({
      ...current,
      selectedComponent: null,
    }));

    setMessage(
      "Fio selecionado. Pressione Delete para remover."
    );
  };


  /* ==================================================
     REMOVER FIO SELECIONADO
  ================================================== */

  const handleDeleteSelectedWire = () => {
    if (!selectedWireId) {
      return;
    }

    updateCircuit((current) => ({
      ...current,
      wires: (current.wires || []).filter(
        (wire) => wire.id !== selectedWireId
      ),
    }));

    setSelectedWireId(null);
    setMessage("Fio removido do circuito.");
  };


  /* ==================================================
     REMOVER CONEXÕES DO COMPONENTE
  ================================================== */

  const removeComponentConnections = (
    circuitState,
    componentId
  ) => {

    return {
      ...circuitState,

      wires: (
        circuitState.wires || []
      ).filter(
        (wire) =>
          wire?.from?.componentId !==
            componentId &&
          wire?.to?.componentId !==
            componentId
      ),
    };
  };


  /* ==================================================
     ADICIONAR / REMOVER COMPONENTE
  ================================================== */

  const handleAddOrRemoveComponent = (
    catalogItem
  ) => {

    const existing =
      circuit.components.find(
        (component) =>
          component.type ===
          catalogItem.id
      );


    /* ==================================================
       REMOVER
    ================================================== */

    if (existing) {

      updateCircuit((current) => {

        const withoutConnections =
          removeComponentConnections(
            current,
            existing.id
          );


        return removeComponent(
          withoutConnections,
          existing.id
        );
      });


      if (
        connectionStart?.componentId ===
        existing.id
      ) {

        setConnectionStart(null);
        setMousePosition(null);
      }


      setMessage(
        `${catalogItem.name} removido do circuito.`
      );


      return;
    }


    /* ==================================================
       ADICIONAR
    ================================================== */

    updateCircuit((current) =>
      addComponent(
        current,
        catalogItem
      )
    );


    setMessage(
      `${catalogItem.name} adicionado ao circuito.`
    );
  };


  /* ==================================================
     CLIQUE NO QUADRO
  ================================================== */

  const handleBoardClick = (event) => {

    const board = boardRef.current;

    if (!board) {
      return;
    }

    /*
     * Durante uma conexão: clique no quadro adiciona
     * um ponto intermediário (waypoint) no fio.
     */
    if (connectionStart) {
      // Ignora cliques que vieram de terminais/componentes
      const isBoardBackground =
        event.target === board ||
        event.target.classList?.contains("circuit-board") ||
        event.target.classList?.contains("circuit-grid-background") ||
        event.target.classList?.contains("connection-layer") ||
        event.target.closest?.(".connection-layer");

      if (!isBoardBackground) {
        return;
      }

      const rect = board.getBoundingClientRect();

      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      setConnectionWaypoints((prev) => [...prev, point]);

      setMessage(
        `Ponto ${connectionWaypoints.length + 1} adicionado. Clique em outro ponto ou em um terminal para finalizar. (Esc para cancelar)`
      );

      return;
    }

    /*
     * Só desmarca a seleção quando o clique
     * é no fundo do quadro (área vazia).
     */
    if (
      event.target !== board &&
      !event.target.classList?.contains("circuit-board") &&
      !event.target.classList?.contains("circuit-grid-background")
    ) {
      return;
    }

    setSelectedWireId(null);

    setCircuit((current) => ({
      ...current,
      selectedComponent: null,
    }));
  };


  /* ==================================================
     RESET
  ================================================== */

  const handleReset = () => {
    const initial = createInitialCircuit();

    setCircuit(initial);
    pushHistory(initial);

    setConnectionStart(null);
    setMousePosition(null);
    setConnectionWaypoints([]);
    setSelectedWireId(null);
    setZoom(1);

    setMessage(
      "Quadro limpo. Monte seu circuito do zero."
    );
  };


  /* ==================================================
     RESISTÊNCIA
  ================================================== */

  const handleResistanceChange = (
    event
  ) => {

    const value =
      Number(
        event.target.value
      );


    if (!resistor) {
      return;
    }


    updateCircuit((current) =>
      updateComponent(
        current,
        resistor.id,
        {
          value,
        }
      )
    );
  };


  /* ==================================================
     INTERRUPTOR
  ================================================== */

  const handleSwitchToggle = () => {
    const controlTypes = [
      COMPONENT_TYPES.SWITCH,
      COMPONENT_TYPES.PUSH_BUTTON_NO,
      COMPONENT_TYPES.PUSH_BUTTON_NC,
      COMPONENT_TYPES.CONTACTOR,
      COMPONENT_TYPES.BREAKER,
    ];

    // Prioriza o componente selecionado se for de comando
    const targetId =
      selectedComponent &&
      controlTypes.includes(selectedComponent.type)
        ? selectedComponent.id
        : switchComponent?.id;

    if (!targetId) {
      setMessage("Nenhum interruptor ou comando no circuito.");
      return;
    }

    let nextValue = false;
    let targetType = COMPONENT_TYPES.SWITCH;
    let targetName = "Interruptor";

    updateCircuit((current) => {
      const live = (current.components || []).find(
        (component) => component.id === targetId
      );

      if (!live) {
        return current;
      }

      // Interpretação clara do estado atual (evita bug com string)
      const currentlyClosed =
        live.value === true ||
        live.value === 1 ||
        live.value === "1" ||
        live.value === "true" ||
        live.value === "on";

      nextValue = !currentlyClosed;
      targetType = live.type;
      targetName = live.name || "Componente";

      return updateComponent(current, live.id, {
        value: nextValue,
      });
    });

    const labels = {
      [COMPONENT_TYPES.SWITCH]: "Interruptor",
      [COMPONENT_TYPES.PUSH_BUTTON_NO]: "Botoeira NA",
      [COMPONENT_TYPES.PUSH_BUTTON_NC]: "Botoeira NF",
      [COMPONENT_TYPES.CONTACTOR]: "Contator",
      [COMPONENT_TYPES.BREAKER]: "Disjuntor",
    };

    const name = labels[targetType] || targetName;

    setMessage(
      nextValue
        ? `${name} FECHADO — corrente pode passar.`
        : `${name} ABERTO — corrente interrompida.`
    );
  };


  /* ==================================================
     VALOR DO COMPONENTE SELECIONADO
  ================================================== */

  const handleSelectedValueChange = (
    event
  ) => {

    if (!selectedComponent) {
      return;
    }


    const value =
      Number(
        event.target.value
      );


    updateCircuit((current) =>
      updateComponent(
        current,
        selectedComponent.id,
        {
          value,
        }
      )
    );
  };


  /* ==================================================
     DIAGNÓSTICO
  ================================================== */

  const diagnostic =
    useMemo(() => {

      /* ==================================================
         SEM FONTE
      ================================================== */

      if (!source) {

        return {
          type: "warning",

          title:
            "Fonte não encontrada",

          description:
            "Adicione uma fonte DC para alimentar o circuito.",
        };
      }


      /* ==================================================
         SEM INTERRUPTOR
      ================================================== */

      if (!switchComponent) {

        return {
          type: "warning",

          title:
            "Interruptor não encontrado",

          description:
            "Adicione um interruptor para controlar o circuito.",
        };
      }


      /* ==================================================
         CARGAS
      ================================================== */

      const loads =
        circuit.components.filter(
          (component) =>
            component.type ===
              COMPONENT_TYPES.LAMP ||
            component.type ===
              COMPONENT_TYPES.MOTOR ||
            component.type ===
              COMPONENT_TYPES.LED
        );


      if (
        loads.length === 0
      ) {

        return {
          type: "warning",

          title:
            "Nenhuma carga encontrada",

          description:
            "Adicione uma lâmpada, motor ou LED ao circuito.",
        };
      }


      /* ==================================================
         FONTE DESLIGADA
      ================================================== */

      if (
        source.enabled !== true
      ) {

        return {
          type: "info",

          title:
            "Fonte desligada",

          description:
            "Ative a fonte para alimentar o circuito.",
        };
      }


      /* ==================================================
         INTERRUPTOR ABERTO
      ================================================== */

      if (!switchOn) {

        return {
          type: "info",

          title:
            "Circuito aberto",

          description:
            "Feche o interruptor para permitir a passagem de corrente.",
        };
      }


      /* ==================================================
         CIRCUITO NÃO ENERGIZADO
      ================================================== */

      if (
        !simulation.energized
      ) {

        return {
          type: "warning",

          title:
            "Circuito aberto ou desconectado",

          description:
            "Verifique se a fonte, o interruptor e pelo menos uma carga estão conectados formando um caminho fechado.",
        };
      }


      /* ==================================================
         CARGA ENERGIZADA
      ================================================== */

      const energizedLoad =
        loads.some(
          (load) =>
            simulation.loads?.[
              load.id
            ]?.energized === true
        );


      if (!energizedLoad) {

        return {
          type: "warning",

          title:
            "Carga não energizada",

          description:
            "O circuito foi fechado, mas nenhuma carga está recebendo energia.",
        };
      }


      /* ==================================================
         MOTOR
      ================================================== */

      const runningMotor =
        loads.some(
          (load) =>
            load.type ===
              COMPONENT_TYPES.MOTOR &&
            simulation.loads?.[
              load.id
            ]?.running === true
        );


      if (runningMotor) {

        return {
          type: "success",

          title:
            "Motor funcionando",

          description:
            "O circuito está fechado e o motor está recebendo energia.",
        };
      }


      /* ==================================================
         CIRCUITO NORMAL
      ================================================== */

      return {
        type: "success",

        title:
          "Circuito energizado",

        description:
          "A corrente está circulando pelo circuito.",
      };

    }, [
      circuit.components,
      source,
      switchComponent,
      switchOn,
      simulation,
    ]);


  /* ==================================================
     ÍCONE DO DIAGNÓSTICO
  ================================================== */

  const diagnosticIcon = {
    warning:
      CircleAlert,

    error:
      CircleAlert,

    info:
      Activity,

    success:
      CheckCircle2,
  };


  const DiagnosticIcon =
    diagnosticIcon[
      diagnostic.type
    ] || Activity;


  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div className="laboratory-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="laboratory-header">

        <div>

          <span className="laboratory-eyebrow">
            LABORATÓRIO VIRTUAL
          </span>

          <h1>
            Laboratório de Circuitos
          </h1>

          <p>
            Monte, configure e teste seus
            circuitos elétricos de forma
            interativa.
          </p>

        </div>


        <div className="laboratory-header-actions">

          <button
            type="button"
            className="laboratory-action-button"
            onClick={handleUndo}
            title="Desfazer (Ctrl+Z)"
            disabled={historyIndex <= 0}
          >
            <Undo2 size={18} />
            Desfazer
          </button>

          <button
            type="button"
            className="laboratory-action-button"
            onClick={handleSaveCircuit}
            title="Salvar circuito"
          >
            <Save size={18} />
            Salvar
          </button>

          <button
            type="button"
            className="laboratory-action-button"
            onClick={handleLoadCircuit}
            title="Carregar circuito"
          >
            <FolderOpen size={18} />
            Carregar
          </button>

          <button
            type="button"
            className="laboratory-action-button laboratory-validate-button"
            onClick={handleValidateExercise}
            title="Validar exercício"
          >
            <ClipboardCheck size={18} />
            Validar
          </button>

          <button
            type="button"
            className="laboratory-reset-button"
            onClick={handleReset}
          >
            <RotateCcw size={18} />
            Restaurar
          </button>

        </div>

      </header>


      {/* ==================================================
          TOOLBAR
      ================================================== */}

      <section className="laboratory-toolbar">

        <div className="toolbar-tool active">

          <MousePointer2 size={18} />

          <span>
            Selecionar
          </span>

        </div>


        <div className="toolbar-status">

          <span
            className={`status-dot ${
              simulation.energized
                ? "active"
                : ""
            }`}
          />

          <span>
            {simulation.energized
              ? "Circuito energizado"
              : "Circuito desligado"}
          </span>

        </div>


        <div className="toolbar-message">

          {connectionStart
            ? "Mova o mouse até outro terminal para conectar. (Esc para cancelar)"
            : message}

        </div>


        <div className="toolbar-zoom">

          <button
            type="button"
            className="zoom-button"
            onClick={handleZoomOut}
            title="Diminuir zoom"
          >
            <ZoomOut size={16} />
          </button>

          <button
            type="button"
            className="zoom-button zoom-value"
            onClick={handleZoomReset}
            title="Resetar zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            className="zoom-button"
            onClick={handleZoomIn}
            title="Aumentar zoom"
          >
            <ZoomIn size={16} />
          </button>

        </div>

      </section>


      {/* ==================================================
          LAYOUT
      ================================================== */}

      <div className="laboratory-layout">

        {/* ==================================================
            PAINEL DE COMPONENTES
        ================================================== */}

        <aside className="components-panel">

          <div className="panel-heading">

            <div>

              <span className="panel-kicker">
                COMPONENTES
              </span>

              <h2>
                Biblioteca
              </h2>

            </div>

            <Settings2 size={20} />

          </div>


          {selectedComponent && (

            <div className="resistor-control selected-component-panel">

              <div className="control-heading">

                <div>

                  <span>
                    COMPONENTE SELECIONADO
                  </span>

                  <strong>
                    {
                      selectedComponent.name
                    }
                  </strong>

                </div>


                <button
                  type="button"
                  className="delete-component-button"

                  onClick={() => {

                    updateCircuit((current) => {

                      const withoutConnections =
                        removeComponentConnections(
                          current,
                          selectedComponent.id
                        );


                      return removeComponent(
                        withoutConnections,
                        selectedComponent.id
                      );

                    });


                    if (
                      connectionStart?.componentId ===
                      selectedComponent.id
                    ) {

                      setConnectionStart(
                        null
                      );

                      setMousePosition(
                        null
                      );
                    }


                    setMessage(
                      `${selectedComponent.name} removido.`
                    );

                  }}

                  title="Remover componente"
                >

                  <Trash2
                    size={17}
                  />

                  <span>
                    Apagar
                  </span>

                </button>

              </div>


              {typeof selectedComponent.value ===
                "number" && (

                <label>

                  <span>
                    Valor
                  </span>


                  <div className="input-with-unit">

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={
                        selectedComponent.value
                      }
                      onChange={
                        handleSelectedValueChange
                      }
                    />


                    {selectedComponent.unit && (

                      <span>
                        {
                          selectedComponent.unit
                        }
                      </span>

                    )}

                  </div>

                </label>

              )}


              {typeof selectedComponent.value ===
                "boolean" &&
                [
                  COMPONENT_TYPES.SWITCH,
                  COMPONENT_TYPES.PUSH_BUTTON_NO,
                  COMPONENT_TYPES.PUSH_BUTTON_NC,
                  COMPONENT_TYPES.CONTACTOR,
                  COMPONENT_TYPES.BREAKER,
                ].includes(selectedComponent.type) && (

                <label>

                  <span>
                    Estado
                  </span>

                  <button
                    type="button"
                    className="delete-component-button"
                    style={{ marginTop: 8 }}
                    onClick={handleSwitchToggle}
                  >
                    {selectedComponent.value
                      ? "Desligar / Abrir"
                      : "Ligar / Fechar"}
                  </button>

                </label>

              )}

            </div>

          )}



          {/* ==================================================
              LISTA
          ================================================== */}

          <div className="component-list">

            {componentCatalog.map(
              (catalogItem) => {

                const Icon =
                  iconMap[
                    catalogItem.id
                  ] || Zap;


                const exists =
                  circuit.components.some(
                    (component) =>
                      component.type ===
                      catalogItem.id
                  );


                return (
                  <button
                    type="button"
                    key={
                      catalogItem.id
                    }
                    className={`component-item ${
                      exists
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleAddOrRemoveComponent(
                        catalogItem
                      )
                    }
                  >

                    <span
                      className="component-item-icon"
                      style={{
                        color:
                          catalogItem.color,
                      }}
                    >
                      <Icon size={22} />
                    </span>


                    <span className="component-item-content">

                      <strong>
                        {
                          catalogItem.name
                        }
                      </strong>

                      <small>
                        {
                          catalogItem.description
                        }
                      </small>

                    </span>


                    {exists && (
                      <CheckCircle2
                        size={18}
                        className="component-item-check"
                      />
                    )}

                  </button>
                );
              }
            )}

          </div>


          {/* ==================================================
              COMPONENTE SELECIONADO
          ================================================== */}

          {/* ==================================================
              RESISTOR
          ================================================== */}

          {resistor && (

            <div className="resistor-control">

              <div className="control-heading">

                <div>

                  <span>
                    RESISTOR
                  </span>

                  <strong>
                    Ajustar resistência
                  </strong>

                </div>


                <span className="control-value">

                  {resistor.value} Ω

                </span>

              </div>


              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={
                  resistor.value
                }
                onChange={
                  handleResistanceChange
                }
              />


              <div className="range-labels">

                <span>
                  10 Ω
                </span>

                <span>
                  500 Ω
                </span>

              </div>

            </div>

          )}

        </aside>


        {/* ==================================================
            WORKSPACE
        ================================================== */}

        <main className="circuit-workspace">

          <div className="workspace-header">

            <div>

              <span className="panel-kicker">
                ÁREA DE MONTAGEM
              </span>

              <h2>
                Circuito
              </h2>

            </div>


            <div className="circuit-status">

              <span
                className={`status-dot ${
                  simulation.energized
                    ? "active"
                    : ""
                }`}
              />

              {simulation.energized
                ? "Ligado"
                : "Desligado"}

            </div>

          </div>


          {/* ==================================================
              EXERCÍCIO ATIVO
          ================================================== */}

          {activeExercise && (
            <div className="exercise-banner">
              <div className="exercise-banner-content">
                <ClipboardCheck size={20} />
                <div>
                  <strong>{activeExercise.title}</strong>
                  <p>{activeExercise.description}</p>
                </div>
              </div>
              <button
                type="button"
                className="exercise-banner-close"
                onClick={handleClearExercise}
                title="Sair do exercício"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* ==================================================
              RESULTADO DA VALIDAÇÃO
          ================================================== */}

          {validationResult && (
            <div
              className={`validation-panel ${
                validationResult.ok ? "validation-ok" : "validation-fail"
              }`}
            >
              <div className="validation-header">
                <strong>
                  {validationResult.ok
                    ? "Exercício concluído!"
                    : "Validação"}
                </strong>
                <span>
                  {validationResult.passedCount}/
                  {validationResult.total} · {validationResult.score}%
                </span>
              </div>
              <ul className="validation-checks">
                {validationResult.checks.map((check) => (
                  <li
                    key={check.id}
                    className={
                      check.passed ? "check-passed" : "check-failed"
                    }
                  >
                    <span className="check-mark">
                      {check.passed ? "✓" : "✗"}
                    </span>
                    <span>
                      <strong>{check.label}</strong>
                      <small>{check.detail}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ==================================================
              DIAGNÓSTICO
          ================================================== */}

          <div
            className={`diagnostic-card ${diagnostic.type}`}
          >

            <div className="diagnostic-icon">

              <DiagnosticIcon
                size={22}
              />

            </div>


            <div>

              <strong>
                {
                  diagnostic.title
                }
              </strong>

              <p>
                {
                  diagnostic.description
                }
              </p>

            </div>

          </div>


          {/* ==================================================
              QUADRO DE MONTAGEM
          ================================================== */}

          <div
            ref={boardRef}
            className={`circuit-board circuit-grid-background ${
              connectionStart
                ? "connection-mode"
                : ""
            }`}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
            onClick={
              handleBoardClick
            }
            onMouseMove={
              handleBoardMouseMove
            }
            onMouseUp={
              handleCompleteConnection
            }
          >

            {/* ==================================================
                CAMADA DE CONEXÕES
            ================================================== */}

            <ConnectionLayer
              connections={
                circuit.wires || []
              }
              components={
                circuit.components || []
              }
              connectionStart={
                connectionStart
              }
              mousePosition={
                mousePosition
              }
              waypoints={
                connectionWaypoints
              }
              selectedWireId={
                selectedWireId
              }
              onSelectWire={
                handleSelectWire
              }
              onEmptyClick={
                handleBoardClick
              }
              energized={
                simulation.energized
              }
            />


            {/* ==================================================
                COMPONENTES
            ================================================== */}

            {(circuit.components || []).map(
              (component) => (

                <ComponentNode
                  key={
                    component.id
                  }

                  component={
                    component
                  }

                  selected={
                    circuit.selectedComponent ===
                    component.id
                  }

                  energized={
                    isComponentEnergized(
                      component
                    )
                  }

                  running={
                    isMotorRunning(
                      component
                    )
                  }

                  power={
                    getComponentPower(
                      component
                    )
                  }

                  connectionStart={
                    connectionStart
                  }

                  onSelect={
                    handleSelectComponent
                  }

                  onStartDrag={
                    handleStartDrag
                  }

                  onStartConnection={
                    handleStartConnection
                  }

                  onCompleteConnection={
                    handleCompleteConnection
                  }
                />

              )
            )}


            {/* ==================================================
                ÁREA VAZIA
            ================================================== */}

            {circuit.components.length ===
              0 && (

              <div className="laboratory-message">

                <Zap size={28} />

                <strong>
                  Área de montagem vazia
                </strong>

                <span>
                  Adicione componentes pela
                  biblioteca.
                </span>

              </div>

            )}


            {/* ==================================================
                INDICADOR DE ENERGIA
            ================================================== */}

            {simulation.energized && (

              <div className="circuit-energy-indicator">

                <span className="status-dot active" />

                Circuito energizado

              </div>

            )}

          </div>


          {/* ==================================================
              CONTROLE DO INTERRUPTOR
          ================================================== */}

          {switchComponent && (

            <div className="experiment-card">

              <div>

                <span className="panel-kicker">
                  CONTROLE
                </span>

                <h3>
                  Interruptor
                </h3>

                <p>
                  Abra ou feche o circuito para
                  observar o comportamento da
                  corrente.
                </p>

              </div>


              <button
                type="button"
                className={`switch-control-button ${
                  switchOn
                    ? "on"
                    : ""
                }`}
                onClick={
                  handleSwitchToggle
                }
              >

                <Power size={20} />

                {switchOn
                  ? "Ligado"
                  : "Desligado"}

              </button>

            </div>

          )}


          {/* ==================================================
              MEDIÇÕES
          ================================================== */}

          <section className="measurements-panel">

            <div className="measurements-heading">

              <div>

                <span className="panel-kicker">
                  INSTRUMENTAÇÃO
                </span>

                <h2>
                  Medições
                </h2>

              </div>


              <Activity size={20} />

            </div>


            <div className="measurements-grid">

              <div className="measurement-card">

                <span>
                  Tensão
                </span>

                <strong>
                  {simulation.voltage} V
                </strong>

              </div>


              <div className="measurement-card">

                <span>
                  Corrente
                </span>

                <strong>
                  {simulation.current} A
                </strong>

              </div>


              <div className="measurement-card">

                <span>
                  Resistência
                </span>

                <strong>
                  {simulation.resistance} Ω
                </strong>

              </div>


              <div className="measurement-card">

                <span>
                  Potência
                </span>

                <strong>
                  {simulation.power} W
                </strong>

              </div>

              {simulation.reactive?.capacitor && (
                <>
                  <div className="measurement-card">
                    <span>Capacitor</span>
                    <strong>
                      {simulation.reactive.capacitor.valueuF ?? "—"} µF
                    </strong>
                  </div>

                  <div className="measurement-card">
                    <span>τ Capacitor</span>
                    <strong>
                      {simulation.reactive.capacitor.tauMs != null
                        ? `${simulation.reactive.capacitor.tauMs} ms`
                        : "R necessária"}
                    </strong>
                  </div>

                  <div className="measurement-card">
                    <span>Energia do capacitor</span>
                    <strong>
                      {simulation.reactive.capacitor.energyJ != null
                        ? `${simulation.reactive.capacitor.energyJ} J`
                        : "—"}
                    </strong>
                  </div>

                  <div className="measurement-card">
                    <span>Tensão no capacitor</span>
                    <strong>
                      {simulation.reactive.capacitor.voltage ?? "—"} V
                    </strong>
                  </div>
                </>
              )}

              {simulation.reactive?.inductor && (
                <>
                  <div className="measurement-card">
                    <span>Indutor</span>
                    <strong>
                      {simulation.reactive.inductor.valuemH ?? "—"} mH
                    </strong>
                  </div>

                  <div className="measurement-card">
                    <span>τ Indutor</span>
                    <strong>
                      {simulation.reactive.inductor.tauMs != null
                        ? `${simulation.reactive.inductor.tauMs} ms`
                        : "R necessária"}
                    </strong>
                  </div>

                  <div className="measurement-card">
                    <span>Energia do indutor</span>
                    <strong>
                      {simulation.reactive.inductor.energyJ != null
                        ? `${simulation.reactive.inductor.energyJ} J`
                        : "—"}
                    </strong>
                  </div>

                  <div className="measurement-card">
                    <span>Corrente no indutor</span>
                    <strong>
                      {simulation.reactive.inductor.current ?? "—"} A
                    </strong>
                  </div>
                </>
              )}

            </div>

          </section>


          {/* ==================================================
              LEI DE OHM
          ================================================== */}

          <section className="ohm-card">

            <div>

              <span className="panel-kicker">
                CONCEITO
              </span>

              <h2>
                Lei de Ohm
              </h2>

              <p>
                A corrente elétrica pode ser
                calculada pela relação entre tensão
                e resistência.
              </p>

            </div>


            <div className="formula">
              I = V / R
            </div>

          </section>

        </main>

      </div>

    </div>
  );
}
