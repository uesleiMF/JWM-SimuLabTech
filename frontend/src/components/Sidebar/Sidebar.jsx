import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  FlaskConical,
  Cpu,
  ClipboardList,
  Trophy,
  BarChart3,
  Award,
  Library,
  MessageCircle,
  LifeBuoy,
  Zap,
  Settings,
  X,
} from "lucide-react";

import "./Sidebar.css";

const mainMenu = [
  {
    label: "Início",
    path: "/app/dashboard",
    icon: Home,
  },
  {
    label: "Meus Cursos",
    path: "/app/cursos",
    icon: BookOpen,
  },
  {
    label: "Laboratórios",
    path: "/app/laboratorio",
    icon: FlaskConical,
  },
  {
    label: "Simulador",
    path: "/app/simulador",
    icon: Cpu,
  },
  {
    label: "Exercícios",
    path: "/app/exercicios",
    icon: ClipboardList,
  },
  {
    label: "Desafios",
    path: "/app/desafios",
    icon: Trophy,
  },
  {
    label: "Meu Progresso",
    path: "/app/progresso",
    icon: BarChart3,
  },
  {
    label: "Certificados",
    path: "/app/certificados",
    icon: Award,
  },
];

const modules = [
  {
    label: "Circuitos Elétricos I",
    path: "/app/cursos/circuitos-1",
  },
  {
    label: "Circuitos Elétricos II",
    path: "/app/cursos/circuitos-2",
  },
  {
    label: "Eletrônica",
    path: "/app/cursos/eletronica",
  },
  {
    label: "Comandos Elétricos",
    path: "/app/cursos/comandos-eletricos",
  },
  {
    label: "Automação",
    path: "/app/cursos/automacao",
  },
  {
    label: "Eletrotécnica",
    path: "/app/cursos/eletrotecnica",
  },
];

const supportMenu = [
  {
    label: "Biblioteca",
    path: "/app/biblioteca",
    icon: Library,
  },
  {
    label: "Fórum",
    path: "/app/forum",
    icon: MessageCircle,
  },
  {
    label: "Suporte",
    path: "/app/suporte",
    icon: LifeBuoy,
  },
];

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <Zap size={22} />
            </div>

            <div className="brand-text">
              <strong>JWM</strong>
              <span>SimuLabTech</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-scroll">
          <nav className="sidebar-section">
            <span className="sidebar-title">MENU PRINCIPAL</span>

            {mainMenu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <nav className="sidebar-section">
            <span className="sidebar-title">MÓDULOS</span>

            {modules.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-module ${isActive ? "active" : ""}`
                }
              >
                <span className="module-dot" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <nav className="sidebar-section">
            <span className="sidebar-title">RECURSOS</span>

            {supportMenu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">JU</div>

          <div className="user-info">
            <strong>Estudante</strong>
            <span>Aluno JWM</span>
          </div>

          <NavLink
            to="/app/perfil"
            onClick={onClose}
            className="settings-button"
            aria-label="Configurações do perfil"
          >
            <Settings size={18} />
          </NavLink>
        </div>
      </aside>
    </>
  );
}