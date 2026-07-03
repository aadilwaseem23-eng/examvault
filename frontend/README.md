# ExamVault — Zero-Trust Digital Examination Infrastructure

> Restoring trust in high-stakes examinations with AI, Blockchain, Cryptography and Zero-Trust architecture.

Live demo: **[examvault.vercel.app](https://examvault.vercel.app)** _(replace with your deployment URL)_

---

## What's inside

| Layer         | Tech                                            |
| ------------- | ----------------------------------------------- |
| Mobile / Web  | Expo SDK **54**, Expo Router 6, React Native 0.81, React Native Web 0.21, React 19 |
| Animation     | `react-native-reanimated` 4, custom Skia-free primitives |
| Backend       | FastAPI + Motor + MongoDB (see `/backend`)      |
| Deploy target | **Vercel** (static Expo Web export)             |

The single Expo app renders **17 screens across 5 personas** (Candidate, Vault Authority, Exam Centre, Evaluator, Government Analytics) plus a marketing landing (`/`) and a public certificate verifier (`/verify/[id]`).

Routing (all statically exported):

```
/                       marketing landing
/prototype              role selector
/candidate/register
/candidate/verify
/candidate/application
/candidate/admit-card
/candidate/exam-auth
/candidate/exam
/candidate/result
/candidate/answer-sheet
/vault                  3-of-5 multi-sig hero
/centre                 exam centre command hub
/centre/decrypt         AES-256 key ceremony
/centre/paper-preview   decrypted paper with QR + watermarks
/centre/printing        live printer fleet
/centre/tracking        answer-sheet custody
/evaluator              blockchain-anchored marking
/analytics              national analytics
/verify/[id]            public certificate verifier
/impact                 transformation infographic
```

---

## Deploying to Vercel

### 1) Push the `frontend/` folder to a Git repo

Vercel deploys from a Git repository — either push the entire monorepo (and configure Vercel's root directory to `frontend/`) or push just `frontend/` on its own repo.

### 2) Connect the repo on Vercel

- Framework preset: **Other** (Vercel auto-detects from `vercel.json`)
- Root directory: `frontend/`
- Build command: _leave blank_ (uses `vercel.json`)
- Output directory: _leave blank_ (uses `vercel.json`)

### 3) Set environment variables (optional)

If you deployed the FastAPI backend separately (Railway / Render / Fly.io), set:

```
EXPO_PUBLIC_BACKEND_URL=https://your-backend.example.com
```

on Vercel → Project → Settings → Environment Variables.

**If `EXPO_PUBLIC_BACKEND_URL` is unset**, the app runs on a fully client-side demo layer defined in `src/api.ts` — all screens still work with realistic mock data, in-memory vault state, live-updating printer fleet, etc. This is what powers `examvault.vercel.app` when no backend is attached.

### 4) Deploy

Push to `main` → Vercel builds via `npx expo export --platform web` → outputs `dist/` → served as a fully static site.

### 5) Custom domain

Vercel → Project → Domains → add `examvault.vercel.app` (default) or your own.

---

## Local development

```bash
cd frontend
yarn install
yarn web            # dev server at http://localhost:8081
```

To exercise the FastAPI backend locally:

```bash
cd backend
pip install -r requirements.txt
MONGO_URL="mongodb://localhost:27017" DB_NAME=examvault uvicorn server:app --port 8001
```

Then in `frontend/.env` set:

```
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

---

## Building a native app (iOS/Android)

This project uses Expo Router — it works natively too. Use the Emergent "Publish" button (top-right) to generate iOS/Android builds without leaving the platform.

---

## Static export (what Vercel runs)

```bash
cd frontend
npx expo export --platform web
```

Produces `dist/` with:

- `index.html`, `prototype.html`, etc. for every static route
- `verify/[id].html` dynamic route (rewritten by `vercel.json`)
- `_expo/static/js/*` bundled JS
- `assets/*` — icons, fonts, images

---

## Editing the marketing site

External links live at the top of `app/index.tsx`:

```ts
const LINKS = {
  pitchDeck:  "https://drive.google.com/…",
  whitepaper: "https://drive.google.com/…",
  github:     "https://github.com/…",
  email:      "mailto:aadilwaseem234@gmail.com",
  phone:      "tel:+918920869628",
};
```

Update those URLs to point at your real assets before publishing.

---

## Contact

- **Aadil Waseem** — [aadilwaseem234@gmail.com](mailto:aadilwaseem234@gmail.com)
- **Phone** — +91 8920869628

---

## License

Prototype for public benefit · 2028
