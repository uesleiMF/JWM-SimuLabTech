import { COMPONENT_TYPES } from "./components/componentTypes";

import { defaultCircuit } from "./defaultCircuit";


/* ==================================================
   GERAR ID
================================================== */

function generateId(type) {
  return `${type}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}


/* ==================================================
   ENCONTRAR COMPONENTE POR TIPO
================================================== */

function findComponentByType(
  components,
  type
) {
  if (!Array.isArray(components)) {
    return null;
  }

  return (
    components.find(
      (component) =>
        component?.type === type
    ) || null
  );
}


/* ==================================================
   MAPEAR TERMINAL DO CIRCUITO PADRÃO
================================================== */

/*
 * O defaultCircuit usa IDs fixos:
 *
 * source-1
 * switch-1
 * resistor-1
 * lamp-1
 * motor-1
 * led-1
 *
 * Quando um componente é excluído,
 * seu novo ID passa a ser diferente.
 *
 * Esta função converte o ID antigo
 * para o ID atual do componente.
 */

function resolveComponentId(
  circuit,
  componentId
) {
  if (!componentId) {
    return null;
  }


  /* ==================================================
     COMPONENTE JÁ EXISTENTE COM MESMO ID
  ================================================== */

  const exactComponent =
    circuit.components?.find(
      (component) =>
        component.id === componentId
    );


  if (exactComponent) {
    return exactComponent.id;
  }


  /* ==================================================
     PROCURAR NO CIRCUITO PADRÃO
  ================================================== */

  const defaultComponent =
    defaultCircuit.components?.find(
      (component) =>
        component.id === componentId
    );


  if (!defaultComponent) {
    return null;
  }


  /* ==================================================
     ENCONTRAR COMPONENTE ATUAL PELO TIPO
  ================================================== */

  const currentComponent =
    findComponentByType(
      circuit.components,
      defaultComponent.type
    );


  return (
    currentComponent?.id ||
    null
  );
}


/* ==================================================
   RESTAURAR CONEXÕES DO COMPONENTE
================================================== */

/*
 * Quando adicionamos novamente um componente
 * que fazia parte do circuito padrão, precisamos
 * reconstruir seus fios.
 *
 * Exemplo:
 *
 * Motor antigo:
 *
 * resistor-1 → motor-1
 * motor-1 → source-1
 *
 * Motor novo:
 *
 * resistor-1 → motor-173829...
 * motor-173829... → source-1
 *
 * O componente novo passa a participar novamente
 * do circuito.
 */

function restoreDefaultConnections(
  circuit,
  newComponent
) {

  const defaultWires =
    defaultCircuit.wires || [];


  if (
    defaultWires.length === 0 ||
    !newComponent
  ) {
    return circuit;
  }


  /* ==================================================
     VERIFICAR SE EXISTE CONEXÃO PADRÃO
     ENVOLVENDO O TIPO DO NOVO COMPONENTE
  ================================================== */

  const componentDefault =
    defaultCircuit.components?.find(
      (component) =>
        component.type ===
        newComponent.type
    );


  if (!componentDefault) {
    return circuit;
  }


  const newWires = [];


  /* ==================================================
     PERCORRER CONEXÕES PADRÃO
  ================================================== */

  defaultWires.forEach(
    (defaultWire) => {

      if (
        !defaultWire?.from ||
        !defaultWire?.to
      ) {
        return;
      }


      /*
       * O fio pertence ao componente novo
       * quando um dos lados aponta para o ID
       * padrão daquele componente.
       */

      const involvesNewComponent =
        defaultWire.from.componentId ===
          componentDefault.id ||
        defaultWire.to.componentId ===
          componentDefault.id;


      if (!involvesNewComponent) {
        return;
      }


      /* ==================================================
         RESOLVER COMPONENTES ATUAIS
      ================================================== */

      const fromComponentId =
        defaultWire.from.componentId ===
          componentDefault.id
          ? newComponent.id
          : resolveComponentId(
              circuit,
              defaultWire.from.componentId
            );


      const toComponentId =
        defaultWire.to.componentId ===
          componentDefault.id
          ? newComponent.id
          : resolveComponentId(
              circuit,
              defaultWire.to.componentId
            );


      /*
       * Se o outro componente ainda não existe,
       * não criamos a conexão.
       */

      if (
        !fromComponentId ||
        !toComponentId
      ) {
        return;
      }


      /* ==================================================
         NOVO FIO
      ================================================== */

      const newWire = {
        id: generateId(
          COMPONENT_TYPES.WIRE
        ),

        type:
          defaultWire.type ||
          "electrical",

        from: {
          componentId:
            fromComponentId,

          terminalId:
            defaultWire.from.terminalId,
        },

        to: {
          componentId:
            toComponentId,

          terminalId:
            defaultWire.to.terminalId,
        },

        status:
          defaultWire.status ||
          "active",

        createdAt:
          Date.now(),
      };


      /* ==================================================
         EVITAR DUPLICIDADE
      ================================================== */

      const exists =
        circuit.wires?.some(
          (wire) => {

            if (
              !wire?.from ||
              !wire?.to
            ) {
              return false;
            }


            const sameDirection =
              wire.from.componentId ===
                newWire.from.componentId &&
              wire.from.terminalId ===
                newWire.from.terminalId &&
              wire.to.componentId ===
                newWire.to.componentId &&
              wire.to.terminalId ===
                newWire.to.terminalId;


            const oppositeDirection =
              wire.from.componentId ===
                newWire.to.componentId &&
              wire.from.terminalId ===
                newWire.to.terminalId &&
              wire.to.componentId ===
                newWire.from.componentId &&
              wire.to.terminalId ===
                newWire.from.terminalId;


            return (
              sameDirection ||
              oppositeDirection
            );
          }
        );


      if (!exists) {
        newWires.push(
          newWire
        );
      }
    }
  );


  /* ==================================================
     RETORNAR CIRCUITO
  ================================================== */

  if (
    newWires.length === 0
  ) {
    return circuit;
  }


  return {
    ...circuit,

    wires: [
      ...(circuit.wires || []),
      ...newWires,
    ],
  };
}


/* ==================================================
   ADICIONAR COMPONENTE
================================================== */

export function addComponent(
  circuit,
  component
) {

  // O catálogo usa "id" como tipo do componente (ex: "source", "motor").
  // Componentes já existentes usam "type". Aceitamos os dois para
  // funcionar tanto com catalogItem quanto com objetos completos.
  const componentType =
    component.type || component.id;

  if (!componentType) {
    console.error(
      "addComponent: componente sem type/id",
      component
    );
    return circuit;
  }

  // Tenta reutilizar a posição padrão do circuito inicial
  // para o componente voltar no lugar "certo"
  const defaultComponent =
    defaultCircuit.components?.find(
      (c) => c.type === componentType
    );

  const defaultPosition =
    defaultComponent?.position || {
      x: 120,
      y: 120,
    };

  // Desloca um pouco se já existirem componentes (evita empilhar)
  const existingCount = (circuit.components || []).length;
  const offset = existingCount * 24;

  // Valores padrão por tipo de comando
  let defaultValue =
    component.defaultValue ??
    component.value ??
    defaultComponent?.value ??
    0;

  if (componentType === COMPONENT_TYPES.PUSH_BUTTON_NC) {
    defaultValue = true; // NF começa fechada
  }
  if (componentType === COMPONENT_TYPES.BREAKER) {
    defaultValue = true; // Disjuntor começa fechado
  }
  if (
    componentType === COMPONENT_TYPES.SWITCH ||
    componentType === COMPONENT_TYPES.PUSH_BUTTON_NO ||
    componentType === COMPONENT_TYPES.CONTACTOR
  ) {
    defaultValue = Boolean(defaultValue);
  }

  const newComponent = {
    id: generateId(componentType),

    type: componentType,

    name:
      component.name || defaultComponent?.name || componentType,

    value: defaultValue,

    unit:
      component.unit ?? defaultComponent?.unit ?? "",

    enabled: true,

    position: {
      x: defaultPosition.x + (offset % 200),
      y: defaultPosition.y + Math.floor(offset / 8),
    },
  };


  /* ==================================================
     ADICIONAR COMPONENTE (sem fios automáticos)
     O aluno liga tudo manualmente.
  ================================================== */

  return {
    ...circuit,

    components: [
      ...(circuit.components || []),
      newComponent,
    ],

    selectedComponent:
      newComponent.id,
  };
}


/* ==================================================
   REMOVER COMPONENTE
================================================== */

export function removeComponent(
  circuit,
  componentId
) {

  return {
    ...circuit,

    components:
      (
        circuit.components || []
      ).filter(
        (component) =>
          component.id !==
          componentId
      ),

    /*
     * IMPORTANTE:
     *
     * Os fios usam:
     *
     * wire.from.componentId
     * wire.to.componentId
     *
     * e não:
     *
     * wire.from === componentId
     *
     * Esta correção evita deixar conexões
     * órfãs no circuito.
     */

    wires:
      (
        circuit.wires || []
      ).filter(
        (wire) =>
          wire?.from?.componentId !==
            componentId &&
          wire?.to?.componentId !==
            componentId
      ),

    selectedComponent:
      circuit.selectedComponent ===
      componentId
        ? null
        : circuit.selectedComponent,
  };
}


/* ==================================================
   SELECIONAR COMPONENTE
================================================== */

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


/* ==================================================
   ATUALIZAR COMPONENTE
================================================== */

export function updateComponent(
  circuit,
  componentId,
  updates
) {

  return {
    ...circuit,

    components:
      (
        circuit.components || []
      ).map(
        (component) =>
          component.id ===
          componentId
            ? {
                ...component,
                ...updates,
              }
            : component
      ),
  };
}


/* ==================================================
   ATUALIZAR POSIÇÃO
================================================== */

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


/* ==================================================
   ADICIONAR FIO
================================================== */

export function addWire(
  circuit,
  from,
  to
) {

  if (
    !from ||
    !to
  ) {
    return circuit;
  }


  /*
   * Compatibilidade com o novo formato:
   *
   * {
   *   componentId,
   *   terminalId
   * }
   */

  const sameTerminal =
    from.componentId ===
      to.componentId &&
    from.terminalId ===
      to.terminalId;


  if (sameTerminal) {
    return circuit;
  }


  const alreadyExists =
    (
      circuit.wires || []
    ).some(
      (wire) => {

        if (
          !wire?.from ||
          !wire?.to
        ) {
          return false;
        }


        const sameDirection =
          wire.from.componentId ===
            from.componentId &&
          wire.from.terminalId ===
            from.terminalId &&
          wire.to.componentId ===
            to.componentId &&
          wire.to.terminalId ===
            to.terminalId;


        const oppositeDirection =
          wire.from.componentId ===
            to.componentId &&
          wire.from.terminalId ===
            to.terminalId &&
          wire.to.componentId ===
            from.componentId &&
          wire.to.terminalId ===
            from.terminalId;


        return (
          sameDirection ||
          oppositeDirection
        );
      }
    );


  if (alreadyExists) {
    return circuit;
  }


  return {
    ...circuit,

    wires: [
      ...(circuit.wires || []),

      {
        id: generateId(
          COMPONENT_TYPES.WIRE
        ),

        type: "electrical",

        from: {
          componentId:
            from.componentId,

          terminalId:
            from.terminalId,
        },

        to: {
          componentId:
            to.componentId,

          terminalId:
            to.terminalId,
        },

        status:
          "active",

        createdAt:
          Date.now(),
      },
    ],
  };
}


/* ==================================================
   REMOVER FIO
================================================== */

export function removeWire(
  circuit,
  wireId
) {

  return {
    ...circuit,

    wires:
      (
        circuit.wires || []
      ).filter(
        (wire) =>
          wire.id !==
          wireId
      ),
  };
}