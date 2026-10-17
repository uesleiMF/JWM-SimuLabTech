import { useState } from "react";
import {
  Search,
  Bell,
  Menu,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import "./Header.css";

function getAvatar(user) {
  if (user?.avatar) return String(user.avatar).slice(0, 3).toUpperCase();
  const name = user?.name || "Aluno";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => (p[0] || "").toUpperCase())
    .join("");
}

function getRoleLabel(role) {
  if (role === "teacher") return "Professor";
  if (role === "admin") return "Admin";
  return "Estudante";
}

export default function Header() {
  const { user } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const displayName = user?.name || "Estudante";
  const avatar = getAvatar(user);
  const roleLabel = getRoleLabel(user?.role);

  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent("jwm:open-sidebar"));
  };

  const toggleTheme = () => {
    setDarkMode((current) => !current);
    document.body.classList.toggle("dark-mode");
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={openSidebar}
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Pesquisar cursos, aulas, exercícios..."
            aria-label="Pesquisar"
          />

          <kbd>Ctrl K</kbd>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="header-icon-button"
          onClick={toggleTheme}
          aria-label="Alternar tema"
        >
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <button
          type="button"
          className="header-icon-button notification-button"
          aria-label="Notificações"
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="header-profile">
          <div className="header-avatar">{avatar}</div>

          <div className="header-user">
            <strong>{displayName}</strong>
            <span>{roleLabel}</span>
          </div>

          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}
