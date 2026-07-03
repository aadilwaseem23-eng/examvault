from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import hashlib
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="ExamVault DPI")
api_router = APIRouter(prefix="/api")


# ------------------------- helpers -------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def short_hash(text: str, n: int = 12) -> str:
    return sha256(text)[:n]


def new_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:10].upper()}"


async def log_audit(action: str, actor: str, meta: Optional[Dict[str, Any]] = None):
    entry = {
        "id": new_id("AUD-"),
        "action": action,
        "actor": actor,
        "meta": meta or {},
        "ts": now_iso(),
        "hash": sha256(f"{action}:{actor}:{now_iso()}"),
    }
    await db.audit_log.insert_one(entry.copy())
    entry.pop("_id", None)
    return entry


# ------------------------- models -------------------------
class CandidateCreate(BaseModel):
    name: str
    dob: str
    gov_id: str
    email: str
    phone: str
    exam: str


class Candidate(BaseModel):
    id: str
    name: str
    dob: str
    gov_id: str
    email: str
    phone: str
    exam: str
    photo_hash: str
    verified: bool = False
    created_at: str


class ApplicationCreate(BaseModel):
    candidate_id: str
    exam: str
    centre_pref: str


class Application(BaseModel):
    id: str
    candidate_id: str
    exam: str
    centre_pref: str
    status: str
    seat_no: str
    centre_id: str
    exam_date: str
    created_at: str


class VaultSignRequest(BaseModel):
    authority_id: str


class EvaluationSubmit(BaseModel):
    sheet_id: str
    marks: int
    remarks: str
    evaluator_id: str


# ------------------------- static seed -------------------------
AUTHORITIES = [
    {"id": "AUTH-1", "name": "Dr. R. Iyer", "role": "Testing Agency", "org": "National Testing Authority"},
    {"id": "AUTH-2", "name": "S. Menon", "role": "Government Representative", "org": "Ministry of Education"},
    {"id": "AUTH-3", "name": "Col. A. Rao", "role": "Security Authority", "org": "NIC Cyber Cell"},
    {"id": "AUTH-4", "name": "Prof. K. Bhatia", "role": "Independent Observer", "org": "UGC Panel"},
    {"id": "AUTH-5", "name": "Dr. P. Sharma", "role": "Chief Examination Controller", "org": "Central Exam Board"},
]

EXAMS = [
    {"code": "NEET-UG-2028", "name": "NEET UG 2028", "date": "2028-05-04"},
    {"code": "JEE-MAIN-2028", "name": "JEE Main 2028", "date": "2028-01-24"},
    {"code": "UPSC-CSE-2028", "name": "UPSC CSE Prelims 2028", "date": "2028-06-11"},
    {"code": "CAT-2027", "name": "CAT 2027", "date": "2027-11-28"},
]

CENTRES = [
    {"id": "CTR-DEL-014", "name": "New Delhi — Rohini Node", "city": "New Delhi"},
    {"id": "CTR-BLR-032", "name": "Bengaluru — Whitefield Node", "city": "Bengaluru"},
    {"id": "CTR-MUM-011", "name": "Mumbai — Andheri Node", "city": "Mumbai"},
]


# ------------------------- routes -------------------------
@api_router.get("/")
async def root():
    return {"service": "ExamVault DPI", "version": "1.0", "status": "operational"}


@api_router.get("/stats")
async def get_stats():
    return {
        "candidates": 30_412_780,
        "centres": 10_248,
        "traceability_pct": 100.0,
        "integrity_pct": 99.99,
        "active_exams": 4,
        "vault_status": "SEALED",
        "network_nodes": 512,
    }


@api_router.get("/exams")
async def list_exams():
    return {"exams": EXAMS}


@api_router.get("/centres")
async def list_centres():
    return {"centres": CENTRES}


