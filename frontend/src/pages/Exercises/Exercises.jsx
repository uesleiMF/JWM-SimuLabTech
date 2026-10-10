import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FlaskConical,
  Target,
} from "lucide-react";

import { EXERCISES } from "../../simulator/exercises";

import "./Exercises.css";

const difficultyColor = {
  Fácil: "level-basic",
  Médio: "level-intermediate",
  Difícil: "level-advanced",
};

export default function Exercises() {
  return (
    <div className="exercises-page">
      <header className="exercises-header">
        <div>
          <span className="exercises-eyebrow">PRÁTICA</span>
          <h1>Exercícios</h1>
          <p>
            Monte os circuitos no laboratório e use o botão{" "}
            <strong>Validar</strong> para conferir se está correto.
          </p>
        </div>

        <Link to="/app/laboratorio" className="exercises-lab-link">
          <FlaskConical size={18} />
          Abrir laboratório livre
        </Link>
      </header>

      <section className="exercises-grid">
        {EXERCISES.map((exercise) => (
          <article key={exercise.id} className="exercise-card">
            <div className="exercise-card-top">
              <span
                className={`exercise-level ${
                  difficultyColor[exercise.difficulty] || ""
                }`}
              >
                {exercise.difficulty}
              </span>
              <span className="exercise-points">
                {exercise.points} pts
              </span>
            </div>

            <h3>{exercise.title}</h3>
            <p>{exercise.description}</p>

            <div className="exercise-meta">
              <span>
                <Target size={14} />
                {exercise.requiredTypes?.length || 0} componentes
              </span>
              <span>
                <ClipboardCheck size={14} />
                Validação automática
              </span>
            </div>

            <Link
              to={`/app/laboratorio?exercicio=${exercise.id}`}
              className="exercise-action"
            >
              Praticar no laboratório
              <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </section>

      <section className="exercises-tip">
        <BookOpen size={18} />
        <div>
          <strong>Como funciona</strong>
          <p>
            1. Clique em Praticar no laboratório · 2. Monte o circuito com os
            componentes pedidos · 3. Ligue os fios manualmente · 4. Clique em
            Validar para ver o resultado.
          </p>
        </div>
      </section>
    </div>
  );
}
