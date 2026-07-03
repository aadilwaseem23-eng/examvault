// Resilient API client for ExamVault.
// If EXPO_PUBLIC_BACKEND_URL is unset OR the backend is unreachable,
// each endpoint falls back to a static demo payload so the site
// still works end-to-end when hosted as a pure static build (Vercel).

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

async function req<T = any>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) throw new Error("NO_BACKEND");
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

// ---------- Static demo fallbacks (so vercel.app works with no backend) ----------
const NOW = () => new Date().toISOString();
const HEX = "0123456789abcdef";
const hex = (n = 40) => Array.from({ length: n }, () => HEX[Math.floor(Math.random() * 16)]).join("");
const short = (n = 12) => hex(n);
const AUTHORITIES = [
  { id: "AUTH-1", name: "Dr. R. Iyer", role: "Testing Agency", org: "National Testing Authority" },
  { id: "AUTH-2", name: "S. Menon", role: "Government Representative", org: "Ministry of Education" },
  { id: "AUTH-3", name: "Col. A. Rao", role: "Security Authority", org: "NIC Cyber Cell" },
  { id: "AUTH-4", name: "Prof. K. Bhatia", role: "Independent Observer", org: "UGC Panel" },
  { id: "AUTH-5", name: "Dr. P. Sharma", role: "Chief Examination Controller", org: "Central Exam Board" },
];
const EXAMS = [
  { code: "NEET-UG-2028", name: "NEET UG 2028", date: "2028-05-04" },
  { code: "JEE-MAIN-2028", name: "JEE Main 2028", date: "2028-01-24" },
  { code: "UPSC-CSE-2028", name: "UPSC CSE Prelims 2028", date: "2028-06-11" },
  { code: "CAT-2027", name: "CAT 2027", date: "2027-11-28" },
];
const CENTRES = [
  { id: "CTR-DEL-014", name: "New Delhi — Rohini Node", city: "New Delhi" },
  { id: "CTR-BLR-032", name: "Bengaluru — Whitefield Node", city: "Bengaluru" },
  { id: "CTR-MUM-011", name: "Mumbai — Andheri Node", city: "Mumbai" },
];

// In-memory demo state (persists per browser tab)
const memory: any = {
  vault: null,
  print: null,
  watermarks: [] as any[],
  candidates: {} as Record<string, any>,
  applications: {} as Record<string, any>,
};

function ensureVault() {
  if (memory.vault) return memory.vault;
  memory.vault = {
    id: "VLT-" + hex(10).toUpperCase(),
    paper_id: "QP-NEET-UG-2028-A1",
    exam: "NEET UG 2028",
    encrypted_hash: hex(64),
    aes_fingerprint: hex(32),
    threshold: 3,
    total: 5,
    signatures: [],
    status: "SEALED",
    release_deadline: new Date(Date.now() + 47 * 60 * 1000).toISOString(),
    active: true,
    created_at: NOW(),
    authorities: AUTHORITIES,
  };
  return memory.vault;
}

function ensurePrint() {
  if (memory.print) return memory.print;
  memory.print = {
    centre_id: "CTR-DEL-014",
    state: "IDLE",
    started_at: null,
    aes_progress: 0,
    aes_key_fingerprint: null,
    paper_id: "QP-NEET-UG-2028-A1",
    printers: [
      { id: "PRN-DEL-014-01", bay: "Bay-A1", model: "SecurePress-9800", capacity: 180, printed: 0, state: "STANDBY" },
      { id: "PRN-DEL-014-02", bay: "Bay-A2", model: "SecurePress-9800", capacity: 180, printed: 0, state: "STANDBY" },
      { id: "PRN-DEL-014-03", bay: "Bay-B1", model: "SecurePress-9800", capacity: 180, printed: 0, state: "STANDBY" },
      { id: "PRN-DEL-014-04", bay: "Bay-B2", model: "SecurePress-9800", capacity: 180, printed: 0, state: "STANDBY" },
      { id: "PRN-DEL-014-05", bay: "Bay-C1", model: "SecurePress-9800", capacity: 90, printed: 0, state: "STANDBY" },
      { id: "PRN-DEL-014-06", bay: "Bay-C2", model: "SecurePress-9800", capacity: 90, printed: 0, state: "STANDBY" },
    ],
  };
  return memory.print;
}

