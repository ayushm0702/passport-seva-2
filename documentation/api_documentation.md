# REST API Documentation

Base URL: `http://localhost:5000/api`. All responses use one shape:
`{ "success": true|false, "message": "...", "data": ..., "errors": {field: message} }`.
Protected routes need `Authorization: Bearer <JWT>`. Roles: `citizen`, `officer`, `admin`.
Status codes: 200 OK, 201 Created, 401 not logged in, 403 wrong role, 404 not found, 409 conflict, 422 validation failed, 500 server error.

## Authentication
| Method | Path | Role | Body | Purpose |
|---|---|---|---|---|
| POST | /auth/register | public | full_name, email, phone, password | Create a citizen, returns token |
| POST | /auth/login | public | role (citizen/admin/officer), email, password | Returns token and user |

## Citizen profile
| Method | Path | Role | Body | Purpose |
|---|---|---|---|---|
| GET | /users/me | citizen | | Profile |
| PUT | /users/me | citizen | full_name, phone, dob, gender, address, city, state, pincode | Save profile |

## Applications (citizen)
| Method | Path | Notes |
|---|---|---|
| GET | /applications | Own applications |
| POST | /applications | Create draft. Fields: application_type (New/Reissue), service_mode (Normal/Tatkaal), given_name, surname, dob, gender, birth_place, address, old_passport_no (required for Reissue, format K1234567) |
| GET | /applications/:id | Own application with its documents |
| POST | /applications/:id/documents | multipart: doc_type, file (PDF/JPG/PNG, max 2 MB) |
| POST | /applications/:id/submit | Needs at least one document. Returns `reference_no` (PSP-YYYY-NNNNN) |
| GET | /applications/track/:ref | Status, history and simulated-outcome notice |
| GET | /applications/:id/receipt | PDF receipt (after submission) |

## Appointments (citizen)
| Method | Path | Notes |
|---|---|---|
| GET | /appointments/available | Free future slots |
| GET | /appointments/mine | Booking history |
| POST | /appointments/book | `{application_id, slot_id}`. Application must be Submitted. Booking is atomic |

## Notifications (citizen)
| Method | Path | Notes |
|---|---|---|
| GET | /notifications | Latest 50 |
| PATCH | /notifications/:id/read | Mark read |

## Officer
| Method | Path | Notes |
|---|---|---|
| GET | /officer/applications | Applications assigned to this officer |
| GET | /officer/applications/:id | Details, documents, earlier remarks (assigned only) |
| POST | /officer/applications/:id/verify | `{status: Pending/Completed/Correction Required, remarks}`. Maps to Under Verification / Verification Completed / Documents Required |

## Administrator
| Method | Path | Notes |
|---|---|---|
| GET | /admin/stats | users, total, pending, verifying, completed, today, monthly, byStatus |
| GET | /admin/users?q= | Search citizens |
| PATCH | /admin/users/:id/active | `{is_active: bool}` |
| GET | /admin/applications?q=&status=&limit=&offset= | Search and filter |
| GET | /admin/applications/:id | Full detail, documents, officer remarks |
| GET | /admin/officers | Officer list |
| POST | /admin/applications/:id/assign | `{officer_id}` |
| PATCH | /admin/applications/:id/status | `{status, note}` allowed: Under Verification, Documents Required, Approved (Simulated), Rejected (Simulated). Approve/Reject only from Verification Completed |
| GET | /admin/slots | All slots and who booked them |
| POST | /admin/slots | `{slot_date, slot_time, center}` |
| DELETE | /admin/slots/:id | Free slots only |

## Documents
| Method | Path | Notes |
|---|---|---|
| GET | /documents/:id/file | Owner citizen, assigned officer or any admin |
