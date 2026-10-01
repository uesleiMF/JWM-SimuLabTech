import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FlaskConical,
  Lock,
  Play,
  Trophy,
  Zap,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import "./CourseDetail.css";

const courseData = {
  "circuitos-1": {
    title: "Circuitos Elétricos I",
    category: "Circuitos Elétricos",
    description:
      "Aprenda os fundamentos dos circuitos elétricos e desenvolva a capacidade de analisar circuitos de forma teórica e prática.",
    progress: 72,
    lessonsCompleted: 23,
    totalLessons: 32,
    duration: "18 horas",
    level: "Básico",
    modules: [
      {
        id: 1,
        title: "Fundamentos da Eletricidade",
        description:
          "Conceitos fundamentais necessários para compreender os circuitos elétricos.",
        progress: 100,
        lessons: [
          {
            id: 1,
            title: "O que é eletricidade?",
            duration: "18 min",
            completed: true,
          },
          {
            id: 2,
            title: "Carga elétrica",
            duration: "22 min",
            completed: true,
          },
          {
            id: 3,
            title: "Tensão elétrica",
            duration: "25 min",
            completed: true,
          },
          {
            id: 4,
            title: "Corrente elétrica",
            duration: "28 min",
            completed: true,
          },
        ],
      },
      {
        id: 2,
        title: "Resistência e Lei de Ohm",
        description:
          "Estude resistência elétrica e aprenda a utilizar a Lei de Ohm para resolver circuitos.",
        progress: 100,
        lessons: [
          {
            id: 5,
            title: "Resistência elétrica",
            duration: "24 min",
            completed: true,
          },
          {
            id: 6,
            title: "Resistores",
            duration: "20 min",
            completed: true,
          },
          {
            id: 7,
            title: "Lei de Ohm",
            duration: "32 min",
            completed: true,
          },
          {
            id: 8,
            title: "Aplicações da Lei de Ohm",
            duration: "35 min",
            completed: true,
          },
        ],
      },
      {
        id: 3,
        title: "Potência e Energia Elétrica",
        description:
          "Compreenda potência, energia e consumo elétrico em circuitos.",
        progress: 75,
        lessons: [
          {
            id: 9,
            title: "Potência elétrica",
            duration: "26 min",
            completed: true,
          },
          {
            id: 10,
            title: "Energia elétrica",
            duration: "24 min",
            completed: true,
          },
          {
            id: 11,
            title: "Consumo de energia",
            duration: "30 min",
            completed: true,
          },
          {
            id: 12,
            title: "Exercícios de potência",
            duration: "35 min",
            completed: false,
          },
        ],
      },
      {
        id: 4,
        title: "Associação de Resistores",
        description:
          "Aprenda a analisar associações série, paralelo e mistas.",
        progress: 50,
        lessons: [
          {
            id: 13,
            title: "Resistores em série",
            duration: "28 min",
            completed: true,
          },
          {
            id: 14,
            title: "Resistores em paralelo",
            duration: "31 min",
            completed: false,
          },
          {
            id: 15,
            title: "Associação mista",
            duration: "34 min",
            completed: false,
          },
          {
            id: 16,
            title: "Exercícios de associação",
            duration: "40 min",
            completed: false,
          },
        ],
      },
      {
        id: 5,
        title: "Leis de Kirchhoff",
        description:
          "Aprenda as leis das correntes e das tensões e suas aplicações.",
        progress: 0,
        lessons: [
          {
            id: 17,
            title: "Primeira Lei de Kirchhoff",
            duration: "30 min",
            completed: false,
          },
          {
            id: 18,
            title: "Segunda Lei de Kirchhoff",
            duration: "32 min",
            completed: false,
          },
          {
            id: 19,
            title: "Análise de malhas",
            duration: "38 min",
            completed: false,
          },
          {
            id: 20,
            title: "Exercícios de Kirchhoff",
            duration: "45 min",
            completed: false,
          },
        ],
      },
      {
        id: 6,
        title: "Laboratório de Circuitos",
        description:
          "Coloque em prática os conhecimentos através de experimentos virtuais.",
        progress: 0,
        lessons: [
          {
            id: 21,
            title: "Montando o primeiro circuito",
            duration: "25 min",
            completed: false,
          },
          {
            id: 22,
            title: "Medição de tensão",
            duration: "28 min",
            completed: false,
          },
          {
            id: 23,
            title: "Medição de corrente",
            duration: "28 min",
            completed: false,
          },
          {
            id: 24,
            title: "Experimento Lei de Ohm",
            duration: "40 min",
            completed: false,
          },
        ],
      },
    ],
  },
};

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const course =
    courseData[courseId] || courseData["circuitos-1"];

  const [openModules, setOpenModules] = useState([1, 2, 3, 4]);

  const toggleModule = (moduleId) => {
    setOpenModules((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId]
    );
  };

 const continueCourse = () => {
  navigate(`/app/aula/${courseId}/12`);
};

  return (
    <div className="course-detail-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/app/cursos")}
      >
        <ArrowLeft size={18} />
        Voltar para meus cursos
      </button>

      <section className="course-detail-hero">
        <div className="course-detail-icon">
          <Zap size={34} />
        </div>

        <div className="course-detail-main">
          <div className="course-detail-tags">
            <span>{course.category}</span>
            <span>{course.level}</span>
          </div>

          <h1>{course.title}</h1>

          <p>{course.description}</p>

          <div className="course-detail-meta">
            <span>
              <BookOpen size={16} />
              {course.totalLessons} aulas
            </span>

            <span>
              <Clock3 size={16} />
              {course.duration}
            </span>

            <span>
              <Trophy size={16} />
              Certificado
            </span>
          </div>
        </div>

        <div className="course-detail-progress">
          <div className="progress-circle">
            <strong>{course.progress}%</strong>
          </div>

          <span>Concluído</span>
        </div>
      </section>

      <section className="course-action-bar">
        <div>
          <strong>Continue de onde parou</strong>

          <span>
            Aula 12 — Exercícios de potência
          </span>
        </div>

        <div className="course-actions">
          <button
            type="button"
            className="laboratory-button"
            onClick={() => navigate("/app/laboratorio")}
          >
            <FlaskConical size={17} />
            Abrir laboratório
          </button>

          <button
            type="button"
            className="continue-course-button"
            onClick={continueCourse}
          >
            <Play size={17} fill="currentColor" />
            Continuar aula
          </button>
        </div>
      </section>

      <div className="course-content-grid">
        <main>
          <div className="content-heading">
            <div>
              <span>CONTEÚDO DO CURSO</span>
              <h2>Módulos e aulas</h2>
            </div>

            <strong>
              {course.lessonsCompleted}/{course.totalLessons} aulas
            </strong>
          </div>

          <div className="modules-list">
            {course.modules.map((module) => {
              const isOpen = openModules.includes(module.id);

              return (
                <article
                  className="module-card"
                  key={module.id}
                >
                  <button
                    type="button"
                    className="module-header"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="module-number">
                      {module.id}
                    </div>

                    <div className="module-info">
                      <div className="module-title-row">
                        <h3>{module.title}</h3>

                        <span>{module.progress}%</span>
                      </div>

                      <p>{module.description}</p>

                      <div className="module-progress">
                        <div
                          style={{
                            width: `${module.progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {isOpen ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </button>

                  {isOpen && (
                    <div className="lesson-list">
                      {module.lessons.map((lesson) => (
                        <div
                          className={`lesson-item ${
                            lesson.completed
                              ? "completed"
                              : ""
                          }`}
                          key={lesson.id}
                        >
                          <div className="lesson-status">
                            {lesson.completed ? (
                              <CheckCircle2 size={19} />
                            ) : (
                              <Play size={16} />
                            )}
                          </div>

                          <div className="lesson-info">
                            <strong>{lesson.title}</strong>

                            <span>
                              <Clock3 size={13} />
                              {lesson.duration}
                            </span>
                          </div>

                          {lesson.completed ? (
                            <span className="lesson-completed">
                              Concluída
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="lesson-button"
                              onClick={() =>
                                navigate(
                                  `/app/aula/${courseId}/${lesson.id}`
                                )
                              }
                            >
                              Assistir
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </main>

        <aside className="course-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-card-icon">
              <Trophy size={21} />
            </div>

            <h3>Seu progresso</h3>

            <div className="big-progress">
              <div>
                <strong>{course.progress}%</strong>
                <span>concluído</span>
              </div>

              <div className="big-progress-bar">
                <div
                  style={{
                    width: `${course.progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="progress-stat">
              <span>Aulas concluídas</span>
              <strong>
                {course.lessonsCompleted}/{course.totalLessons}
              </strong>
            </div>

            <div className="progress-stat">
              <span>Tempo estudado</span>
              <strong>13h 20min</strong>
            </div>

            <div className="progress-stat">
              <span>XP conquistado</span>
              <strong>1.240 XP</strong>
            </div>
          </div>

          <div className="sidebar-card practical-card">
            <div className="sidebar-card-icon">
              <FlaskConical size={21} />
            </div>

            <h3>Aprenda praticando</h3>

            <p>
              Teste seus conhecimentos no laboratório virtual
              e monte circuitos elétricos diretamente no
              navegador.
            </p>

            <button
              type="button"
              onClick={() => navigate("/app/laboratorio")}
            >
              Ir para o laboratório
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-card-icon">
              <Lock size={20} />
            </div>

            <h3>Próximo módulo</h3>

            <p>
              Ao concluir o conteúdo atual, novos experimentos
              e desafios serão liberados.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}