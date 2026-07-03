const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

async function req<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

export const api = {
  stats: () => req("/stats"),
  exams: () => req("/exams"),
  centres: () => req("/centres"),
  registerCandidate: (body: any) =>
    req("/candidates/register", { method: "POST", body: JSON.stringify(body) }),
  verifyCandidate: (id: string) =>
    req(`/candidates/${id}/verify`, { method: "POST" }),
  createApplication: (body: any) =>
    req("/applications", { method: "POST", body: JSON.stringify(body) }),
  getApplication: (id: string) => req(`/applications/${id}`),
  getAdmitCard: (id: string) => req(`/admit-cards/${id}`),
  vaultSession: () => req("/vault/session"),
  vaultSign: (authority_id: string) =>
    req("/vault/session/sign", { method: "POST", body: JSON.stringify({ authority_id }) }),
  vaultReset: () => req("/vault/session/reset", { method: "POST" }),
  centreDashboard: () => req("/centre/dashboard"),
  centreDecrypt: () => req("/centre/decrypt", { method: "POST" }),
  centrePaperPreview: () => req("/centre/paper-preview"),
  printRun: () => req("/centre/print-run"),
  printRunStart: () => req("/centre/print-run/start", { method: "POST" }),
  printRunTick: () => req("/centre/print-run/tick"),
  printRunReset: () => req("/centre/print-run/reset", { method: "POST" }),
  sheets: () => req("/answer-sheets"),
  evalQueue: () => req("/evaluator/queue"),
  submitEval: (body: any) =>
    req("/evaluator/submit", { method: "POST", body: JSON.stringify(body) }),
  getResult: (id: string) => req(`/results/${id}`),
  verifyCertificate: (id: string) => req(`/certificate/verify/${id}`),
  analytics: () => req("/analytics/overview"),
  audit: () => req("/audit-log"),
};
