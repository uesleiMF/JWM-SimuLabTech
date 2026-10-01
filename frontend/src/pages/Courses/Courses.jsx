import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BookOpen,
  Search,
  Play,
  Clock3,
  CheckCircle2,
  Filter,
  Zap,
  Cpu,
  Settings,
  Bot,
  GraduationCap,
} from "lucide-react";

import "./Courses.css";

const courses = [
  {
    id: "circuitos-1",
    title: "Circuitos Elétricos I",
    category: "Circuitos",
    description:
      "Aprenda os fundamentos dos circuitos elétricos, tensão, corrente, resistência e as principais leis da eletricidade.",
    icon: Zap,
    level: "Básico",
    lessons: 32,
    duration: "18h",
    progress: 72,
    completedLessons: 23,
    color: "blue",
    modules: [
      "Fundamentos da eletricidade",
      "Tensão, corrente e resistência",
      "Lei de Ohm",
      "Potência elétrica",
      "Associação de resistores",
      "Leis de Kirchhoff",
    ],
  },

  {
    id: "circuitos-2",
    title: "Circuitos Elétricos II",
    category: "Circuitos",
    description:
      "Avance nos estudos de circuitos elétricos com análise de redes, corrente alternada e técnicas de resolução.",
    icon: Zap,
    level: "Intermediário",
    lessons: 36,
    duration: "22h",
    progress: 48,
    completedLessons: 17,
    color: "indigo",
    modules: [
      "Análise de circuitos",
      "Teoremas de circuitos",
      "Capacitores e indutores",
      "Corrente alternada",
      "Impedância",
      "Circuitos RLC",
    ],
  },

  {
    id: "eletronica",
    title: "Eletrônica",
    category: "Eletrônica",
    description:
      "Estude componentes eletrônicos e aprenda a analisar e montar circuitos utilizando diodos, transistores e amplificadores.",
    icon: Cpu,
    level: "Intermediário",
    lessons: 40,
    duration: "25h",
    progress: 34,
    completedLessons: 14,
    color: "purple",
    modules: [
      "Componentes eletrônicos",
      "Diodos",
      "Retificadores",
      "Transistores",
      "Amplificadores",
      "Fontes de alimentação",
    ],
  },

  {
    id: "comandos-eletricos",
    title: "Comandos Elétricos",
    category: "Comandos",
    description:
      "Aprenda comandos elétricos industriais, contatores, relés, motores e circuitos de controle.",
    icon: Settings,
    level: "Intermediário",
    lessons: 34,
    duration: "20h",
    progress: 18,
    completedLessons: 6,
    color: "orange",
    modules: [
      "Introdução aos comandos",
      "Contatores",
      "Relés",
      "Partida direta",
      "Partida estrela-triângulo",
      "Proteção de motores",
    ],
  },

  {
    id: "automacao",
    title: "Automação Industrial",
    category: "Automação",
    description:
      "Conheça sensores, atuadores, CLPs e fundamentos da automação industrial.",
    icon: Bot,
    level: "Intermediário",
    lessons: 38,
    duration: "24h",
    progress: 12,
    completedLessons: 5,
    color: "green",
    modules: [
      "Fundamentos da automação",
      "Sensores",
      "Atuadores",
      "CLP",
      "Lógica de programação",
      "Sistemas automatizados",
    ],
  },

  {
    id: "eletrotecnica",
    title: "Eletrotécnica",
    category: "Eletrotécnica",
    description:
      "Formação abrangente em eletrotécnica com instalações, máquinas elétricas, medições e segurança.",
    icon: GraduationCap,
    level: "Avançado",
    lessons: 44,
    duration: "30h",
    progress: 8,
    completedLessons: 4,
    color: "cyan",
    modules: [
      "Fundamentos de eletrotécnica",
      "Instalações elétricas",
      "Medições elétricas",
      "Máquinas elétricas",
      "Transformadores",
      "Segurança elétrica",
    ],
  },
];