const demo = {
  stats: () => ({ candidates: 30_412_780, centres: 10_248, traceability_pct: 100, integrity_pct: 99.99, active_exams: 4, vault_status: "SEALED", network_nodes: 512 }),
  exams: () => ({ exams: EXAMS }),
  centres: () => ({ centres: CENTRES }),
  registerCandidate: (body: any) => {
    const id = "CND-" + hex(10).toUpperCase();
    const doc = { id, ...body, photo_hash: hex(64), verified: false, created_at: NOW() };
    memory.candidates[id] = doc;
    return doc;
  },
  verifyCandidate: (id: string) => ({
    candidate_id: id,
    verified: true,
    liveness: 0.973,
    face_match: 0.984,
    duplicate_score: 0.008,
    signature: hex(64),
    verified_at: NOW(),
  }),
  createApplication: (body: any) => {
    const id = "APP-" + hex(10).toUpperCase();
    const exam = EXAMS.find((e) => e.code === body.exam) || EXAMS[0];
    const doc = {
      id,
      candidate_id: body.candidate_id,
      exam: body.exam,
      exam_name: exam.name,
      centre_pref: body.centre_pref,
      centre_id: body.centre_pref,
      status: "CONFIRMED",
      seat_no: `R${Math.floor(Math.random() * 32) + 1}-S${Math.floor(Math.random() * 40) + 1}`,
      exam_date: exam.date,
      receipt_hash: hex(64),
      created_at: NOW(),
    };
    memory.applications[id] = doc;
    return doc;
  },
  getApplication: (id: string) => memory.applications[id] || { id, exam_name: "NEET UG 2028", centre_id: "CTR-DEL-014", seat_no: "R14-S28", exam_date: "2028-05-04", receipt_hash: hex(64) },
  getAdmitCard: (id: string) => {
    const app = memory.applications[id];
    const cand = app ? memory.candidates[app.candidate_id] : null;
    return {
      admit_id: `ADM-${id.slice(-8)}`,
      candidate: {
        id: cand?.id || "CND-DEMO",
        name: cand?.name || "Aarav Sharma",
        gov_id_masked: "••••",
        photo_hash: hex(64),
      },
      exam: app?.exam_name || "NEET UG 2028",
      centre: CENTRES[0],
      seat_no: app?.seat_no || "R14-S28",
      exam_date: app?.exam_date || "2028-05-04",
      reporting_time: "08:30 IST",
      signature: hex(64),
      qr_payload: `EXAMVAULT|${id}|${hex(16)}`,
      issued_at: NOW(),
    };
  },
  vaultSession: () => ensureVault(),
  vaultSign: (authority_id: string) => {
    const v = ensureVault();
    if (v.signatures.some((s: any) => s.authority_id === authority_id)) return v;
    v.signatures.push({ authority_id, signed_at: NOW(), signature: hex(64) });
    if (v.signatures.length >= v.threshold) v.status = "UNLOCKED";
    return v;
  },
  vaultReset: () => {
    memory.vault = null;
    return ensureVault();
  },
  centreDashboard: () => {
    const v = ensureVault();
    const unlocked = v.status === "UNLOCKED";
    return {
      centre: CENTRES[0],
      exam: "NEET UG 2028",
      exam_start: new Date(Date.now() + 44 * 60 * 1000).toISOString(),
      paper_status: unlocked ? "DECRYPTED" : "AWAITING_KEY",
      vault_signed: v.signatures.length,
      vault_threshold: v.threshold,
      printed_count: unlocked ? 812 : 0,
      total_seats: 900,
      printer: { id: "PRN-DEL-014-03", status: unlocked ? "ACTIVE" : "STANDBY", queue: unlocked ? 12 : 0 },
      cctv_stream: "SECURE",
      watermark_id: short(10).toUpperCase(),
      timeline: [
        { ts: "07:12:04", event: "Vault threshold met (3/5)", hash: short(12) },
        { ts: "07:12:09", event: "Decryption key received", hash: short(12) },
        { ts: "07:14:22", event: "Local decryption complete (AES-256)", hash: short(12) },
        { ts: "07:15:41", event: "Printing started (CCTV verified)", hash: short(12) },
        { ts: "07:52:18", event: "812 of 900 papers printed", hash: short(12) },
      ],
    };
  },
  centreDecrypt: () => {
    const v = ensureVault();
    if (v.status !== "UNLOCKED") throw new Error("Vault must be unlocked first");
    const pr = ensurePrint();
    pr.state = "DECRYPTING";
    pr.aes_key_fingerprint = v.aes_fingerprint;
    return {
      state: "DECRYPTING",
      aes_key_fingerprint: v.aes_fingerprint,
      key_material_hash: hex(64),
      authorities_ack: AUTHORITIES,
      estimated_seconds: 6,
    };
  },
  centrePaperPreview: () => {
    const v = ensureVault();
    const unlocked = v.status === "UNLOCKED";
    return {
      paper_id: "QP-NEET-UG-2028-A1",
      decrypted: unlocked,
      watermark: short(10).toUpperCase(),
      aes_fingerprint: v.aes_fingerprint,
      sample_questions: unlocked
        ? [
            { n: 1, text: "A particle moves in a plane with position vector r(t) = 3t î + (4t − 2t²) ĵ. Find its velocity at t = 1s." },
            { n: 2, text: "Which of the following molecules exhibits sp³ hybridisation? (A) CO₂ (B) BF₃ (C) CH₄ (D) C₂H₂" },
            { n: 3, text: "In a light-independent reaction of photosynthesis, the enzyme responsible for CO₂ fixation is _____ ." },
            { n: 4, text: "The osmotic pressure of a 0.1 M NaCl solution at 27 °C is closest to:" },
          ]
        : [],
    };
  },
  printRun: () => ensurePrint(),
  printRunStart: () => {
    const pr = ensurePrint();
    pr.state = "PRINTING";
    pr.printers.forEach((p: any) => (p.state = "PRINTING"));
    return { state: pr.state, printers: pr.printers };
  },
  printRunTick: () => {
    const pr = ensurePrint();
    const wmarks: any[] = [];
    if (pr.state !== "PRINTING") return { state: pr.state, printers: pr.printers, watermarks: [], total_printed: 0, total_capacity: 900 };
    let allDone = true;
    for (const p of pr.printers) {
      if (p.printed < p.capacity) {
        const inc = 6 + Math.floor(Math.random() * 8);
        const to = Math.min(p.capacity, p.printed + inc);
        for (let i = p.printed; i < to; i++) {
          wmarks.push({ printer: p.id, serial: i + 1, watermark: short(10).toUpperCase(), qr: `CTR-DEL-014|${p.id}|${String(i + 1).padStart(3, "0")}`, ts: NOW() });
        }
        p.printed = to;
        if (to >= p.capacity) p.state = "COMPLETE";
        else allDone = false;
      } else p.state = "COMPLETE";
    }
    pr.state = allDone ? "COMPLETE" : "PRINTING";
    const total_printed = pr.printers.reduce((a: number, p: any) => a + p.printed, 0);
    const total_capacity = pr.printers.reduce((a: number, p: any) => a + p.capacity, 0);
    return { state: pr.state, printers: pr.printers, watermarks: wmarks.slice(-6), total_printed, total_capacity };
  },
  printRunReset: () => {
    memory.print = null;
    return ensurePrint();
  },
  sheets: () => ({
    sheets: Array.from({ length: 6 }).map((_, i) => ({
      id: `AS-2028-${1000 + i}`,
      candidate: `CND-${Math.floor(10000 + Math.random() * 90000)}`,
      hash: hex(20),
      chain_of_custody: [
        { ts: "12:04", event: "Sealed at centre", actor: "CTR-DEL-014" },
        { ts: "12:31", event: "Handoff to courier", actor: "SEC-9812" },
        { ts: "14:11", event: "Received at evaluation node", actor: "EVAL-NODE-3" },
      ],
      status: i % 3 ? "IN_TRANSIT" : "AT_EVALUATION",
    })),
  }),
  evalQueue: () => ({
    queue: ["Physics", "Chemistry", "Biology", "Physics", "Chemistry"].map((subject, i) => ({
      sheet_id: `AS-2028-${1000 + i}`,
      subject,
      pages: 24,
      assigned_at: NOW(),
      sla_minutes: 45,
    })),
  }),
  submitEval: (body: any) => ({
    id: "EVL-" + hex(10).toUpperCase(),
    sheet_id: body.sheet_id,
    marks: body.marks,
    remarks: body.remarks,
    evaluator_id: body.evaluator_id,
    chain_hash: hex(64),
    block_height: 1_284_000 + Math.floor(Math.random() * 6000),
    submitted_at: NOW(),
  }),
  getResult: (id: string) => ({
    app_id: id,
    candidate_name: "Aarav Sharma",
    exam: "NEET UG 2028",
    marks: 682,
    total: 720,
    percentile: 99.86,
    rank: 214,
    sections: [
      { name: "Physics", score: 168, total: 180 },
      { name: "Chemistry", score: 172, total: 180 },
      { name: "Biology", score: 342, total: 360 },
    ],
    certificate_id: `EV-CERT-${id.slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
    certificate_hash: hex(64),
    block_height: 1_284_991,
    chain: "EXAMVAULT-MAINNET",
    verified: true,
    issued_at: NOW(),
  }),
  verifyCertificate: (id: string) => ({
    certificate_id: id,
    verified: true,
    chain: "EXAMVAULT-MAINNET",
    block_height: 1_284_991,
    tx_hash: hex(64),
    issued_at: NOW(),
    issuer: "Central Examination Board, Govt. of India",
    signature: hex(64),
    history: [
      { event: "Certificate minted", ts: "2028-06-14T09:22:04Z" },
      { event: "Public verification requested", ts: NOW() },
    ],
  }),
  analytics: () => ({
    registered: 30_412_780,
    attendance_pct: 94.7,
    active_centres: 10_248,
    incidents: 3,
    suspicious_flags: 27,
    avg_verification_sec: 4.8,
    avg_paper_release_sec: 1.9,
    hourly_verifications: [1240, 2210, 3810, 5920, 8210, 9800, 10450, 9880, 8420, 6110, 3820, 1420],
    top_incidents: [
      { id: "INC-2091", type: "Duplicate face flagged", centre: "CTR-DEL-014", severity: "low" },
      { id: "INC-2092", type: "Printer offline > 30s", centre: "CTR-BLR-032", severity: "medium" },
      { id: "INC-2093", type: "Unauthorized login attempt", centre: "CTR-MUM-011", severity: "high" },
    ],
  }),
  audit: () => ({ entries: [] }),
};

function withFallback<T extends (...a: any[]) => Promise<any>>(fn: T, fb: (...a: Parameters<T>) => any) {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (e: any) {
      return fb(...args);
    }
  }) as unknown as T;
}

export const api = {
  stats: withFallback(() => req("/stats"), () => demo.stats()),
  exams: withFallback(() => req("/exams"), () => demo.exams()),
  centres: withFallback(() => req("/centres"), () => demo.centres()),
  registerCandidate: withFallback(
    (body: any) => req("/candidates/register", { method: "POST", body: JSON.stringify(body) }),
    (body: any) => demo.registerCandidate(body),
  ),
  verifyCandidate: withFallback(
    (id: string) => req(`/candidates/${id}/verify`, { method: "POST" }),
    (id: string) => demo.verifyCandidate(id),
  ),
  createApplication: withFallback(
    (body: any) => req("/applications", { method: "POST", body: JSON.stringify(body) }),
    (body: any) => demo.createApplication(body),
  ),
  getApplication: withFallback((id: string) => req(`/applications/${id}`), (id: string) => demo.getApplication(id)),
  getAdmitCard: withFallback((id: string) => req(`/admit-cards/${id}`), (id: string) => demo.getAdmitCard(id)),
  vaultSession: withFallback(() => req("/vault/session"), () => demo.vaultSession()),
  vaultSign: withFallback(
    (authority_id: string) => req("/vault/session/sign", { method: "POST", body: JSON.stringify({ authority_id }) }),
    (authority_id: string) => demo.vaultSign(authority_id),
  ),
  vaultReset: withFallback(() => req("/vault/session/reset", { method: "POST" }), () => demo.vaultReset()),
  centreDashboard: withFallback(() => req("/centre/dashboard"), () => demo.centreDashboard()),
  centreDecrypt: withFallback(() => req("/centre/decrypt", { method: "POST" }), () => demo.centreDecrypt()),
  centrePaperPreview: withFallback(() => req("/centre/paper-preview"), () => demo.centrePaperPreview()),
  printRun: withFallback(() => req("/centre/print-run"), () => demo.printRun()),
  printRunStart: withFallback(() => req("/centre/print-run/start", { method: "POST" }), () => demo.printRunStart()),
  printRunTick: withFallback(() => req("/centre/print-run/tick"), () => demo.printRunTick()),
  printRunReset: withFallback(() => req("/centre/print-run/reset", { method: "POST" }), () => demo.printRunReset()),
  sheets: withFallback(() => req("/answer-sheets"), () => demo.sheets()),
  evalQueue: withFallback(() => req("/evaluator/queue"), () => demo.evalQueue()),
  submitEval: withFallback(
    (body: any) => req("/evaluator/submit", { method: "POST", body: JSON.stringify(body) }),
    (body: any) => demo.submitEval(body),
  ),
  getResult: withFallback((id: string) => req(`/results/${id}`), (id: string) => demo.getResult(id)),
  verifyCertificate: withFallback((id: string) => req(`/certificate/verify/${id}`), (id: string) => demo.verifyCertificate(id)),
  analytics: withFallback(() => req("/analytics/overview"), () => demo.analytics()),
  audit: withFallback(() => req("/audit-log"), () => demo.audit()),
};
