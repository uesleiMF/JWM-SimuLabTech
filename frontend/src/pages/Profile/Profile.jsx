import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  FlaskConical,
  LogOut,
  Mail,
  Shield,
  Trophy,
  User,
  Zap,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import "./Profile.css";

const stats = [
  {
    icon: BookOpen,
    label: "Cursos em andamento",
    value: "3",
  },
  {
    icon: FlaskConical,
    label: "Circuitos montados",
    value: "12",
  },
  {
    icon: Trophy,
    label: "Desafios concluídos",
    value: "5",
  },
  {
    icon: Zap,
    label: "Horas de estudo",
    value: "18h",
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = user?.name || "Estudante";
  const displayEmail = user?.email || "aluno@simulabtech.com";
  const displayAvatar =
    user?.avatar ||
    displayName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-page">
      {/* ==================================================
          HEADER
      ================================================== */}
      <header className="profile-header">
        <div>
          <span className="profile-eyebrow">CONTA DO ALUNO</span>
          <h1>Meu Perfil</h1>
          <p>
            Gerencie suas informações e acompanhe um resumo da sua jornada no
            SimuLabTech.
          </p>
        </div>
      </header>

      <div className="profile-grid">
        {/* ==================================================
            CARD PRINCIPAL
        ================================================== */}
        <section className="profile-card profile-main-card">
          <div className="profile-identity">
            <div className="profile-avatar">{displayAvatar}</div>

            <div className="profile-identity-info">
              <h2>{displayName}</h2>
              <p>{displayEmail}</p>

              <div className="profile-role-badge">
                <Shield size={14} />
                <span>
                  {user?.role === "student" ? "Estudante" : user?.role || "Estudante"}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <User size={16} />
              </div>
              <div>
                <span>Nome completo</span>
                <strong>{displayName}</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Mail size={16} />
              </div>
              <div>
                <span>E-mail</span>
                <strong>{displayEmail}</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Shield size={16} />
              </div>
              <div>
                <span>Tipo de conta</span>
                <strong>
                  {user?.role === "student" ? "Estudante" : user?.role || "Estudante"}
                </strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sair da conta
          </button>
        </section>

        {/* ==================================================
            RESUMO
        ================================================== */}
        <section className="profile-card profile-summary-card">
          <div className="profile-section-heading">
            <span className="profile-eyebrow">RESUMO</span>
            <h2>Sua atividade</h2>
            <p>
              Um panorama rápido do seu progresso na plataforma.
            </p>
          </div>

          <div className="profile-stats-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article key={stat.label} className="profile-stat-card">
                  <div className="profile-stat-icon">
                    <Icon size={18} />
                  </div>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              );
            })}
          </div>

          <div className="profile-note">
            <Zap size={16} />
            <p>
              Os dados de progresso ainda são demonstrativos. Quando o backend
              MERN estiver conectado, essas informações virão da sua conta real.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
