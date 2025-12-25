HADES Rehab — Complete Starter (JWKS, Supabase, RBAC, Repair Workbench)
=======================================================================
What's included (expanded):
- NestJS proxy with:
  - Forensic storage in MongoDB (works with MongoDB Atlas in prod)
  - Triage persistence directly to Supabase Postgres using service role key
  - JWT verification using JWKS (recommended) via SUPABASE_JWKS_URL
  - RBAC check that looks up user role in Supabase table `user_roles` (create this table)
- React triage UI integrated with Supabase auth (sign-in + save triage)
- FastAPI sandbox placeholder (model replay)
- Repair workbench (Python) with LoRA training & evaluation skeleton (placeholders)
- docker-compose configured for local dev (mongo + services). Note: Postgres container removed; use hosted Supabase for triage.

Environment variables (important)
- MONGO_URI: mongodb://mongo:27017/hades (or your Atlas URI)
- SANDBOX_URL: http://sandbox-model:8000/replay
- VITE_SUPABASE_URL: your supabase project URL (e.g., https://xyz.supabase.co)
- VITE_SUPABASE_ANON_KEY: anon public key for UI auth
- SUPABASE_SERVICE_KEY: Service Role key for server-side inserts & RBAC checks (keep secret)
- SUPABASE_JWKS_URL: Optional but recommended; JWKS endpoint to verify Supabase JWTs (e.g., https://<project>.supabase.co/auth/v1/certs)
  If SUPABASE_JWKS_URL is unset the server will decode tokens without verifying (NOT FOR PROD).

Local dev quickstart
--------------------
1. Ensure Docker is installed.
2. From repo root:
   docker compose build
   docker compose up
3. Set the client env vars in triage UI (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) either in your host env or edit docker-compose.

Security notes
--------------
- SUPABASE_SERVICE_KEY must be kept secret (server-side only). Do not commit it.
- For production: configure SUPABASE_JWKS_URL and SUPABASE_SERVICE_KEY. Ensure TLS and proper secret storage.