# ---- Candidate flow ----
@api_router.post("/candidates/register")
async def register_candidate(payload: CandidateCreate):
    cid = new_id("CND-")
    photo_hash = sha256(f"{cid}:photo")
    doc = {
        "id": cid,
        "name": payload.name,
        "dob": payload.dob,
        "gov_id": payload.gov_id,
        "email": payload.email,
        "phone": payload.phone,
        "exam": payload.exam,
        "photo_hash": photo_hash,
        "verified": False,
        "created_at": now_iso(),
    }
    await db.candidates.insert_one(doc.copy())
    await log_audit("candidate.register", cid, {"exam": payload.exam})
    doc.pop("_id", None)
    return doc


@api_router.post("/candidates/{cid}/verify")
async def verify_candidate(cid: str):
    liveness = round(random.uniform(0.94, 0.99), 4)
    match = round(random.uniform(0.96, 0.995), 4)
    dup = round(random.uniform(0.001, 0.02), 4)
    await db.candidates.update_one({"id": cid}, {"$set": {"verified": True}})
    await log_audit("candidate.verify", cid, {"liveness": liveness, "match": match})
    return {
        "candidate_id": cid,
        "verified": True,
        "liveness": liveness,
        "face_match": match,
        "duplicate_score": dup,
        "signature": sha256(f"{cid}:verify:{now_iso()}"),
        "verified_at": now_iso(),
    }


@api_router.post("/applications")
async def create_application(payload: ApplicationCreate):
    aid = new_id("APP-")
    seat = f"R{random.randint(1,32):02d}-S{random.randint(1,40):02d}"
    exam_row = next((e for e in EXAMS if e["code"] == payload.exam), EXAMS[0])
    doc = {
        "id": aid,
        "candidate_id": payload.candidate_id,
        "exam": payload.exam,
        "exam_name": exam_row["name"],
        "centre_pref": payload.centre_pref,
        "centre_id": payload.centre_pref,
        "status": "CONFIRMED",
        "seat_no": seat,
        "exam_date": exam_row["date"],
        "receipt_hash": sha256(f"{aid}:receipt"),
        "created_at": now_iso(),
    }
    await db.applications.insert_one(doc.copy())
    await log_audit("application.create", payload.candidate_id, {"app_id": aid})
    doc.pop("_id", None)
    return doc


