import {
  Battery,
  Circle,
  CircleDot,
  Cog,
  Lightbulb,
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

  onSelect,
  onStartDrag,

  onStartConnection,
  onCompleteConnection,
}) {

  /* ==================================================
     ÍCONE
  ================================================== */

  const Icon =
    icons[component.type] ||
    Circle;


  /* ==================================================
     TIPOS
  ================================================== */

  const isLamp =
    component.type ===
    COMPONENT_TYPES.LAMP;

  const isMotor =
    component.type ===
    COMPONENT_TYPES.MOTOR;

  const isLED =
    component.type ===
    COMPONENT_TYPES.LED;

  const isSwitch =
    component.type ===
    COMPONENT_TYPES.SWITCH;


  /* ==================================================
     TERMINAIS
  ================================================== */

  const terminals =
    getComponentTerminals(
      component
    ) || [];


  /* ==================================================
     POTÊNCIA
  ================================================== */

  const numericPower =
    Number(power) || 0;


  /* ==================================================
     INTENSIDADE DA LÂMPADA
  ================================================== */

  const lampIntensity =
    isLamp && energized
      ? Math.min(
          Math.max(
            numericPower / 100,
            0.25
          ),
          1
        )
      : 0;


  /* ==================================================
     ESTADO DO MOTOR
  ================================================== */

  /*
   * energized:
   *   O motor está recebendo energia.
   *
   * running:
   *   O motor está efetivamente funcionando.
   *
   * Mantemos os dois estados separados para
   * permitir uma simulação mais realista futuramente.
   */

  const motorRunning =
    isMotor &&
    energized &&
    running === true;


  /* ==================================================
     ESTADO DO INTERRUPTOR
  ================================================== */

  const switchOn =
    isSwitch &&
    component.value === true;


  /* ==================================================
     MOUSE DOWN
  ================================================== */

  const handleMouseDown = (
    event
  ) => {

    if (
      event.button !== 0
    ) {
      return;
    }


    event.preventDefault();
    event.stopPropagation();


    onSelect?.(
      component.id
    );


    onStartDrag?.(
      event,
      component
    );
  };


  /* ==================================================
     INICIAR CONEXÃO
  ================================================== */

  const handleTerminalMouseDown = (
    event,
    terminal
  ) => {

    if (
      event.button !== 0
    ) {
      return;
    }


    event.preventDefault();
    event.stopPropagation();


    onStartConnection?.(
      event,
      component,
      terminal
    );
  };


  /* ==================================================
     FINALIZAR CONEXÃO
  ================================================== */

  const handleTerminalMouseUp = (
    event,
    terminal
  ) => {

    if (
      event.button !== 0
    ) {
      return;
    }


    event.preventDefault();
    event.stopPropagation();


    onCompleteConnection?.(
      event,
      component,
      terminal
    );
  };


  /* ==================================================
     CLIQUE NO TERMINAL
  ================================================== */

  const handleTerminalClick = (
    event
  ) => {

    event.preventDefault();
    event.stopPropagation();
  };


  /* ==================================================
     CLASSES
  ================================================== */

  const componentClasses = [

    "component-node",

    `component-node-${component.type}`,

    selected
      ? "selected"
      : "",

    energized
      ? "energized"
      : "",

    /*
     * LÂMPADA
     */

    isLamp &&
    energized
      ? "lamp-on"
      : "",

    /*
     * MOTOR
     *
     * Agora somente recebe
     * motor-running quando
     * realmente está funcionando.
     */

    motorRunning
      ? "motor-running"
      : "",

    /*
     * LED
     */

    isLED &&
    energized
      ? "led-on"
      : "",

    /*
     * INTERRUPTOR
     */

    isSwitch &&
    switchOn
      ? "switch-on"
      : "",

    isSwitch &&
    !switchOn
      ? "switch-off"
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

      className={
        componentClasses
      }

      data-component-id={
        component.id
      }

      data-component-type={
        component.type
      }

      data-energized={
        energized
          ? "true"
          : "false"
      }

      data-running={
        motorRunning
          ? "true"
          : "false"
      }

      data-power={
        numericPower
      }

      data-switch-state={
        isSwitch
          ? switchOn
            ? "on"
            : "off"
          : undefined
      }

      style={{

        left:
          component.position?.x ?? 0,

        top:
          component.position?.y ?? 0,

        "--lamp-intensity":
          lampIntensity,

        "--component-power":
          numericPower,

        ...(
          isLamp && energized
            ? {
                borderColor: "#eab308",
                background:
                  "linear-gradient(145deg, #fffbeb 0%, #fde68a 100%)",
                boxShadow:
                  "0 0 0 3px rgba(234, 179, 8, 0.35), 0 0 28px rgba(250, 204, 21, 0.65)",
              }
            : {}
        ),

        ...(
          motorRunning
            ? {
                borderColor: "#2563eb",
                background:
                  "linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)",
                boxShadow:
                  "0 0 0 2px rgba(37, 99, 235, 0.2), 0 0 18px rgba(37, 99, 235, 0.4)",
              }
            : {}
        ),

      }}

      onMouseDown={
        handleMouseDown
      }

      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect?.(component.id);
      }}
