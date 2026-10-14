/* JWM_SAVE_OPEN_V10 - ferramentas desenho CADe SIMU (selecionar/fio/apagar/mão) */
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
  Cable,
  Eraser,
  Hand,
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
  Volume2,
  VolumeX,
  ClipboardCheck,
  X,
  LayoutGrid,
  PenLine,
  Boxes,
  FileDown,
  RotateCw,
  History,
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
  getComponentTerminals,
} from "../../simulator/connections/connectionUtils";

import {
  EXERCISES,
  getExerciseById,
  validateExercise,
} from "../../simulator/exercises";

import { createInitialCircuit } from "./hooks/useLaboratory";

import {
  setSoundMuted,
  isSoundMuted,
  playClick,
  playContactor,
  playFuseBlow,
  playTrip,
  playOverloadBeep,
  startMotorSound,
  stopMotorSound,
} from "../../simulator/sounds";


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
  [COMPONENT_TYPES.FUSE_ISOLATOR]: CircleAlert,
  [COMPONENT_TYPES.THERMAL_RELAY]: Settings2,
  [COMPONENT_TYPES.TIMER_ON_DELAY]: History,
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

  const [soundOn, setSoundOn] = useState(true);
  const prevSoundRef = useRef({
    components: {},
    motorsOn: false,
    coils: {},
    overloaded: {},
  });


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

  /* Modo de visualização: blocos | esquema | 3d */
  const [viewMode, setViewMode] = useState("blocos");

  /* Ferramenta ativa da barra: selecionar, fio, apagar ou mão */
  const [drawTool, setDrawTool] = useState("select");




  /* ==================================================
     REFERÊNCIA DO QUADRO
  ================================================== */

  const boardRef =
    useRef(null);

  /* Input oculto para abrir arquivo .json do computador */
  const fileInputRef =
    useRef(null);

  /* Lista de circuitos recentes (localStorage) */
  const [recentCircuits, setRecentCircuits] = useState(() => {
    try {
      const raw = localStorage.getItem("jwm_simulabtech_recent");
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  });

  const [showRecent, setShowRecent] = useState(false);

  /*
   * Converte coordenada da tela → espaço local do quadro.
   * Corrige zoom e perspectiva 3D (getBoundingClientRect
   * devolve o tamanho visual transformado).
   */
  const clientToBoardLocal = (clientX, clientY) => {
    const board = boardRef.current;

    if (!board) {
      return { x: 0, y: 0 };
    }

    const rect = board.getBoundingClientRect();
    const width = board.offsetWidth || rect.width;
    const height = board.offsetHeight || rect.height;

    if (rect.width === 0 || rect.height === 0) {
      return { x: 0, y: 0 };
    }

    return {
      x: ((clientX - rect.left) * width) / rect.width,
      y: ((clientY - rect.top) * height) / rect.height,
    };
  };


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
     SONS (motor, botoeiras, contator, proteções)
  ================================================== */

  useEffect(() => {
    setSoundMuted(!soundOn);
    if (!soundOn) {
      stopMotorSound();
    }
  }, [soundOn]);

  useEffect(() => {
    if (!soundOn) return;

    const prev = prevSoundRef.current;
    const components = circuit.components || [];
    const nextMap = {};

    components.forEach((comp) => {
      nextMap[comp.id] = {
        type: comp.type,
        value: Boolean(comp.value),
        tripped: Boolean(comp.tripped),
        burned: Boolean(comp.burned),
      };

      const before = prev.components[comp.id];
      if (!before) return;

      // Interruptor / botoeiras
      if (
        [
          COMPONENT_TYPES.SWITCH,
          COMPONENT_TYPES.PUSH_BUTTON_NO,
          COMPONENT_TYPES.PUSH_BUTTON_NC,
        ].includes(comp.type) &&
        before.value !== Boolean(comp.value)
      ) {
        if (comp.type === COMPONENT_TYPES.PUSH_BUTTON_NO) {
          playClick(comp.value ? "hard" : "release");
        } else if (
          comp.type === COMPONENT_TYPES.PUSH_BUTTON_NC
        ) {
          playClick(comp.value ? "release" : "hard");
        } else {
          playClick(comp.value ? "hard" : "soft");
        }
      }

      // Proteções
      if (
        [
          COMPONENT_TYPES.FUSE_ISOLATOR,
          COMPONENT_TYPES.THERMAL_RELAY,
          COMPONENT_TYPES.BREAKER,
        ].includes(comp.type)
      ) {
        if (!before.burned && comp.burned) {
          playFuseBlow();
        } else if (!before.tripped && comp.tripped) {
          playTrip();
        }
      }
    });

    // Contator: bobina
    const coils = simulation?.coils || {};
    Object.keys(coils).forEach((id) => {
      const now = Boolean(coils[id]?.coilEnergized);
      const was = Boolean(prev.coils[id]);
      if (now !== was) {
        playContactor(now);
      }
    });

    // Motor funcionando
    const motorOn = (components || []).some((c) => {
      if (c.type !== COMPONENT_TYPES.MOTOR) return false;
      const load = simulation?.loads?.[c.id];
      return load?.energized === true;
    });

    if (motorOn && !prev.motorsOn) {
      startMotorSound();
    } else if (!motorOn && prev.motorsOn) {
      stopMotorSound();
    } else if (motorOn) {
      startMotorSound();
    }

    // Sobrecarga nova (bip leve, no máximo um por ciclo de mudança)
    const overloadedNow = {};
    Object.values(simulation?.loads || {}).forEach((load) => {
      if (load?.overloaded) {
        overloadedNow[load.id] = true;
        if (!prev.overloaded[load.id]) {
          playOverloadBeep();
        }
      }
    });

    prevSoundRef.current = {
      components: nextMap,
      motorsOn: motorOn,
      coils: Object.fromEntries(
        Object.entries(coils).map(([id, c]) => [
          id,
          Boolean(c?.coilEnergized),
        ])
      ),
      overloaded: overloadedNow,
    };
  }, [circuit, simulation, soundOn]);

  /* ==================================================
     PROTEÇÕES INSTANTÂNEAS (fusível / disjuntor)
  ================================================== */

  useEffect(() => {
    const trips = simulation?.protections?.trips;
    if (!Array.isArray(trips) || trips.length === 0) {
      return;
    }

    const needsApply = trips.some((trip) => {
      const comp = circuit.components?.find(
        (c) => c.id === trip.id
      );
      if (!comp) return false;
      if (trip.action === "burn") {
        return comp.burned !== true;
      }
      return comp.tripped !== true || comp.value !== false;
    });

    if (!needsApply) return;

    setCircuit((current) => {
      let changed = false;
      const components = (current.components || []).map(
        (comp) => {
          const trip = trips.find((t) => t.id === comp.id);
          if (!trip) return comp;

          changed = true;
          if (trip.action === "burn") {
            return {
              ...comp,
              value: false,
              burned: true,
              tripped: true,
            };
          }
          return {
            ...comp,
            value: false,
            tripped: true,
            burned: false,
          };
        }
      );

      if (!changed) return current;
      return { ...current, components };
    });

    const messages = trips.map((t) => t.reason).join(" | ");
    setMessage(`⚠ Proteção atuou: ${messages}`);
  }, [simulation?.protections?.trips, circuit.components]);

  /* ==================================================
     ATRASO TÉRMICO DO RELÉ (aquecimento progressivo)
  ================================================== */

  const [thermalHeat, setThermalHeat] = useState({});
  // thermalHeat[id] = { progress: 0..1, delaySeconds, current, limit }

  useEffect(() => {
    const pending = simulation?.protections?.thermalPending;
    const pendingMap = new Map(
      (Array.isArray(pending) ? pending : []).map((p) => [
        p.id,
        p,
      ])
    );

    // Se não há nenhum em aquecimento e estado vazio, nada a fazer
    if (pendingMap.size === 0) {
      setThermalHeat((prev) =>
        Object.keys(prev).length === 0 ? prev : {}
      );
      return undefined;
    }

    const TICK_MS = 100;
    const intervalId = setInterval(() => {
      setThermalHeat((prev) => {
        const next = { ...prev };
        const messages = [];

        // Atualiza ou inicia aquecimento
        pendingMap.forEach((p, id) => {
          const prevEntry = next[id];
          const delay = Math.max(
            Number(p.delaySeconds) || 3,
            0.5
          );
          const step = TICK_MS / 1000 / delay;

          if (!prevEntry) {
            next[id] = {
              progress: step,
              delaySeconds: delay,
              current: p.current,
              limit: p.limit,
            };
          } else {
            next[id] = {
              ...prevEntry,
              progress: Math.min(
                1,
                prevEntry.progress + step
              ),
              delaySeconds: delay,
              current: p.current,
              limit: p.limit,
            };
          }

          if (next[id].progress >= 1) {
            messages.push(
              `Relé térmico desarmou: ${Number(p.current).toFixed(3)} A > ${p.limit} A (após sobrecarga)`
            );
          }
        });

        // Remove ids que não estão mais em sobrecarga
        Object.keys(next).forEach((id) => {
          if (!pendingMap.has(id)) {
            delete next[id];
          }
        });

        // Dispara desarme quando progress >= 1
        const toTrip = Object.entries(next).filter(
          ([, v]) => v.progress >= 1
        );

        if (toTrip.length > 0) {
          // Limpa progresso dos que vão desarmar
          toTrip.forEach(([id]) => {
            delete next[id];
          });

          setCircuit((current) => {
            const components = (current.components || []).map(
              (comp) => {
                if (
                  !toTrip.some(([id]) => id === comp.id)
                ) {
                  return comp;
                }
                if (comp.tripped || comp.burned) {
                  return comp;
                }
                return {
                  ...comp,
                  value: false,
                  tripped: true,
                  burned: false,
                };
              }
            );
            return { ...current, components };
          });

          if (messages.length > 0) {
            setMessage(`⚠ ${messages.join(" | ")}`);
          }
        }

        return next;
      });
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, [simulation?.protections?.thermalPending]);

  /* ==================================================
     TEMPORIZADOR TON (atraso na energização)
  ================================================== */

  const [timerHeat, setTimerHeat] = useState({});

  useEffect(() => {
    const coils = simulation?.coils || {};
    const pendingIds = Object.values(coils)
      .filter((c) => c.timerPending)
      .map((c) => c.id);

    const coilOnIds = new Set(
      Object.values(coils)
        .filter(
          (c) =>
            c.type === COMPONENT_TYPES.TIMER_ON_DELAY &&
            c.coilEnergized
        )
        .map((c) => c.id)
    );

    // Bobina desligada → reseta contato e progresso
    const timersOff = (circuit.components || []).filter(
      (c) =>
        c.type === COMPONENT_TYPES.TIMER_ON_DELAY &&
        c.value === true &&
        !coilOnIds.has(c.id)
    );

    if (timersOff.length > 0) {
      setCircuit((current) => ({
        ...current,
        components: (current.components || []).map((comp) =>
          timersOff.some((t) => t.id === comp.id)
            ? { ...comp, value: false }
            : comp
        ),
      }));
      setTimerHeat((prev) => {
        const next = { ...prev };
        timersOff.forEach((t) => {
          delete next[t.id];
        });
        return next;
      });
    }

    if (pendingIds.length === 0) {
      setTimerHeat((prev) =>
        Object.keys(prev).length === 0 ? prev : {}
      );
      return undefined;
    }

    const TICK_MS = 100;
    const intervalId = setInterval(() => {
      setTimerHeat((prev) => {
        const next = { ...prev };
        const toClose = [];

        pendingIds.forEach((id) => {
          const comp = circuit.components?.find(
            (c) => c.id === id
          );
          let delay = Number(comp?.thermalDelay);
          if (!Number.isFinite(delay) || delay < 0.5) {
            delay = 3;
          }
          const step = TICK_MS / 1000 / delay;
          const prevEntry = next[id];
          const progress = Math.min(
            1,
            (prevEntry?.progress || 0) + step
          );
          next[id] = { progress, delaySeconds: delay };
          if (progress >= 1) {
            toClose.push(id);
          }
        });

        Object.keys(next).forEach((id) => {
          if (!pendingIds.includes(id)) {
            delete next[id];
          }
        });

        if (toClose.length > 0) {
          toClose.forEach((id) => {
            delete next[id];
          });
          setCircuit((current) => ({
            ...current,
            components: (current.components || []).map(
              (comp) =>
                toClose.includes(comp.id)
                  ? { ...comp, value: true }
                  : comp
            ),
          }));
          setMessage(
            "Temporizador TON: contato fechado após o atraso."
          );
        }

        return next;
      });
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, [simulation?.coils, circuit.components]);


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

        overloaded:
          loadState?.overloaded === true,

        overloadReasons:
          loadState?.overloadReasons || [],

        current:
          Number(loadState?.current) || 0,
      };
    }

    /* ==================================================
       RESISTOR (também pode entrar em sobrecarga)
    ================================================== */

    if (component.type === COMPONENT_TYPES.RESISTOR) {
      const resistorState =
        simulation.loads?.[`__resistor__${component.id}`];

      return {
        energized:
          simulation.energized === true,

        running: false,

        power:
          Number(resistorState?.power) ||
          (simulation.energized
            ? Number(simulation.power) || 0
            : 0),

        overloaded:
          resistorState?.overloaded === true,

        overloadReasons:
          resistorState?.overloadReasons || [],

        current:
          Number(resistorState?.current) ||
          (simulation.energized
            ? Number(simulation.current) || 0
            : 0),
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

  /* ==================================================
     SALVAR / ABRIR CIRCUITO NO COMPUTADOR (.json)
  ================================================== */

  const buildCircuitPayload = (nameOverride) => {
    const resolvedName =
      (typeof nameOverride === "string" && nameOverride.trim()) ||
      circuit?.name ||
      "Novo Circuito";

    return {
      app: "JWM-SimuLabTech",
      type: "circuit",
      version: 1,
      savedAt: new Date().toISOString(),
      circuit: {
        id: circuit?.id || `circuito-${Date.now()}`,
        name: resolvedName.trim(),
        description: circuit?.description || "",
        components: Array.isArray(circuit?.components)
          ? JSON.parse(JSON.stringify(circuit.components))
          : [],
        wires: Array.isArray(circuit?.wires)
          ? JSON.parse(JSON.stringify(circuit.wires))
          : [],
        selectedComponent: null,
        selectedWire: null,
      },
    };
  };

  const parseCircuitFile = (payload) => {
    if (!payload || typeof payload !== "object") return null;

    const source =
      payload.circuit && typeof payload.circuit === "object"
        ? payload.circuit
        : payload;

    if (
      !Array.isArray(source.components) &&
      !Array.isArray(source.wires)
    ) {
      return null;
    }

    return {
      id: source.id || `circuito-${Date.now()}`,
      name: source.name || "Circuito carregado",
      description: source.description || "",
      components: Array.isArray(source.components)
        ? source.components
        : [],
      wires: Array.isArray(source.wires) ? source.wires : [],
      selectedComponent: null,
      selectedWire: null,
    };
  };

  const buildCircuitPayloadFrom = (c) => ({
    app: "JWM-SimuLabTech",
    type: "circuit",
    version: 1,
    savedAt: new Date().toISOString(),
    circuit: {
      id: c?.id || `circuito-${Date.now()}`,
      name: c?.name || "Novo Circuito",
      description: c?.description || "",
      components: Array.isArray(c?.components)
        ? JSON.parse(JSON.stringify(c.components))
        : [],
      wires: Array.isArray(c?.wires)
        ? JSON.parse(JSON.stringify(c.wires))
        : [],
      selectedComponent: null,
      selectedWire: null,
    },
  });

  const RECENT_KEY = "jwm_simulabtech_recent";
  const RECENT_LIMIT = 10;

  const readRecentList = () => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  };

  const pushRecentCircuit = (payload) => {
    if (!payload || !payload.circuit) return;
    const entry = {
      id: payload.circuit.id || `circuito-${Date.now()}`,
      name: payload.circuit.name || "Novo Circuito",
      description: payload.circuit.description || "",
      savedAt: payload.savedAt || new Date().toISOString(),
      componentCount: Array.isArray(payload.circuit.components)
        ? payload.circuit.components.length
        : 0,
      wireCount: Array.isArray(payload.circuit.wires)
        ? payload.circuit.wires.length
        : 0,
      payload,
    };

    try {
      const prev = readRecentList().filter(
        (item) => item && item.id !== entry.id
      );
      const next = [entry, ...prev].slice(0, RECENT_LIMIT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      setRecentCircuits(next);
    } catch (err) {
      console.warn("[JWM] Falha ao gravar recentes:", err);
    }
  };

  const handleOpenRecent = (entry) => {
    if (!entry?.payload) {
      setMessage("Circuito recente inválido.");
      return;
    }
    const loaded = parseCircuitFile(entry.payload);
    if (!loaded) {
      setMessage("Não foi possível abrir este circuito recente.");
      return;
    }
    applyLoadedCircuit(loaded, entry.name || "recente");
    setShowRecent(false);
    try {
      localStorage.setItem(
        "jwm_simulabtech_circuit",
        JSON.stringify(entry.payload)
      );
    } catch {
      /* ignore */
    }
  };

  const handleClearRecent = () => {
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
    setRecentCircuits([]);
    setShowRecent(false);
    setMessage("Lista de circuitos recentes limpa.");
  };

  const applyLoadedCircuit = (loaded, sourceLabel) => {
    if (!loaded) return false;

    // Garante estrutura mínima para o quadro renderizar
    const components = (Array.isArray(loaded.components) ? loaded.components : [])
      .filter((c) => c && c.id && c.type)
      .map((c) => ({
        ...c,
        position: {
          x: Number(c.position?.x) || 0,
          y: Number(c.position?.y) || 0,
        },
        enabled: c.enabled !== false,
      }));

    const wires = (Array.isArray(loaded.wires) ? loaded.wires : [])
      .filter((w) => w && w.from && w.to)
      .map((w) => ({
        ...w,
        type: w.type || "electrical",
        status: w.status || "active",
        points: Array.isArray(w.points) ? w.points : [],
      }));

    const snapshot = {
      id: loaded.id || `circuito-${Date.now()}`,
      name: loaded.name || "Circuito carregado",
      description: loaded.description || "",
      components,
      wires,
      selectedComponent: null,
      selectedWire: null,
    };

    console.log(
      "[JWM] Aplicando circuito:",
      snapshot.components.length,
      "comp,",
      snapshot.wires.length,
      "fios — origem:",
      sourceLabel
    );

    setCircuit(snapshot);
    setHistory([JSON.parse(JSON.stringify(snapshot))]);
    setHistoryIndex(0);
    setConnectionStart(null);
    setMousePosition(null);
    setConnectionWaypoints([]);
    setSelectedWireId(null);
    setValidationResult(null);
    setMessage(
      "Aberto: " +
        sourceLabel +
        " — " +
        snapshot.components.length +
        " componente(s), " +
        snapshot.wires.length +
        " fio(s)."
    );
    return true;
  };

  const handleSaveCircuit = () => {
    console.log("[JWM] Salvar clicado — download + localStorage");
    try {
      const currentName = circuit?.name || "Novo Circuito";
      const typed = window.prompt(
        "Nome do circuito:",
        currentName
      );

      // Cancelou o prompt
      if (typed === null) {
        setMessage("Salvamento cancelado.");
        return;
      }

      const circuitName = typed.trim() || "Novo Circuito";

      // Atualiza o nome no estado para a próxima vez
      setCircuit((current) => ({
        ...current,
        name: circuitName,
      }));

      const payload = buildCircuitPayload(circuitName);
      const nComp = payload.circuit.components.length;
      const nWire = payload.circuit.wires.length;
      console.log(
        "[JWM] Salvando:",
        circuitName,
        "—",
        nComp,
        "comp,",
        nWire,
        "fios"
      );

      if (nComp === 0 && nWire === 0) {
        setMessage(
          "Quadro vazio — o arquivo seria salvo sem componentes. Adicione peças antes de salvar."
        );
      }

      const json = JSON.stringify(payload, null, 2);

      try {
        localStorage.setItem("jwm_simulabtech_circuit", json);
      } catch {
        /* ignore quota / private mode */
      }

      pushRecentCircuit(payload);

      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const stamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-");
      const baseName =
        circuitName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-_]/g, "") || "circuito";

      const fileName = baseName + "-" + stamp + ".json";
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          document.body.removeChild(a);
        } catch {
          /* ignore */
        }
        URL.revokeObjectURL(url);
      }, 200);

      console.log("[JWM] Download disparado:", fileName);
      setMessage(
        'Circuito "' +
          circuitName +
          '" salvo: ' +
          fileName +
          " (" +
          nComp +
          " comp, " +
          nWire +
          " fios)."
      );
    } catch (err) {
      console.error("Salvar circuito:", err);
      setMessage("Erro ao salvar o circuito.");
    }
  };

  const loadCircuitFromText = (textContent, sourceLabel) => {
    try {
      const text = String(textContent || "").trim();
      if (!text) {
        setMessage("Arquivo vazio.");
        return false;
      }
      console.log("[JWM] Conteúdo lido (início):", text.slice(0, 200));
      const payload = JSON.parse(text);
      const loaded = parseCircuitFile(payload);

      if (!loaded) {
        console.warn("[JWM] parseCircuitFile retornou null", payload);
        setMessage(
          "Arquivo inválido. Use um .json salvo pelo botão Salvar desta tela."
        );
        return false;
      }

      if (
        (!loaded.components || loaded.components.length === 0) &&
        (!loaded.wires || loaded.wires.length === 0)
      ) {
        setMessage(
          "Arquivo aberto, mas está vazio (0 componentes). Salve de novo com o circuito montado."
        );
      }

      const ok = applyLoadedCircuit(loaded, sourceLabel);

      try {
        const payload = buildCircuitPayloadFrom(loaded);
        localStorage.setItem(
          "jwm_simulabtech_circuit",
          JSON.stringify(payload)
        );
        pushRecentCircuit(payload);
      } catch {
        /* ignore */
      }

      return ok;
    } catch (err) {
      console.error("[JWM] Erro ao abrir circuito:", err);
      setMessage(
        "Não foi possível ler o arquivo. Ele precisa ser um JSON válido salvo por este laboratório."
      );
      return false;
    }
  };

  const handleOpenCircuit = (event) => {
    // Shift+clique no rótulo: carrega o último do localStorage (não abre diálogo)
    if (event && event.shiftKey) {
      if (event.preventDefault) event.preventDefault();
      if (event.stopPropagation) event.stopPropagation();
      try {
        const raw = localStorage.getItem("jwm_simulabtech_circuit");
        if (!raw) {
          setMessage(
            "Nenhum circuito salvo no navegador. Use Salvar primeiro ou escolha um arquivo."
          );
          return;
        }
        console.log("[JWM] Shift+Abrir — carregando localStorage");
        loadCircuitFromText(raw, "último salvo no navegador");
      } catch (err) {
        console.error("[JWM] Erro ao abrir do localStorage:", err);
        setMessage("Não foi possível abrir o último circuito salvo no navegador.");
      }
      return;
    }

    // Clique normal: o <label htmlFor> abre o seletor nativo.
    // Só limpamos o value para permitir reescolher o mesmo arquivo.
    console.log("[JWM] Abrir clicado — seletor nativo via label");
    const input = fileInputRef.current;
    if (input) {
      input.value = "";
    }
  };

  const handleFileInputChange = (event) => {
    console.log("[JWM] onChange do input de arquivo disparou", event?.type);
    const list = event.target.files;
    const file = list && list[0];
    console.log(
      "[JWM] Arquivo selecionado:",
      file && file.name,
      file && file.size,
      file && file.type,
      "files.length=",
      list && list.length
    );

    if (!file) {
      console.log("[JWM] Nenhum arquivo no input (cancelou?)");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      loadCircuitFromText(String(reader.result || ""), file.name);
      // permite selecionar o mesmo arquivo de novo
      event.target.value = "";
    };

    reader.onerror = () => {
      console.error("[JWM] FileReader error");
      setMessage("Falha ao ler o arquivo do disco.");
      event.target.value = "";
    };

    reader.readAsText(file, "UTF-8");
  };

  const handleDropCircuitFile = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file =
      event.dataTransfer &&
      event.dataTransfer.files &&
      event.dataTransfer.files[0];
    if (!file) return;

    console.log("[JWM] Arquivo solto no quadro:", file.name, file.size);
    const reader = new FileReader();
    reader.onload = () => {
      loadCircuitFromText(String(reader.result || ""), file.name);
    };
    reader.onerror = () => {
      setMessage("Falha ao ler o arquivo arrastado.");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDragOverCircuitFile = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  };

  const handleLoadCircuit = handleOpenCircuit;




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
     ROTAÇÃO DOS COMPONENTES (só os ícones)
  ================================================== */

  const selectedRotation =
    selectedComponent?.rotation || 0;

  const applyComponentRotation = (
    componentId,
    degrees
  ) => {
    let next = degrees % 360;
    if (next < 0) next += 360;

    updateCircuit((current) =>
      updateComponent(current, componentId, {
        rotation: next,
      })
    );
  };

  const handleRotationChange = (event) => {
    if (!selectedComponent) {
      setMessage(
        "Selecione um componente para girar."
      );
      return;
    }

    const value = Number(event.target.value);
    applyComponentRotation(
      selectedComponent.id,
      Number.isFinite(value) ? value : 0
    );
  };

  const handleRotationReset = () => {
    if (!selectedComponent) {
      setMessage(
        "Selecione um componente para zerar a rotação."
      );
      return;
    }

    applyComponentRotation(selectedComponent.id, 0);
    setMessage(
      `Rotação de ${selectedComponent.name} zerada.`
    );
  };

  const handleRotateStep = (delta) => {
    if (!selectedComponent) {
      setMessage(
        "Selecione um componente para girar."
      );
      return;
    }

    const current = selectedComponent.rotation || 0;
    let next = (current + delta) % 360;
    if (next < 0) next += 360;

    applyComponentRotation(selectedComponent.id, next);
    setMessage(
      `${selectedComponent.name} girado para ${next}°.`
    );
  };


  /* ==================================================
     EXPORTAR PDF (circuito + medições + cálculos)
  ================================================== */

  const handleExportPdf = () => {
    const title =
      (circuit.name && String(circuit.name).trim()) ||
      activeExercise?.title ||
      "Circuito JWM SimuLabTech";

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setMessage("Permita pop-ups para exportar o PDF.");
      return;
    }

    const V = Number(simulation.voltage) || 0;
    const I = Number(simulation.current) || 0;
    const R = Number(simulation.resistance) || 0;
    const P = Number(simulation.power) || 0;

    const iOhm = R > 0 ? V / R : null;
    const vOhm = I * R;
    const rOhm = I > 0 ? V / I : null;
    const pVI = V * I;
    const pI2R = I * I * R;
    const pV2R = R > 0 ? (V * V) / R : null;
    const e1s = P;
    const e60s = P * 60;

    const fmt = (n, digits = 4) =>
      n == null || !Number.isFinite(n) ? "—" : Number(n).toFixed(digits);

    const statusLabel = simulation.energized
      ? "Circuito energizado"
      : simulation.status === "aberto"
        ? "Circuito aberto"
        : "Circuito incompleto";

    // ---- Diagrama SVG a partir dos dados (fios alinhados) ----
    const sizes = {
      blocos: { w: 92, h: 76 },
      esquema: { w: 72, h: 56 },
      "3d": { w: 110, h: 96 },
    };
    const size = sizes[viewMode] || sizes.blocos;

    const terminalPoint = (component, side) => {
      const x = component.position?.x ?? 0;
      const y = component.position?.y ?? 0;
      const rot = ((Number(component.rotation) || 0) * Math.PI) / 180;
      let lx = size.w / 2;
      let ly = size.h / 2;
      if (side === "left") {
        lx = 0;
        ly = size.h / 2;
      } else if (side === "right") {
        lx = size.w;
        ly = size.h / 2;
      } else if (side === "top") {
        lx = size.w / 2;
        ly = 0;
      } else if (side === "bottom") {
        lx = size.w / 2;
        ly = size.h;
      }
      const cx = x + size.w / 2;
      const cy = y + size.h / 2;
      const rx = lx - size.w / 2;
      const ry = ly - size.h / 2;
      return {
        x: cx + rx * Math.cos(rot) - ry * Math.sin(rot),
        y: cy + rx * Math.sin(rot) + ry * Math.cos(rot),
      };
    };

    const terminalSide = (component, terminalId) => {
      const terminals =
        (typeof getComponentTerminals === "function"
          ? getComponentTerminals(component)
          : null) || [];
      const found = terminals.find((t) => t.id === terminalId);
      return found?.position || "right";
    };

    const components = circuit.components || [];
    const wires = circuit.wires || [];

    let minX = 0;
    let minY = 0;
    let maxX = 400;
    let maxY = 300;
    components.forEach((c) => {
      const x = c.position?.x ?? 0;
      const y = c.position?.y ?? 0;
      minX = Math.min(minX, x - 20);
      minY = Math.min(minY, y - 20);
      maxX = Math.max(maxX, x + size.w + 40);
      maxY = Math.max(maxY, y + size.h + 40);
    });

    const pad = 24;
    const svgW = Math.max(420, maxX - minX + pad * 2);
    const svgH = Math.max(280, maxY - minY + pad * 2);
    const ox = -minX + pad;
    const oy = -minY + pad;

    const wirePaths = wires
      .map((wire) => {
        const fromComp = components.find(
          (c) => c.id === wire.from?.componentId
        );
        const toComp = components.find(
          (c) => c.id === wire.to?.componentId
        );
        if (!fromComp || !toComp) return "";

        const start = terminalPoint(
          fromComp,
          terminalSide(fromComp, wire.from?.terminalId)
        );
        const end = terminalPoint(
          toComp,
          terminalSide(toComp, wire.to?.terminalId)
        );

        const points = Array.isArray(wire.points) ? wire.points : [];
        const all = [start, ...points, end];
        let d = `M ${all[0].x + ox} ${all[0].y + oy}`;
        for (let i = 1; i < all.length; i++) {
          const prev = all[i - 1];
          const curr = all[i];
          // ortogonal
          d += ` L ${curr.x + ox} ${prev.y + oy} L ${curr.x + ox} ${curr.y + oy}`;
        }
        return `<path d="${d}" fill="none" stroke="#111827" stroke-width="2" stroke-linejoin="round" />`;
      })
      .join("");

    const componentRects = components
      .map((c) => {
        const x = (c.position?.x ?? 0) + ox;
        const y = (c.position?.y ?? 0) + oy;
        const label = (c.name || c.type || "").replace(/</g, "");
        const value =
          c.value != null
            ? `${c.value}${c.unit ? ` ${c.unit}` : ""}`
            : "";
        return `
          <rect x="${x}" y="${y}" width="${size.w}" height="${size.h}" rx="8" fill="#ffffff" stroke="#334155" stroke-width="1.5" />
          <text x="${x + size.w / 2}" y="${y + size.h / 2 - 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">${label}</text>
          <text x="${x + size.w / 2}" y="${y + size.h / 2 + 12}" text-anchor="middle" font-size="10" fill="#64748b">${value}</text>
        `;
      })
      .join("");

    const diagramSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;height:auto;background:#fafafa;border:1px solid #e2e8f0;border-radius:12px">
        ${wirePaths}
        ${componentRects}
      </svg>
    `;

    const componentsRows = components
      .map((c) => {
        const loadState = simulation.loads?.[c.id];
        const loadPower = loadState?.power;
        const loadOn = loadState?.energized ? "Sim" : "Não";
        return `<tr>
          <td>${c.name || c.type}</td>
          <td>${c.type}</td>
          <td>${c.value ?? "—"}${c.unit ? ` ${c.unit}` : ""}</td>
          <td>${loadOn}</td>
          <td>${loadPower != null ? `${loadPower} W` : "—"}</td>
        </tr>`;
      })
      .join("");

    const calcRows = [
      ["Lei de Ohm", "I = V / R", R > 0 ? `${V} / ${R} = ${fmt(iOhm)} A` : "R = 0"],
      ["Lei de Ohm", "V = I × R", `${I} × ${R} = ${fmt(vOhm)} V`],
      ["Lei de Ohm", "R = V / I", I > 0 ? `${V} / ${I} = ${fmt(rOhm)} Ω` : "I = 0"],
      ["Potência", "P = V × I", `${V} × ${I} = ${fmt(pVI)} W`],
      ["Potência", "P = I² × R", `${I}² × ${R} = ${fmt(pI2R)} W`],
      ["Potência", "P = V² / R", R > 0 ? `${V}² / ${R} = ${fmt(pV2R)} W` : "R = 0"],
      ["Energia", "E = P × t (1 s)", `${fmt(e1s)} J`],
      ["Energia", "E = P × t (60 s)", `${fmt(e60s)} J`],
      ["Associação", "R_eq do circuito", `${R} Ω`],
    ];

    const calcTable = calcRows
      .map(
        ([group, formula, result]) =>
          `<tr><td>${group}</td><td><code>${formula}</code></td><td>${result}</td></tr>`
      )
      .join("");

    printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px 20px;
      font-family: Inter, system-ui, sans-serif;
      color: #0f172a;
      background: #fff;
    }
    h1 { font-size: 18px; margin: 0 0 4px; }
    h2 { font-size: 14px; margin: 0 0 10px; color: #1e293b; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 14px; }
    .layout {
      display: grid;
      grid-template-columns: 1.35fr 1fr;
      gap: 16px;
      align-items: start;
    }
    .panel {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      background: #fff;
    }
    .metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 14px;
    }
    .metric {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px;
      background: #f8fafc;
    }
    .metric span { display: block; font-size: 11px; color: #64748b; margin-bottom: 4px; }
    .metric strong { font-size: 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 7px 8px; text-align: left; vertical-align: top; }
    th { color: #64748b; font-weight: 700; }
    code {
      font-weight: 700;
      color: #1d4ed8;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 4px;
      padding: 1px 6px;
      white-space: nowrap;
    }
    .status-ok { color: #15803d; font-weight: 700; }
    .status-off { color: #b45309; font-weight: 700; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    JWM SimuLabTech · ${new Date().toLocaleString("pt-BR")} ·
    <span class="${simulation.energized ? "status-ok" : "status-off"}">${statusLabel}</span>
  </div>
  ${(circuit.description || "").trim()
    ? `<p style="margin:8px 0 0;color:#475569;font-size:13px;max-width:720px">${String(circuit.description).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`
    : ""}

  <div class="layout">
    <div>
      <h2>Diagrama do circuito</h2>
      ${diagramSvg}
    </div>

    <div class="panel">
      <h2>Medições</h2>
      <div class="metrics">
        <div class="metric"><span>Tensão (V)</span><strong>${V} V</strong></div>
        <div class="metric"><span>Corrente (I)</span><strong>${I} A</strong></div>
        <div class="metric"><span>Resistência (R)</span><strong>${R} Ω</strong></div>
        <div class="metric"><span>Potência (P)</span><strong>${P} W</strong></div>
      </div>

      <h2>Cálculos aplicados</h2>
      <table>
        <thead>
          <tr><th>Grupo</th><th>Fórmula</th><th>Resultado</th></tr>
        </thead>
        <tbody>
          ${calcTable}
        </tbody>
      </table>

      <h2 style="margin-top:14px">Componentes</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Energizado</th>
            <th>Potência</th>
          </tr>
        </thead>
        <tbody>
          ${componentsRows || "<tr><td colspan='5'>Nenhum componente</td></tr>"}
        </tbody>
      </table>
      <div style="margin-top:10px;font-size:11px;color:#64748b">
        Fios: ${wires.length} · Componentes: ${components.length}
      </div>
    </div>
  </div>
</body>
</html>`);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setMessage(
        'PDF: use "Salvar como PDF" na janela de impressão.'
      );
    }, 400);
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

      // R → girar componente selecionado 90°
      if (
        event.key.toLowerCase() === "r" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !connectionStart
      ) {
        if (
          event.target.tagName === "INPUT" ||
          event.target.tagName === "TEXTAREA"
        ) {
          return;
        }

        if (selectedComponent) {
          event.preventDefault();
          handleRotateStep(90);
        }
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
  }, [
    connectionStart,
    selectedWireId,
    selectedComponent,
    historyIndex,
    history,
  ]);


  /* ==================================================
     SELECIONAR COMPONENTE
  ================================================== */

  const handleSelectComponent = (
    componentId
  ) => {
    // Ferramenta Apagar: remove o componente ao clicar
    if (drawTool === "delete") {
      updateCircuit((current) => {
        const withoutWires = {
          ...current,
          wires: (current.wires || []).filter(
            (w) =>
              w?.from?.componentId !== componentId &&
              w?.to?.componentId !== componentId
          ),
        };
        return removeComponent(withoutWires, componentId);
      });
      setSelectedWireId(null);
      setConnectionStart(null);
      setMessage("Componente removido.");
      return;
    }

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

    if (drawTool === "delete") {
      return;
    }

    // Com ferramenta Selecionar, ainda permite fio pelos terminais.
    // Com ferramenta Fio, força modo de ligação.
    if (drawTool === "pan") {
      return;
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

      setMousePosition(
        clientToBoardLocal(
          event.clientX,
          event.clientY
        )
      );
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

    setMousePosition(
      clientToBoardLocal(
        event.clientX,
        event.clientY
      )
    );
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

    if (drawTool === "delete") {
      updateCircuit((current) => ({
        ...current,
        wires: (current.wires || []).filter(
          (wire) => wire.id !== wireId
        ),
      }));
      setSelectedWireId(null);
      setMessage("Fio removido.");
      return;
    }

    setSelectedWireId(wireId);
    setCircuit((current) => ({
      ...current,
      selectedComponent: null,
    }));

    setMessage(
      "Fio selecionado. Pressione Delete para remover (ou use a ferramenta Apagar)."
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
    /*
     * Sempre adiciona uma nova instância.
     * Para remover, selecione o componente no quadro
     * e use o botão Apagar do painel.
     * Assim é possível ter 2 botoeiras, 2 contatores, etc.
     */

    updateCircuit((current) =>
      addComponent(
        current,
        catalogItem
      )
    );

    const count = (
      circuit.components || []
    ).filter(
      (c) => c.type === catalogItem.id
    ).length;

    setMessage(
      count > 0
        ? `${catalogItem.name} adicionado (${count + 1} no quadro).`
        : `${catalogItem.name} adicionado ao circuito.`
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

      const point = clientToBoardLocal(
        event.clientX,
        event.clientY
      );

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

          <div
            className="laboratory-circuit-name-row"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "8px",
              marginBottom: "4px",
              maxWidth: "520px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <label
                htmlFor="jwm-circuit-name-input"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--text-secondary, #94a3b8)",
                  whiteSpace: "nowrap",
                  minWidth: "110px",
                }}
              >
                Nome
              </label>
              <input
                id="jwm-circuit-name-input"
                type="text"
                className="laboratory-circuit-name-input"
                value={circuit?.name || ""}
                placeholder="Novo Circuito"
                maxLength={80}
                onChange={(event) => {
                  const nextName = event.target.value;
                  setCircuit((current) => ({
                    ...current,
                    name: nextName,
                  }));
                }}
                onKeyDown={(event) => {
                  event.stopPropagation();
                }}
                style={{
                  minWidth: "180px",
                  flex: "1 1 200px",
                  height: "34px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #1e293b)",
                  background: "var(--bg-panel, #111827)",
                  color: "var(--text-primary, #e2e8f0)",
                  fontSize: "13px",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <label
                htmlFor="jwm-circuit-desc-input"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--text-secondary, #94a3b8)",
                  whiteSpace: "nowrap",
                  minWidth: "110px",
                  paddingTop: "8px",
                }}
              >
                Descrição
              </label>
              <textarea
                id="jwm-circuit-desc-input"
                className="laboratory-circuit-desc-input"
                value={circuit?.description || ""}
                placeholder="Breve descrição do circuito (opcional)"
                maxLength={240}
                rows={2}
                onChange={(event) => {
                  const nextDesc = event.target.value;
                  setCircuit((current) => ({
                    ...current,
                    description: nextDesc,
                  }));
                }}
                onKeyDown={(event) => {
                  event.stopPropagation();
                }}
                style={{
                  minWidth: "180px",
                  flex: "1 1 200px",
                  minHeight: "56px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #1e293b)",
                  background: "var(--bg-panel, #111827)",
                  color: "var(--text-primary, #e2e8f0)",
                  fontSize: "13px",
                  fontWeight: 500,
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

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
            title="Salvar circuito no computador (.json) — você pode nomear antes de baixar"
          >
            <Save size={18} />
            Salvar
          </button>

          {/* Label nativo + input: forma mais confiável de abrir arquivo no browser */}
          <input
            ref={fileInputRef}
            id="jwm-circuit-file-input"
            type="file"
            accept=".json,application/json,text/plain,text/json,*/*"
            onChange={handleFileInputChange}
            style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              padding: 0,
              margin: "-1px",
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          />
          <label
            htmlFor="jwm-circuit-file-input"
            className="laboratory-action-button"
            onClick={handleOpenCircuit}
            title="Abrir arquivo .json salvo. Segure Shift e clique para reabrir o último salvo no navegador."
            style={{ cursor: "pointer" }}
          >
            <FolderOpen size={18} />
            Abrir
          </label>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="laboratory-action-button"
              onClick={() => setShowRecent((v) => !v)}
              title="Circuitos salvos recentemente neste navegador"
            >
              <History size={18} />
              Recentes
              {recentCircuits.length > 0 ? (
                <span
                  style={{
                    marginLeft: 2,
                    fontSize: 11,
                    opacity: 0.85,
                  }}
                >
                  ({recentCircuits.length})
                </span>
              ) : null}
            </button>

            {showRecent ? (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  zIndex: 50,
                  width: "320px",
                  maxHeight: "360px",
                  overflowY: "auto",
                  borderRadius: "12px",
                  border: "1px solid var(--border, #1e293b)",
                  background: "var(--bg-panel, #0f172a)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                  padding: "8px",
                }}
              >
                {recentCircuits.length === 0 ? (
                  <div
                    style={{
                      padding: "14px 12px",
                      fontSize: "13px",
                      color: "var(--text-secondary, #94a3b8)",
                    }}
                  >
                    Nenhum circuito recente. Salve um circuito para aparecer aqui.
                  </div>
                ) : (
                  recentCircuits.map((item) => (
                    <button
                      key={item.id + (item.savedAt || "")}
                      type="button"
                      onClick={() => handleOpenRecent(item)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        marginBottom: "4px",
                        borderRadius: "8px",
                        border: "1px solid transparent",
                        background: "transparent",
                        color: "var(--text-primary, #e2e8f0)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--bg-panel-2, #1a2332)";
                        e.currentTarget.style.borderColor =
                          "var(--border-focus, #3b82f6)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          marginBottom: 2,
                        }}
                      >
                        {item.name || "Sem nome"}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary, #94a3b8)",
                        }}
                      >
                        {(item.componentCount || 0) +
                          " comp · " +
                          (item.wireCount || 0) +
                          " fios"}
                        {item.savedAt
                          ? " · " +
                            new Date(item.savedAt).toLocaleString("pt-BR")
                          : ""}
                      </div>
                      {item.description ? (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary, #94a3b8)",
                            marginTop: 4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.description}
                        </div>
                      ) : null}
                    </button>
                  ))
                )}

                {recentCircuits.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearRecent}
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: "6px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border, #1e293b)",
                      background: "transparent",
                      color: "var(--text-secondary, #94a3b8)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Limpar lista
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="laboratory-action-button"
            onClick={handleExportPdf}
            title="Exportar circuito em PDF (com nome e descrição)"
          >
            <FileDown size={18} />
            PDF
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

        <div className="toolbar-draw-tools" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>

          <button
            type="button"
            className={`toolbar-tool ${drawTool === "select" ? "active" : ""}`}
            onClick={() => {
              setDrawTool("select");
              setConnectionStart(null);
              setConnectionWaypoints([]);
              setMessage("Ferramenta: Selecionar. Clique em um componente para mover ou editar.");
            }}
            title="Selecionar / mover componentes"
          >
            <MousePointer2 size={18} />
            <span>Selecionar</span>
          </button>

          <button
            type="button"
            className={`toolbar-tool ${drawTool === "wire" ? "active" : ""}`}
            onClick={() => {
              setDrawTool("wire");
              setMessage(
                "Ferramenta: Fio. Clique em um terminal, depois em outro (ou no quadro para cantos). Esc cancela."
              );
            }}
            title="Desenhar fio entre terminais (estilo CADe SIMU)"
          >
            <Cable size={18} />
            <span>Fio</span>
          </button>

          <button
            type="button"
            className={`toolbar-tool ${drawTool === "delete" ? "active" : ""}`}
            onClick={() => {
              setDrawTool("delete");
              setConnectionStart(null);
              setConnectionWaypoints([]);
              setMessage("Ferramenta: Apagar. Clique em um componente ou fio para remover.");
            }}
            title="Apagar componente ou fio"
          >
            <Eraser size={18} />
            <span>Apagar</span>
          </button>

          <button
            type="button"
            className={`toolbar-tool ${drawTool === "pan" ? "active" : ""}`}
            onClick={() => {
              setDrawTool("pan");
              setConnectionStart(null);
              setMessage("Ferramenta: Mão. Use o zoom e arraste a visualização do quadro.");
            }}
            title="Mão / navegação"
          >
            <Hand size={18} />
            <span>Mão</span>
          </button>

        </div>

        <div className="toolbar-view-modes">
          <button
            type="button"
            className={`toolbar-view-btn ${viewMode === "blocos" ? "active" : ""}`}
            onClick={() => setViewMode("blocos")}
            title="Vista em blocos"
          >
            <LayoutGrid size={16} />
            <span>Blocos</span>
          </button>
          <button
            type="button"
            className={`toolbar-view-btn ${viewMode === "esquema" ? "active" : ""}`}
            onClick={() => setViewMode("esquema")}
            title="Diagrama esquemático"
          >
            <PenLine size={16} />
            <span>Esquema</span>
          </button>
          <button
            type="button"
            className={`toolbar-view-btn ${viewMode === "3d" ? "active" : ""}`}
            onClick={() => setViewMode("3d")}
            title="Vista 3D"
          >
            <Boxes size={16} />
            <span>3D</span>
          </button>
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
            ? "Ligando fio… clique em outro terminal ou no quadro para cantos. (Esc cancela)"
            : message}

        </div>


        <div
          className="toolbar-rotation"
          title="Girar componente selecionado (0–360°)"
        >
          <button
            type="button"
            className="zoom-button"
            onClick={() => handleRotateStep(-15)}
            title="Girar componente -15°"
            disabled={!selectedComponent}
          >
            <RotateCcw size={14} />
          </button>

          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={selectedRotation}
            onChange={handleRotationChange}
            className="rotation-slider"
            aria-label="Rotação do componente"
            disabled={!selectedComponent}
          />

          <button
            type="button"
            className="zoom-button zoom-value"
            onClick={handleRotationReset}
            title="Zerar rotação do componente"
            disabled={!selectedComponent}
          >
            {selectedRotation}°
          </button>

          <button
            type="button"
            className="zoom-button"
            onClick={() => handleRotateStep(15)}
            title="Girar componente +15°"
            disabled={!selectedComponent}
          >
            <RotateCw size={14} />
          </button>

          <button
            type="button"
            className="zoom-button"
            onClick={() => handleRotateStep(90)}
            title="Girar 90°"
            disabled={!selectedComponent}
          >
            90°
          </button>
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

          <button
            type="button"
            className={`zoom-button ${soundOn ? "active" : ""}`}
            onClick={() => {
              setSoundOn((v) => {
                const next = !v;
                setSoundMuted(!next);
                if (!next) stopMotorSound();
                setMessage(
                  next
                    ? "Sons do laboratório ativados."
                    : "Sons do laboratório desativados."
                );
                return next;
              });
            }}
            title={
              soundOn
                ? "Desativar sons"
                : "Ativar sons (motor, botoeiras, contator…)"
            }
          >
            {soundOn ? (
              <Volume2 size={16} />
            ) : (
              <VolumeX size={16} />
            )}
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

              {/* Fonte AC / DC */}
              {selectedComponent.type ===
                COMPONENT_TYPES.SOURCE && (

                <div style={{ marginTop: 10 }}>
                  <label>
                    <span>Tipo de tensão</span>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 6,
                      }}
                    >
                      <button
                        type="button"
                        className={`delete-component-button ${
                          String(
                            selectedComponent.mode || "DC"
                          ).toUpperCase() !== "AC"
                            ? "on"
                            : ""
                        }`}
                        style={{
                          flex: 1,
                          opacity:
                            String(
                              selectedComponent.mode || "DC"
                            ).toUpperCase() !== "AC"
                              ? 1
                              : 0.7,
                        }}
                        onClick={() => {
                          updateCircuit((current) =>
                            updateComponent(
                              current,
                              selectedComponent.id,
                              {
                                mode: "DC",
                                name: "Fonte DC",
                              }
                            )
                          );
                          setMessage(
                            "Fonte configurada em DC (contínua)."
                          );
                        }}
                      >
                        DC
                      </button>
                      <button
                        type="button"
                        className="delete-component-button"
                        style={{
                          flex: 1,
                          opacity:
                            String(
                              selectedComponent.mode || "DC"
                            ).toUpperCase() === "AC"
                              ? 1
                              : 0.7,
                        }}
                        onClick={() => {
                          updateCircuit((current) =>
                            updateComponent(
                              current,
                              selectedComponent.id,
                              {
                                mode: "AC",
                                name: "Fonte AC",
                                frequency:
                                  selectedComponent.frequency ??
                                  60,
                              }
                            )
                          );
                          setMessage(
                            "Fonte configurada em AC (alternada)."
                          );
                        }}
                      >
                        AC
                      </button>
                    </div>
                  </label>

                  {String(
                    selectedComponent.mode || "DC"
                  ).toUpperCase() === "AC" && (
                    <label style={{ marginTop: 10, display: "block" }}>
                      <span>Frequência (Hz)</span>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={
                            selectedComponent.frequency ?? 60
                          }
                          onChange={(event) => {
                            const v = Number(event.target.value);
                            updateCircuit((current) =>
                              updateComponent(
                                current,
                                selectedComponent.id,
                                {
                                  frequency:
                                    Number.isFinite(v) && v > 0
                                      ? v
                                      : 60,
                                }
                              )
                            );
                          }}
                        />
                        <span>Hz</span>
                      </div>
                      <small
                        style={{
                          display: "block",
                          marginTop: 4,
                          opacity: 0.75,
                        }}
                      >
                        Tensão informada = valor eficaz (RMS)
                      </small>
                    </label>
                  )}
                </div>

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

              {/* Proteções: rearmar / trocar fusível */}
              {[
                COMPONENT_TYPES.FUSE_ISOLATOR,
                COMPONENT_TYPES.THERMAL_RELAY,
                COMPONENT_TYPES.BREAKER,
              ].includes(selectedComponent.type) && (

                <div style={{ marginTop: 10 }}>
                  <label>
                    <span>Corrente de atuação (A)</span>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={
                          selectedComponent.maxCurrent ?? ""
                        }
                        onChange={(event) => {
                          const v = Number(event.target.value);
                          updateCircuit((current) =>
                            updateComponent(
                              current,
                              selectedComponent.id,
                              {
                                maxCurrent:
                                  Number.isFinite(v) && v > 0
                                    ? v
                                    : undefined,
                              }
                            )
                          );
                        }}
                      />
                      <span>A</span>
                    </div>
                  </label>

                  {selectedComponent.type ===
                    COMPONENT_TYPES.THERMAL_RELAY && (
                    <label style={{ marginTop: 8, display: "block" }}>
                      <span>Atraso térmico (s)</span>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={
                            selectedComponent.thermalDelay ?? 3
                          }
                          onChange={(event) => {
                            const v = Number(
                              event.target.value
                            );
                            updateCircuit((current) =>
                              updateComponent(
                                current,
                                selectedComponent.id,
                                {
                                  thermalDelay:
                                    Number.isFinite(v) &&
                                    v >= 0.5
                                      ? v
                                      : 3,
                                }
                              )
                            );
                          }}
                        />
                        <span>s</span>
                      </div>
                    </label>
                  )}

                  {selectedComponent.type ===
                    COMPONENT_TYPES.THERMAL_RELAY &&
                    thermalHeat[selectedComponent.id] && (
                    <p
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "#c2410c",
                        fontWeight: 600,
                      }}
                    >
                      Aquecendo:{" "}
                      {Math.round(
                        (thermalHeat[selectedComponent.id]
                          ?.progress || 0) * 100
                      )}
                      % — desarma em breve
                    </p>
                  )}

                  {(selectedComponent.tripped ||
                    selectedComponent.burned) && (
                    <button
                      type="button"
                      className="delete-component-button"
                      style={{ marginTop: 10 }}
                      onClick={() => {
                        updateCircuit((current) =>
                          updateComponent(
                            current,
                            selectedComponent.id,
                            {
                              value: true,
                              tripped: false,
                              burned: false,
                            }
                          )
                        );
                        setThermalHeat((prev) => {
                          const next = { ...prev };
                          delete next[selectedComponent.id];
                          return next;
                        });
                        setMessage(
                          selectedComponent.type ===
                            COMPONENT_TYPES.FUSE_ISOLATOR
                            ? "Fusível substituído e circuito rearmado."
                            : "Proteção rearmada."
                        );
                      }}
                    >
                      {selectedComponent.type ===
                      COMPONENT_TYPES.FUSE_ISOLATOR
                        ? "Trocar fusível / Rearmar"
                        : "Rearmar proteção"}
                    </button>
                  )}
                </div>

              )}

              {/* Valores atuais + limites nominais (sobrecarga) */}
              {[
                COMPONENT_TYPES.LAMP,
                COMPONENT_TYPES.LED,
                COMPONENT_TYPES.MOTOR,
                COMPONENT_TYPES.INDICATOR,
                COMPONENT_TYPES.RESISTOR,
              ].includes(selectedComponent.type) && (

                <div className="limits-grid">

                  {/* Valores reais do circuito (só leitura) */}
                  {selectedComponent.type !==
                    COMPONENT_TYPES.RESISTOR && (
                    <>
                      <label>
                        <span>Tensão atual (V)</span>
                        <input
                          type="text"
                          readOnly
                          value={
                            simulation.loads?.[
                              selectedComponent.id
                            ]?.energized
                              ? `${simulation.voltage ?? 0} V`
                              : "0 V (desligado)"
                          }
                          title="Vem da fonte — altere a Fonte para mudar"
                        />
                      </label>
                      <label>
                        <span>Corrente atual (A)</span>
                        <input
                          type="text"
                          readOnly
                          value={(() => {
                            const load =
                              simulation.loads?.[
                                selectedComponent.id
                              ];
                            if (!load?.energized) {
                              return "0 A (desligado)";
                            }
                            const I =
                              load.current ??
                              (Number(
                                selectedComponent.resistance
                              ) > 0
                                ? simulation.voltage /
                                  selectedComponent.resistance
                                : simulation.current);
                            return `${Number(I).toFixed(3)} A`;
                          })()}
                          title="I ≈ V / R — altere a Resistência ou a Fonte"
                        />
                      </label>
                    </>
                  )}

                  {(selectedComponent.type !==
                    COMPONENT_TYPES.RESISTOR ||
                    selectedComponent.resistance !=
                      null) && (
                    <label>
                      <span>Resistência (Ω)</span>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={
                          selectedComponent.resistance ??
                          ""
                        }
                        placeholder="auto"
                        onChange={(event) => {
                          const raw = event.target.value;
                          if (raw === "" || raw === "-") {
                            return;
                          }
                          const v = Number(raw);
                          if (
                            !Number.isFinite(v) ||
                            v <= 0
                          ) {
                            return;
                          }
                          updateCircuit((current) =>
                            updateComponent(
                              current,
                              selectedComponent.id,
                              { resistance: v }
                            )
                          );
                        }}
                      />
                    </label>
                  )}

                  <label>
                    <span>I máx (A) — limite</span>
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={
                        selectedComponent.maxCurrent ??
                        ""
                      }
                      placeholder="—"
                      onChange={(event) => {
                        const raw = event.target.value;
                        if (raw === "" || raw === "-") {
                          return;
                        }
                        const v = Number(raw);
                        if (
                          !Number.isFinite(v) ||
                          v <= 0
                        ) {
                          return;
                        }
                        updateCircuit((current) =>
                          updateComponent(
                            current,
                            selectedComponent.id,
                            { maxCurrent: v }
                          )
                        );
                      }}
                    />
                  </label>

                  <label>
                    <span>P máx (W) — limite</span>
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={
                        selectedComponent.maxPower ?? ""
                      }
                      placeholder="—"
                      onChange={(event) => {
                        const raw = event.target.value;
                        if (raw === "" || raw === "-") {
                          return;
                        }
                        const v = Number(raw);
                        if (
                          !Number.isFinite(v) ||
                          v <= 0
                        ) {
                          return;
                        }
                        updateCircuit((current) =>
                          updateComponent(
                            current,
                            selectedComponent.id,
                            { maxPower: v }
                          )
                        );
                      }}
                    />
                  </label>

                  <label>
                    <span>V máx (V) — limite</span>
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={
                        selectedComponent.maxVoltage ??
                        ""
                      }
                      placeholder="—"
                      onChange={(event) => {
                        const raw = event.target.value;
                        if (raw === "" || raw === "-") {
                          return;
                        }
                        const v = Number(raw);
                        if (
                          !Number.isFinite(v) ||
                          v <= 0
                        ) {
                          return;
                        }
                        updateCircuit((current) =>
                          updateComponent(
                            current,
                            selectedComponent.id,
                            { maxVoltage: v }
                          )
                        );
                      }}
                    />
                  </label>

                  <small
                    style={{
                      gridColumn: "1 / -1",
                      opacity: 0.8,
                      lineHeight: 1.35,
                      marginTop: 4,
                    }}
                  >
                    A tensão vem da <strong>Fonte</strong>.
                    A corrente é I ≈ V / R — mude a{" "}
                    <strong>Resistência</strong> do motor
                    ou a tensão da fonte. I/P/V máx são só
                    limites de sobrecarga.
                  </small>

                </div>

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


                const count = (
                  circuit.components || []
                ).filter(
                  (component) =>
                    component.type ===
                    catalogItem.id
                ).length;


                return (
                  <button
                    type="button"
                    key={
                      catalogItem.id
                    }
                    className={`component-item ${
                      count > 0
                        ? "has-instances"
                        : ""
                    }`}
                    title="Clique para adicionar outro no quadro"
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


                    {count > 0 && (
                      <span
                        className="component-item-count"
                        title={`${count} no quadro — clique para adicionar mais`}
                      >
                        {count}
                      </span>
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
            className={[
              "circuit-board",
              "circuit-grid-background",
              connectionStart || drawTool === "wire" ? "connection-mode" : "",
              drawTool === "delete" ? "delete-mode" : "",
              drawTool === "pan" ? "pan-mode" : "",
              `view-${viewMode}`,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              transform:
                viewMode === "3d"
                  ? `perspective(1000px) rotateX(18deg) scale(${zoom})`
                  : `scale(${zoom})`,
              transformOrigin:
                viewMode === "3d" ? "center center" : "top left",
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
            onDragOver={handleDragOverCircuitFile}
            onDrop={handleDropCircuitFile}
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
              layoutKey={`${viewMode}-${zoom}-${selectedRotation}-${circuit.components?.map((c) => c.rotation || 0).join(",")}`}
              viewMode={viewMode}
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

                  overloaded={
                    getComponentSimulationState(
                      component
                    ).overloaded === true
                  }

                  overloadReasons={
                    getComponentSimulationState(
                      component
                    ).overloadReasons || []
                  }

                  thermalProgress={
                    thermalHeat[component.id]
                      ?.progress || 0
                  }

                  coilEnergized={
                    simulation.coils?.[component.id]
                      ?.coilEnergized === true
                  }

                  timerProgress={
                    timerHeat[component.id]
                      ?.progress || 0
                  }

                  connectionStart={
                    connectionStart
                  }

                  viewMode={
                    viewMode
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

            {/* Alertas de sobrecarga e proteções */}
            {(() => {
              const overloadedItems = Object.values(
                simulation.loads || {}
              ).filter((s) => s?.overloaded);

              const trippedDevices = (
                circuit.components || []
              ).filter(
                (c) =>
                  c.tripped === true || c.burned === true
              );

              const heatingIds = Object.keys(
                thermalHeat || {}
              );

              if (
                overloadedItems.length === 0 &&
                trippedDevices.length === 0 &&
                heatingIds.length === 0
              ) {
                return null;
              }

              return (
                <div className="overload-alert-banner" role="alert">
                  {overloadedItems.length > 0 && (
                    <>
                      <strong>
                        ⚠ Sobrecarga em{" "}
                        {overloadedItems.length} componente
                        {overloadedItems.length > 1
                          ? "s"
                          : ""}
                      </strong>
                      <ul>
                        {overloadedItems.map((item) => {
                          const comp = (
                            circuit.components || []
                          ).find((c) => c.id === item.id);
                          const name =
                            comp?.name ||
                            item.type ||
                            item.id;
                          return (
                            <li key={item.id}>
                              <strong>{name}</strong>
                              {": "}
                              {(
                                item.overloadReasons || []
                              ).join("; ")}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}

                  {heatingIds.length > 0 && (
                    <>
                      <strong style={{ marginTop: 6 }}>
                        🌡 Relé térmico aquecendo
                      </strong>
                      <ul>
                        {heatingIds.map((id) => {
                          const comp = (
                            circuit.components || []
                          ).find((c) => c.id === id);
                          const heat = thermalHeat[id];
                          return (
                            <li key={id}>
                              <strong>
                                {comp?.name || id}
                              </strong>
                              {`: ${Math.round(
                                (heat?.progress || 0) * 100
                              )}% — ${Number(
                                heat?.current || 0
                              ).toFixed(2)} A > ${
                                heat?.limit
                              } A`}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}

                  {trippedDevices.length > 0 && (
                    <>
                      <strong style={{ marginTop: 6 }}>
                        ⛔ Proteções atuadas
                      </strong>
                      <ul>
                        {trippedDevices.map((comp) => (
                          <li key={comp.id}>
                            <strong>
                              {comp.name || comp.type}
                            </strong>
                            {comp.burned
                              ? ": fusível queimado"
                              : ": desarmado"}
                            {" — selecione o componente e rearme"}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              );
            })()}


            <div className="measurements-grid">

              <div className="measurement-card">

                <span>
                  Tensão
                  {simulation.sourceMode === "AC"
                    ? " (RMS)"
                    : " (DC)"}
                </span>

                <strong>
                  {simulation.voltage} V
                  {simulation.sourceMode === "AC"
                    ? " AC"
                    : " DC"}
                </strong>

                {simulation.sourceMode === "AC" && (
                  <small style={{ display: "block", opacity: 0.75 }}>
                    {simulation.frequency || 60} Hz
                  </small>
                )}

              </div>


              <div className="measurement-card">

                <span>
                  Corrente
                  {simulation.sourceMode === "AC"
                    ? " (RMS)"
                    : ""}
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
                      {simulation.reactive.capacitor.value ??
                        simulation.reactive.capacitor.valueuF ??
                        "—"}{" "}
                      µF
                    </strong>
                  </div>

                  {simulation.reactive.capacitor.mode === "AC" ? (
                    <div className="measurement-card">
                      <span>XC (reatância)</span>
                      <strong>
                        {simulation.reactive.capacitor.reactance != null
                          ? `${simulation.reactive.capacitor.reactance} Ω`
                          : "—"}
                      </strong>
                    </div>
                  ) : (
                    <div className="measurement-card">
                      <span>τ Capacitor</span>
                      <strong>
                        {simulation.reactive.capacitor.tauMs != null
                          ? `${simulation.reactive.capacitor.tauMs} ms`
                          : "R necessária"}
                      </strong>
                    </div>
                  )}

                  <div className="measurement-card">
                    <span>
                      {simulation.reactive.capacitor.mode === "AC"
                        ? "Corrente no C"
                        : "Energia do capacitor"}
                    </span>
                    <strong>
                      {simulation.reactive.capacitor.mode === "AC"
                        ? `${simulation.reactive.capacitor.current ?? "—"} A`
                        : simulation.reactive.capacitor.energyJ != null
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
                      {simulation.reactive.inductor.value ??
                        simulation.reactive.inductor.valuemH ??
                        "—"}{" "}
                      mH
                    </strong>
                  </div>

                  {simulation.reactive.inductor.mode === "AC" ? (
                    <div className="measurement-card">
                      <span>XL (reatância)</span>
                      <strong>
                        {simulation.reactive.inductor.reactance != null
                          ? `${simulation.reactive.inductor.reactance} Ω`
                          : "—"}
                      </strong>
                    </div>
                  ) : (
                    <div className="measurement-card">
                      <span>τ Indutor</span>
                      <strong>
                        {simulation.reactive.inductor.tauMs != null
                          ? `${simulation.reactive.inductor.tauMs} ms`
                          : "R necessária"}
                      </strong>
                    </div>
                  )}

                  <div className="measurement-card">
                    <span>
                      {simulation.reactive.inductor.mode === "AC"
                        ? "Corrente no L"
                        : "Energia do indutor"}
                    </span>
                    <strong>
                      {simulation.reactive.inductor.mode === "AC"
                        ? `${simulation.reactive.inductor.current ?? "—"} A`
                        : simulation.reactive.inductor.energyJ != null
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
              FÓRMULAS E CÁLCULOS
          ================================================== */}

          <section className="formulas-panel">

            <div className="formulas-heading">
              <div>
                <span className="panel-kicker">
                  CONCEITOS
                </span>
                <h2>
                  Fórmulas e cálculos
                </h2>
                <p>
                  Relações elétricas aplicadas ao circuito atual.
                </p>
              </div>
            </div>

            <div className="formulas-grid">

              <div className="formula-card">
                <strong>Lei de Ohm</strong>
                <code>I = V / R</code>
                <small>
                  {Number(simulation.resistance) > 0
                    ? `I = ${simulation.voltage} / ${simulation.resistance} = ${(
                        Number(simulation.voltage) /
                        Number(simulation.resistance)
                      ).toFixed(4)} A`
                    : "Informe R > 0"}
                </small>
                <code>V = I × R</code>
                <small>
                  V = {simulation.current} × {simulation.resistance} = {(
                    Number(simulation.current) *
                    Number(simulation.resistance)
                  ).toFixed(4)} V
                </small>
                <code>R = V / I</code>
                <small>
                  {Number(simulation.current) > 0
                    ? `R = ${simulation.voltage} / ${simulation.current} = ${(
                        Number(simulation.voltage) /
                        Number(simulation.current)
                      ).toFixed(4)} Ω`
                    : "Sem corrente"}
                </small>
              </div>

              <div className="formula-card">
                <strong>Potência elétrica</strong>
                <code>P = V × I</code>
                <small>
                  P = {simulation.voltage} × {simulation.current} = {(
                    Number(simulation.voltage) *
                    Number(simulation.current)
                  ).toFixed(4)} W
                </small>
                <code>P = I² × R</code>
                <small>
                  P = ({simulation.current})² × {simulation.resistance} = {(
                    Number(simulation.current) ** 2 *
                    Number(simulation.resistance)
                  ).toFixed(4)} W
                </small>
                <code>P = V² / R</code>
                <small>
                  {Number(simulation.resistance) > 0
                    ? `P = (${simulation.voltage})² / ${simulation.resistance} = ${(
                        (Number(simulation.voltage) ** 2) /
                        Number(simulation.resistance)
                      ).toFixed(4)} W`
                    : "Informe R > 0"}
                </small>
              </div>

              <div className="formula-card">
                <strong>Energia</strong>
                <code>E = P × t</code>
                <small>
                  Em 1 s: E = {simulation.power} × 1 = {Number(simulation.power).toFixed(4)} J
                </small>
                <small>
                  Em 1 min: E = {simulation.power} × 60 = {(
                    Number(simulation.power) * 60
                  ).toFixed(4)} J
                </small>
                <code>E = ½ C V²</code>
                <small>
                  {simulation.reactive?.capacitor
                    ? `E ≈ ${simulation.reactive.capacitor.energyJ ?? 0} J`
                    : "Sem capacitor no circuito"}
                </small>
                <code>E = ½ L I²</code>
                <small>
                  {simulation.reactive?.inductor
                    ? `E ≈ ${simulation.reactive.inductor.energyJ ?? 0} J`
                    : "Sem indutor no circuito"}
                </small>
              </div>

              <div className="formula-card">
                <strong>Constantes de tempo</strong>
                <code>τ = R × C</code>
                <small>
                  {simulation.reactive?.capacitor?.tauMs != null
                    ? `τ = ${simulation.reactive.capacitor.tauMs} ms`
                    : "Precisa de R e C"}
                </small>
                <code>τ = L / R</code>
                <small>
                  {simulation.reactive?.inductor?.tauMs != null
                    ? `τ = ${simulation.reactive.inductor.tauMs} ms`
                    : "Precisa de L e R"}
                </small>
                <code>t ≈ 5τ</code>
                <small>
                  Tempo para regime permanente (~99%)
                </small>
              </div>

              <div className="formula-card">
                <strong>Resistências associadas</strong>
                <code>Série: R<sub>eq</sub> = R₁ + R₂</code>
                <small>
                  Soma das resistências no mesmo ramo
                </small>
                <code>Paralelo: 1/R<sub>eq</sub> = 1/R₁ + 1/R₂</code>
                <small>
                  R<sub>eq</sub> atual do circuito ≈ {simulation.resistance} Ω
                </small>
              </div>

              <div className="formula-card">
                <strong>Resumo do circuito</strong>
                <small>
                  Status: {simulation.energized ? "Energizado" : "Desligado / aberto"}
                </small>
                <small>
                  Componentes: {(circuit.components || []).length}
                </small>
                <small>
                  Conexões (fios): {(circuit.wires || []).length}
                </small>
                <small>
                  Cargas energizadas: {(simulation.energizedLoadIds || []).length}
                </small>
              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}
