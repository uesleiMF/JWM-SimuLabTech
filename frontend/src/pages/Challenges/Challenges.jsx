import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  Flame,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

import "./Challenges.css";

const challenges = [
  {
    id: 1,
    title: "Circuito série e paralelo",
    description:
      "Monte um circuito misto e obtenha a corrente total correta no laboratório.",
    difficulty: "Médio",
    points: 120,
    time: "30 min",
    status: "Em andamento",
    progress: 60,
  },
  {
    id: 2,
    title: "Lâmpada sob controle",
    description:
      "Use fonte, interruptor e lâmpada para criar um circuito funcional completo.",
    difficulty: "Fácil",
    points: 80,
    time: "20 min",
    status: "Concluído",
    progress: 100,
  },
  {
    id: 3,
    title: "Motor em ação",
    description:
      "Energize um motor DC com segurança e valide corrente e potência.",
    difficulty: "Médio",
    points: 150,
    time: "35 min",
    status: "Disponível",
    progress: 0,
  },
  {
    id: 4,
    title: "LED com proteção",
    description:
      "Monte um LED com resistor de proteção e prove que a corrente está adequada.",
    difficulty: "Fácil",
    points: 90,
    time: "25 min",
    status: "Disponível",
    progress: 0,
  },
  {
    id: 5,
    title: "Análise de potência máxima",
    description:
      "Encontre a configuração de carga que maximiza a potência no circuito.",
    difficulty: "Difícil",
    points: 220,
    time: "45 min",
    status: "Bloqueado",
    progress: 0,
  },
  {
    id: 6,
    title: "Desafio do laboratório completo",
    description:
      "Monte um circuito com fonte, switch, resistor, lâmpada e motor funcionando juntos.",
    difficulty: "Difícil",
    points: 300,
    time: "50 min",
    status: "Bloqueado",
    progress: 0,
  },
];

export default function Challenges() {
  const completed = challenges.filter((c) => c.status === "Concluído").length;
  const totalPoints = challenges
    .filter((c) => c.status === "Concluído")
    .reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="challenges-page">
      <header className="challenges-header">
        <div>
          <span className="challenges-eyebrow">COMPETIÇÃO</span>
          <h1>Desafios</h1>
          <p>
            Complete missões práticas no laboratório, acumule pontos e evolua
            suas habilidades.
          </p>
        </div>

        <div className="challenges-summary">
          <div className="challenges-summary-card">
            <Trophy size={18} />
            <div>
              <strong>{completed}</strong>
              <span>Concluídos</span>
            </div>
          </div>
          <div className="challenges-summary-card">
            <Star size={18} />
            <div>
              <strong>{totalPoints}</strong>
              <span>Pontos</span>
            </div>
          </div>
          <div className="challenges-summary-card">
            <Flame size={18} />
            <div>
              <strong>3</strong>
              <span>Sequência</span>
            </div>
          </div>
        </div>
      </header>

      <div className="challenges-grid">
        {challenges.map((challenge) => (
          <article key={challenge.id} className="challenge-card">
            <div className="challenge-card-top">
              <span
                className={`challenge-difficulty ${challenge.difficulty
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")}`}
              >
                {challenge.difficulty}
              </span>

              <span
                className={`challenge-status ${
                  challenge.status === "Concluído"
                    ? "done"
                    : challenge.status === "Em andamento"
                    ? "active"
                    : challenge.status === "Disponível"
                    ? "available"
                    : "locked"
                }`}
              >
                {challenge.status}
              </span>
            </div>

            <h3>{challenge.title}</h3>
            <p>{challenge.description}</p>

            <div className="challenge-meta">
              <div>
                <Star size={14} />
                <span>{challenge.points} pts</span>
              </div>
              <div>
                <Clock3 size={14} />
                <span>{challenge.time}</span>
              </div>
              <div>
                <Zap size={14} />
                <span>Laboratório</span>
              </div>
            </div>

            {challenge.progress > 0 && (
              <div className="challenge-progress">
                <div className="challenge-progress-track">
                  <div
                    className="challenge-progress-fill"
                    style={{ width: `${challenge.progress}%` }}
                  />
                </div>
                <span>{challenge.progress}%</span>
              </div>
            )}

            <div className="challenge-card-actions">
              {challenge.status === "Bloqueado" ? (
                <button type="button" className="challenge-btn locked" disabled>
                  Bloqueado
                </button>
              ) : challenge.status === "Concluído" ? (
                <button type="button" className="challenge-btn secondary">
                  Ver resultado
                </button>
              ) : (
                <Link to="/app/laboratorio" className="challenge-btn primary">
                  {challenge.status === "Em andamento"
                    ? "Continuar"
                    : "Iniciar desafio"}
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
