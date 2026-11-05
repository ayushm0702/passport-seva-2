# Software Testing Documentation

## Approach
Unit-level checks are done by input validation in each controller. Integration is covered by an automated smoke test (`cd backend && npm test`) that walks the whole workflow through the REST API, plus the manual cases below for the web and desktop interfaces.

## Environment
Node.js 18+, MySQL 8, Python 3.10+, Chrome. Backend on port 5000, frontend on 5173. Database freshly loaded from `schema.sql`, `sample_data.sql`, and `npm run seed`.

## Automated test (backend/tests/smoke.js)
Covers 24 checks: health, validation errors, duplicate email, missing token (401), wrong role (403), draft creation, submit blocked without documents, file type rejection, upload, reference number format, slot booking, officer assignment, approval blocked before verification, remarks required, verification, simulated approval, tracking notice, history, PDF receipt, notifications.
Run it and paste the final line (`N passed, M failed`) into the results table.

## Manual test cases
| ID | Module | Steps | Expected | Result |
|---|---|---|---|---|
| TC01 | Register | Submit empty form | Inline errors on every field | |
| TC02 | Register | Valid details | Account created, lands on dashboard | |
| TC03 | Register | Reuse an email | "Email already registered" | |
| TC04 | Login | Wrong password | "Invalid credentials" | |
| TC05 | Login | Citizen opens /admin | Redirected away | |
| TC06 | Profile | Pincode "12" | Error: 6 digits | |
| TC07 | Application | Reissue without old passport number | Error shown | |
| TC08 | Application | Valid new application | Draft saved, goes to upload page | |
| TC09 | Documents | Upload .exe or .txt | Rejected: only PDF, JPG, PNG | |
| TC10 | Documents | Upload file over 2 MB | Rejected: 2 MB limit | |
| TC11 | Submit | Submit with no documents | Button disabled / error | |
| TC12 | Submit | Submit with a document | Reference PSP-YYYY-NNNNN shown | |
| TC13 | Appointment | Book a free slot | Status Appointment Scheduled | |
| TC14 | Appointment | Two users book the same slot | Second gets "no longer available" | |
| TC15 | Admin | Assign officer | Status Under Verification, citizen notified | |
| TC16 | Admin | Approve before verification | Blocked with message | |
| TC17 | Officer | Save verification with empty remarks | Rejected | |
| TC18 | Officer | Outcome Completed | Status Verification Completed | |
| TC19 | Officer | Outcome Correction Required | Status Documents Required | |
| TC20 | Admin | Approve (Simulated) | Citizen sees simulated notice | |
| TC21 | Tracking | Enter another user's reference | Not found | |
| TC22 | Receipt | Download after submit | PDF with demo disclaimer | |
| TC23 | Dashboard | Open admin overview | Stat cards and both charts load | |
| TC24 | Desktop | Log in with citizen credentials | "Invalid credentials" | |
| TC25 | Desktop | Review documents, open a PDF | File opens | |
| TC26 | Desktop | Export CSV report | File saved with rows | |
| TC27 | Security | Send `' OR 1=1 --` as login email | Rejected, no data leak | |
| TC28 | Security | Call /admin/stats with citizen token | 403 | |
| TC29 | Security | Open /api/documents/1/file as another citizen | 404 | |
| TC30 | Responsive | View at 375 px width | No sideways page scroll, nav wraps | |

Fill the Result column with Pass or Fail after running each case. Record any defect with its ID, steps and fix.

## Defect log
| Defect | Found in | Fix | Retested |
|---|---|---|---|
| | | | |
