import {
  Battery,
  Circle,
  CircleDot,
  Cog,
  Lightbulb,
  ToggleLeft,
  ToggleRight,
  Box,
  Shield,
} from "lucide-react";

import { COMPONENT_TYPES } from "./components/componentTypes";
import { getComponentTerminals } from "./connections/connectionUtils";

/* ==================================================
   ÍCONES DOS COMPONENTES
================================================== */

const icons = {
  [COMPONENT_TYPES.SOURCE]: Battery,
  [COMPONENT_TYPES.RESISTOR]: CircleDot,
  [COMPONENT_TYPES.CAPACITOR]: CircleDot,
  [COMPONENT_TYPES.INDUCTOR]: Cog,
  [COMPONENT_TYPES.SWITCH]: Circle,
  [COMPONENT_TYPES.LAMP]: Lightbulb,
  [COMPONENT_TYPES.MOTOR]: Cog,
  [COMPONENT_TYPES.LED]: Lightbulb,
  [COMPONENT_TYPES.PUSH_BUTTON_NO]: ToggleLeft,
  [COMPONENT_TYPES.PUSH_BUTTON_NC]: ToggleRight,
  [COMPONENT_TYPES.CONTACTOR]: Box,
  [COMPONENT_TYPES.BREAKER]: Shield,
  [COMPONENT_TYPES.FUSE_ISOLATOR]: Shield,
  [COMPONENT_TYPES.THERMAL_RELAY]: Cog,
  [COMPONENT_TYPES.INDICATOR]: Circle,
};

/* ==================================================
   COMPONENT NODE
================================================== */

/* ==================================================
   SÍMBOLOS DO DIAGRAMA ESQUEMÁTICO
================================================== */

