import { useMemo, useState } from "react";
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
} from "lucide-react";

import "./Laboratory.css";

import { simulateCircuit } from "../../simulator/circuitEngine";
import { defaultCircuit } from "../../simulator/defaultCircuit";
import { COMPONENT_TYPES } from "../../simulator/components/componentTypes";
import { componentCatalog } from "../../simulator/components/componentCatalog";

import ComponentNode from "../../simulator/ComponentNode";

import {
  addComponent,
  removeComponent,
  selectComponent,
  updateComponent,
} from "../../simulator/circuitActions";

const iconMap = {
  [COMPONENT_TYPES.SOURCE]: Battery,
  [COMPONENT_TYPES.RESISTOR]: Minus,
  [COMPONENT_TYPES.SWITCH]: Power,
  [COMPONENT_TYPES.LAMP]: Lightbulb,
  [COMPONENT_TYPES.MOTOR]: Zap,
  [COMPONENT_TYPES.LED]: Lightbulb,
};

function createInitialCircuit() {
  return {
    ...defaultCircuit,
    components: defaultCircuit.components.map((component) => ({
      ...component,
      position: {
        ...component.position,
      },
    })),
    wires: defaultCircuit.wires.map((wire) => ({
      ...wire,
    })),
    selectedComponent: null,
  };
}

