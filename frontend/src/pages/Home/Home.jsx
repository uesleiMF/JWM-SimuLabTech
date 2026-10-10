import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Play,
  Target,
  Trophy,
  Zap,
  Cpu,
  Activity,
  Shield,
} from "lucide-react";

import "./Home.css";

const features = [
  {
    icon: FlaskConical,
    title: "Laboratório Virtual",
    description:
      "Monte circuitos elétricos interativos, conecte componentes e simule em tempo real.",
  },
  {
    icon: BookOpen,
    title: "Cursos Estruturados",
    description:
      "Trilhas de aprendizado em circuitos, eletrônica, comandos e eletrotécnica.",
  },
  {
    icon: Target,
    title: "Exercícios Práticos",
    description:
      "Pratique com desafios progressivos e valide seus circuitos automaticamente.",
  },
  {
    icon: Trophy,
    title: "Acompanhe seu Progresso",
    description:
      "Visualize seu avanço, conquistas e desempenho em cada módulo.",
  },
];

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Cadastre-se em poucos segundos e acesse a plataforma.",
  },
  {
    number: "02",
    title: "Escolha um curso",
    description: "Selecione a trilha ideal para o seu nível de conhecimento.",
  },
  {
    number: "03",
    title: "Pratique no laboratório",
    description: "Monte, simule e analise circuitos de forma interativa.",
  },
  {
    number: "04",
    title: "Evolua continuamente",
    description: "Acompanhe seu progresso e desbloqueie novos desafios.",
  },
];

const courses = [
  {
    icon: "⚡",
    title: "Circuitos Elétricos I",
    description: "Fundamentos de eletricidade e análise de circuitos DC.",
    lessons: 18,
  },
  {
    icon: "🔌",
    title: "Circuitos Elétricos II",
    description: "Análise avançada de circuitos em corrente alternada.",
    lessons: 20,
  },
  {
    icon: "🔧",
    title: "Eletrônica",
    description: "Diodos, transistores, fontes e circuitos eletrônicos.",
    lessons: 24,
  },
];

