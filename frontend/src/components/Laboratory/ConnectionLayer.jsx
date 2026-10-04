import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getComponentTerminals,
} from "../../simulator/connections/connectionUtils";

const ConnectionLayer = ({
  connections = [],
  components = [],
  connectionStart = null,
  mousePosition = null,
  energized = false,
}) => {
  const svgRef = useRef(null);

  const [
    terminalPositions,
    setTerminalPositions,
  ] = useState({});

  /*
   * ==================================================
   * LOCALIZAR COMPONENTE
   * ==================================================
   */

  const getComponent = useCallback(
    (componentId) => {
      if (!componentId) {
        return null;
      }

      return (
        components.find(
          (component) =>
            component.id === componentId
        ) || null
      );
    },
    [components]
  );

  /*
   * ==================================================
   * LOCALIZAR TERMINAL
   * ==================================================
   */

  const getTerminalElement = useCallback(
    (
      componentId,
      terminalId
    ) => {
      if (
        !componentId ||
        !terminalId
      ) {
        return null;
      }

      const selector =
        `[data-terminal="true"][data-component-id="${componentId}"][data-terminal-id="${terminalId}"]`;

      return document.querySelector(
        selector
      );
    },
    []
  );

  /*
   * ==================================================
   * CALCULAR POSIÇÃO FÍSICA
   * ==================================================
   */

  const getTerminalPosition =
    useCallback(
      (
        componentId,
        terminalId
      ) => {
        const svg =
          svgRef.current;

        if (!svg) {
          return null;
        }

        const terminalElement =
          getTerminalElement(
            componentId,
            terminalId
          );

        if (!terminalElement) {
          return null;
        }

        const svgRect =
          svg.getBoundingClientRect();

        const terminalRect =
          terminalElement.getBoundingClientRect();

        return {
          x:
            terminalRect.left -
            svgRect.left +
            terminalRect.width / 2,

          y:
            terminalRect.top -
            svgRect.top +
            terminalRect.height / 2,
        };
      },
      [getTerminalElement]
    );

  /*
   * ==================================================
   * ATUALIZAR POSIÇÕES
   * ==================================================
   */

  const updateTerminalPositions =
    useCallback(() => {
      const positions = {};

      components.forEach(
        (component) => {
          const terminals =
            getComponentTerminals(
              component
            ) || [];

          terminals.forEach(
            (terminal) => {
              const position =
                getTerminalPosition(
                  component.id,
                  terminal.id
                );

              if (!position) {
                return;
              }

              const key =
                `${component.id}:${terminal.id}`;

              positions[key] =
                position;
            }
          );
        }
      );

      setTerminalPositions(
        positions
      );
    },
    [
      components,
      getTerminalPosition,
    ]);

  /*
   * ==================================================
   * ATUALIZAR POSIÇÕES
   * ==================================================
   */

  useEffect(() => {
    updateTerminalPositions();

    const handleResize = () => {
      updateTerminalPositions();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [
    updateTerminalPositions,
  ]);

  /*
   * ==================================================
   * BUSCAR POSIÇÃO DO TERMINAL
   * ==================================================
   */

  const resolveConnectionPoint =
    useCallback(
      (
        componentId,
        terminalId
      ) => {
        const key =
          `${componentId}:${terminalId}`;

        /*
         * Primeiro tenta a posição
         * armazenada.
         */

        if (
          terminalPositions[key]
        ) {
          return terminalPositions[
            key
          ];
        }

        /*
         * Depois tenta calcular
         * diretamente.
         */

        return getTerminalPosition(
          componentId,
          terminalId
        );
      },
      [
        terminalPositions,
        getTerminalPosition,
      ]);

  /*
   * ==================================================
   * POSIÇÃO INICIAL DA CONEXÃO
   * ==================================================
   */

  const getConnectionStartPosition =
    useCallback(() => {
      if (!connectionStart) {
        return null;
      }

      if (
        connectionStart.componentId &&
        connectionStart.terminalId
      ) {
        return resolveConnectionPoint(
          connectionStart.componentId,
          connectionStart.terminalId
        );
      }

      return null;
    }, [
      connectionStart,
      resolveConnectionPoint,
    ]);

  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (
    <svg
      ref={svgRef}
      className={`connection-layer ${
        energized
          ? "connection-layer-energized"
          : ""
      }`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      aria-hidden="true"
    >

      {/* ==================================================
          CONEXÕES
      ================================================== */}

      {connections.map(
        (connection) => {
          if (
            !connection?.from ||
            !connection?.to
          ) {
            return null;
          }

          const start =
            resolveConnectionPoint(
              connection.from.componentId,
              connection.from.terminalId
            );

          const end =
            resolveConnectionPoint(
              connection.to.componentId,
              connection.to.terminalId
            );

          if (
            !start ||
            !end
          ) {
            return null;
          }

          /*
           * Um fio fica energizado
           * quando o circuito inteiro
           * está energizado.
           */

          const wireEnergized =
            energized;

          return (
            <g
              key={
                connection.id
              }

              className={[
                "circuit-connection",

                connection.status ===
                "active"
                  ? "active"
                  : "",

                wireEnergized
                  ? "energized"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}

              data-connection-id={
                connection.id
              }

              data-energized={
                wireEnergized
                  ? "true"
                  : "false"
              }
            >

              {/* Fio principal */}

              <line
                className="connection-wire"
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
              />

              {/* Efeito de corrente */}

              {wireEnergized && (
                <line
                  className="connection-current"
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                />
              )}

              {/* Terminal inicial */}

              <circle
                className="connection-point"
                cx={start.x}
                cy={start.y}
                r="4"
              />

              {/* Terminal final */}

              <circle
                className="connection-point"
                cx={end.x}
                cy={end.y}
                r="4"
              />

            </g>
          );
        }
      )}

      {/* ==================================================
          PREVIEW DA CONEXÃO
      ================================================== */}

      {connectionStart &&
        mousePosition &&
        (() => {
          const start =
            getConnectionStartPosition();

          if (!start) {
            return null;
          }

          return (
            <g className="connection-preview">

              <line
                x1={start.x}
                y1={start.y}
                x2={
                  mousePosition.x
                }
                y2={
                  mousePosition.y
                }
              />

              <circle
                className="connection-preview-point"
                cx={start.x}
                cy={start.y}
                r="5"
              />

              <circle
                className="connection-target"
                cx={
                  mousePosition.x
                }
                cy={
                  mousePosition.y
                }
                r="6"
              />

            </g>
          );
        })()}

    </svg>
  );
};

export default ConnectionLayer;