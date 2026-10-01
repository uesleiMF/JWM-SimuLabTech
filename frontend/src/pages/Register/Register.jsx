import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  Zap,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Preencha todos os campos.");
      return;
    }

    if (form.password.length < 6) {
      setError("A senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message || "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-logo">
          <div>
            <Zap size={22} />
          </div>

          <strong>JWM SimuLabTech</strong>
        </div>

        <div className="register-heading">
          <span>COMECE SUA JORNADA</span>

          <h1>Crie sua conta</h1>

          <p>
            Faça seu cadastro gratuitamente e comece a aprender,
            praticar e simular.
          </p>
        </div>

        {error && (
          <div className="register-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="register-form-group">
            <label htmlFor="name">Nome completo</label>

            <div className="register-input">
              <User size={18} />

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Digite seu nome"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="register-form-group">
            <label htmlFor="email">E-mail</label>

            <div className="register-input">
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

          <div className="register-form-row">
            <div className="register-form-group">
              <label htmlFor="password">Senha</label>

              <div className="register-input">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="register-password-toggle"
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            <div className="register-form-group">
              <label htmlFor="confirmPassword">
                Confirmar senha
              </label>

              <div className="register-input">
                <LockKeyhole size={18} />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  placeholder="Repita a senha"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  className="register-password-toggle"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <label className="terms-check">
            <input type="checkbox" required />

            <span>
              Concordo com os termos de uso e política de
              privacidade.
            </span>
          </label>

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Criando conta..." : "Criar minha conta"}

            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="register-login">
          Já possui uma conta?

          <Link to="/login">
            Entrar
          </Link>
        </div>

        <div className="register-footer">
          JWM SimuLabTech © 2026
        </div>
      </div>
    </div>
  );
}