@api_router.get("/applications/{aid}")
async def get_application(aid: str):
    doc = await db.applications.find_one({"id": aid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Application not found")
    return doc


@api_router.get("/admit-cards/{aid}")
async def get_admit_card(aid: str):
    app = await db.applications.find_one({"id": aid}, {"_id": 0})
    if not app:
        raise HTTPException(404, "Application not found")
    cand = await db.candidates.find_one({"id": app["candidate_id"]}, {"_id": 0}) or {}
    centre = next((c for c in CENTRES if c["id"] == app.get("centre_id")), CENTRES[0])
    signature = sha256(f"{aid}:admit:{cand.get('id','')}")
    return {
        "admit_id": f"ADM-{aid[-8:]}",
        "candidate": {
            "id": cand.get("id"),
            "name": cand.get("name"),
            "gov_id_masked": (cand.get("gov_id") or "XXXX-XXXX-XXXX")[-4:].rjust(4, "•"),
            "photo_hash": cand.get("photo_hash"),
        },
        "exam": app.get("exam_name") or app.get("exam"),
        "centre": centre,
        "seat_no": app["seat_no"],
        "exam_date": app["exam_date"],
        "reporting_time": "08:30 IST",
        "signature": signature,
        "qr_payload": f"EXAMVAULT|{aid}|{signature[:16]}",
        "issued_at": now_iso(),
    }


# ---- Vault (Multi-sig) ----
async def _get_or_create_vault():
    doc = await db.vault_sessions.find_one({"active": True}, {"_id": 0})
    if doc:
        return doc
    session_id = new_id("VLT-")
    paper_id = "QP-NEET-UG-2028-A1"
    encrypted_hash = sha256(f"{paper_id}:{session_id}")
    doc = {
        "id": session_id,
        "paper_id": paper_id,
        "exam": "NEET UG 2028",
        "encrypted_hash": encrypted_hash,
        "aes_fingerprint": short_hash(encrypted_hash, 32),
        "threshold": 3,
        "total": 5,
        "signatures": [],
        "status": "SEALED",
        "release_deadline": (datetime.now(timezone.utc) + timedelta(minutes=47, seconds=15)).isoformat(),
        "active": True,
        "created_at": now_iso(),
    }
    await db.vault_sessions.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


@api_router.get("/vault/session")
async def get_vault_session():
    session = await _get_or_create_vault()
    return {
        **session,
        "authorities": AUTHORITIES,
    }


@api_router.post("/vault/session/sign")
async def sign_vault(payload: VaultSignRequest):
    session = await _get_or_create_vault()
    if payload.authority_id not in [a["id"] for a in AUTHORITIES]:
        raise HTTPException(400, "Unknown authority")
    signatures = session.get("signatures", [])
    if any(s["authority_id"] == payload.authority_id for s in signatures):
        return {**session, "authorities": AUTHORITIES}
    sig = {
        "authority_id": payload.authority_id,
        "signed_at": now_iso(),
        "signature": sha256(f"{payload.authority_id}:{session['id']}:{now_iso()}"),
    }
    signatures.append(sig)
    status = "UNLOCKED" if len(signatures) >= session["threshold"] else "SEALED"
    await db.vault_sessions.update_one(
        {"id": session["id"]},
        {"$set": {"signatures": signatures, "status": status}},
    )
    await log_audit("vault.sign", payload.authority_id, {"session": session["id"]})
    session["signatures"] = signatures
    session["status"] = status
    return {**session, "authorities": AUTHORITIES}


@api_router.post("/vault/session/reset")
async def reset_vault():
    await db.vault_sessions.update_many({"active": True}, {"$set": {"active": False}})
    session = await _get_or_create_vault()
    return {**session, "authorities": AUTHORITIES}


# ---- Centre / Answer Sheet / Evaluation ----
@api_router.get("/centre/dashboard")
async def centre_dashboard():
    return {
        "centre": CENTRES[0],
        "paper_status": "DECRYPTED",
        "printed_count": 812,
        "total_seats": 900,
        "printer": {"id": "PRN-DEL-014-03", "status": "ACTIVE", "queue": 12},
        "cctv_stream": "SECURE",
        "watermark_id": short_hash("watermark", 10).upper(),
        "timeline": [
            {"ts": "07:12:04", "event": "Vault threshold met (3/5)", "hash": short_hash("t1")},
            {"ts": "07:12:09", "event": "Decryption key received", "hash": short_hash("t2")},
            {"ts": "07:14:22", "event": "Local decryption complete (AES-256)", "hash": short_hash("t3")},
            {"ts": "07:15:41", "event": "Printing started (CCTV verified)", "hash": short_hash("t4")},
            {"ts": "07:52:18", "event": "812 of 900 papers printed", "hash": short_hash("t5")},
        ],
    }


@api_router.get("/answer-sheets")
async def list_sheets():
    sheets = []
    for i in range(6):
        sid = f"AS-{2028}-{1000+i}"
        sheets.append({
            "id": sid,
            "candidate": f"CND-{random.randint(10000,99999)}",
            "hash": sha256(sid)[:20],
            "chain_of_custody": [
                {"ts": "12:04", "event": "Sealed at centre", "actor": "CTR-DEL-014"},
                {"ts": "12:31", "event": "Handoff to courier", "actor": "SEC-9812"},
                {"ts": "14:11", "event": "Received at evaluation node", "actor": "EVAL-NODE-3"},
            ],
            "status": "IN_TRANSIT" if i % 3 else "AT_EVALUATION",
        })
    return {"sheets": sheets}


@api_router.get("/evaluator/queue")
async def evaluator_queue():
    q = []
    for i in range(5):
        q.append({
            "sheet_id": f"AS-2028-{1000+i}",
            "subject": ["Physics", "Chemistry", "Biology", "Physics", "Chemistry"][i],
            "pages": 24,
            "assigned_at": now_iso(),
            "sla_minutes": 45,
        })
    return {"queue": q}


@api_router.post("/evaluator/submit")
async def evaluator_submit(payload: EvaluationSubmit):
    doc = {
        "id": new_id("EVL-"),
        "sheet_id": payload.sheet_id,
        "marks": payload.marks,
        "remarks": payload.remarks,
        "evaluator_id": payload.evaluator_id,
        "chain_hash": sha256(f"{payload.sheet_id}:{payload.marks}:{now_iso()}"),
        "block_height": random.randint(1_284_000, 1_290_000),
        "submitted_at": now_iso(),
    }
    await db.evaluations.insert_one(doc.copy())
    await log_audit("evaluation.submit", payload.evaluator_id, {"sheet": payload.sheet_id, "marks": payload.marks})
    doc.pop("_id", None)
    return doc


# ---- Result / Certificate ----
@api_router.get("/results/{aid}")
async def get_result(aid: str):
    app = await db.applications.find_one({"id": aid}, {"_id": 0})
    cand = None
    exam_name = "NEET UG 2028"
    if app:
        cand = await db.candidates.find_one({"id": app["candidate_id"]}, {"_id": 0})
        exam_name = app.get("exam_name") or app.get("exam")
    marks = random.randint(612, 698)
    percentile = round(random.uniform(97.4, 99.98), 4)
    rank = random.randint(148, 4820)
    cert_id = f"EV-CERT-{aid[-6:]}-{random.randint(100,999)}"
    return {
        "app_id": aid,
        "candidate_name": (cand or {}).get("name", "Candidate"),
        "exam": exam_name,
        "marks": marks,
        "total": 720,
        "percentile": percentile,
        "rank": rank,
        "sections": [
            {"name": "Physics", "score": random.randint(140, 178), "total": 180},
            {"name": "Chemistry", "score": random.randint(150, 178), "total": 180},
            {"name": "Biology", "score": random.randint(320, 358), "total": 360},
        ],
        "certificate_id": cert_id,
        "certificate_hash": sha256(cert_id),
        "block_height": random.randint(1_284_000, 1_290_000),
        "chain": "EXAMVAULT-MAINNET",
        "verified": True,
        "issued_at": now_iso(),
    }


@api_router.get("/certificate/verify/{cert_id}")
async def verify_certificate(cert_id: str):
    return {
        "certificate_id": cert_id,
        "verified": True,
        "chain": "EXAMVAULT-MAINNET",
        "block_height": random.randint(1_284_000, 1_290_000),
        "tx_hash": sha256(cert_id),
        "issued_at": now_iso(),
        "issuer": "Central Examination Board, Govt. of India",
        "signature": sha256(f"issuer:{cert_id}"),
        "history": [
            {"event": "Certificate minted", "ts": "2028-06-14T09:22:04Z"},
            {"event": "Public verification requested", "ts": now_iso()},
        ],
    }


# ---- Analytics ----
@api_router.get("/analytics/overview")
async def analytics_overview():
    return {
        "registered": 30_412_780,
        "attendance_pct": 94.7,
        "active_centres": 10_248,
        "incidents": 3,
        "suspicious_flags": 27,
        "avg_verification_sec": 4.8,
        "avg_paper_release_sec": 1.9,
        "hourly_verifications": [1240, 2210, 3810, 5920, 8210, 9800, 10450, 9880, 8420, 6110, 3820, 1420],
        "top_incidents": [
            {"id": "INC-2091", "type": "Duplicate face flagged", "centre": "CTR-DEL-014", "severity": "low"},
            {"id": "INC-2092", "type": "Printer offline > 30s", "centre": "CTR-BLR-032", "severity": "medium"},
            {"id": "INC-2093", "type": "Unauthorized login attempt", "centre": "CTR-MUM-011", "severity": "high"},
        ],
    }


@api_router.get("/audit-log")
async def get_audit(limit: int = 20):
    entries = await db.audit_log.find({}, {"_id": 0}).sort("ts", -1).to_list(limit)
    return {"entries": entries}


# ---- Mount ----
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("examvault")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
