# Passport Seva Portal (Academic Demo, Lotus Theme)
Not an official Government of India service. Dummy data and simulated verification only.

## Build status
- [x] Stage 1: architecture, MySQL schema, backend core (auth, applications, uploads)
- [x] Stage 2: officer/admin/appointment/notification/report APIs
- [x] Stage 3: React frontend (lotus theme)
- [x] Stage 4: Tkinter desktop app
- [x] Stage 5: docs, diagrams, testing, project report

## Run (Stage 1)
1. MySQL: `mysql -u root -p < database/schema.sql` then `mysql -u root -p < database/sample_data.sql`
2. `cd backend && cp .env.example .env` (edit DB password and JWT_SECRET)
3. `npm install && npm run seed && npm start`
4. Check http://localhost:5000/api/health

Demo logins (password `Demo@1234`): citizen@demo.in, officer@demo.in, admin@demo.in

## Architecture
React (frontend) and Tkinter (desktop-app) -> REST API (Express) -> MySQL. Only the backend holds DB credentials.

## Run the frontend (Stage 3)
`cd frontend && cp .env.example .env && npm install && npm run dev` then open http://localhost:5173
Flow to try: log in as citizen@demo.in, start an application, add a document, submit, book a slot.
Then log in at /staff-login as admin@demo.in to assign officer@demo.in, then as the officer to verify.

## Run the desktop admin app (Stage 4)
`cd desktop-app && pip install -r requirements.txt && python main.py`
Log in with admin@demo.in / Demo@1234. Set `PSP_API_URL` if the backend is not at http://localhost:5000/api.
The app only calls the REST API. It never holds database credentials.

## Email notifications (optional)
Fill the SMTP_* values in backend/.env. With SMTP_HOST empty, emails are skipped and only in-app notifications are sent.

## Documentation
- documentation/setup_guide.md (install, demo script, troubleshooting)
- documentation/api_documentation.md
- documentation/diagrams.md (architecture, ER, use case, DFD, status flow)
- documentation/testing.md and `cd backend && npm test`
- documentation/project_report.md
