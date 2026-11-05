# Passport Seva Portal: Smart Passport Application, Verification and Management System

**Academic project report**
Submitted by: Ayush Mukti Mohanty
College / Department: [fill in]  |  Guide: [fill in]  |  Academic year: 2026-27

> This is an academic demonstration. It is not an official Government of India service. All data is dummy and all verification is simulated.

## Abstract
The project builds a web portal inspired by the Indian Passport Seva system. Citizens register, apply for a new or reissued passport, upload documents, book an appointment and track progress. Verification officers review documents and add remarks. Administrators assign officers, decide applications in a simulated workflow, manage appointment slots and view statistics. A separate Python Tkinter desktop application gives administrators the same management tools. The system uses React, Node.js with Express, MySQL, JWT and bcrypt, with a lotus-inspired Indian visual theme.

## 1. Introduction
Paper-based passport processing is slow and hard to track. A central digital platform gives applicants visibility and gives staff a structured workflow. This project demonstrates that idea end to end using modern full-stack tools.

## 2. Objectives
1. Provide secure registration and login with role-based access.
2. Digitise the new and reissue passport application with validation.
3. Support secure document upload and officer verification.
4. Offer appointment booking without double booking.
5. Give citizens a clear status tracker and downloadable receipt.
6. Give administrators dashboards, reports and a desktop management tool.

## 3. Scope and limitations
In scope: three roles, ten database tables, thirteen modules, simulated approval. Out of scope: real identity checks, payment, police verification, real passport issuance, SMS. Approved (Simulated) never means a passport exists.

## 4. Technology stack
| Layer | Technology | Why |
|---|---|---|
| Web frontend | React, Vite, React Router, Axios, Recharts, CSS | Component-based, responsive UI and charts |
| Backend | Node.js, Express | Simple REST API with middleware |
| Desktop | Python Tkinter, requests | Admin tool that reuses the same API |
| Database | MySQL | Relational integrity with foreign keys |
| Security | JWT, bcrypt, Helmet, parameterised queries | Standard protections |
| Files and mail | Multer, PDFKit, Nodemailer | Uploads, receipts, notifications |

## 5. System design
Architecture, ER, DFD, use case and status diagrams are in `diagrams.md`.
**Architecture.** React and Tkinter are clients of one Express API. Only the API reaches MySQL, so database credentials never leave the server.
**Database.** `passport_seva_db` has ten tables: users, user_profiles, passport_applications, application_documents, appointments, verification_records, application_status_history, notifications, admin_users, officer_users. Keys, unique constraints and indexes on status, user, officer and slot date support the main queries. The schema is normalised: profile data is separate from login data, and every status change is recorded in a history table.
**Workflow.** Draft, Submitted, Appointment Scheduled, Under Verification, Documents Required, Verification Completed, then Approved (Simulated) or Rejected (Simulated). The server enforces the order, for example approval is only possible after verification is completed.

## 6. Implementation
- **Authentication:** bcrypt hashes (cost 10), JWT with role claim, separate tables for citizens, officers and admins.
- **Application and documents:** server-side validation of every field, reference number `PSP-YEAR-NNNNN` generated at submission inside a transaction, uploads limited to PDF/JPG/PNG up to 2 MB and stored under random names.
- **Appointments:** a single conditional UPDATE claims a slot only if it is free, so two users cannot book the same slot.
- **Verification:** officers see only their assigned applications and documents; remarks are mandatory.
- **Notifications:** every status change writes an in-app notification and optionally sends an email.
- **Dashboards:** SQL aggregates feed cards and charts (monthly totals, status split).
- **Receipt:** generated as a PDF with a demo disclaimer.
- **Desktop app:** login, dashboard, application manager, document verification window, citizens, appointments and CSV reports, all through the API.
- **Theme:** navy with lotus pink, saffron and green accents, a lotus logo and a tricolour strip, applied to both web and desktop.

## 7. Security measures
Passwords are hashed. All queries are parameterised. Inputs are validated on client and server. Role checks guard every route. Document access is limited to the owner, assigned officer or admin. Helmet sets secure headers. Secrets live in `.env`. Only dummy data is used.

## 8. Testing
See `testing.md`: an automated end-to-end script and 30 manual cases covering validation, security, workflow rules, both interfaces and responsiveness. [Insert measured results and screenshots after running.]

## 9. Results
The system delivers the full workflow for all three roles, with consistent validation, auditable history and a consistent interface across web and desktop. [Add screenshots: home, dashboard, application form, tracking, admin charts, officer review, desktop app.]

## 10. Limitations and future work
Real identity verification, payments, SMS alerts, multi-language (Hindi and regional) support, document virus scanning, rate limiting, audit export and a mobile app are natural extensions.

## 11. Conclusion
The project shows how a role-based government-service workflow can be built securely with a React front end, an Express API, MySQL and a desktop client, while clearly staying a simulation.

## References
Official Passport Seva website (for inspiration only); Node.js, Express, React, MySQL, Tkinter, bcrypt and JWT documentation.
