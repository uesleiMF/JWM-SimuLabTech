import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  FlaskConical,
  Lightbulb,
  Play,
  RotateCcw,
  Trophy,
  Zap,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import "./Lesson.css";

const lessonData = {
  "circuitos-1": {
    12: {
      module: "Potência e Energia Elétrica",
      title: "Exercícios de Potência",
      duration: "35 min",
      lessonNumber: 12,
      totalLessons: 32,
    },
  },
};

export default function Lesson() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const lesson =
    lessonData[courseId]?.[lessonId] ||
    lessonData["circuitos-1"]["12"];

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const correctAnswer = "120";

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    setShowResult(true);
  };

  const resetExercise = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const nextLesson = () => {
    navigate(
      `/app/aula/${courseId}/${Number(lessonId) + 1}`
    );
  };

  return (
    <div className="lesson-page">
      <div className="lesson-topbar">
        <button
          type="button"
          className="lesson-back"
          onClick={() =>
            navigate(`/app/curso/${courseId}`)
          }
        >
          <ArrowLeft size={17} />
          Voltar para o curso
        </button>

        <div className="lesson-progress-info">
          <span>
            Aula {lesson.lessonNumber} de {lesson.totalLessons}
          </span>

          <div className="lesson-progress">
            <div
              style={{
                width: `${Math.round(
                  (lesson.lessonNumber /
                    lesson.totalLessons) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="lesson-layout">
        <main className="lesson-main">
          <div className="lesson-breadcrumb">
            <span>Circuitos Elétricos I</span>
            <ChevronRight size={14} />
            <span>{lesson.module}</span>
          </div>

          <div className="lesson-header">
            <div className="lesson-icon">
              <Zap size={25} />
            </div>

            <div>
              <span className="lesson-label">
                AULA {lesson.lessonNumber}
              </span>

              <h1>{lesson.title}</h1>

              <div className="lesson-meta">
                <span>
                  <Clock3 size={14} />
                  {lesson.duration}
                </span>

                <span>
                  <BookOpen size={14} />
                  Circuitos Elétricos I
                </span>
              </div>
            </div>
          </div>

          <section className="lesson-section">
            <span className="section-label">
              CONCEITO
            </span>

            <h2>O que é potência elétrica?</h2>

            <p>
              A potência elétrica representa a quantidade
              de energia elétrica transformada ou consumida
              por um equipamento em determinado intervalo
              de tempo.
            </p>

            <p>
              Em circuitos elétricos, a potência pode ser
              calculada utilizando a tensão elétrica e a
              corrente que atravessa o circuito.
            </p>
          </section>

          <section className="formula-card">
            <div className="formula-icon">
              <Lightbulb size={22} />
            </div>

            <div>
              <span>FÓRMULA PRINCIPAL</span>

              <div className="formula">
                P = V × I
              </div>

              <p>
                P = potência (W)
                <br />
                V = tensão (V)
                <br />
                I = corrente (A)
              </p>
            </div>
          </section>

          <section className="example-card">
            <div className="example-header">
              <div>
                <span className="section-label">
                  EXEMPLO RESOLVIDO
                </span>

                <h2>Calculando a potência</h2>
              </div>

              <div className="example-icon">
                <Zap size={19} />
              </div>
            </div>

            <p>
              Um circuito possui uma tensão de{" "}
              <strong>24 V</strong> e uma corrente de{" "}
              <strong>5 A</strong>. Qual é a potência
              elétrica consumida?
            </p>

            <div className="calculation">
              <span>P = V × I</span>

              <span>P = 24 × 5</span>

              <strong>P = 120 W</strong>
            </div>
          </section>

          <section className="exercise-card">
            <div className="exercise-header">
              <div className="exercise-title">
                <div className="exercise-icon">
                  <CircleHelp size={21} />
                </div>

                <div>
                  <span>EXERCÍCIO</span>
                  <h2>Teste seus conhecimentos</h2>
                </div>
              </div>

              <span className="exercise-points">
                +50 XP
              </span>
            </div>

            <div className="question">
              <strong>
                Um equipamento possui tensão de 120 V e
                corrente de 1 A. Qual é sua potência?
              </strong>
            </div>

            <div className="answers">
              {["60", "100", "120", "240"].map(
                (answer) => (
                  <button
                    type="button"
                    key={answer}
                    className={`answer ${
                      selectedAnswer === answer
                        ? "selected"
                        : ""
                    } ${
                      showResult &&
                      answer === correctAnswer
                        ? "correct"
                        : ""
                    } ${
                      showResult &&
                      selectedAnswer === answer &&
                      answer !== correctAnswer
                        ? "wrong"
                        : ""
                    }`}
                    onClick={() =>
                      !showResult &&
                      setSelectedAnswer(answer)
                    }
                  >
                    <span>{answer} W</span>

                    {showResult &&
                    answer === correctAnswer ? (
                      <CheckCircle2 size={18} />
                    ) : null}
                  </button>
                )
              )}
            </div>

            {!showResult ? (
              <button
                type="button"
                className="check-button"
                onClick={checkAnswer}
                disabled={!selectedAnswer}
              >
                Verificar resposta
              </button>
            ) : (
              <div
                className={`exercise-result ${
                  selectedAnswer === correctAnswer
                    ? "success"
                    : "error"
                }`}
              >
                {selectedAnswer === correctAnswer ? (
                  <>
                    <CheckCircle2 size={20} />

                    <div>
                      <strong>
                        Resposta correta!
                      </strong>

                      <p>
                        Você ganhou +50 XP.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CircleHelp size={20} />

                    <div>
                      <strong>
                        Vamos revisar?
                      </strong>

                      <p>
                        Utilize P = V × I. Tente
                        novamente.
                      </p>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={resetExercise}
                >
                  <RotateCcw size={15} />
                  Refazer
                </button>
              </div>
            )}
          </section>

          <section className="laboratory-promo">
            <div className="laboratory-promo-icon">
              <FlaskConical size={26} />
            </div>

            <div>
              <span>APRENDA NA PRÁTICA</span>

              <h2>
                Monte esse circuito no laboratório
              </h2>

              <p>
                Escolha os componentes, monte o circuito,
                aplique a tensão e observe os valores de
                corrente e potência.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/app/laboratorio")
              }
            >
              Abrir laboratório
              <Play size={15} fill="currentColor" />
            </button>
          </section>

          <div className="lesson-navigation">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/app/aula/${courseId}/${Math.max(
                    1,
                    Number(lessonId) - 1
                  )}`
                )
              }
            >
              <ArrowLeft size={17} />
              Aula anterior
            </button>

            <button
              type="button"
              className="next-lesson"
              onClick={nextLesson}
            >
              Próxima aula
              <ArrowRight size={17} />
            </button>
          </div>
        </main>

        <aside className="lesson-sidebar">
          <div className="lesson-side-card">
            <div className="side-card-icon">
              <Trophy size={20} />
            </div>

            <h3>Seu progresso</h3>

            <strong className="side-progress-number">
              72%
            </strong>

            <div className="side-progress-bar">
              <div style={{ width: "72%" }} />
            </div>

            <span className="side-progress-text">
              23 de 32 aulas concluídas
            </span>
          </div>

          <div className="lesson-side-card">
            <div className="side-card-icon">
              <CheckCircle2 size={20} />
            </div>

            <h3>Objetivo da aula</h3>

            <ul>
              <li>Compreender potência elétrica</li>
              <li>Aplicar P = V × I</li>
              <li>Resolver problemas práticos</li>
              <li>Aplicar o conhecimento no laboratório</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}