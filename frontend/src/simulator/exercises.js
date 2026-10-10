import { COMPONENT_TYPES } from "./components/componentTypes";
import {
  simulateCircuit,
  getSource,
  getLoads,
  isLoadEnergized,
  hasClosedCircuit,
} from "./circuitEngine";

/**
 * Definição dos exercícios práticos do laboratório.
 * Cada exercício declara o que o aluno precisa montar
 * e como validar o circuito.
 */
export const EXERCISES = [
  {
    id: "ex-lamp-switch",
    title: "Lâmpada com interruptor",
    description:
      "Monte um circuito com Fonte DC, Interruptor e Lâmpada. Feche o interruptor e faça a lâmpada acender.",
    difficulty: "Fácil",
    points: 80,
    requiredTypes: [
      COMPONENT_TYPES.SOURCE,
      COMPONENT_TYPES.SWITCH,
      COMPONENT_TYPES.LAMP,
    ],
    rules: {
      mustHaveClosedCircuit: true,
      mustEnergizeTypes: [COMPONENT_TYPES.LAMP],
      switchMustBeClosed: true,
    },
  },
  {
    id: "ex-led-resistor",
    title: "LED com resistor de proteção",
    description:
      "Monte Fonte DC, Resistor e LED em série. O LED deve acender com o circuito fechado.",
    difficulty: "Fácil",
    points: 90,
    requiredTypes: [
      COMPONENT_TYPES.SOURCE,
      COMPONENT_TYPES.RESISTOR,
      COMPONENT_TYPES.LED,
    ],
    rules: {
      mustHaveClosedCircuit: true,
      mustEnergizeTypes: [COMPONENT_TYPES.LED],
    },
  },
  {
    id: "ex-motor-switch",
    title: "Motor sob controle",
    description:
      "Energize um Motor DC usando Fonte e Interruptor. O motor deve girar com o interruptor fechado.",
    difficulty: "Médio",
    points: 120,
    requiredTypes: [
      COMPONENT_TYPES.SOURCE,
      COMPONENT_TYPES.SWITCH,
      COMPONENT_TYPES.MOTOR,
    ],
    rules: {
      mustHaveClosedCircuit: true,
      mustEnergizeTypes: [COMPONENT_TYPES.MOTOR],
      switchMustBeClosed: true,
    },
  },
  {
    id: "ex-parallel-loads",
    title: "Cargas em paralelo",
    description:
      "Monte Fonte, Interruptor, Lâmpada e Motor. Lâmpada e Motor devem acender/girar juntos com o interruptor fechado.",
    difficulty: "Médio",
    points: 150,
    requiredTypes: [
      COMPONENT_TYPES.SOURCE,
      COMPONENT_TYPES.SWITCH,
      COMPONENT_TYPES.LAMP,
      COMPONENT_TYPES.MOTOR,
    ],
    rules: {
      mustHaveClosedCircuit: true,
      mustEnergizeTypes: [
        COMPONENT_TYPES.LAMP,
        COMPONENT_TYPES.MOTOR,
      ],
      switchMustBeClosed: true,
    },
  },
  {
    id: "ex-push-button",
    title: "Comando com botoeira NA",
    description:
      "Use Fonte, Botoeira NA e Lâmpada (ou Sinalizador). Ative a botoeira e confirme que a carga energiza.",
    difficulty: "Médio",
    points: 130,
    requiredTypes: [
      COMPONENT_TYPES.SOURCE,
      COMPONENT_TYPES.PUSH_BUTTON_NO,
    ],
    rules: {
      mustHaveClosedCircuit: true,
      mustEnergizeAnyLoad: true,
      requireOneOfTypes: [
        COMPONENT_TYPES.LAMP,
        COMPONENT_TYPES.INDICATOR,
        COMPONENT_TYPES.LED,
        COMPONENT_TYPES.MOTOR,
      ],
      controlMustBeClosed: true,
    },
  },
  {
    id: "ex-full-lab",
    title: "Laboratório completo",
    description:
      "Monte um circuito com Fonte, Interruptor, Resistor, Lâmpada e Motor, todos funcionando juntos.",
    difficulty: "Difícil",
    points: 200,
    requiredTypes: [
      COMPONENT_TYPES.SOURCE,
      COMPONENT_TYPES.SWITCH,
      COMPONENT_TYPES.RESISTOR,
      COMPONENT_TYPES.LAMP,
      COMPONENT_TYPES.MOTOR,
    ],
    rules: {
      mustHaveClosedCircuit: true,
      mustEnergizeTypes: [
        COMPONENT_TYPES.LAMP,
        COMPONENT_TYPES.MOTOR,
      ],
      switchMustBeClosed: true,
    },
  },
];

export function getExerciseById(id) {
  return EXERCISES.find((ex) => ex.id === id) || null;
}

function hasType(circuit, type) {
  return (circuit.components || []).some((c) => c?.type === type);
}

function getByType(circuit, type) {
  return (circuit.components || []).filter((c) => c?.type === type);
}

