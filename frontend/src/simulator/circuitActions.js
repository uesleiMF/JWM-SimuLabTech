import { COMPONENT_TYPES } from "./components/componentTypes";

function generateId(type) {
  return `${type}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function addComponent(
  circuit,
  component
) {
  const newComponent = {
    id: generateId(component.type),

    type: component.type,

    name: component.name,

    value:
      component.defaultValue ?? 0,

    unit:
      component.unit ?? "",

    enabled: true,

    position: {
      x: 120,
      y: 120,
    },
  };

  return {
    ...circuit,

    components: [
      ...circuit.components,
      newComponent,
    ],

    selectedComponent:
      newComponent.id,
  };
}

export function removeComponent(
  circuit,
  componentId
) {
  return {
    ...circuit,

    components:
      circuit.components.filter(
        (component) =>
          component.id !== componentId
      ),

    wires:
      circuit.wires.filter(
        (wire) =>
          wire.from !== componentId &&
          wire.to !== componentId
      ),

    selectedComponent:
      circuit.selectedComponent ===
      componentId
        ? null
        : circuit.selectedComponent,
  };
}

export function selectComponent(
  circuit,
  componentId
) {
  return {
    ...circuit,

    selectedComponent:
      componentId,
  };
}

export function updateComponent(
  circuit,
  componentId,
  updates
) {
  return {
    ...circuit,

    components:
      circuit.components.map(
        (component) =>
          component.id === componentId
            ? {
                ...component,
                ...updates,
              }
            : component
      ),
  };
}

export function updateComponentPosition(
  circuit,
  componentId,
  position
) {
  return updateComponent(
    circuit,
    componentId,
    {
      position,
    }
  );
}

export function addWire(
  circuit,
  from,
  to
) {
  if (
    !from ||
    !to ||
    from === to
  ) {
    return circuit;
  }

  const alreadyExists =
    circuit.wires.some(
      (wire) =>
        (wire.from === from &&
          wire.to === to) ||
        (wire.from === to &&
          wire.to === from)
    );

  if (alreadyExists) {
    return circuit;
  }

  return {
    ...circuit,

    wires: [
      ...circuit.wires,

      {
        id: generateId(
          COMPONENT_TYPES.WIRE
        ),

        from,

        to,
      },
    ],
  };
}

export function removeWire(
  circuit,
  wireId
) {
  return {
    ...circuit,

    wires:
      circuit.wires.filter(
        (wire) =>
          wire.id !== wireId
      ),
  };
}