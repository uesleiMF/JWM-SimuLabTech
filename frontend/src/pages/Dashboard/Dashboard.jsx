import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FlaskConical,
  Flame,
  GraduationCap,
  Play,
  Plus,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import "./Dashboard.css";

const courses = [
  {
    title: "Circuitos Elétricos I",
    description: "Fundamentos de eletricidade e análise de circuitos.",
    progress: 72,
    lessons: 18,
    completed: 13,
    icon: "⚡",
  },
  {
    title: "Circuitos Elétricos II",
    description: "Análise avançada de circuitos em corrente alternada.",
    progress: 48,
    lessons: 20,
    completed: 10,
    icon: "🔌",
  },
  {
    title: "Eletrônica",
    description: "Diodos, transistores, fontes e circuitos eletrônicos.",
    progress: 34,
    lessons: 24,
    completed: 8,
    icon: "🔧",
  },
];

const modules = [
  {
    title: "Comandos Elétricos",
    description: "Contatores, relés, motores e comandos.",
    icon: "⚙️",
  },
  {
    title: "Automação",
    description: "CLP, sensores e sistemas automatizados.",
    icon: "🤖",
  },
  {
    title: "Eletrotécnica",
    description: "Máquinas elétricas e instalações.",
    icon: "🏭",
  },
  {
    title: "Eletrônica Industrial",
    description: "Aplicações eletrônicas para indústria.",
    icon: "💡",
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
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* CABEÇALHO */}
      <section className="dashboard-welcome">
        <div>
          <span className="welcome-label">PAINEL DO ESTUDANTE</span>

          <h1>
            Olá, José! <span>👋</span>
          </h1>

          <p>
            Continue seus estudos e avance mais um passo na sua formação
            técnica.
          </p>
        </div>

        <div className="study-streak">
          <div className="streak-icon">
            <Flame size={21} />
          </div>

          <div>
            <strong>7 dias</strong>
            <span>sequência de estudos</span>
          </div>
        </div>
      </section>

      {/* CARDS DE RESUMO */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <BookOpen size={21} />
          </div>

          <div className="stat-content">
            <span>Cursos ativos</span>
            <strong>6</strong>
            <small>+2 este mês</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={21} />
          </div>

          <div className="stat-content">
            <span>Aulas concluídas</span>
            <strong>38</strong>
            <small>+5 esta semana</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock3 size={21} />
          </div>

          <div className="stat-content">
            <span>Horas estudadas</span>
            <strong>24h</strong>
            <small>+3h esta semana</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Trophy size={21} />
          </div>

          <div className="stat-content">
            <span>Pontuação</span>
            <strong>1.840</strong>
            <small>Nível 8</small>
          </div>
        </div>
      </section>

      {/* PROGRESSO + LABORATÓRIO */}
      <section className="dashboard-main-grid">
        <div className="progress-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">SEU DESEMPENHO</span>
              <h2>Progresso geral</h2>
            </div>

            <button type="button" className="text-button">
              Ver detalhes
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="progress-overview">
            <div className="progress-circle">
              <div>
                <strong>64%</strong>
                <span>concluído</span>
              </div>
            </div>

            <div className="progress-info">
              <div className="progress-info-row">
                <span>Conteúdo estudado</span>
                <strong>64%</strong>
              </div>

              <div className="progress-bar">
                <div style={{ width: "64%" }} />
              </div>

              <div className="progress-info-row">
                <span>Exercícios realizados</span>
                <strong>78%</strong>
              </div>

              <div className="progress-bar green-bar">
                <div style={{ width: "78%" }} />
              </div>

              <div className="progress-info-row">
                <span>Desafios concluídos</span>
                <strong>42%</strong>
              </div>

              <div className="progress-bar orange-bar">
                <div style={{ width: "42%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="laboratory-card">
          <div className="laboratory-top">
            <div className="laboratory-icon">
              <FlaskConical size={24} />
            </div>

            <span className="live-badge">
              <span />
              ONLINE
            </span>
          </div>

          <h2>Laboratório Virtual</h2>

          <p>
            Monte seus circuitos, faça medições e aprenda praticando.
          </p>

          <div className="lab-preview">
            <div className="circuit-line">
              <span className="circuit-node" />
              <span className="circuit-component resistor">
                R1
              </span>
              <span className="circuit-node" />
              <span className="circuit-component lamp">
                💡
              </span>
              <span className="circuit-node" />
            </div>

            <div className="lab-measurements">
              <span>
                <small>Tensão</small>
                <strong>12.0 V</strong>
              </span>

              <span>
                <small>Corrente</small>
                <strong>0.24 A</strong>
              </span>

              <span>
                <small>Potência</small>
                <strong>2.88 W</strong>
              </span>
            </div>
          </div>

          <button type="button" className="lab-button">
            <Play size={17} fill="currentColor" />
            Abrir laboratório
          </button>
        </div>
      </section>

      {/* CURSOS */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <span className="panel-label">CONTINUE APRENDENDO</span>
            <h2>Meus cursos</h2>
          </div>

          <button type="button" className="text-button">
            Ver todos
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="courses-grid">
          {courses.map((course) => (
            <article className="course-card" key={course.title}>
              <div className="course-icon">{course.icon}</div>

              <div className="course-body">
                <span className="course-category">
                  CURSO TÉCNICO
                </span>

                <h3>{course.title}</h3>

                <p>{course.description}</p>

                <div className="course-progress-info">
                  <span>Progresso</span>
                  <strong>{course.progress}%</strong>
                </div>

                <div className="course-progress">
                  <div style={{ width: `${course.progress}%` }} />
                </div>

                <div className="course-footer">
                  <span>
                    {course.completed} de {course.lessons} aulas
                  </span>

                  <button type="button">
                    Continuar
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ATIVIDADES + DESAFIO */}
      <section className="dashboard-bottom-grid">
        <div className="activities-panel">
          <div className="section-header">
            <div>
              <span className="panel-label">HISTÓRICO</span>
              <h2>Atividades recentes</h2>
            </div>

            <button type="button" className="text-button">
              Ver tudo
            </button>
          </div>

          <div className="activities-list">
            {activities.map((activity, index) => (
              <div className="activity-item" key={activity.title}>
                <div className={`activity-icon activity-${index}`}>
                  {index === 0 && <CheckCircle2 size={18} />}
                  {index === 1 && <FlaskConical size={18} />}
                  {index === 2 && <Target size={18} />}
                </div>

                <div className="activity-info">
                  <strong>{activity.title}</strong>
                  <span>
                    {activity.type} · {activity.time}
                  </span>
                </div>

                <span
                  className={`activity-status ${
                    activity.status === "Concluído"
                      ? "completed"
                      : "progress"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="challenge-card">
          <div className="challenge-header">
            <div className="challenge-icon">
              <Trophy size={23} />
            </div>

            <span>DESAFIO DA SEMANA</span>
          </div>

          <h2>Monte o circuito correto</h2>

          <p>
            Monte um circuito série com uma fonte de 24 V e dois
            resistores de 100 Ω.
          </p>

          <div className="challenge-reward">
            <div>
              <Zap size={17} />
              <span>Recompensa</span>
            </div>

            <strong>+250 XP</strong>
          </div>

          <button type="button" className="challenge-button">
            Começar desafio
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* MÓDULOS */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <span className="panel-label">FORMAÇÃO</span>
            <h2>Áreas de conhecimento</h2>
          </div>

          <button type="button" className="add-module-button">
            <Plus size={17} />
            Explorar módulos
          </button>
        </div>

        <div className="modules-grid">
          {modules.map((module) => (
            <article className="module-card" key={module.title}>
              <div className="module-card-icon">
                {module.icon}
              </div>

              <div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>

              <ChevronRight size={18} />
            </article>
          ))}
        </div>
      </section>

      {/* MOTIVAÇÃO */}
      <section className="motivation-card">
        <div className="motivation-icon">
          <GraduationCap size={30} />
        </div>

        <div>
          <strong>Continue construindo seu conhecimento.</strong>
          <p>
            Cada circuito montado é um passo a mais na sua formação
            profissional.
          </p>
        </div>

        <div className="motivation-score">
          <span>Nível atual</span>
          <strong>8</strong>
        </div>
      </section>
    </div>
  );
}