import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flame,
  FlaskConical,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import "./Progress.css";

const overview = [
  {
    icon: BookOpen,
    label: "Cursos ativos",
    value: "3",
    detail: "em andamento",
  },
  {
    icon: CheckCircle2,
    label: "Aulas concluídas",
    value: "31",
    detail: "de 62 aulas",
  },
  {
    icon: FlaskConical,
    label: "Laboratórios",
    value: "12",
    detail: "circuitos montados",
  },
  {
    icon: Trophy,
    label: "Desafios",
    value: "5",
    detail: "concluídos",
  },
];

const courses = [
  {
    title: "Circuitos Elétricos I",
    description: "Fundamentos de eletricidade e análise de circuitos.",
    progress: 72,
    lessons: 18,
    completed: 13,
    icon: "⚡",
    color: "#2563eb",
  },
  {
    title: "Circuitos Elétricos II",
    description: "Análise avançada de circuitos em corrente alternada.",
    progress: 48,
    lessons: 20,
    completed: 10,
    icon: "🔌",
    color: "#7c3aed",
  },
  {
    title: "Eletrônica",
    description: "Diodos, transistores, fontes e circuitos eletrônicos.",
    progress: 34,
    lessons: 24,
    completed: 8,
    icon: "🔧",
    color: "#059669",
  },
];

const activities = [
  {
    title: "Lei de Ohm",
    type: "Exercício",
    time: "Hoje, 14:32",
    status: "Concluído",
  },
  {
    title: "Associação de resistores",
    type: "Laboratório",
    time: "Ontem, 20:15",
    status: "Concluído",
  },
  {
    title: "Circuito série e paralelo",
    type: "Desafio",
    time: "Ontem, 18:42",
    status: "Em andamento",
  },
  {
    title: "Fonte DC e interruptor",
    type: "Laboratório",
    time: "Segunda, 16:10",
    status: "Concluído",
  },
  {
    title: "Análise de potência",
    type: "Exercício",
    time: "Segunda, 11:05",
    status: "Concluído",
  },
];

const goals = [
  {
    icon: Target,
    title: "Meta semanal",
    value: "4 de 5 aulas",
    progress: 80,
  },
  {
    icon: Flame,
    title: "Sequência de estudos",
    value: "6 dias seguidos",
    progress: 60,
  },
  {
    icon: Clock3,
    title: "Tempo de estudo",
    value: "18h este mês",
    progress: 45,
  },
];

export default function Progress() {
  const overallProgress = Math.round(
    courses.reduce((sum, course) => sum + course.progress, 0) / courses.length
  );

  return (
    <div className="progress-page">
      {/* ==================================================
          HEADER
      ================================================== */}
      <header className="progress-header">
        <div>
          <span className="progress-eyebrow">ACOMPANHAMENTO</span>
          <h1>Meu Progresso</h1>
          <p>
            Acompanhe sua evolução nos cursos, laboratórios e desafios do
            SimuLabTech.
          </p>
        </div>

        <div className="progress-overall-card">
          <div className="progress-overall-icon">
            <BarChart3 size={22} />
          </div>
          <div>
            <span>Progresso geral</span>
            <strong>{overallProgress}%</strong>
          </div>
        </div>
      </header>

      {/* ==================================================
          OVERVIEW
      ================================================== */}
      <section className="progress-overview-grid">
        {overview.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.label} className="progress-overview-card">
              <div className="progress-overview-icon">
                <Icon size={18} />
              </div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <small>{item.detail}</small>
            </article>
          );
        })}
      </section>

      <div className="progress-main-grid">
        {/* ==================================================
            CURSOS
        ================================================== */}
        <section className="progress-panel">
          <div className="progress-panel-heading">
            <span className="progress-eyebrow">CURSOS</span>
            <h2>Progresso por curso</h2>
          </div>

          <div className="progress-courses-list">
            {courses.map((course) => (
              <article key={course.title} className="progress-course-card">
                <div className="progress-course-top">
                  <div className="progress-course-icon">{course.icon}</div>

                  <div className="progress-course-info">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                  </div>

                  <div className="progress-course-percent">
                    <strong>{course.progress}%</strong>
                  </div>
                </div>

                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${course.progress}%`,
                      background: course.color,
                    }}
                  />
                </div>

                <div className="progress-course-meta">
                  <span>
                    {course.completed} de {course.lessons} aulas concluídas
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ==================================================
            METAS + ATIVIDADES
        ================================================== */}
        <div className="progress-side-column">
          <section className="progress-panel">
            <div className="progress-panel-heading">
              <span className="progress-eyebrow">METAS</span>
              <h2>Objetivos</h2>
            </div>

            <div className="progress-goals-list">
              {goals.map((goal) => {
                const Icon = goal.icon;

                return (
                  <article key={goal.title} className="progress-goal-card">
                    <div className="progress-goal-top">
                      <div className="progress-goal-icon">
                        <Icon size={16} />
                      </div>
                      <div>
                        <h3>{goal.title}</h3>
                        <p>{goal.value}</p>
                      </div>
                    </div>

                    <div className="progress-bar-track compact">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="progress-panel">
            <div className="progress-panel-heading">
              <span className="progress-eyebrow">ATIVIDADES</span>
              <h2>Histórico recente</h2>
            </div>

            <div className="progress-activities-list">
              {activities.map((activity) => (
                <article key={activity.title} className="progress-activity-item">
                  <div className="progress-activity-main">
                    <strong>{activity.title}</strong>
                    <span>
                      {activity.type} · {activity.time}
                    </span>
                  </div>

                  <span
                    className={`progress-activity-status ${
                      activity.status === "Concluído" ? "done" : "pending"
                    }`}
                  >
                    {activity.status}
                  </span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="progress-note">
        <Zap size={16} />
        <p>
          Os dados exibidos são demonstrativos. Quando o backend MERN estiver
          conectado, o progresso virá da conta do aluno em tempo real.
        </p>
      </div>
    </div>
  );
}
