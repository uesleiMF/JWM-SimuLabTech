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
  [COMPONENT_TYPES.INDICATOR]: Circle,
};

/* ==================================================
   COMPONENT NODE
================================================== */

export default function ComponentNode({
  component,
  selected = false,
  energized = false,
  running = false,
  power = 0,
  connectionStart = null,
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
    component.type === COMPONENT_TYPES.BREAKER;

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

        "--lamp-intensity": lampIntensity,
        "--component-power": numericPower,

        ...(isLamp && energized
          ? {
              borderColor: "#eab308",
              background:
                "linear-gradient(145deg, #fffbeb 0%, #fde68a 100%)",
              boxShadow:
                "0 0 0 3px rgba(234, 179, 8, 0.35), 0 0 28px rgba(250, 204, 21, 0.65)",
            }
          : {}),

        ...(motorRunning
          ? {
              borderColor: "#2563eb",
              background:
                "linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)",
              boxShadow:
                "0 0 0 2px rgba(37, 99, 235, 0.2), 0 0 18px rgba(37, 99, 235, 0.4)",
            }
          : {}),
      }}
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
          ÍCONE
      ================================================= */}

      <span
        className={[
          "component-node-icon",
          energized ? "component-node-icon-energized" : "",
          motorRunning ? "is-spinning" : "",
          isLamp && energized ? "is-glowing" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
        style={
          motorRunning
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
        <Icon size={18} />
      </span>

      {/* ================================================
          NOME DO COMPONENTE
      ================================================= */}

      <strong>{component.name}</strong>

      {/* ================================================
          VALOR DO COMPONENTE
      ================================================= */}

      {component.unit && (
        <small>
          {component.value} {component.unit}
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