import { useEffect, useState } from "react";
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
  Users,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { joinClass, listClasses } from "../../services/api";

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

  const roleLabel =
    user?.role === "teacher"
      ? "Professor"
      : user?.role === "admin"
        ? "Administrador"
        : "Estudante";

  const accountEyebrow =
    user?.role === "teacher" || user?.role === "admin"
      ? "CONTA DO PROFESSOR"
      : "CONTA DO ALUNO";

  const [joinCode, setJoinCode] = useState("");
  const [joinMsg, setJoinMsg] = useState("");
  const [joinErr, setJoinErr] = useState("");
  const [myClasses, setMyClasses] = useState([]);
  const [joining, setJoining] = useState(false);

  const loadMyClasses = async () => {
    try {
      const data = await listClasses();
      setMyClasses(Array.isArray(data?.classes) ? data.classes : []);
    } catch {
      setMyClasses([]);
    }
  };

  useEffect(() => {
    if (user && user.role !== "teacher" && user.role !== "admin") {
      loadMyClasses();
    }
  }, [user]);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    setJoinMsg("");
    setJoinErr("");
    if (!joinCode.trim()) {
      setJoinErr("Informe o código da turma.");
      return;
    }
    setJoining(true);
    try {
      const res = await joinClass(joinCode.trim());
      setJoinMsg(res.message || "Entrou na turma!");
      setJoinCode("");
      await loadMyClasses();
    } catch (err) {
      setJoinErr(err.message || "Não foi possível entrar na turma.");
    } finally {
      setJoining(false);
    }
  };

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
          <span className="profile-eyebrow">{accountEyebrow}</span>
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
                <span>{roleLabel}</span>
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
                <strong>{roleLabel}</strong>
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

        {/* Turmas do aluno */}
        {user?.role !== "teacher" && user?.role !== "admin" ? (
          <section className="profile-card" style={{ gridColumn: "1 / -1" }}>
            <div className="profile-section-heading">
              <span className="profile-eyebrow">TURMAS</span>
              <h2>
                <Users size={18} style={{ marginRight: 8 }} />
                Minhas turmas
              </h2>
              <p>Entre com o código que o professor compartilhou.</p>
            </div>

            <form
              onSubmit={handleJoinClass}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 16,
                alignItems: "center",
              }}
            >
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Ex: CIRCUITOS-A3F2"
                style={{
                  flex: "1 1 180px",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border, #e2e8f0)",
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
              <button
                type="submit"
                disabled={joining}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "#3b82f6",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {joining ? "Entrando…" : "Entrar na turma"}
              </button>
            </form>
            {joinErr ? (
              <p style={{ color: "#ef4444", fontWeight: 600 }}>{joinErr}</p>
            ) : null}
            {joinMsg ? (
              <p style={{ color: "#16a34a", fontWeight: 600 }}>{joinMsg}</p>
            ) : null}

            {myClasses.length === 0 ? (
              <p style={{ opacity: 0.7 }}>Você ainda não está em nenhuma turma.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {myClasses.map((c) => (
                  <li
                    key={c.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--border, #e2e8f0)",
                      marginBottom: 8,
                    }}
                  >
                    <strong>{c.name}</strong>
                    <div style={{ fontSize: 13, opacity: 0.75 }}>
                      Código: {c.code}
                      {c.teacher?.name ? ` · Prof. ${c.teacher.name}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

      </div>
    </div>
  );
}