export default function Laboratory() {
  const [circuit, setCircuit] = useState(createInitialCircuit);
  const [message, setMessage] = useState(
    "Monte e teste seu circuito elétrico."
  );

  const simulation = useMemo(
    () => simulateCircuit(circuit),
    [circuit]
  );

  const source = circuit.components.find(
    (component) =>
      component.type === COMPONENT_TYPES.SOURCE
  );

  const resistor = circuit.components.find(
    (component) =>
      component.type === COMPONENT_TYPES.RESISTOR
  );

  const switchComponent = circuit.components.find(
    (component) =>
      component.type === COMPONENT_TYPES.SWITCH
  );

  const lamp = circuit.components.find(
    (component) =>
      component.type === COMPONENT_TYPES.LAMP
  );

  const selectedComponent = circuit.components.find(
    (component) =>
      component.id === circuit.selectedComponent
  );

  const switchOn =
    switchComponent?.value === true;

  const handleSelectComponent = (componentId) => {
    setCircuit((current) =>
      selectComponent(current, componentId)
    );
  };

  const handleAddOrRemoveComponent = (catalogItem) => {
    const existing = circuit.components.find(
      (component) =>
        component.type === catalogItem.id
    );

    if (existing) {
      setCircuit((current) =>
        removeComponent(current, existing.id)
      );

      setMessage(
        `${catalogItem.name} removido do circuito.`
      );

      return;
    }

    setCircuit((current) =>
      addComponent(current, catalogItem)
    );

    setMessage(
      `${catalogItem.name} adicionado ao circuito.`
    );
  };

  const handleBoardClick = () => {
    setCircuit((current) => ({
      ...current,
      selectedComponent: null,
    }));
  };

  const handleReset = () => {
    setCircuit(createInitialCircuit());

    setMessage(
      "Laboratório restaurado ao circuito inicial."
    );
  };

  const handleResistanceChange = (event) => {
    const value = Number(event.target.value);

    if (!resistor) return;

    setCircuit((current) =>
      updateComponent(
        current,
        resistor.id,
        {
          value,
        }
      )
    );
  };

  const handleSwitchToggle = () => {
    if (!switchComponent) return;

    setCircuit((current) =>
      updateComponent(
        current,
        switchComponent.id,
        {
          value: !switchComponent.value,
        }
      )
    );

    setMessage(
      !switchComponent.value
        ? "Interruptor fechado. Verificando circuito..."
        : "Interruptor aberto."
    );
  };

  const handleSelectedValueChange = (event) => {
    if (!selectedComponent) return;

    const value = Number(event.target.value);

    setCircuit((current) =>
      updateComponent(
        current,
        selectedComponent.id,
        {
          value,
        }
      )
    );
  };

  const diagnostic = useMemo(() => {
    if (!source) {
      return {
        type: "warning",
        title: "Fonte não encontrada",
        description:
          "Adicione uma fonte DC para alimentar o circuito.",
      };
    }

    if (!resistor) {
      return {
        type: "warning",
        title: "Resistor não encontrado",
        description:
          "Adicione um resistor para limitar a corrente.",
      };
    }

    if (!switchComponent) {
      return {
        type: "warning",
        title: "Interruptor não encontrado",
        description:
          "Adicione um interruptor para controlar o circuito.",
      };
    }

    if (
      Number(resistor.value) <= 0
    ) {
      return {
        type: "error",
        title: "Resistência inválida",
        description:
          "A resistência precisa ser maior que zero.",
      };
    }

    if (!switchOn) {
      return {
        type: "info",
        title: "Circuito desligado",
        description:
          "Feche o interruptor para permitir a passagem de corrente.",
      };
    }

    if (!simulation.energized) {
      return {
        type: "warning",
        title: "Circuito não energizado",
        description:
          "Verifique a fonte e as conexões do circuito.",
      };
    }

    return {
      type: "success",
      title: "Circuito energizado",
      description:
        "A corrente está circulando pelo circuito.",
    };
  }, [
    source,
    resistor,
    switchComponent,
    switchOn,
    simulation,
  ]);

  const diagnosticIcon = {
    warning: CircleAlert,
    error: CircleAlert,
    info: Activity,
    success: CheckCircle2,
  };

  const DiagnosticIcon =
    diagnosticIcon[diagnostic.type];

  return (
    <div className="laboratory-page">
      {/* HEADER */}
      <header className="laboratory-header">
        <div>
          <span className="laboratory-eyebrow">
            LABORATÓRIO VIRTUAL
          </span>

          <h1>
            Laboratório de Circuitos
          </h1>

          <p>
            Monte, configure e teste seus circuitos
            elétricos de forma interativa.
          </p>
        </div>

        <div className="laboratory-header-actions">
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

      {/* TOOLBAR */}
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
          {message}
        </div>
      </section>

      <div className="laboratory-layout">
        {/* COMPONENTES */}
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
                    key={catalogItem.id}
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
                        {catalogItem.name}
                      </strong>

                      <small>
                        {catalogItem.description}
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

          {/* COMPONENTE SELECIONADO */}
          {selectedComponent && (
            <div className="resistor-control">
              <div className="control-heading">
                <div>
                  <span>
                    COMPONENTE SELECIONADO
                  </span>

                  <strong>
                    {selectedComponent.name}
                  </strong>
                </div>

                <button
                  type="button"
                  className="delete-component-button"
                  onClick={() => {
                    setCircuit((current) =>
                      removeComponent(
                        current,
                        selectedComponent.id
                      )
                    );

                    setMessage(
                      `${selectedComponent.name} removido.`
                    );
                  }}
                  title="Remover componente"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              {selectedComponent.unit && (
                <label>
                  <span>
                    Valor
                  </span>

                  <div className="input-with-unit">
                    <input
                      type="number"
                      min="0"
                      value={
                        selectedComponent.value
                      }
                      onChange={
                        handleSelectedValueChange
                      }
                    />

                    <span>
                      {selectedComponent.unit}
                    </span>
                  </div>
                </label>
              )}
            </div>
          )}

          {/* RESISTOR */}
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
                value={resistor.value}
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

        {/* WORKSPACE */}
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

          {/* DIAGNÓSTICO */}
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
                {diagnostic.title}
              </strong>

              <p>
                {diagnostic.description}
              </p>
            </div>
          </div>

          {/* QUADRO */}
          <div
            className="circuit-board circuit-grid-background"
            onClick={handleBoardClick}
          >
            {circuit.components.map(
              (component) => (
                <ComponentNode
                  key={component.id}
                  component={component}
                  selected={
                    circuit.selectedComponent ===
                    component.id
                  }
                  energized={
                    simulation.energized &&
                    (
                      component.type ===
                        COMPONENT_TYPES.SOURCE ||
                      component.type ===
                        COMPONENT_TYPES.RESISTOR ||
                      component.type ===
                        COMPONENT_TYPES.SWITCH ||
                      component.type ===
                        COMPONENT_TYPES.LAMP
                    )
                  }
                  onSelect={
                    handleSelectComponent
                  }
                />
              )
            )}

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

            {/* INDICADOR DE ENERGIA */}
            {simulation.energized && (
              <div className="circuit-energy-indicator">
                <span className="status-dot active" />

                Circuito energizado
              </div>
            )}
          </div>

          {/* CONTROLE DO INTERRUPTOR */}
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
                  observar o comportamento da corrente.
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

          {/* MEDIÇÕES */}
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
            </div>
          </section>

          {/* LEI DE OHM */}
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