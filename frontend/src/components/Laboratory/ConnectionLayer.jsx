import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getComponentTerminals,
} from "../../simulator/connections/connectionUtils";

/*
==================================================
JWM SIMULABTECH
CAMADA VISUAL DE CONEXÕES ELÉTRICAS

- Fios com ângulos de 90 graus.
- Atualização das posições dos terminais.
- Pré-visualização da conexão.
- Indicação visual de circuito energizado.
==================================================
*/

const ConnectionLayer = ({
  connections = [],
  components = [],
  connectionStart = null,
  mousePosition = null,
  waypoints = [],
  selectedWireId = null,
  onSelectWire = null,
  onEmptyClick = null,
  energized = false,
}) => {
  const svgRef = useRef(null);

  const [
    terminalPositions,
    setTerminalPositions,
  ] = useState({});

  /*
  ==================================================
  LOCALIZAR TERMINAL NO DOM
  ==================================================
  */

  const getTerminalElement = useCallback(
    (componentId, terminalId) => {
      if (
        !componentId ||
        !terminalId
      ) {
        return null;
      }

      const terminals =
        document.querySelectorAll(
          '[data-terminal="true"]'
        );

      return (
        Array.from(terminals).find(
          (element) =>
            element.dataset.componentId ===
              String(componentId) &&
            element.dataset.terminalId ===
              String(terminalId)
        ) || null
      );
    },
    []
  );

  /*
  ==================================================
  CALCULAR POSIÇÃO DO TERMINAL NO SVG
  ==================================================
  */

  const getTerminalPosition = useCallback(
    (componentId, terminalId) => {
      const svg = svgRef.current;

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

      if (
        svgRect.width === 0 ||
        svgRect.height === 0
      ) {
        return null;
      }

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
  ==================================================
  ATUALIZAR POSIÇÕES DOS TERMINAIS
  ==================================================
  */

  const updateTerminalPositions =
    useCallback(() => {
      const positions = {};

      components.forEach((component) => {
        const terminals =
          getComponentTerminals(
            component
          ) || [];

        terminals.forEach((terminal) => {
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

          positions[key] = position;
        });
      });

      setTerminalPositions(positions);
    }, [
      components,
      getTerminalPosition,
    ]);

  /*
  ==================================================
  OBSERVAR ALTERAÇÕES NO LAYOUT
  ==================================================
  */

  useEffect(() => {
    let animationFrameId;

    const scheduleUpdate = () => {
      cancelAnimationFrame(
        animationFrameId
      );

      animationFrameId =
        requestAnimationFrame(() => {
          updateTerminalPositions();
        });
    };

    scheduleUpdate();

    window.addEventListener(
      "resize",
      scheduleUpdate
    );

    window.addEventListener(
      "scroll",
      scheduleUpdate,
      true
    );

    return () => {
      cancelAnimationFrame(
        animationFrameId
      );

      window.removeEventListener(
        "resize",
        scheduleUpdate
      );

      window.removeEventListener(
        "scroll",
        scheduleUpdate,
        true
      );
    };
  }, [
    updateTerminalPositions,
  ]);

  /*
  ==================================================
  BUSCAR POSIÇÃO DO TERMINAL
  ==================================================
  */

  const resolveConnectionPoint =
    useCallback(
      (componentId, terminalId) => {
        const key =
          `${componentId}:${terminalId}`;

        const storedPosition =
          terminalPositions[key];

        /*
        Primeiro tenta usar a posição
        armazenada.
        */

        if (storedPosition) {
          return storedPosition;
        }

        /*
        Se ainda não estiver armazenada,
        calcula a posição diretamente.
        */

        return getTerminalPosition(
          componentId,
          terminalId
        );
      },
      [
        terminalPositions,
        getTerminalPosition,
      ]
    );

  /*
  ==================================================
  POSIÇÃO INICIAL DO FIO
  ==================================================
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
  ==================================================
  TRAÇADO ORTOGONAL ENTRE DOIS PONTOS
  ==================================================
  */

  const createOrthogonalSegment = useCallback(
    (start, end) => {
      if (!start || !end) {
        return "";
      }

      const dx = Math.abs(end.x - start.x);
      const dy = Math.abs(end.y - start.y);

      // Quase alinhado → linha reta
      if (dx < 3) {
        return `L ${start.x} ${end.y}`;
      }
      if (dy < 3) {
        return `L ${end.x} ${start.y}`;
      }

      // Segmento ortogonal clássico (H → V)
      const midX = start.x + (end.x - start.x) / 2;

      return [
        `L ${midX} ${start.y}`,
        `L ${midX} ${end.y}`,
        `L ${end.x} ${end.y}`,
      ].join(" ");
    },
    []
  );

  /*
  ==================================================
  CAMINHO COMPLETO COM WAYPOINTS MANUAIS

  points = array de {x, y} intermediários
  ==================================================
  */

  const createPathFromPoints = useCallback(
    (start, end, points = []) => {
      if (!start || !end) {
        return "";
      }

      const allPoints = [
        start,
        ...(Array.isArray(points) ? points : []),
        end,
      ];

      let d = `M ${allPoints[0].x} ${allPoints[0].y}`;

      for (let i = 1; i < allPoints.length; i++) {
        const prev = allPoints[i - 1];
        const curr = allPoints[i];

        // Entre waypoints usamos segmentos ortogonais
        const dx = Math.abs(curr.x - prev.x);
        const dy = Math.abs(curr.y - prev.y);

        if (dx < 3) {
          d += ` L ${prev.x} ${curr.y}`;
        } else if (dy < 3) {
          d += ` L ${curr.x} ${prev.y}`;
        } else {
          // Preferência: horizontal primeiro
          d += ` L ${curr.x} ${prev.y} L ${curr.x} ${curr.y}`;
        }
      }

      return d;
    },
    []
  );

  /*
  ==================================================
  CAMINHO SIMPLES (sem waypoints) - compatibilidade
  ==================================================
  */

  const createPath = useCallback(
    (start, end, points = []) => {
      if (points && points.length > 0) {
        return createPathFromPoints(start, end, points);
      }

      // Fallback ortogonal automático
      if (!start || !end) return "";

      const midX = start.x + (end.x - start.x) / 2;

      return [
        `M ${start.x} ${start.y}`,
        `L ${midX} ${start.y}`,
        `L ${midX} ${end.y}`,
        `L ${end.x} ${end.y}`,
      ].join(" ");
    },
    [createPathFromPoints]
  );

  /*
  ==================================================
  RENDERIZAÇÃO
  ==================================================
  */

  return (
    <svg
      ref={svgRef}
      className={[
        "connection-layer",
        energized
          ? "connection-layer-energized"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}

      width="100%"
      height="100%"
      preserveAspectRatio="none"

      aria-hidden="true"

      onClick={(event) => {
        // Clique no fundo do SVG (não em um fio)
        if (
          event.target === svgRef.current &&
          onEmptyClick
        ) {
          onEmptyClick(event);
        }
      }}
    >
      {/* =========================================
          CONEXÕES DEFINITIVAS
      ========================================= */}

      {connections.map((connection) => {
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

        if (!start || !end) {
          return null;
        }

        const path =
          createPath(
            start,
            end,
            connection.points || []
          );

        // Só acende o fio quando o circuito está realmente energizado
        const wireEnergized = Boolean(energized);

        const isSelected =
          selectedWireId === connection.id;

        return (
          <g
            key={connection.id}
            className={[
              "circuit-connection",
              connection.status === "active"
                ? "active"
                : "",
              wireEnergized
                ? "energized"
                : "",
              isSelected
                ? "selected"
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

            onClick={(event) => {
              event.stopPropagation();
              if (!connectionStart && onSelectWire) {
                onSelectWire(connection.id);
              }
            }}

            style={{ cursor: connectionStart ? "default" : "pointer" }}
          >
            {/* Área visual mais larga para o fio (clicável) */}

            <path
              className="connection-wire-hitbox"
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="stroke"
            />

            {/* Fio principal */}

            <path
              className="connection-wire"
              d={path}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />

            {/* Efeito visual de corrente */}

            {wireEnergized && (
              <path
                className="connection-current"
                d={path}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
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
      })}

      {/* =========================================
          PRÉ-VISUALIZAÇÃO DO FIO (com waypoints)
      ========================================= */}

      {connectionStart &&
        mousePosition &&
        (() => {
          const start =
            getConnectionStartPosition();

          if (!start) {
            return null;
          }

          const end = {
            x: mousePosition.x,
            y: mousePosition.y,
          };

          const previewPath =
            createPath(
              start,
              end,
              waypoints
            );

          return (
            <g className="connection-preview">
              {/* Traçado com waypoints manuais */}

              <path
                d={previewPath}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="7 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Ponto de origem */}

              <circle
                className="connection-preview-point"
                cx={start.x}
                cy={start.y}
                r="5"
              />

              {/* Waypoints já adicionados */}

              {waypoints.map((point, index) => (
                <circle
                  key={`wp-${index}`}
                  className="connection-waypoint"
                  cx={point.x}
                  cy={point.y}
                  r="4"
                />
              ))}

              {/* Posição atual do cursor */}

              <circle
                className="connection-target"
                cx={end.x}
                cy={end.y}
                r="6"
              />
            </g>
          );
        })()}
    </svg>
  );
};

export default ConnectionLayer;