/**
 * Valida o circuito atual contra um exercício.
 * Retorna { ok, score, checks: [{ label, passed, detail }] }
 */
export function validateExercise(circuit, exerciseId) {
  const exercise = getExerciseById(exerciseId);

  if (!exercise) {
    return {
      ok: false,
      score: 0,
      message: "Exercício não encontrado.",
      checks: [],
    };
  }

  const checks = [];
  const components = circuit.components || [];
  const wires = circuit.wires || [];
  const simulation = simulateCircuit(circuit);

  // 1. Componentes obrigatórios
  for (const type of exercise.requiredTypes || []) {
    const found = hasType(circuit, type);
    const name =
      components.find((c) => c.type === type)?.name || type;

    checks.push({
      id: `req-${type}`,
      label: `Possui ${name}`,
      passed: found,
      detail: found
        ? "Componente presente no quadro."
        : "Adicione este componente pela biblioteca.",
    });
  }

  // 1b. Pelo menos um dos tipos alternativos
  if (exercise.rules?.requireOneOfTypes?.length) {
    const found = exercise.rules.requireOneOfTypes.some((t) =>
      hasType(circuit, t)
    );
    checks.push({
      id: "req-one-of-load",
      label: "Possui pelo menos uma carga (lâmpada, LED, motor ou sinalizador)",
      passed: found,
      detail: found
        ? "Carga encontrada."
        : "Adicione uma lâmpada, LED, motor ou sinalizador.",
    });
  }

  // 2. Existe pelo menos um fio
  checks.push({
    id: "has-wires",
    label: "Possui conexões (fios)",
    passed: wires.length > 0,
    detail:
      wires.length > 0
        ? `${wires.length} fio(s) no circuito.`
        : "Ligue os terminais dos componentes.",
  });

  // 3. Circuito fechado
  if (exercise.rules?.mustHaveClosedCircuit) {
    const closed = hasClosedCircuit(circuit) || simulation.energized;
    checks.push({
      id: "closed-circuit",
      label: "Circuito fechado / caminho completo",
      passed: Boolean(closed),
      detail: closed
        ? "Há caminho elétrico entre fonte e cargas."
        : "Verifique se a fonte está ligada às cargas e ao retorno (negativo).",
    });
  }

  // 4. Interruptor / comando fechado
  if (exercise.rules?.switchMustBeClosed || exercise.rules?.controlMustBeClosed) {
    const controls = components.filter((c) =>
      [
        COMPONENT_TYPES.SWITCH,
        COMPONENT_TYPES.PUSH_BUTTON_NO,
        COMPONENT_TYPES.PUSH_BUTTON_NC,
        COMPONENT_TYPES.CONTACTOR,
        COMPONENT_TYPES.BREAKER,
      ].includes(c.type)
    );

    const anyClosed = controls.some((c) => Boolean(c.value));
    checks.push({
      id: "control-closed",
      label: "Dispositivo de comando fechado/ativado",
      passed: anyClosed,
      detail: anyClosed
        ? "Há um comando fechado no circuito."
        : "Feche o interruptor, botoeira ou contator (botão na barra ou selecione e ative).",
    });
  }

  // 5. Cargas específicas energizadas
  if (exercise.rules?.mustEnergizeTypes?.length) {
    for (const type of exercise.rules.mustEnergizeTypes) {
      const loads = getByType(circuit, type);
      const name = loads[0]?.name || type;

      if (loads.length === 0) {
        checks.push({
          id: `energize-${type}`,
          label: `${name} energizado(a)`,
          passed: false,
          detail: "Componente não está no quadro.",
        });
        continue;
      }

      const energized = loads.some((load) =>
        isLoadEnergized(circuit, load)
      );

      checks.push({
        id: `energize-${type}`,
        label: `${name} energizado(a)`,
        passed: energized,
        detail: energized
          ? "Carga recebendo energia."
          : "A carga não está no caminho energizado. Revise as ligações.",
      });
    }
  }

  // 6. Qualquer carga energizada
  if (exercise.rules?.mustEnergizeAnyLoad) {
    const loads = getLoads(circuit);
    const any = loads.some((load) => isLoadEnergized(circuit, load));
    checks.push({
      id: "any-load-on",
      label: "Pelo menos uma carga energizada",
      passed: any,
      detail: any
        ? "Há carga funcionando."
        : "Nenhuma carga está energizada.",
    });
  }

  // 7. Fonte presente
  const source = getSource(circuit);
  checks.push({
    id: "has-source",
    label: "Fonte DC presente",
    passed: Boolean(source),
    detail: source
      ? `Fonte de ${source.value}${source.unit || "V"}.`
      : "Adicione uma Fonte DC.",
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const total = checks.length;
  const score = total > 0 ? Math.round((passedCount / total) * 100) : 0;
  const ok = checks.every((c) => c.passed);

  return {
    ok,
    score,
    passedCount,
    total,
    message: ok
      ? `Exercício concluído! (${score}%)`
      : `Ainda faltam requisitos (${passedCount}/${total}).`,
    checks,
    exercise,
  };
}
