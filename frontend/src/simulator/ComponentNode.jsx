import {
  Battery,
  Circle,
  CircleDot,
  Lightbulb,
  Zap,
} from "lucide-react";

import { COMPONENT_TYPES } from "./components/componentTypes";
import { getComponentTerminals } from "./connections/connectionUtils";

const icons = {
  [COMPONENT_TYPES.SOURCE]: Battery,
  [COMPONENT_TYPES.RESISTOR]: CircleDot,
  [COMPONENT_TYPES.SWITCH]: Circle,
  [COMPONENT_TYPES.LAMP]: Lightbulb,
  [COMPONENT_TYPES.MOTOR]: Zap,
  [COMPONENT_TYPES.LED]: Lightbulb,
};

export default function ComponentNode({
  component,
  selected = false,
  energized = false,

  onSelect,
  onStartDrag,

  // Nova função para iniciar uma conexão elétrica
  onStartConnection,
}) {
  const Icon = icons[component.type] || Circle;

  const terminals = getComponentTerminals(component);

  /*
   * ==================================================
   * ARRASTO DO COMPONENTE
   * ==================================================
   */

  const handleMouseDown = (event) => {
    // Somente botão esquerdo
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Seleciona o componente
    onSelect?.(component.id);

    // Inicia o arrasto do componente
    onStartDrag?.(
      event,
      component
    );
  };

  /*
   * ==================================================
   * INÍCIO DA CONEXÃO
   * ==================================================
   *
   * O terminal possui comportamento diferente
   * do restante do componente.
   *
   * Ao pressionar o terminal:
   *
   * ComponentNode
   *      ↓
   * terminal
   *      ↓
   * onStartConnection()
   */

  const handleTerminalMouseDown = (
    event,
    terminal
  ) => {
    // Somente botão esquerdo
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    /*
     * Envia para o componente pai:
     *
     * event
     * component
     * terminal
     */
    onStartConnection?.(
      event,
      component,
      terminal
    );
  };

  /*
   * ==================================================
   * CLIQUE NO TERMINAL
   * ==================================================
   */

  const handleTerminalClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (
    <button
      type="button"
      className={`component-node ${
        selected ? "selected" : ""
      } ${
        energized ? "energized" : ""
      }`}
      data-component-id={component.id}
      style={{
        left: component.position.x,
        top: component.position.y,
      }}
      onMouseDown={handleMouseDown}
      onClick={(event) => {
        event.stopPropagation();

        onSelect?.(component.id);
      }}
    >
      {/* ==================================================
          TERMINAIS ELÉTRICOS
      ================================================== */}

      {terminals.map((terminal) => (
        <span
          key={terminal.id}
          className={`component-terminal component-terminal-${terminal.position}`}
          data-terminal-id={terminal.id}
          data-terminal-type={terminal.type}
          data-component-id={component.id}
          onMouseDown={(event) =>
            handleTerminalMouseDown(
              event,
              terminal
            )
          }
          onClick={handleTerminalClick}
        >
          <span className="component-terminal-dot">
            {terminal.label}
          </span>
        </span>
      ))}

      {/* ==================================================
          ÍCONE
      ================================================== */}

      <span className="component-node-icon">
        <Icon size={28} />
      </span>

      {/* ==================================================
          NOME
      ================================================== */}

      <strong>
        {component.name}
      </strong>

      {/* ==================================================
          VALOR / UNIDADE
      ================================================== */}

      {component.unit && (
        <small>
          {component.value}{" "}
          {component.unit}
        </small>
      )}
    </button>
  );
}