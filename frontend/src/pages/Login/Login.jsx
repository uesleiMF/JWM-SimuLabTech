import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Zap,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);

      await login(form.email, form.password);

      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Zap size={25} />
          </div>

          <div>
            <strong>JWM</strong>
            <span>SimuLabTech</span>
          </div>
        </div>

        <div className="auth-presentation">
          <span>PLATAFORMA DE APRENDIZAGEM</span>

          <h1>
            Aprenda.
            <br />
            Pratique.
            <br />
            <strong>Simule.</strong>
          </h1>

          <p>
            Aprenda eletricidade e tecnologia através de aulas,
            exercícios, laboratórios virtuais e simulações
            interativas.
          </p>

          <div className="auth-feature">
            <span>✓</span>
            <p>Laboratórios virtuais</p>
          </div>

          <div className="auth-feature">
            <span>✓</span>
            <p>Simulador de circuitos</p>
          </div>

          <div className="auth-feature">
            <span>✓</span>
            <p>Acompanhamento do seu progresso</p>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <div>
              <Zap size={21} />
            </div>

            <strong>JWM SimuLabTech</strong>
          </div>

          <div className="auth-heading">
            <span>ACESSO À PLATAFORMA</span>
            <h2>Bem-vindo de volta!</h2>
            <p>
              Entre na sua conta para continuar seus estudos.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Senha</label>

                <button
                  type="button"
                  className="forgot-button"
                >
                  Esqueci minha senha
                </button>
              </div>

              <div className="input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <p className="auth-register">
            Ainda não possui uma conta?

            <Link to="/cadastro">
              Criar minha conta
            </Link>
          </p>

          <p className="auth-footer">
            JWM SimuLabTech © 2026
          </p>
        </div>
      </div>
    </div>
  );
}