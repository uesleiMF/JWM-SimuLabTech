import { Link } from "react-router-dom";
import {
  ArrowRight,
  Battery,
  Cpu,
  FlaskConical,
  Lightbulb,
  Play,
  Power,
  Zap,
} from "lucide-react";

import "./Simulator.css";

const presets = [
  {
    id: "serie",
    title: "Circuito em série",
    description:
      "Fonte, interruptor, resistor e lâmpada em série para estudar corrente única.",
    icon: Lightbulb,
    tag: "Básico",
  },
  {
    id: "paralelo",
    title: "Circuito em paralelo",
    description:
      "Duas cargas em paralelo para comparar tensão e corrente em cada ramo.",
    icon: Zap,
    tag: "Básico",
  },
  {
    id: "motor",
    title: "Motor DC",
    description:
      "Simule o acionamento de um motor com fonte, interruptor e proteção.",
    icon: Cpu,
    tag: "Intermediário",
  },
  {
    id: "led",
    title: "LED com resistor",
    description:
      "Monte um LED com resistor de proteção e analise a corrente resultante.",
    icon: Power,
    tag: "Básico",
  },
];

const tools = [
  {
    title: "Laboratório completo",
    description:
      "Ambiente livre para montar qualquer circuito com drag-and-drop, fios e medições.",
    path: "/app/laboratorio",
    icon: FlaskConical,
    primary: true,
  },
  {
    title: "Exercícios práticos",
    description:
      "Treine cálculos e conceitos antes de validar no laboratório.",
    path: "/app/exercicios",
    icon: Battery,
    primary: false,
  },
  {
    title: "Desafios",
    description:
      "Missões com objetivos claros para evoluir suas montagens.",
    path: "/app/desafios",
    icon: Zap,
    primary: false,
  },
];

export default function Simulator() {
  return (
    <div className="simulator-page">
      <header className="simulator-header">
        <div>
          <span className="simulator-eyebrow">SIMULAÇÃO</span>
          <h1>Simulador</h1>
          <p>
            Escolha um modelo pronto ou abra o laboratório completo para montar
            seu próprio circuito.
          </p>
        </div>

        <Link to="/app/laboratorio" className="simulator-main-cta">
          <Play size={18} />
          Abrir laboratório
        </Link>
      </header>

      {/* ==================================================
          ACESSO RÁPIDO
      ================================================== */}
      <section className="simulator-tools-grid">
        {tools.map((tool) => {
          const Icon = tool.icon;

          return (
            <Link
              key={tool.title}
              to={tool.path}
              className={`simulator-tool-card ${
                tool.primary ? "primary" : ""
              }`}
            >
              <div className="simulator-tool-icon">
                <Icon size={20} />
              </div>
              <div className="simulator-tool-content">
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </div>
              <ArrowRight size={18} className="simulator-tool-arrow" />
            </Link>
          );
        })}
      </section>

      {/* ==================================================
          PRESETS
      ================================================== */}
      <section className="simulator-presets">
        <div className="simulator-section-heading">
          <span className="simulator-eyebrow">MODELOS PRONTOS</span>
          <h2>Comece com um circuito base</h2>
          <p>
            Selecione um modelo e continue a montagem no laboratório virtual.
          </p>
        </div>

        <div className="simulator-presets-grid">
          {presets.map((preset) => {
            const Icon = preset.icon;

            return (
              <article key={preset.id} className="simulator-preset-card">
                <div className="simulator-preset-top">
                  <div className="simulator-preset-icon">
                    <Icon size={18} />
                  </div>
                  <span className="simulator-preset-tag">{preset.tag}</span>
                </div>

                <h3>{preset.title}</h3>
                <p>{preset.description}</p>

                <Link to="/app/laboratorio" className="simulator-preset-btn">
                  Usar este modelo
                  <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* ==================================================
          DICA
      ================================================== */}
      <div className="simulator-note">
        <FlaskConical size={16} />
        <p>
          O simulador usa o mesmo motor do Laboratório. Os modelos prontos
          abrem o ambiente completo para você ajustar componentes, conexões e
          medições.
        </p>
      </div>
    </div>
  );
}
