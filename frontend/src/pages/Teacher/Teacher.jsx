import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Trash2,
  GraduationCap,
  Users,
  Trophy,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import {
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  listStudentsProgress,
  getStudentDetail,
  listClasses,
  createClass,
  deleteClass,
  regenerateClassCode,
  removeStudentFromClass,
} from "../../services/api";
import { COMPONENT_TYPES } from "../../simulator/components/componentTypes";

import "./Teacher.css";

const TYPE_OPTIONS = [
  { value: "exercise", label: "Exercício" },
  { value: "challenge", label: "Desafio" },
  { value: "lab", label: "Laboratório" },
];

const DIFFICULTY_OPTIONS = ["Fácil", "Médio", "Difícil"];

const COMPONENT_OPTIONS = Object.entries(COMPONENT_TYPES).map(([key, value]) => ({
  key,
  value,
  label: key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const emptyForm = {
  title: "",
  description: "",
  type: "exercise",
  difficulty: "Fácil",
  points: 100,
  requiredTypes: [],
  published: false,
  classId: "",
  rules: {
    mustHaveClosedCircuit: true,
    mustEnergizeTypes: [],
    switchMustBeClosed: false,
  },
};

export default function Teacher() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === "teacher" || user?.role === "admin";

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [results, setResults] = useState({ students: [], byActivity: [] });
  const [loadingResults, setLoadingResults] = useState(false);
  const [filterActivity, setFilterActivity] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [resultsTab, setResultsTab] = useState("activity"); // activity | student
  const [selectedStudent, setSelectedStudent] = useState(null); // detalhe completo
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [classes, setClasses] = useState([]);
  const [classForm, setClassForm] = useState({ name: "", description: "" });
  const [savingClass, setSavingClass] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listActivities({ mine: true });
      setActivities(Array.isArray(data?.activities) ? data.activities : []);
    } catch (err) {
      setError(err.message || "Falha ao carregar atividades.");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClasses = useCallback(async () => {
    try {
      const data = await listClasses();
      setClasses(Array.isArray(data?.classes) ? data.classes : []);
    } catch {
      setClasses([]);
    }
  }, []);

  const loadResults = useCallback(async () => {
    setLoadingResults(true);
    try {
      const params = {};
      if (filterActivity) params.activityId = filterActivity;
      if (filterClass) params.classId = filterClass;
      const data = await listStudentsProgress(params);
      setResults({
        students: data?.students || [],
        byActivity: data?.byActivity || [],
      });
    } catch (err) {
      console.warn(err);
      setResults({ students: [], byActivity: [] });
    } finally {
      setLoadingResults(false);
    }
  }, [filterActivity, filterClass]);

  useEffect(() => {
    if (isStaff) {
      load();
      loadClasses();
    }
  }, [isStaff, load, loadClasses]);

  useEffect(() => {
    if (isStaff) loadResults();
  }, [isStaff, loadResults]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!classForm.name.trim()) {
      setError("Nome da turma é obrigatório.");
      return;
    }
    setSavingClass(true);
    setError("");
    try {
      await createClass(classForm);
      setClassForm({ name: "", description: "" });
      setMessage("Turma criada. Compartilhe o código com os alunos.");
      await loadClasses();
    } catch (err) {
      setError(err.message || "Erro ao criar turma.");
    } finally {
      setSavingClass(false);
    }
  };

  const handleDeleteClass = async (cls) => {
    if (!window.confirm(`Excluir turma "${cls.name}"?`)) return;
    try {
      await deleteClass(cls.id);
      await loadClasses();
      if (filterClass === cls.id) setFilterClass("");
    } catch (err) {
      setError(err.message || "Erro ao excluir turma.");
    }
  };

  const handleRegenCode = async (cls) => {
    try {
      const data = await regenerateClassCode(cls.id);
      setMessage(`Novo código: ${data.code}`);
      await loadClasses();
    } catch (err) {
      setError(err.message || "Erro ao regenerar código.");
    }
  };

  const handleRemoveStudent = async (cls, studentId) => {
    if (!window.confirm("Remover este aluno da turma?")) return;
    try {
      await removeStudentFromClass(cls.id, studentId);
      await loadClasses();
      await loadResults();
    } catch (err) {
      setError(err.message || "Erro ao remover aluno.");
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setMessage(`Código ${code} copiado!`);
    } catch {
      setMessage(`Código: ${code}`);
    }
  };

  const openCircuitInLab = (circuit, studentName) => {
    if (!circuit?.data && !circuit?.components) {
      setError("Circuito sem dados para abrir.");
      return;
    }
    const payload = {
      app: "JWM-SimuLabTech",
      type: "circuit",
      version: 1,
      preview: true,
      studentName: studentName || "",
      savedAt: new Date().toISOString(),
      circuit: circuit.data || circuit,
    };
    try {
      sessionStorage.setItem(
        "jwm_teacher_preview_circuit",
        JSON.stringify(payload)
      );
    } catch (err) {
      setError("Não foi possível preparar o circuito.");
      return;
    }
    setSelectedStudent(null);
    navigate("/app/laboratorio?preview=1");
  };

  const openStudentDetail = async (userId) => {

    if (!userId) return;
    setLoadingDetail(true);
    setSelectedStudent(null);
    try {
      const data = await getStudentDetail(userId);
      setSelectedStudent(data);
    } catch (err) {
      setError(err.message || "Não foi possível carregar o aluno.");
    } finally {
      setLoadingDetail(false);
    }
  };


  if (!isStaff) {
    return (
      <div className="teacher-page">
        <div className="teacher-denied">
          <GraduationCap size={40} />
          <h1>Área restrita</h1>
          <p>Apenas professores e administradores podem acessar este painel.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "published") {
      setForm((f) => ({ ...f, published: checked }));
      return;
    }
    if (name === "mustHaveClosedCircuit" || name === "switchMustBeClosed") {
      setForm((f) => ({
        ...f,
        rules: { ...f.rules, [name]: checked },
      }));
      return;
    }
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const toggleRequiredType = (typeValue) => {
    setForm((f) => {
      const has = f.requiredTypes.includes(typeValue);
      const requiredTypes = has
        ? f.requiredTypes.filter((t) => t !== typeValue)
        : [...f.requiredTypes, typeValue];
      return { ...f, requiredTypes };
    });
  };

  const toggleEnergizeType = (typeValue) => {
    setForm((f) => {
      const list = f.rules?.mustEnergizeTypes || [];
      const has = list.includes(typeValue);
      const mustEnergizeTypes = has
        ? list.filter((t) => t !== typeValue)
        : [...list, typeValue];
      return {
        ...f,
        rules: { ...f.rules, mustEnergizeTypes },
      };
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (activity) => {
    setEditingId(activity.id);
    setForm({
      title: activity.title || "",
      description: activity.description || "",
      type: activity.type || "exercise",
      difficulty: activity.difficulty || "Fácil",
      points: activity.points || 100,
      requiredTypes: activity.requiredTypes || [],
      published: Boolean(activity.published),
      classId: activity.classId?.id || activity.classId || "",
      rules: {
        mustHaveClosedCircuit: activity.rules?.mustHaveClosedCircuit !== false,
        mustEnergizeTypes: activity.rules?.mustEnergizeTypes || [],
        switchMustBeClosed: Boolean(activity.rules?.switchMustBeClosed),
      },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Informe o título da atividade.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        classId: form.classId || null,
      };
      if (editingId) {
        await updateActivity(editingId, payload);
        setMessage("Atividade atualizada.");
      } else {
        await createActivity(payload);
        setMessage("Atividade criada.");
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (activity) => {
    try {
      await updateActivity(activity.id, { published: !activity.published });
      await load();
    } catch (err) {
      setError(err.message || "Erro ao publicar.");
    }
  };

  const handleDelete = async (activity) => {
    if (!window.confirm(`Excluir "${activity.title}"?`)) return;
    try {
      await deleteActivity(activity.id);
      if (editingId === activity.id) resetForm();
      await load();
    } catch (err) {
      setError(err.message || "Erro ao excluir.");
    }
  };

  return (
    <div className="teacher-page">
      <header className="teacher-header">
        <div>
          <span className="teacher-eyebrow">PAINEL DO PROFESSOR</span>
          <h1>Atividades</h1>
          <p>
            Crie exercícios e desafios. Ao publicar, eles aparecem para os
            alunos em Exercícios / Desafios.
          </p>
        </div>
      </header>

      {error ? <div className="teacher-alert teacher-alert-error">{error}</div> : null}
      {message ? (
        <div className="teacher-alert teacher-alert-ok">
          <CheckCircle2 size={16} /> {message}
        </div>
      ) : null}


      {/* ===== Turmas ===== */}
      <section className="teacher-card" style={{ marginBottom: 20 }}>
        <h2>
          <Users size={18} />
          Turmas
        </h2>
        <form className="teacher-form" onSubmit={handleCreateClass} style={{ marginBottom: 16 }}>
          <div className="teacher-form-row">
            <label>
              Nome da turma *
              <input
                value={classForm.name}
                onChange={(e) =>
                  setClassForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ex: Circuitos I — Manhã"
                required
              />
            </label>
            <label>
              Descrição
              <input
                value={classForm.description}
                onChange={(e) =>
                  setClassForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Opcional"
              />
            </label>
          </div>
          <button type="submit" className="teacher-btn-primary" disabled={savingClass}>
            {savingClass ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
            Criar turma
          </button>
        </form>

        {classes.length === 0 ? (
          <p className="teacher-muted">
            Nenhuma turma. Crie uma e compartilhe o código com os alunos.
          </p>
        ) : (
          <ul className="teacher-list">
            {classes.map((cls) => (
              <li key={cls.id} className="teacher-list-item teacher-result-block">
                <div className="teacher-list-main">
                  <strong>{cls.name}</strong>
                  <span className="teacher-list-meta">
                    Código:{" "}
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => copyCode(cls.code)}
                      title="Copiar código"
                    >
                      {cls.code}
                    </button>
                    {" · "}
                    {(cls.students || []).length} aluno(s)
                    {cls.active === false ? " · inativa" : ""}
                  </span>
                  {cls.description ? (
                    <p className="teacher-list-desc">{cls.description}</p>
                  ) : null}
                  {(cls.students || []).length > 0 ? (
                    <ul className="teacher-student-sublist">
                      {cls.students.map((s) => (
                        <li key={s.id || s._id}>
                          <span className="name">{s.name}</span>
                          <span className="email">{s.email}</span>
                          <button
                            type="button"
                            className="linkish"
                            style={{ color: "#f87171" }}
                            onClick={() =>
                              handleRemoveStudent(cls, s.id || s._id)
                            }
                          >
                            Remover
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="teacher-list-desc">
                      Ainda sem alunos. Peça para entrarem com o código.
                    </p>
                  )}
                </div>
                <div className="teacher-list-actions">
                  <button type="button" onClick={() => copyCode(cls.code)}>
                    Copiar código
                  </button>
                  <button type="button" onClick={() => handleRegenCode(cls)}>
                    Novo código
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDeleteClass(cls)}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="teacher-grid">
        <section className="teacher-card">
          <h2>
            <Plus size={18} />
            {editingId ? "Editar atividade" : "Nova atividade"}
          </h2>

          <form className="teacher-form" onSubmit={handleSubmit}>
            <label>
              Título *
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Lâmpada com interruptor"
                required
              />
            </label>

            <label>
              Descrição
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="O que o aluno deve montar e validar"
              />
            </label>

            <div className="teacher-form-row">
              <label>
                Tipo
                <select name="type" value={form.type} onChange={handleChange}>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Dificuldade
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                >
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Pontos
                <input
                  name="points"
                  type="number"
                  min={0}
                  max={10000}
                  value={form.points}
                  onChange={handleChange}
                />
              </label>
            </div>

            <fieldset className="teacher-fieldset">
              <legend>Componentes obrigatórios</legend>
              <div className="teacher-chips">
                {COMPONENT_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={
                      "teacher-chip" +
                      (form.requiredTypes.includes(c.value) ? " active" : "")
                    }
                    onClick={() => toggleRequiredType(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="teacher-fieldset">
              <legend>Regras de validação</legend>
              <label className="teacher-check">
                <input
                  type="checkbox"
                  name="mustHaveClosedCircuit"
                  checked={form.rules.mustHaveClosedCircuit}
                  onChange={handleChange}
                />
                Circuito deve estar fechado
              </label>
              <label className="teacher-check">
                <input
                  type="checkbox"
                  name="switchMustBeClosed"
                  checked={form.rules.switchMustBeClosed}
                  onChange={handleChange}
                />
                Interruptor deve estar fechado
              </label>
              <p className="teacher-hint">Cargas que devem energizar:</p>
              <div className="teacher-chips">
                {COMPONENT_OPTIONS.filter((c) =>
                  ["lamp", "led", "motor", "indicator"].includes(c.value)
                ).map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={
                      "teacher-chip" +
                      ((form.rules.mustEnergizeTypes || []).includes(c.value)
                        ? " active"
                        : "")
                    }
                    onClick={() => toggleEnergizeType(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>


            <label>
              Turma (opcional)
              <select name="classId" value={form.classId} onChange={handleChange}>
                <option value="">Todas / global</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="teacher-check">
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={handleChange}
              />
              Publicar agora (visível para alunos)
            </label>

            <div className="teacher-form-actions">
              <button type="submit" className="teacher-btn-primary" disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : null}
                {editingId ? "Salvar alterações" : "Criar atividade"}
              </button>
              {editingId ? (
                <button type="button" className="teacher-btn-ghost" onClick={resetForm}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="teacher-card">
          <h2>
            <ClipboardList size={18} />
            Minhas atividades ({activities.length})
          </h2>

          {loading ? (
            <p className="teacher-muted">
              <Loader2 size={16} className="spin" /> Carregando…
            </p>
          ) : activities.length === 0 ? (
            <p className="teacher-muted">
              Nenhuma atividade ainda. Crie a primeira ao lado.
            </p>
          ) : (
            <ul className="teacher-list">
              {activities.map((a) => (
                <li key={a.id} className="teacher-list-item">
                  <div className="teacher-list-main">
                    <strong>{a.title}</strong>
                    <span className="teacher-list-meta">
                      {a.type} · {a.difficulty} · {a.points} pts ·{" "}
                      {a.published ? (
                        <em className="ok">Publicada</em>
                      ) : (
                        <em>Rascunho</em>
                      )}
                    </span>
                    {a.description ? (
                      <p className="teacher-list-desc">{a.description}</p>
                    ) : null}
                  </div>
                  <div className="teacher-list-actions">
                    <button
                      type="button"
                      title={a.published ? "Despublicar" : "Publicar"}
                      onClick={() => handleTogglePublish(a)}
                    >
                      {a.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button type="button" title="Editar" onClick={() => handleEdit(a)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      title="Excluir"
                      className="danger"
                      onClick={() => handleDelete(a)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ===== Resultados dos alunos ===== */}
      <section className="teacher-card teacher-results" style={{ marginTop: 20 }}>
        <div className="teacher-results-head">
          <h2>
            <Users size={18} />
            Atividades feitas pelos alunos
          </h2>
          <div className="teacher-results-filters">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">Todas as turmas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
            >
              <option value="">Todas as atividades</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
            <div className="teacher-tabs">
              <button
                type="button"
                className={resultsTab === "activity" ? "active" : ""}
                onClick={() => setResultsTab("activity")}
              >
                Por atividade
              </button>
              <button
                type="button"
                className={resultsTab === "student" ? "active" : ""}
                onClick={() => setResultsTab("student")}
              >
                Por aluno
              </button>
            </div>
            <button
              type="button"
              className="teacher-btn-ghost"
              onClick={loadResults}
              disabled={loadingResults}
            >
              {loadingResults ? <Loader2 size={14} className="spin" /> : null}
              Atualizar
            </button>
          </div>
        </div>

        {loadingResults ? (
          <p className="teacher-muted">
            <Loader2 size={16} className="spin" /> Carregando resultados…
          </p>
        ) : resultsTab === "activity" ? (
          results.byActivity.length === 0 ? (
            <p className="teacher-muted">
              Ainda não há conclusões registradas. Quando o aluno validar no
              laboratório (logado), aparece aqui.
            </p>
          ) : (
            <ul className="teacher-list">
              {results.byActivity.map((act) => (
                <li key={act.id} className="teacher-list-item teacher-result-block">
                  <div className="teacher-list-main">
                    <strong>
                      <Trophy size={14} style={{ marginRight: 6 }} />
                      {act.title}
                    </strong>
                    <span className="teacher-list-meta">
                      {act.completions} conclusão(ões) · média {act.avgScore}%
                    </span>
                    <ul className="teacher-student-sublist">
                      {act.students.map((s) => (
                        <li key={s.id + String(s.completedAt)}>
                          <button
                            type="button"
                            className="name linkish"
                            onClick={() => openStudentDetail(s.id)}
                            title="Ver todas as atividades deste aluno"
                          >
                            {s.name}
                          </button>
                          <span className="email">{s.email}</span>
                          <span className="score">{s.score}%</span>
                          <span className="pts">{s.points} pts</span>
                          <span className="date">
                            {s.completedAt
                              ? new Date(s.completedAt).toLocaleString("pt-BR")
                              : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : results.students.length === 0 ? (
          <p className="teacher-muted">Nenhum aluno com progresso ainda.</p>
        ) : (
          <ul className="teacher-list">
            {results.students.map((st) => (
              <li key={st.user.id} className="teacher-list-item teacher-result-block">
                <div className="teacher-list-main">
                  <strong>
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => openStudentDetail(st.user.id)}
                      title="Ver todas as atividades"
                    >
                      {st.user.name}
                    </button>
                  </strong>
                  <span className="teacher-list-meta">
                    {st.user.email} · {st.completedCount} exercício(s) ·{" "}
                    {st.totalPoints} pts
                    {" · "}
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => openStudentDetail(st.user.id)}
                    >
                      Ver tudo
                    </button>
                  </span>
                  {st.exercisesCompleted?.length ? (
                    <ul className="teacher-student-sublist">
                      {st.exercisesCompleted.map((ex) => (
                        <li key={ex.id + String(ex.completedAt)}>
                          <span className="name">{ex.title || ex.id}</span>
                          <span className="score">{ex.score}%</span>
                          <span className="pts">{ex.points} pts</span>
                          <span className="date">
                            {ex.completedAt
                              ? new Date(ex.completedAt).toLocaleString("pt-BR")
                              : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="teacher-list-desc">Sem exercícios neste filtro.</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Painel detalhe do aluno */}
      {(selectedStudent || loadingDetail) && (
        <div className="teacher-detail-overlay" onClick={() => setSelectedStudent(null)}>
          <div
            className="teacher-detail-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="teacher-detail-head">
              <h2>
                {loadingDetail
                  ? "Carregando…"
                  : selectedStudent?.user?.name || "Aluno"}
              </h2>
              <button
                type="button"
                className="teacher-cascade-close"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>

            {loadingDetail ? (
              <p className="teacher-muted">
                <Loader2 size={16} className="spin" /> Buscando atividades…
              </p>
            ) : selectedStudent ? (
              <>
                <p className="teacher-list-meta">
                  {selectedStudent.user.email} ·{" "}
                  {selectedStudent.progress?.completedCount || 0} atividades ·{" "}
                  {selectedStudent.progress?.totalPoints || 0} pts ·{" "}
                  {selectedStudent.progress?.circuitsSaved || 0} circuitos salvos
                </p>

                <h3 className="teacher-detail-section">
                  Todas as atividades concluídas
                </h3>
                {!selectedStudent.exercisesCompleted?.length ? (
                  <p className="teacher-muted">Nenhuma atividade concluída ainda.</p>
                ) : (
                  <ul className="teacher-student-sublist">
                    {selectedStudent.exercisesCompleted.map((ex) => (
                      <li key={ex.id + String(ex.completedAt)}>
                        <span className="name">{ex.title || ex.id}</span>
                        <span className="score">{ex.score}%</span>
                        <span className="pts">{ex.points} pts</span>
                        <span className="date">
                          {ex.completedAt
                            ? new Date(ex.completedAt).toLocaleString("pt-BR")
                            : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <h3 className="teacher-detail-section">
                  Laboratórios / circuitos montados
                </h3>
                {!selectedStudent.circuits?.length ? (
                  <p className="teacher-muted">
                    Nenhum circuito salvo na nuvem. O aluno precisa usar{" "}
                    <strong>Salvar</strong> no laboratório estando logado.
                  </p>
                ) : (
                  <ul className="teacher-circuit-list">
                    {selectedStudent.circuits.map((c) => (
                      <li key={c.id} className="teacher-circuit-card">
                        <div className="teacher-circuit-card-main">
                          <strong>{c.name || "Sem nome"}</strong>
                          {c.description ? (
                            <p className="teacher-list-desc">{c.description}</p>
                          ) : null}
                          <span className="teacher-list-meta">
                            {c.componentCount} componentes · {c.wireCount} fios
                            {c.updatedAt
                              ? " · " +
                                new Date(c.updatedAt).toLocaleString("pt-BR")
                              : ""}
                          </span>
                          {c.componentTypes &&
                          Object.keys(c.componentTypes).length > 0 ? (
                            <div className="teacher-chips" style={{ marginTop: 8 }}>
                              {Object.entries(c.componentTypes).map(
                                ([type, n]) => (
                                  <span key={type} className="teacher-chip active">
                                    {type} ×{n}
                                  </span>
                                )
                              )}
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="teacher-btn-primary"
                          style={{ flexShrink: 0, padding: "8px 12px", fontSize: 12 }}
                          onClick={() =>
                            openCircuitInLab(c, selectedStudent.user?.name)
                          }
                        >
                          Abrir no laboratório
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
