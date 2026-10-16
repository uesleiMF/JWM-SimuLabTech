/**
 * Progresso do aluno — localStorage agora, API MERN depois.
 * Chave: jwm_simulabtech_progress
 */

const STORAGE_KEY = "jwm_simulabtech_progress";

function emptyProgress() {
  return {
    version: 1,
    updatedAt: null,
    exercisesCompleted: [], // { id, title, score, points, completedAt }
    totalPoints: 0,
    labsCount: 0,
    circuitsSaved: 0,
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return emptyProgress();
    return {
      ...emptyProgress(),
      ...data,
      exercisesCompleted: Array.isArray(data.exercisesCompleted)
        ? data.exercisesCompleted
        : [],
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  const next = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn("[JWM] Falha ao salvar progresso:", err);
  }
  return next;
}

export function recordExerciseCompletion({
  id,
  title,
  score = 100,
  points = 0,
}) {
  if (!id) return loadProgress();

  const current = loadProgress();
  const existingIdx = current.exercisesCompleted.findIndex(
    (e) => e.id === id
  );

  const entry = {
    id,
    title: title || id,
    score,
    points: Number(points) || 0,
    completedAt: new Date().toISOString(),
  };

  let list = [...current.exercisesCompleted];
  if (existingIdx >= 0) {
    // Mantém a melhor pontuação
    const prev = list[existingIdx];
    if ((prev.score || 0) > score) {
      return current;
    }
    list[existingIdx] = entry;
  } else {
    list = [entry, ...list].slice(0, 50);
  }

  const totalPoints = list.reduce(
    (sum, e) => sum + (Number(e.points) || 0),
    0
  );

  return saveProgress({
    ...current,
    exercisesCompleted: list,
    totalPoints,
    labsCount: (current.labsCount || 0) + (existingIdx >= 0 ? 0 : 1),
  });
}

export function getProgressSummary() {
  const p = loadProgress();
  const completed = p.exercisesCompleted || [];
  return {
    ...p,
    completedCount: completed.length,
    recent: completed.slice(0, 8),
  };
}
