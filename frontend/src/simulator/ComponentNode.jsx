import {
  Battery,
  Circle,
  CircleDot,
  Lightbulb,
  Zap,
} from "lucide-react";

import { COMPONENT_TYPES } from "./components/componentTypes";

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
}) {
  const Icon =
    icons[component.type] ||
    Circle;

  const handleMouseDown = (event) => {
    // Somente botão esquerdo
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    onSelect(component.id);

    if (onStartDrag) {
      onStartDrag(
        event,
        component
      );
    }
  };

  return (
    <button
      type="button"
      className={`component-node ${
        selected
          ? "selected"
          : ""
      } ${
        energized
          ? "energized"
          : ""
      }`}
      style={{
        left: component.position.x,
        top: component.position.y,
      }}
      onMouseDown={
        handleMouseDown
      }
      onClick={(event) => {
        event.stopPropagation();

        onSelect(
          component.id
        );
      }}
    >
      <span className="component-node-icon">
        <Icon size={28} />
      </span>

      <strong>
        {component.name}
      </strong>

      {component.unit && (
        <small>
          {component.value}{" "}
          {component.unit}
        </small>
      )}
    </button>
  );
}