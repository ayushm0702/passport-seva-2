# Diagrams (Mermaid)
Render in GitHub, VS Code (Markdown Preview Mermaid Support) or https://mermaid.live, then export as PNG for the report.

## 1. System architecture
```mermaid
flowchart LR
  subgraph Clients
    A[React web app<br/>citizen, officer, admin]
    B[Python Tkinter<br/>admin desktop app]
  end
  A -- HTTPS JSON + JWT --> C
  B -- HTTPS JSON + JWT --> C
  subgraph Server
    C[Express REST API<br/>routes, middleware, controllers]
    D[(uploads folder)]
    E[Nodemailer]
  end
  C -- parameterised SQL --> F[(MySQL<br/>passport_seva_db)]
  C --> D
  C --> E
```

## 2. ER diagram
```mermaid
erDiagram
  users ||--o| user_profiles : has
  users ||--o{ passport_applications : submits
  users ||--o{ notifications : receives
  officer_users ||--o{ passport_applications : "assigned to"
  officer_users ||--o{ verification_records : writes
  passport_applications ||--o{ application_documents : contains
  passport_applications ||--o| appointments : books
  passport_applications ||--o{ verification_records : has
  passport_applications ||--o{ application_status_history : logs
  users { int id PK
    string email UK
    string password_hash
    string full_name
    string phone }
  passport_applications { int id PK
    string reference_no UK
    int user_id FK
    int officer_id FK
    enum application_type
    enum service_mode
    enum status }
  appointments { int id PK
    date slot_date
    time slot_time
    string center
    int application_id FK }
  application_documents { int id PK
    int application_id FK
    string doc_type
    string stored_name }
  verification_records { int id PK
    int application_id FK
    int officer_id FK
    enum status
    text remarks }
  application_status_history { int id PK
    int application_id FK
    string new_status
    enum changed_by_role }
  notifications { int id PK
    int user_id FK
    string title
    bool is_read }
  admin_users { int id PK
    string email UK
    string password_hash }
  officer_users { int id PK
    string email UK
    string employee_code UK }
  user_profiles { int user_id PK
    date dob
    string city
    string pincode }
```

## 3. Use case diagram
```mermaid
flowchart LR
  C((Citizen)) --- U1[Register and log in]
  C --- U2[Manage profile]
  C --- U3[Apply: new or reissue]
  C --- U4[Upload documents]
  C --- U5[Book appointment]
  C --- U6[Track status]
  C --- U7[Download receipt]
  C --- U8[View notifications]
  O((Verification officer)) --- V1[View assigned applications]
  O --- V2[Review documents]
  O --- V3[Add remarks and outcome]
  O --- V4[Forward to administrator]
  A((Administrator)) --- A1[View users and applications]
  A --- A2[Assign officer]
  A --- A3[Approve or reject - simulated]
  A --- A4[Request more information]
  A --- A5[Manage appointment slots]
  A --- A6[Reports and statistics]
  A --- A7[Manage user accounts]
```

## 4. Data flow diagram, level 0
```mermaid
flowchart LR
  C[Citizen] -- registration, application, documents, booking --> P((Passport Seva Portal))
  P -- reference number, status, receipt, notifications --> C
  O[Officer] -- verification remarks --> P
  P -- assigned applications, documents --> O
  A[Administrator] -- assignments, decisions, slots --> P
  P -- statistics, reports --> A
  P <--> DB[(passport_seva_db)]
```

## 5. Data flow diagram, level 1
```mermaid
flowchart TB
  C[Citizen] --> P1(1 Authenticate)
  P1 --> P2(2 Manage application)
  P2 --> P3(3 Upload documents)
  P3 --> P4(4 Book appointment)
  P4 --> P5(5 Verify)
  O[Officer] --> P5
  P5 --> P6(6 Decide - simulated)
  A[Administrator] --> P6
  P6 --> P7(7 Notify and track)
  P7 --> C
  P1 -.-> D1[(users)]
  P2 -.-> D2[(applications)]
  P3 -.-> D3[(documents)]
  P4 -.-> D4[(appointments)]
  P5 -.-> D5[(verification_records)]
  P6 -.-> D6[(status_history)]
  P7 -.-> D7[(notifications)]
```

## 6. Application status flow
```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Submitted: citizen submits
  Submitted --> AppointmentScheduled: slot booked
  AppointmentScheduled --> UnderVerification: admin assigns officer
  UnderVerification --> VerificationCompleted: officer completes
  UnderVerification --> DocumentsRequired: correction needed
  DocumentsRequired --> Submitted: citizen resubmits
  VerificationCompleted --> Approved: admin approves (simulated)
  VerificationCompleted --> Rejected: admin rejects (simulated)
```