/* Símbolos técnicos estilo CADe SIMU (imagem de referência) */
function SchematicSymbol({ type, energized, switchOn }) {
  const s = "#111827";

  switch (type) {
    case COMPONENT_TYPES.SOURCE:
      // Bateria vertical: traço longo (+) e curto (−)
      return (
        <svg viewBox="0 0 40 48" className="schematic-svg">
          <line x1="20" y1="2" x2="20" y2="12" stroke={s} strokeWidth="2" />
          <line x1="10" y1="14" x2="30" y2="14" stroke={s} strokeWidth="2.5" />
          <line x1="14" y1="20" x2="26" y2="20" stroke={s} strokeWidth="2" />
          <line x1="10" y1="26" x2="30" y2="26" stroke={s} strokeWidth="2.5" />
          <line x1="14" y1="32" x2="26" y2="32" stroke={s} strokeWidth="2" />
          <line x1="20" y1="34" x2="20" y2="46" stroke={s} strokeWidth="2" />
          <text x="32" y="16" fontSize="8" fill={s}>+</text>
          <text x="32" y="34" fontSize="8" fill={s}>−</text>
        </svg>
      );
    case COMPONENT_TYPES.RESISTOR:
      return (
        <svg viewBox="0 0 56 24" className="schematic-svg">
          <path
            d="M2 12 H10 L14 4 L20 20 L26 4 L32 20 L38 4 L44 12 H54"
            fill="none"
            stroke={s}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case COMPONENT_TYPES.CAPACITOR:
      return (
        <svg viewBox="0 0 48 28" className="schematic-svg">
          <line x1="2" y1="14" x2="18" y2="14" stroke={s} strokeWidth="2" />
          <line x1="20" y1="4" x2="20" y2="24" stroke={s} strokeWidth="2.5" />
          <line x1="28" y1="4" x2="28" y2="24" stroke={s} strokeWidth="2.5" />
          <line x1="30" y1="14" x2="46" y2="14" stroke={s} strokeWidth="2" />
        </svg>
      );
    case COMPONENT_TYPES.INDUCTOR:
      return (
        <svg viewBox="0 0 56 24" className="schematic-svg">
          <path
            d="M2 12 H8 A5 5 0 0 1 18 12 A5 5 0 0 1 28 12 A5 5 0 0 1 38 12 A5 5 0 0 1 48 12 H54"
            fill="none"
            stroke={s}
            strokeWidth="2"
          />
        </svg>
      );
    case COMPONENT_TYPES.SWITCH:
    case COMPONENT_TYPES.PUSH_BUTTON_NO:
    case COMPONENT_TYPES.BREAKER:
    case COMPONENT_TYPES.CONTACTOR:
      return (
        <svg viewBox="0 0 56 32" className="schematic-svg">
          <line x1="2" y1="20" x2="16" y2="20" stroke={s} strokeWidth="2" />
          <circle cx="18" cy="20" r="2.8" fill={s} />
          <line
            x1="18"
            y1="20"
            x2={switchOn ? "40" : "38"}
            y2={switchOn ? "20" : "6"}
            stroke={s}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="40" cy="20" r="2.8" fill={switchOn ? s : "none"} stroke={s} strokeWidth="2" />
          <line x1="42" y1="20" x2="54" y2="20" stroke={s} strokeWidth="2" />
        </svg>
      );
    case COMPONENT_TYPES.PUSH_BUTTON_NC:
      return (
        <svg viewBox="0 0 56 28" className="schematic-svg">
          <line x1="2" y1="14" x2="16" y2="14" stroke={s} strokeWidth="2" />
          <circle cx="18" cy="14" r="2.8" fill={s} />
          <line
            x1="18"
            y1="14"
            x2="40"
            y2={switchOn ? "14" : "4"}
            stroke={s}
            strokeWidth="2.5"
          />
          <circle cx="40" cy="14" r="2.8" fill={s} />
          <line x1="42" y1="14" x2="54" y2="14" stroke={s} strokeWidth="2" />
        </svg>
      );
    case COMPONENT_TYPES.LAMP:
    case COMPONENT_TYPES.INDICATOR:
      // Círculo com X (como na referência)
      return (
        <svg viewBox="0 0 40 40" className="schematic-svg">
          <circle
            cx="20"
            cy="20"
            r="12"
            fill={energized ? "#fef08a" : "none"}
            stroke={s}
            strokeWidth="2"
          />
          <line x1="12" y1="12" x2="28" y2="28" stroke={s} strokeWidth="1.8" />
          <line x1="28" y1="12" x2="12" y2="28" stroke={s} strokeWidth="1.8" />
        </svg>
      );
    case COMPONENT_TYPES.MOTOR:
      // Motor trifásico estilo CADe SIMU (círculo + M + 3~)
      return (
        <svg viewBox="0 0 48 48" className="schematic-svg">
          <circle cx="24" cy="24" r="14" fill="none" stroke={s} strokeWidth="2" />
          <text
            x="24"
            y="22"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fontFamily="Arial, sans-serif"
            fill={s}
          >
            M
          </text>
          <text
            x="24"
            y="34"
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fontFamily="Arial, sans-serif"
            fill={s}
          >
            3~
          </text>
        </svg>
      );
    case COMPONENT_TYPES.FUSE_ISOLATOR:
      // Seccionador com fusível (FU) — retângulo + fusível
      return (
        <svg viewBox="0 0 56 40" className="schematic-svg">
          <line x1="2" y1="20" x2="12" y2="20" stroke={s} strokeWidth="2" />
          <rect
            x="12"
            y="8"
            width="32"
            height="24"
            rx="2"
            fill="none"
            stroke={s}
            strokeWidth="2"
          />
          {/* fusível */}
          <rect
            x="20"
            y="14"
            width="16"
            height="12"
            rx="1"
            fill={switchOn ? "#fecaca" : "none"}
            stroke={s}
            strokeWidth="1.6"
          />
          <line x1="28" y1="14" x2="28" y2="26" stroke={s} strokeWidth="1.4" />
          <text x="28" y="7" textAnchor="middle" fontSize="7" fill={s} fontWeight="700">
            FU
          </text>
          <line x1="44" y1="20" x2="54" y2="20" stroke={s} strokeWidth="2" />
        </svg>
      );
    case COMPONENT_TYPES.THERMAL_RELAY:
      // Relé térmico RT
      return (
        <svg viewBox="0 0 56 40" className="schematic-svg">
          <line x1="2" y1="20" x2="12" y2="20" stroke={s} strokeWidth="2" />
          <rect
            x="12"
            y="10"
            width="32"
            height="20"
            rx="2"
            fill="none"
            stroke={s}
            strokeWidth="2"
          />
          <path
            d="M18 24 Q22 12 28 20 Q34 28 38 16"
            fill="none"
            stroke={s}
            strokeWidth="1.8"
          />
          <text x="28" y="9" textAnchor="middle" fontSize="7" fill={s} fontWeight="700">
            RT
          </text>
          <line x1="44" y1="20" x2="54" y2="20" stroke={s} strokeWidth="2" />
        </svg>
      );
    case COMPONENT_TYPES.LED:
      return (
        <svg viewBox="0 0 48 32" className="schematic-svg">
          <line x1="2" y1="16" x2="14" y2="16" stroke={s} strokeWidth="2" />
          <path
            d="M16 6 L16 26 L30 16 Z"
            fill={energized ? "#fecaca" : "none"}
            stroke={s}
            strokeWidth="2"
          />
          <line x1="30" y1="6" x2="30" y2="26" stroke={s} strokeWidth="2" />
          <line x1="32" y1="16" x2="46" y2="16" stroke={s} strokeWidth="2" />
          <path d="M34 8 L40 4 M34 8 L36 12" fill="none" stroke={s} strokeWidth="1.5" />
          <path d="M38 12 L44 8 M38 12 L40 16" fill="none" stroke={s} strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 24" className="schematic-svg">
          <rect x="8" y="4" width="24" height="16" rx="2" fill="none" stroke={s} strokeWidth="2" />
        </svg>
      );
  }
}

/* Ícones 3D realistas (estilo do mockup) */
function Block3DIcon({ type, energized, switchOn, running }) {
  switch (type) {
    case COMPONENT_TYPES.SOURCE:
      return (
        <svg viewBox="0 0 48 48" className="block3d-svg">
          <rect x="12" y="10" width="24" height="28" rx="4" fill="#1e293b" />
          <rect x="16" y="14" width="16" height="8" rx="1" fill="#22c55e" />
          <text x="24" y="20" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fff">+</text>
          <rect x="16" y="26" width="16" height="8" rx="1" fill="#64748b" />
          <text x="24" y="32" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fff">−</text>
        </svg>
      );
    case COMPONENT_TYPES.SWITCH:
    case COMPONENT_TYPES.PUSH_BUTTON_NO:
    case COMPONENT_TYPES.PUSH_BUTTON_NC:
    case COMPONENT_TYPES.BREAKER:
    case COMPONENT_TYPES.CONTACTOR:
      return (
        <svg viewBox="0 0 48 48" className="block3d-svg">
          <rect x="14" y="18" width="20" height="16" rx="3" fill="#1e293b" />
          <rect x="18" y="22" width="12" height="8" rx="2" fill="#334155" />
          <line
            x1="24"
            y1="26"
            x2={switchOn ? "34" : "30"}
            y2={switchOn ? "14" : "10"}
            stroke="#cbd5e1"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={switchOn ? 34 : 30} cy={switchOn ? 14 : 10} r="3" fill="#e2e8f0" />
        </svg>
      );
    case COMPONENT_TYPES.FUSE_ISOLATOR:
      // Seccionador com fusível 3D
      return (
        <svg viewBox="0 0 48 48" className="block3d-svg">
          <rect x="10" y="14" width="28" height="20" rx="3" fill="#1e293b" />
          <rect
            x="16"
            y="18"
            width="16"
            height="12"
            rx="2"
            fill={switchOn ? "#fca5a5" : "#334155"}
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <line x1="24" y1="18" x2="24" y2="30" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="24" y="12" textAnchor="middle" fontSize="7" fontWeight="800" fill="#f87171">
            FU
          </text>
        </svg>
      );
    case COMPONENT_TYPES.THERMAL_RELAY:
      // Relé térmico 3D
      return (
        <svg viewBox="0 0 48 48" className="block3d-svg">
          <rect x="10" y="16" width="28" height="18" rx="3" fill="#1e293b" />
          <path
            d="M16 28 Q20 18 24 24 Q28 30 32 20"
            fill="none"
            stroke={switchOn ? "#fb923c" : "#94a3b8"}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text x="24" y="14" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fb923c">
            RT
          </text>
        </svg>
      );
    case COMPONENT_TYPES.LAMP:
    case COMPONENT_TYPES.INDICATOR:
      return (
        <svg viewBox="0 0 48 48" className="block3d-svg">
          <ellipse
            cx="24"
            cy="20"
            rx="12"
            ry="14"
            fill={energized ? "#fde047" : "#e2e8f0"}
            stroke={energized ? "#eab308" : "#94a3b8"}
            strokeWidth="1.5"
          />
          {energized && (
            <>
              <line x1="24" y1="2" x2="24" y2="6" stroke="#fbbf24" strokeWidth="2" />
              <line x1="8" y1="12" x2="11" y2="14" stroke="#fbbf24" strokeWidth="2" />
              <line x1="40" y1="12" x2="37" y2="14" stroke="#fbbf24" strokeWidth="2" />
            </>
          )}
          <path d="M18 32 Q24 36 30 32 L28 38 H20 Z" fill="#64748b" />
          <rect x="20" y="38" width="8" height="4" rx="1" fill="#475569" />
        </svg>
      );
    case COMPONENT_TYPES.MOTOR:
      return (
        <svg viewBox="0 0 48 48" className="block3d-svg">
          <rect
            x="10"
            y="16"
            width="22"
            height="16"
            rx="3"
            fill={running ? "#94a3b8" : "#64748b"}
          />
          <circle cx="14" cy="24" r="3" fill="#334155" />
          <circle cx="34" cy="24" r="8" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          <circle cx="34" cy="24" r="3" fill="#1e293b" />
          {[0, 45, 90, 135].map((deg) => (
            <line
              key={deg}
              x1="34"
              y1="24"
              x2={34 + 7 * Math.cos((deg * Math.PI) / 180)}
              y2={24 + 7 * Math.sin((deg * Math.PI) / 180)}
              stroke="#1e293b"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      );
    case COMPONENT_TYPES.RESISTOR:
      return (
        <svg viewBox="0 0 48 32" className="block3d-svg">
          <path
            d="M4 16 H12 L15 6 L21 26 L27 6 L33 26 L39 6 L42 16 H44"
            fill="none"
            stroke="#78350f"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case COMPONENT_TYPES.LED:
      return (
        <svg viewBox="0 0 48 48" className="block3d-svg">
          <circle
            cx="24"
            cy="22"
            r="12"
            fill={energized ? "#f87171" : "#fecaca"}
            stroke="#dc2626"
            strokeWidth="1.5"
          />
          <path d="M24 10 L24 6 M16 14 L13 11 M32 14 L35 11" stroke="#fbbf24" strokeWidth="2" />
          <rect x="20" y="34" width="8" height="6" rx="1" fill="#64748b" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" className="block3d-svg">
          <rect x="10" y="10" width="28" height="28" rx="6" fill="#94a3b8" />
        </svg>
      );
  }
}

export default function ComponentNode({
  component,
  selected = false,
  energized = false,
  running = false,
  power = 0,
  overloaded = false,
  overloadReasons = [],
  thermalProgress = 0,
  coilEnergized = false,
  timerProgress = 0,
  connectionStart = null,
  viewMode = "blocos",
  onSelect,
  onStartDrag,
  onStartConnection,
  onCompleteConnection,
}) {
  /* ==================================================
     PROTEÇÃO
  ================================================== */

  if (!component) {
    return null;
  }

  /* ==================================================
     ÍCONE
  ================================================== */

  const Icon = icons[component.type] || Circle;
  const isSchematic = viewMode === "esquema";
  const is3d = viewMode === "3d";

  /* ==================================================
     TIPOS DE COMPONENTES
  ================================================== */

  const isLamp =
    component.type === COMPONENT_TYPES.LAMP ||
    component.type === COMPONENT_TYPES.INDICATOR;

  const isMotor =
    component.type === COMPONENT_TYPES.MOTOR;

  const isLED =
    component.type === COMPONENT_TYPES.LED;

  const isSwitch =
    component.type === COMPONENT_TYPES.SWITCH ||
    component.type === COMPONENT_TYPES.PUSH_BUTTON_NO ||
    component.type === COMPONENT_TYPES.PUSH_BUTTON_NC ||
    component.type === COMPONENT_TYPES.CONTACTOR ||
    component.type === COMPONENT_TYPES.BREAKER ||
    component.type === COMPONENT_TYPES.FUSE_ISOLATOR ||
    component.type === COMPONENT_TYPES.THERMAL_RELAY;

  const isProtection =
    component.type === COMPONENT_TYPES.BREAKER ||
    component.type === COMPONENT_TYPES.FUSE_ISOLATOR ||
    component.type === COMPONENT_TYPES.THERMAL_RELAY;

  const isBurned =
    isProtection && component.burned === true;

  const isTripped =
    isProtection &&
    (component.tripped === true || component.burned === true);

  const isContactor =
    component.type === COMPONENT_TYPES.CONTACTOR;

  const isTimer =
    component.type === COMPONENT_TYPES.TIMER_ON_DELAY;

  const contactorOn = isContactor && coilEnergized;
  const timerTiming = isTimer && timerProgress > 0 && !component.value;
  const timerClosed = isTimer && component.value === true;

  /* ==================================================
     TERMINAIS
  ================================================== */

  const terminals = getComponentTerminals(component) || [];

  /* ==================================================
     POTÊNCIA
  ================================================== */

  const numericPower = Number(power) || 0;

  /* ==================================================
     INTENSIDADE DA LÂMPADA
  ================================================== */

  const lampIntensity =
    isLamp && energized
      ? Math.min(Math.max(numericPower / 100, 0.25), 1)
      : 0;

  /* ==================================================
     ESTADO DO MOTOR
  ================================================== */

  const motorRunning =
    isMotor && energized && running === true;

  /* ==================================================
     ESTADO DO INTERRUPTOR
  ================================================== */

  const switchOn =
    isSwitch && component.value === true;

  /* ==================================================
     IDENTIFICAR O TERMINAL DE ORIGEM
  ================================================== */

  const isOriginTerminal = (terminal) => {
    if (!connectionStart) {
      return false;
    }

    return (
      connectionStart.componentId === component.id &&
      String(connectionStart.terminalId) ===
        String(terminal.id)
    );
  };

  /* ==================================================
     MOUSE DOWN NO COMPONENTE
  ================================================== */

  const handleMouseDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    /*
     * Não inicia o arraste quando o usuário
     * está clicando em um terminal.
     */

    if (event.target.closest("[data-terminal='true']")) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    onSelect?.(component.id);

    onStartDrag?.(event, component);
  };

  /* ==================================================
     INICIAR OU CONCLUIR CONEXÃO
  ================================================== */

  const handleTerminalMouseDown = (event, terminal) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    /*
     * PRIMEIRO CLIQUE:
     *
     * Se não existe uma origem selecionada,
     * inicia a conexão neste terminal.
     */

    if (!connectionStart) {
      onStartConnection?.(event, component, terminal);

      return;
    }

    /*
     * IMPEDIR CONEXÃO DO TERMINAL COM ELE MESMO
     */

    if (isOriginTerminal(terminal)) {
      return;
    }

    /*
     * SEGUNDO CLIQUE:
     *
     * Se já existe uma origem, utiliza
     * este terminal como destino.
     */

    onCompleteConnection?.(event, component, terminal);
  };

  /* ==================================================
     FINALIZAR EVENTO DO TERMINAL
  ================================================== */

  const handleTerminalMouseUp = (event, terminal) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    /*
     * A conexão é iniciada e concluída pelo
     * mouseDown dos terminais.
     *
     * Por isso, não devemos concluir novamente
     * a conexão no mouseUp.
     *
     * Isso evita conexões duplicadas e conflitos
     * com as atualizações assíncronas do React.
     */

    if (!connectionStart) {
      return;
    }

    /*
     * Se o usuário soltou o mouse no terminal
     * de origem, não faz nada.
     */

    if (isOriginTerminal(terminal)) {
      return;
    }

    /*
     * Não chamamos onCompleteConnection aqui,
     * pois o segundo clique já trata da conexão.
     */
  };

  /* ==================================================
     CLIQUE NO TERMINAL
  ================================================== */

  const handleTerminalClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  /* ==================================================
     CLASSES CSS
  ================================================== */

  const componentClasses = [
    "component-node",

    `component-node-${component.type}`,

    selected ? "selected" : "",

    energized ? "energized" : "",

    isLamp && energized ? "lamp-on" : "",

    motorRunning ? "motor-running" : "",

    isLED && energized ? "led-on" : "",

    isSwitch && switchOn ? "switch-on" : "",

    isSwitch && !switchOn ? "switch-off" : "",

    overloaded ? "overloaded" : "",

    isBurned ? "protection-burned" : "",

    isTripped && !isBurned ? "protection-tripped" : "",

    thermalProgress > 0 && !isTripped
      ? "protection-heating"
      : "",

    contactorOn ? "contactor-on" : "",

    timerTiming ? "timer-timing" : "",

    timerClosed ? "timer-closed" : "",

    isSchematic ? "view-schematic" : "",

    is3d ? "view-3d" : "",

    connectionStart?.componentId === component.id
      ? "component-connection-origin"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <button
      type="button"
      className={componentClasses}
      data-component-id={component.id}
      data-component-type={component.type}
      data-energized={energized ? "true" : "false"}
      data-running={motorRunning ? "true" : "false"}
      data-power={numericPower}
      data-switch-state={
        isSwitch ? (switchOn ? "on" : "off") : undefined
      }
      aria-label={component.name || component.type}
      style={{
        left: component.position?.x ?? 0,
        top: component.position?.y ?? 0,
        "--component-rotation": `${component.rotation || 0}deg`,
        transform: `rotate(var(--component-rotation, 0deg))`,
        transformOrigin: "center center",

        "--lamp-intensity": lampIntensity,
        "--component-power": numericPower,

        ...(isLamp && energized && !overloaded
          ? {
              borderColor: "#eab308",
              background:
                "linear-gradient(145deg, #fffbeb 0%, #fde68a 100%)",
              boxShadow:
                "0 0 0 3px rgba(234, 179, 8, 0.35), 0 0 28px rgba(250, 204, 21, 0.65)",
            }
          : {}),

        ...(motorRunning && !overloaded
          ? {
              borderColor: "#2563eb",
              background:
                "linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)",
              boxShadow:
                "0 0 0 2px rgba(37, 99, 235, 0.2), 0 0 18px rgba(37, 99, 235, 0.4)",
            }
          : {}),

        ...(overloaded
          ? {
              borderColor: "#dc2626",
              background:
                "linear-gradient(145deg, #fef2f2 0%, #fecaca 100%)",
              boxShadow:
                "0 0 0 3px rgba(220, 38, 38, 0.45), 0 0 24px rgba(239, 68, 68, 0.7)",
            }
          : {}),
      }}
      title={
        overloaded && overloadReasons?.length
          ? `⚠ SOBRECARGA: ${overloadReasons.join("; ")}`
          : component.name || component.type
      }
      onMouseDown={handleMouseDown}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        onSelect?.(component.id);
      }}
    >
      {/* ================================================
          TERMINAIS ELÉTRICOS
      ================================================= */}

      {terminals.map((terminal) => {
        const terminalPosition = terminal.position || "default";

        const terminalType = terminal.type || "connection";

        const isOrigin = isOriginTerminal(terminal);

        return (
          <span
            key={terminal.id}
            className={[
              "component-terminal",
              `component-terminal-${terminalPosition}`,
              isOrigin ? "component-terminal-origin" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-terminal="true"
            data-terminal-node="true"
            data-terminal-id={terminal.id}
            data-terminal-type={terminalType}
            data-terminal-position={terminalPosition}
            data-component-id={component.id}
            data-component-type={component.type}
            aria-label={`Terminal ${terminal.label || terminal.id}`}
            onMouseDown={(event) =>
              handleTerminalMouseDown(event, terminal)
            }
            onMouseUp={(event) =>
              handleTerminalMouseUp(event, terminal)
            }
            onClick={handleTerminalClick}
          >
            <span
              className="component-terminal-dot"
              data-terminal-dot="true"
            >
              {terminal.label}
            </span>
          </span>
        );
      })}

      {/* ================================================
          INDICADOR DE ENERGIA DA LÂMPADA
      ================================================= */}

      {isLamp && energized && (
        <span
          className="lamp-energy-indicator"
          aria-hidden="true"
        />
      )}

      {/* ================================================
          INDICADOR DO MOTOR
      ================================================= */}

      {motorRunning && (
        <span
          className="motor-energy-indicator"
          aria-hidden="true"
        >
          FUNCIONANDO
        </span>
      )}

      {/* ================================================
          INDICADOR DO LED
      ================================================= */}

      {isLED && energized && (
        <span
          className="led-energy-indicator"
          aria-hidden="true"
        >
          ACESO
        </span>
      )}

      {/* ================================================
          AVISO DE SOBRECARGA
      ================================================= */}

      {overloaded && (
        <span
          className="overload-indicator"
          aria-label="Componente em sobrecarga"
          title={
            overloadReasons?.length
              ? overloadReasons.join("; ")
              : "Sobrecarga detectada"
          }
        >
          ⚠ SOBRECARGA
        </span>
      )}

      {isBurned && (
        <span
          className="protection-status-indicator burned"
          aria-label="Fusível queimado"
        >
          🔥 QUEIMADO
        </span>
      )}

      {isTripped && !isBurned && (
        <span
          className="protection-status-indicator tripped"
          aria-label="Proteção desarmada"
        >
          ⛔ DESARMADO
        </span>
      )}

      {thermalProgress > 0 && !isTripped && (
        <span
          className="protection-status-indicator heating"
          aria-label="Relé térmico aquecendo"
          title={`Aquecimento: ${Math.round(thermalProgress * 100)}%`}
        >
          🌡 {Math.round(thermalProgress * 100)}%
          <span
            className="thermal-heat-bar"
            style={{
              width: `${Math.min(100, thermalProgress * 100)}%`,
            }}
          />
        </span>
      )}

      {contactorOn && (
        <span
          className="protection-status-indicator contactor"
          aria-label="Contator energizado"
        >
          ⚡ BOBINA ON
        </span>
      )}

      {timerTiming && (
        <span
          className="protection-status-indicator heating"
          aria-label="Temporizador contando"
          title={`TON: ${Math.round(timerProgress * 100)}%`}
        >
          ⏱ {Math.round(timerProgress * 100)}%
          <span
            className="thermal-heat-bar"
            style={{
              width: `${Math.min(100, timerProgress * 100)}%`,
            }}
          />
        </span>
      )}

      {timerClosed && (
        <span
          className="protection-status-indicator contactor"
          aria-label="Temporizador fechado"
        >
          ⏱ FECHADO
        </span>
      )}

      {/* ================================================
          ÍCONE / SÍMBOLO ESQUEMÁTICO
      ================================================= */}

      <span
        className={[
          "component-node-icon",
          energized ? "component-node-icon-energized" : "",
          motorRunning ? "is-spinning" : "",
          isLamp && energized ? "is-glowing" : "",
          isSchematic ? "schematic-icon" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
        style={
          isSchematic
            ? undefined
            : motorRunning
              ? {
                  animation: "motorSpin 0.7s linear infinite",
                  color: "#2563eb",
                }
              : isLamp && energized
                ? {
                    color: "#ca8a04",
                    filter:
                      "drop-shadow(0 0 10px rgba(250, 204, 21, 0.95))",
                  }
                : isLED && energized
                  ? {
                      color: "#ef4444",
                      filter:
                        "drop-shadow(0 0 8px rgba(239, 68, 68, 0.9))",
                    }
                  : undefined
        }
      >
        {isSchematic ? (
          <SchematicSymbol
            type={component.type}
            energized={energized}
            switchOn={switchOn}
          />
        ) : is3d ? (
          <Block3DIcon
            type={component.type}
            energized={energized}
            switchOn={switchOn}
            running={motorRunning}
          />
        ) : (
          <Icon size={18} />
        )}
      </span>

      {/* ================================================
          NOME DO COMPONENTE
      ================================================= */}

      {!isSchematic && <strong>{component.name}</strong>}

      {isSchematic && (
        <strong className="schematic-label">{component.name}</strong>
      )}

      {/* ================================================
          VALOR DO COMPONENTE
      ================================================= */}

      {!isSchematic && component.unit && (
        <small>
          {component.type === COMPONENT_TYPES.SOURCE
            ? `${component.value} ${component.unit} ${
                String(component.mode || "DC").toUpperCase() === "AC"
                  ? `AC ${(component.frequency ?? 60)} Hz`
                  : "DC"
              }`
            : `${component.value} ${component.unit}`}
        </small>
      )}

      {isSchematic && component.unit && (
        <small className="schematic-value">
          {component.type === COMPONENT_TYPES.SOURCE
            ? `${component.value}${component.unit} ${
                String(component.mode || "DC").toUpperCase() === "AC"
                  ? "AC"
                  : "DC"
              }`
            : `${component.value}${component.unit}`}
        </small>
      )}

      {/* ================================================
          ESTADO DO INTERRUPTOR
      ================================================= */}

      {isSwitch && (
        <span
          className="switch-state-indicator"
          aria-hidden="true"
        >
          {switchOn ? "ON" : "OFF"}
        </span>
      )}
    </button>
  );
}