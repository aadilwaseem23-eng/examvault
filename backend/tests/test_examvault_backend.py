"""ExamVault DPI backend tests - covers stats, candidate, application,
admit card, vault multi-sig, centre, evaluator, result, certificate, analytics."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL") or os.environ.get("EXPO_BACKEND_URL")
if not BASE_URL:
    # fall back to frontend .env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
    except Exception:
        pass
BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---- basics ----
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "operational"


def test_stats(s):
    r = s.get(f"{API}/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ["candidates", "centres", "integrity_pct", "traceability_pct", "vault_status"]:
        assert k in d
    assert d["candidates"] > 1_000_000


def test_exams_centres(s):
    r1 = s.get(f"{API}/exams")
    assert r1.status_code == 200 and len(r1.json()["exams"]) >= 3
    r2 = s.get(f"{API}/centres")
    assert r2.status_code == 200 and len(r2.json()["centres"]) >= 3


# ---- Candidate flow ----
@pytest.fixture(scope="module")
def candidate(s):
    payload = {
        "name": "TEST_John Doe",
        "dob": "2005-01-01",
        "gov_id": "1234-5678-9012",
        "email": "test_john@example.com",
        "phone": "9999999999",
        "exam": "NEET-UG-2028",
    }
    r = s.post(f"{API}/candidates/register", json=payload)
    assert r.status_code == 200
    d = r.json()
    assert d["id"].startswith("CND-")
    assert d["photo_hash"] and len(d["photo_hash"]) == 64
    assert d["verified"] is False
    return d


def test_verify_candidate(s, candidate):
    r = s.post(f"{API}/candidates/{candidate['id']}/verify")
    assert r.status_code == 200
    d = r.json()
    assert d["verified"] is True
    assert 0.9 <= d["liveness"] <= 1.0
    assert 0.9 <= d["face_match"] <= 1.0
    assert d["signature"]


@pytest.fixture(scope="module")
def application(s, candidate):
    r = s.post(f"{API}/applications", json={
        "candidate_id": candidate["id"],
        "exam": "NEET-UG-2028",
        "centre_pref": "CTR-DEL-014",
    })
    assert r.status_code == 200
    d = r.json()
    assert d["id"].startswith("APP-")
    assert d["seat_no"] and d["centre_id"] == "CTR-DEL-014"
    assert d["exam_date"] and d["receipt_hash"]
    return d


def test_admit_card(s, application):
    r = s.get(f"{API}/admit-cards/{application['id']}")
    assert r.status_code == 200
    d = r.json()
    assert d["admit_id"].startswith("ADM-")
    assert d["signature"] and d["qr_payload"].startswith("EXAMVAULT|")
    assert d["seat_no"] == application["seat_no"]


def test_result(s, application):
    r = s.get(f"{API}/results/{application['id']}")
    assert r.status_code == 200
    d = r.json()
    assert d["verified"] is True
    assert d["certificate_id"].startswith("EV-CERT-")
    assert len(d["sections"]) == 3


def test_certificate_verify(s):
    r = s.get(f"{API}/certificate/verify/EV-CERT-TEST-999")
    assert r.status_code == 200
    d = r.json()
    assert d["verified"] is True
    assert d["chain"] == "EXAMVAULT-MAINNET"
    assert d["tx_hash"] and len(d["history"]) >= 2


# ---- Vault multi-sig ----
def test_vault_flow(s):
    # reset first for deterministic state
    r0 = s.post(f"{API}/vault/session/reset")
    assert r0.status_code == 200
    d0 = r0.json()
    assert d0["status"] == "SEALED"
    assert d0["threshold"] == 3 and d0["total"] == 5
    assert len(d0["authorities"]) == 5

    r = s.get(f"{API}/vault/session")
    assert r.status_code == 200 and r.json()["status"] == "SEALED"

    # sign with 2 - still sealed
    r1 = s.post(f"{API}/vault/session/sign", json={"authority_id": "AUTH-1"})
    assert r1.json()["status"] == "SEALED"
    # duplicate should not double-count
    r1b = s.post(f"{API}/vault/session/sign", json={"authority_id": "AUTH-1"})
    assert len(r1b.json()["signatures"]) == 1

    r2 = s.post(f"{API}/vault/session/sign", json={"authority_id": "AUTH-2"})
    assert r2.json()["status"] == "SEALED"
    assert len(r2.json()["signatures"]) == 2

    r3 = s.post(f"{API}/vault/session/sign", json={"authority_id": "AUTH-3"})
    d3 = r3.json()
    assert d3["status"] == "UNLOCKED"
    assert len(d3["signatures"]) == 3

    # unknown authority
    rbad = s.post(f"{API}/vault/session/sign", json={"authority_id": "BAD-X"})
    assert rbad.status_code == 400

    # reset returns to SEALED
    rr = s.post(f"{API}/vault/session/reset")
    assert rr.json()["status"] == "SEALED"
    assert rr.json()["signatures"] == []


# ---- Centre / sheets / evaluator ----
def test_centre_dashboard(s):
    r = s.get(f"{API}/centre/dashboard")
    assert r.status_code == 200
    d = r.json()
    for k in ["paper_status", "printer", "watermark_id", "timeline"]:
        assert k in d
    assert len(d["timeline"]) >= 3


def test_answer_sheets(s):
    r = s.get(f"{API}/answer-sheets")
    assert r.status_code == 200
    sheets = r.json()["sheets"]
    assert len(sheets) >= 3
    assert "chain_of_custody" in sheets[0]


def test_evaluator_flow(s):
    r = s.get(f"{API}/evaluator/queue")
    assert r.status_code == 200
    q = r.json()["queue"]
    assert len(q) >= 1
    r2 = s.post(f"{API}/evaluator/submit", json={
        "sheet_id": q[0]["sheet_id"],
        "marks": 85,
        "remarks": "TEST_ok",
        "evaluator_id": "EVAL-TEST",
    })
    assert r2.status_code == 200
    d = r2.json()
    assert d["chain_hash"] and d["block_height"] > 0
    assert d["id"].startswith("EVL-")


def test_analytics(s):
    r = s.get(f"{API}/analytics/overview")
    assert r.status_code == 200
    d = r.json()
    assert len(d["hourly_verifications"]) == 12
    assert len(d["top_incidents"]) >= 1