const categories = [
  "Todos",
  "Circuitos",
  "Eletrônica",
  "Comandos",
  "Automação",
  "Eletrotécnica",
];

function CourseCard({ course }) {
  const navigate = useNavigate();

  const Icon = course.icon;

  const handleContinue = () => {
    navigate(`/app/curso/${course.id}`);
  };

  return (
    <article className="course-card">
      <div className={`course-icon ${course.color}`}>
        <Icon size={25} />
      </div>

      <div className="course-card-body">
        <div className="course-card-top">
          <span className="course-category">
            {course.category}
          </span>

          <span className="course-level">
            {course.level}
          </span>
        </div>

        <h3>{course.title}</h3>

        <p>{course.description}</p>

        <div className="course-meta">
          <span>
            <BookOpen size={15} />
            {course.lessons} aulas
          </span>

          <span>
            <Clock3 size={15} />
            {course.duration}
          </span>
        </div>

        <div className="course-progress-header">
          <span>Seu progresso</span>

          <strong>{course.progress}%</strong>
        </div>

        <div className="progress-bar">
          <div
            className={`progress-fill ${course.color}`}
            style={{
              width: `${course.progress}%`,
            }}
          />
        </div>

        <div className="course-footer">
          <span className="lessons-completed">
            <CheckCircle2 size={16} />

            {course.completedLessons} de{" "}
            {course.lessons} aulas
          </span>

          <button
            type="button"
            className="continue-button"
            onClick={handleContinue}
          >
            {course.progress > 0
              ? "Continuar"
              : "Começar"}

            <Play
              size={15}
              fill="currentColor"
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Courses() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

  const filteredCourses = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesCategory =
        category === "Todos" ||
        course.category === category;

      const searchableText = `
        ${course.title}
        ${course.description}
        ${course.category}
        ${course.level}
        ${course.modules.join(" ")}
      `.toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        searchableText.includes(normalizedSearch);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [search, category]);

  const totalCourses = courses.length;

  const completedCourses = courses.filter(
    (course) => course.progress === 100
  ).length;

  const averageProgress = Math.round(
    courses.reduce(
      (sum, course) => sum + course.progress,
      0
    ) / courses.length
  );

  return (
    <div className="courses-page">
      {/* HERO */}
      <section className="courses-hero">
        <div>
          <span className="page-eyebrow">
            <BookOpen size={16} />
            ÁREA DE APRENDIZAGEM
          </span>

          <h1>Meus Cursos</h1>

          <p>
            Desenvolva seus conhecimentos em elétrica,
            eletrônica, automação e tecnologia através de
            aulas práticas e simulações interativas.
          </p>
        </div>

        <div className="courses-hero-icon">
          <BookOpen size={42} />
        </div>
      </section>

      {/* RESUMO */}
      <section className="courses-summary">
        <div className="summary-card">
          <div className="summary-icon blue">
            <BookOpen size={21} />
          </div>

          <div>
            <strong>{totalCourses}</strong>
            <span>Cursos disponíveis</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon green">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <strong>{completedCourses}</strong>
            <span>Cursos concluídos</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon purple">
            <GraduationCap size={21} />
          </div>

          <div>
            <strong>{averageProgress}%</strong>
            <span>Progresso médio</span>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="courses-toolbar">
        <div className="courses-search">
          <Search size={18} />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Pesquisar curso, módulo..."
          />
        </div>

        <div className="category-filter">
          <Filter size={17} />

          <div className="category-buttons">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  category === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CURSOS */}
      <section className="courses-section">
        <div className="section-heading">
          <div>
            <span>FORMAÇÃO</span>

            <h2>Explore seus cursos</h2>
          </div>

          <strong>
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1
              ? "curso"
              : "cursos"}
          </strong>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
              />
            ))}
          </div>
        ) : (
          <div className="empty-courses">
            <Search size={38} />

            <h3>
              Nenhum curso encontrado
            </h3>

            <p>
              Tente pesquisar por outro termo ou
              selecione outra categoria.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("Todos");
              }}
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>
    </div>
  );
}