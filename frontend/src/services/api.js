/**
 * Cliente API — JWM SimuLabTech
 * Backend: http://localhost:5000/api
 */

import {
  getProgressSummary,
  loadProgress,
  recordExerciseCompletion as recordLocal,
  saveProgress,
} from "./progressService";

const BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const TOKEN_KEY = "jwm_simulabtech_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `API ${res.status}: ${path}`);
  }
  return data;
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: authHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `API ${res.status}: ${path}`);
  }
  return data;
}

export async function apiPut(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: authHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `API ${res.status}: ${path}`);
  }
  return data;
}

export async function apiDelete(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    credentials: "include",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `API ${res.status}: ${path}`);
  }
  return data;
}

/* ---------- Auth ---------- */

export async function apiRegister({ name, email, password }) {
  const data = await apiPost("/auth/register", { name, email, password });
  if (data.token) setToken(data.token);
  return data;
}

export async function apiLogin({ email, password }) {
  const data = await apiPost("/auth/login", { email, password });
  if (data.token) setToken(data.token);
  return data;
}

export async function apiMe() {
  return apiGet("/auth/me");
}

export function apiLogout() {
  setToken(null);
}

/* ---------- Progress ---------- */

export async function fetchStudentProgress() {
  try {
    if (!getToken()) return getProgressSummary();
    return await apiGet("/progress/me");
  } catch {
    return getProgressSummary();
  }
}

export async function submitExerciseResult(payload) {
  // Sempre grava local
  const local = recordLocal(payload);
  try {
    if (getToken()) {
      return await apiPost("/progress/exercises", payload);
    }
  } catch (err) {
    console.warn("[API] progresso remoto falhou, mantendo local:", err);
  }
  return local;
}

export async function syncProgressToServer() {
  const local = loadProgress();
  try {
    if (getToken()) {
      return await apiPost("/progress/sync", local);
    }
  } catch (err) {
    console.warn("[API] sync falhou:", err);
  }
  return local;
}

/* ---------- Circuits ---------- */

export async function listRemoteCircuits() {
  return apiGet("/circuits");
}

export async function saveRemoteCircuit(payload, id) {
  if (id) return apiPut(`/circuits/${id}`, payload);
  return apiPost("/circuits", payload);
}

export async function getRemoteCircuit(id) {
  return apiGet(`/circuits/${id}`);
}

export async function deleteRemoteCircuit(id) {
  return apiDelete(`/circuits/${id}`);
}

export {
  loadProgress,
  saveProgress,
  getProgressSummary,
  recordLocal as recordExerciseCompletion,
};