export default function Home() {
  return (
    <div className="home-page">
      {/* NAVBAR */}
      <header className="home-navbar">
        <div className="home-navbar-inner">
          <Link to="/" className="home-brand">
            <div className="home-brand-icon">
              <Zap size={20} />
            </div>
            <div>
              <strong>SimuLabTech</strong>
              <span>Laboratório Virtual</span>
            </div>
          </Link>

          <nav className="home-nav-links">
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#cursos">Cursos</a>
          </nav>

          <div className="home-nav-actions">
            <Link to="/login" className="home-btn-ghost">
              Entrar
            </Link>
            <Link to="/cadastro" className="home-btn-primary">
              Criar conta
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-content">
            <span className="home-eyebrow">
              PLATAFORMA DE ENSINO TÉCNICO
            </span>

            <h1>
              Aprenda circuitos elétricos na prática,{" "}
              <strong>sem precisar de bancada física</strong>
            </h1>

            <p>
              O SimuLabTech é um laboratório virtual interativo para estudar,
              montar e simular circuitos elétricos de forma moderna e prática.
            </p>

            <div className="home-hero-actions">
              <Link to="/cadastro" className="home-btn-primary home-btn-lg">
                Começar agora
                <ArrowRight size={18} />
              </Link>

              <Link to="/login" className="home-btn-secondary home-btn-lg">
                <Play size={18} />
                Acessar plataforma
              </Link>
            </div>

            <div className="home-hero-badges">
              <div className="home-badge">
                <CheckCircle2 size={16} />
                <span>Simulação em tempo real</span>
              </div>
              <div className="home-badge">
                <CheckCircle2 size={16} />
                <span>Cursos estruturados</span>
              </div>
              <div className="home-badge">
                <CheckCircle2 size={16} />
                <span>100% no navegador</span>
              </div>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-hero-card">
              <div className="home-hero-card-header">
                <span className="home-status-dot" />
                <span>Laboratório ativo</span>
              </div>

              <div className="home-hero-metrics">
                <div className="home-metric">
                  <Activity size={18} />
                  <div>
                    <strong>12.0 V</strong>
                    <span>Tensão</span>
                  </div>
                </div>
                <div className="home-metric">
                  <Cpu size={18} />
                  <div>
                    <strong>0.24 A</strong>
                    <span>Corrente</span>
                  </div>
                </div>
                <div className="home-metric">
                  <Zap size={18} />
                  <div>
                    <strong>2.88 W</strong>
                    <span>Potência</span>
                  </div>
                </div>
              </div>

              <div className="home-hero-circuit-preview">
                <div className="home-preview-component">
                  <div className="home-preview-icon source">⚡</div>
                  <span>Fonte DC</span>
                </div>
                <div className="home-preview-line" />
                <div className="home-preview-component">
                  <div className="home-preview-icon switch">⏻</div>
                  <span>Interruptor</span>
                </div>
                <div className="home-preview-line" />
                <div className="home-preview-component">
                  <div className="home-preview-icon lamp on">💡</div>
                  <span>Lâmpada</span>
                </div>
              </div>

              <div className="home-hero-card-footer">
                <Shield size={14} />
                <span>Circuito energizado e estável</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section className="home-section" id="recursos">
        <div className="home-section-inner">
          <div className="home-section-header">
            <span className="home-eyebrow">RECURSOS</span>
            <h2>Tudo o que você precisa para aprender de verdade</h2>
            <p>
              Uma plataforma completa para estudar teoria e praticar em um
              laboratório virtual interativo.
            </p>
          </div>

          <div className="home-features-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article key={feature.title} className="home-feature-card">
                  <div className="home-feature-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="home-section home-section-alt" id="como-funciona">
        <div className="home-section-inner">
          <div className="home-section-header">
            <span className="home-eyebrow">COMO FUNCIONA</span>
            <h2>Do zero à prática em quatro passos</h2>
            <p>
              Uma jornada simples para você começar a aprender e evoluir com
              consistência.
            </p>
          </div>

          <div className="home-steps-grid">
            {steps.map((step) => (
              <article key={step.number} className="home-step-card">
                <span className="home-step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CURSOS */}
      <section className="home-section" id="cursos">
        <div className="home-section-inner">
          <div className="home-section-header">
            <span className="home-eyebrow">CURSOS</span>
            <h2>Trilhas pensadas para o ensino técnico</h2>
            <p>
              Conteúdos organizados para quem está começando ou quer reforçar a
              base em circuitos e eletrônica.
            </p>
          </div>

          <div className="home-courses-grid">
            {courses.map((course) => (
              <article key={course.title} className="home-course-card">
                <div className="home-course-icon">{course.icon}</div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="home-course-meta">
                  <BookOpen size={14} />
                  <span>{course.lessons} aulas</span>
                </div>
              </article>
            ))}
          </div>

          <div className="home-section-cta">
            <Link to="/cadastro" className="home-btn-primary">
              Ver todos os cursos
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <div className="home-cta-content">
            <GraduationCap size={28} />
            <h2>Pronto para montar seu primeiro circuito?</h2>
            <p>
              Crie sua conta gratuitamente e comece a praticar no laboratório
              virtual agora mesmo.
            </p>
          </div>

          <div className="home-cta-actions">
            <Link to="/cadastro" className="home-btn-primary home-btn-lg">
              Criar conta grátis
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="home-btn-ghost-light">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-brand">
            <div className="home-brand-icon">
              <Zap size={18} />
            </div>
            <div>
              <strong>SimuLabTech</strong>
              <span>JWM Tecnologia Educacional</span>
            </div>
          </div>

          <p>
            © {new Date().getFullYear()} SimuLabTech. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}