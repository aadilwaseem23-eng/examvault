# ExamVault — PRD

## Overview
ExamVault is a mobile prototype of a national Digital Public Infrastructure (DPI) that secures the entire high-stakes examination lifecycle using AI, Blockchain, Cryptography and Zero-Trust architecture. Tagline: *Restoring Trust in High-Stakes Examinations.*

## Persona Model
Single app with 5 switchable personas from the landing:
1. **Candidate** — Register → face verify → application → admit card → exam-day auth → exam → result → scanned sheet
2. **Vault Authority** — Multi-signature 3-of-5 digital vault (hero screen)
3. **Exam Centre** — Local decryption, printing, chain-of-custody, answer-sheet tracking
4. **Evaluator** — Marks entry + blockchain-anchored audit receipt
5. **Government Analytics** — National macro-view + incident feed

## Backend API (FastAPI + MongoDB, `/api` prefix)
- Public: `/stats`, `/exams`, `/centres`, `/audit-log`, `/certificate/verify/{id}`, `/analytics/overview`
- Candidate: `/candidates/register`, `/candidates/{id}/verify`, `/applications`, `/applications/{id}`, `/admit-cards/{id}`, `/results/{id}`
- Vault: `/vault/session` (GET), `/vault/session/sign`, `/vault/session/reset`
- Centre: `/centre/dashboard`, `/answer-sheets`
- Evaluator: `/evaluator/queue`, `/evaluator/submit`

All hashes and signatures use deterministic SHA-256 (**MOCKED blockchain / crypto**).

## Design System
Dark theme (`#0F172A`), Electric blue `#38BDF8` + Emerald `#10B981` accents, glassmorphism, Inter font (max 500 weight), Phosphor/Ionicons.

## Screens (17 files)
Landing hero, Register (3-step), Face verify (Reanimated scan-line), Application submitted, Digital Admit Card (QR + Ed25519 signature), Exam-day authentication (4-step chain), Exam-in-progress, Result (hero scorecard + blockchain badge), Scanned Answer Sheet, Vault (3-of-5 threshold with orbiting rings + countdown), Centre Dashboard, Answer-Sheet Tracking, Evaluator Console, Analytics (bar chart + incidents), Public Certificate Verifier, Impact page.

## Testing
Backend: 12/12 pytest PASS. Frontend: all flows render & integrate on 390×844.

## Future Enhancements
- **Business layer**: Certificate verification API as a paid service for universities/recruiters (per-verify pricing) — turns the DPI into a self-sustaining public utility. Add usage metering + API keys for institutional clients.
- Real signal ingestion for AI (Gemini vision face/liveness), on-chain anchoring (Polygon zkEVM), push-notifications for vault release, biometric attendance kiosks, evaluator two-person integrity, and answer-sheet OCR.
