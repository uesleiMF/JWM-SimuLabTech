import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardCheck,
  FlaskConical,
  Target,
  Cloud,
} from "lucide-react";

import { EXERCISES } from "../../simulator/exercises";
import { listActivities, getToken } from "../../services/api";

import "./Exercises.css";

const difficultyColor = {
  Fácil: "level-basic",
  Médio: "level-intermediate",
  Difícil: "level-advanced",
};

function mapApiActivity(a) {
  return {
    id: a.id,
    title: a.title,
    description: a.description || "",
    difficulty: a.difficulty || "Fácil",
    points: a.points || 100,
    requiredTypes: a.requiredTypes || [],
    fromApi: true,
  };
}

export default function Exercises() {
  const [remote, setRemote] = useState([]);
  const [loadingRemote, setLoadingRemote] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    setLoadingRemote(true);
    listActivities({ type: "exercise" })
      .then((data) => {
        if (cancelled) return;
        const list = (data?.activities || [])
          .filter((a) => a.published !== false)
          .map(mapApiActivity);
        setRemote(list);
      })
      .catch(() => {
        if (!cancelled) setRemote([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRemote(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const all = [
    ...remote,
    ...EXERCISES.map((e) => ({ ...e, fromApi: false })),
  ];

  return (
    <div className="exercises-page">
      <header className="exercises-header">
        <div>
          <span className="exercises-eyebrow">PRÁTICA</span>
          <h1>Exercícios</h1>
          <p>
            Monte os circuitos no laboratório e use o botão{" "}
            <strong>Validar</strong> para conferir se está correto.
            {remote.length > 0
              ? ` ${remote.length} atividade(s) do professor.`
              : ""}
          </p>
        </div>

        <Link to="/app/laboratorio" className="exercises-lab-link">
          <FlaskConical size={18} />
          Abrir laboratório livre
        </Link>
      </header>

      {loadingRemote ? (
        <p style={{ opacity: 0.7, marginBottom: 12 }}>
          Carregando atividades do professor…
        </p>
      ) : null}

      <section className="exercises-grid">
        {all.map((exercise) => (
          <article key={exercise.id} className="exercise-card">
            <div className="exercise-card-top">
              <span
                className={`exercise-level ${
                  difficultyColor[exercise.difficulty] || ""
                }`}
              >
                {exercise.difficulty}
              </span>
              <span className="exercise-points">{exercise.points} pts</span>
            </div>

            <h3>
              {exercise.fromApi ? (
                <Cloud size={14} style={{ marginRight: 6, opacity: 0.7 }} />
              ) : null}
              {exercise.title}
            </h3>
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
        <p>
          Dica: no laboratório, monte o circuito e clique em{" "}
          <strong>Validar</strong>. O progresso é salvo na sua conta.
        </p>
      </section>
    </div>
  );
}
