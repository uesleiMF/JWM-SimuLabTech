import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { fetchStudentProgress } from "../../services/api";
import { EXERCISES } from "../../simulator/exercises";

import "./Progress.css";

export default function Progress() {
  const [summary, setSummary] = useState({ completedCount: 0, totalPoints: 0, labsCount: 0, recent: [], exercisesCompleted: [] });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await fetchStudentProgress();
      if (!cancelled) setSummary(data || {});
    }
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const totalExercises = EXERCISES.length;
  const completedCount = summary.completedCount || 0;
  const percent =
    totalExercises > 0
      ? Math.round((completedCount / totalExercises) * 100)
      : 0;

  const overview = [
    {
      icon: CheckCircle2,
      label: "Exercícios concluídos",
      value: String(completedCount),
      detail: `de ${totalExercises} disponíveis`,
    },
    {
      icon: Trophy,
      label: "Pontos",
      value: String(summary.totalPoints || 0),
      detail: "acumulados",
    },
    {
      icon: FlaskConical,
      label: "Labs registrados",
      value: String(summary.labsCount || 0),
      detail: "validações com sucesso",
    },
    {
      icon: Target,
      label: "Progresso geral",
      value: `${percent}%`,
      detail: "dos exercícios",
    },
  ];

  const recent = summary.recent || [];

  return (
    <div className="progress-page">
      <div className="progress-header">
        <div>
          <span className="progress-eyebrow">ACOMPANHAMENTO</span>
          <h1>Meu Progresso</h1>
          <p>
            Resultados dos exercícios do laboratório. Quando o backend MERN
            estiver conectado, estes dados sincronizam com a sua conta.
          </p>
        </div>
        <div className="progress-header-badge">
          <BarChart3 size={18} />
          <span>{percent}% concluído</span>
        </div>
      </div>

      <div className="progress-overview-grid">
        {overview.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="progress-overview-card">
              <div className="progress-overview-icon">
                <Icon size={18} />
              </div>
              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.detail}</small>
              </div>
            </article>
          );
        })}
      </div>

      <div className="progress-main-grid">
        <section className="progress-panel">
          <div className="progress-panel-heading">
            <span className="progress-eyebrow">EXERCÍCIOS</span>
            <h2>Histórico de conclusões</h2>
          </div>

          {recent.length === 0 ? (
            <p className="progress-empty">
              Nenhum exercício concluído ainda. Vá ao laboratório, monte o
              circuito e clique em <strong>Validar</strong>.
            </p>
          ) : (
            <div className="progress-activities-list">
              {recent.map((item) => (
                <article
                  key={item.id + (item.completedAt || "")}
                  className="progress-activity-item"
                >
                  <div className="progress-activity-main">
                    <strong>{item.title}</strong>
                    <span>
                      {item.score}% · {item.points || 0} pts
                      {item.completedAt
                        ? ` · ${new Date(item.completedAt).toLocaleString("pt-BR")}`
                        : ""}
                    </span>
                  </div>
                  <span className="progress-activity-status done">
                    Concluído
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="progress-panel">
          <div className="progress-panel-heading">
            <span className="progress-eyebrow">LISTA</span>
            <h2>Todos os exercícios</h2>
          </div>
          <div className="progress-activities-list">
            {EXERCISES.map((ex) => {
              const done = (summary.exercisesCompleted || []).find(
                (e) => e.id === ex.id
              );
              return (
                <article key={ex.id} className="progress-activity-item">
                  <div className="progress-activity-main">
                    <strong>{ex.title}</strong>
                    <span>
                      {ex.difficulty} · {ex.points} pts
                    </span>
                  </div>
                  <span
                    className={`progress-activity-status ${
                      done ? "done" : "pending"
                    }`}
                  >
                    {done ? "Concluído" : "Pendente"}
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <div className="progress-note">
        <Zap size={16} />
        <p>
          Dados salvos neste navegador (<code>localStorage</code>). O arquivo{" "}
          <code>api.js</code> já está preparado para trocar por endpoints MERN
          (<code>/api/progress</code>).
        </p>
      </div>
    </div>
  );
}
