# Installation and Setup Guide

## Prerequisites
Node.js 18+, MySQL 8, Python 3.10+ (with Tkinter; on Ubuntu `sudo apt install python3-tk`), Git optional.

## 1. Database
```
mysql -u root -p < database/schema.sql
mysql -u root -p < database/sample_data.sql
```

## 2. Backend
```
cd backend
cp .env.example .env      # set DB_PASSWORD and a long random JWT_SECRET
npm install
npm run seed              # creates demo accounts
npm start                 # http://localhost:5000/api/health
npm test                  # optional end-to-end check
```

## 3. Frontend
```
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## 4. Desktop admin app
```
cd desktop-app
pip install -r requirements.txt
python main.py
```

## How the parts connect
React and Tkinter both call the Express API (`VITE_API_URL` and `PSP_API_URL`). Only Express connects to MySQL, using credentials from `backend/.env`. Never commit `.env`.

## Demo accounts (password Demo@1234)
citizen@demo.in, officer@demo.in, admin@demo.in

## Demo script (5 minutes)
1. Citizen: register, start a new application, upload a PDF, submit, copy the reference number.
2. Citizen: book a slot, download the receipt.
3. Admin (web, /staff-login): assign officer@demo.in.
4. Officer: review documents, save "Completed" with remarks.
5. Admin: Approve (Simulated). Citizen: track and see the simulated notice.
6. Desktop app: dashboard, review documents, export CSV.

## Troubleshooting
- `ECONNREFUSED` or "Cannot reach the server": backend not running or wrong API URL.
- `ER_ACCESS_DENIED_ERROR`: wrong DB_USER or DB_PASSWORD in `.env`.
- "Invalid credentials" for demo users: run `npm run seed` again.
- No appointment slots: load `sample_data.sql` (slots are dated from today) or add slots as admin.
- CORS error: set `CLIENT_ORIGIN` to the exact frontend address.
- Upload rejected: only PDF, JPG, PNG up to 2 MB.