>

      {/* ==================================================
          TERMINAIS
      ================================================== */}

      {terminals.map(
        (terminal) => {

          const terminalPosition =
            terminal.position ||
            "default";


          const terminalType =
            terminal.type ||
            "connection";


          return (

            <span
              key={
                terminal.id
              }

              className={
                `component-terminal component-terminal-${terminalPosition}`
              }

              data-terminal="true"

              data-terminal-node="true"

              data-terminal-id={
                terminal.id
              }

              data-terminal-type={
                terminalType
              }

              data-terminal-position={
                terminalPosition
              }

              data-component-id={
                component.id
              }

              data-component-type={
                component.type
              }

              onMouseDown={(
                event
              ) =>
                handleTerminalMouseDown(
                  event,
                  terminal
                )
              }

              onMouseUp={(
                event
              ) =>
                handleTerminalMouseUp(
                  event,
                  terminal
                )
              }

              onClick={
                handleTerminalClick
              }

            >

              <span
                className="component-terminal-dot"

                data-terminal-dot="true"
              >

                {
                  terminal.label
                }

              </span>

            </span>

          );

        }
      )}


      {/* ==================================================
          INDICADOR DA LÂMPADA
      ================================================== */}

      {isLamp &&
        energized && (

        <span
          className="lamp-energy-indicator"
          aria-hidden="true"
        />

      )}


      {/* ==================================================
          INDICADOR DO MOTOR
      ================================================== */}

      {motorRunning && (

        <span
          className="motor-energy-indicator"
          aria-hidden="true"
        >

          FUNCIONANDO

        </span>

      )}


      {/* ==================================================
          INDICADOR DO LED
      ================================================== */}

      {isLED &&
        energized && (

        <span
          className="led-energy-indicator"
          aria-hidden="true"
        >

          ACESO

        </span>

      )}


      {/* ==================================================
          ÍCONE
      ================================================== */}

      <span
        className={`component-node-icon ${
          energized
            ? "component-node-icon-energized"
            : ""
        } ${
          motorRunning
            ? "is-spinning"
            : ""
        } ${
          isLamp && energized
            ? "is-glowing"
            : ""
        }`}

        aria-hidden="true"

        style={
          motorRunning
            ? {
                animation:
                  "motorSpin 0.7s linear infinite",
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

        <Icon
          size={28}
        />

      </span>


      {/* ==================================================
          NOME
      ================================================== */}

      <strong>

        {
          component.name
        }

      </strong>


      {/* ==================================================
          VALOR
      ================================================== */}

      {component.unit && (

        <small>

          {
            component.value
          }{" "}

          {
            component.unit
          }

        </small>

      )}


      {/* ==================================================
          ESTADO DO INTERRUPTOR
      ================================================== */}

      {isSwitch && (

        <span
          className="switch-state-indicator"
          aria-hidden="true"
        >

          {switchOn
            ? "ON"
            : "OFF"}

        </span>

      )}

    </button>

  );
}