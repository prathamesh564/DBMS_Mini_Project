# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Women Skill Development & Employment Portal

**Project Type:** DBMS Mini Project
**Database:** Supabase PostgreSQL
**Backend:** Node.js + Express.js
**Frontend:** Next.js (JavaScript)
**Architecture:** Three-tier architecture
**Database Schema:** `women_skill_portal`

---

# 1. Project Overview

## 1.1 Project Title

Women Skill Development & Employment Portal

## 1.2 Problem Statement

Many women face difficulties accessing professional training, developing market-relevant skills, finding suitable employment opportunities, and connecting with employers.

Existing opportunities may be scattered across different platforms, making it difficult to manage training, certifications, job applications, interviews, and employment records in one place.

The proposed system provides a centralized web portal that connects women, training providers, and employers.

## 1.3 Proposed Solution

The Women Skill Development & Employment Portal is a web application that enables women to:

* Register and maintain their profiles.
* Add skills and proficiency levels.
* Discover and enroll in training programs.
* Track training progress and certifications.
* Browse job opportunities.
* Apply for jobs and monitor application status.
* Track interviews and employment outcomes.

Training providers can manage their courses, while employers can publish vacancies and manage recruitment activities.

An administrator can oversee users, training programs, job listings, and portal activities.

## 1.4 Main Objectives

1. Provide a centralized platform for women's skill development.
2. Connect training programs with employment opportunities.
3. Simplify job applications and interview tracking.
4. Maintain structured, normalized relational data.
5. Demonstrate DBMS concepts through a working web application.
6. Provide secure access to information according to user roles.

---

# 2. Technology Stack

| Layer                | Technology                           | Purpose                               |
| -------------------- | ------------------------------------ | ------------------------------------- |
| Frontend             | Next.js                              | User interface and application pages  |
| Programming Language | JavaScript                           | Frontend and backend development      |
| UI Styling           | Tailwind CSS                         | Responsive design and styling         |
| Backend              | Node.js                              | Server-side JavaScript runtime        |
| API Framework        | Express.js                           | REST API development                  |
| Database             | Supabase PostgreSQL                  | Relational data storage               |
| Database Management  | Supabase SQL Editor                  | Schema creation and SQL queries       |
| Authentication       | Supabase Auth                        | User registration and login           |
| Authorization        | Role-based access control            | Restrict features based on user roles |
| Database Security    | PostgreSQL RLS                       | Restrict access to database rows      |
| Validation           | Express middleware                   | Validate requests and input data      |
| API Testing          | Postman                              | Test backend endpoints                |
| Version Control      | Git and GitHub                       | Source-code management                |
| Deployment           | Vercel and a Node.js hosting service | Host frontend and backend             |

### Why this stack?

* **Supabase PostgreSQL:** Provides relational tables, constraints, foreign keys, and SQL support.
* **Node.js and Express.js:** Connect the frontend to the database through controlled APIs.
* **Next.js:** Provides a responsive interface for women, training providers, employers, and administrators.
* **Supabase Auth:** Handles authentication without requiring you to build password management from scratch.

---

# 3. System Architecture

## 3.1 Architecture Diagram

```text
                USERS
                  |
                  v
       +----------------------+
       |     NEXT.JS UI       |
       |----------------------|
       | Login / Registration |
       | Women Dashboard      |
       | Training Dashboard   |
       | Employer Dashboard   |
       | Admin Dashboard      |
       +----------------------+
                  |
                  | HTTP / JSON
                  v
       +----------------------+
       | NODE.JS + EXPRESS.JS |
       |----------------------|
       | REST API Routes      |
       | Authentication      |
       | Authorization       |
       | Input Validation    |
       | Business Logic      |
       +----------------------+
                  |
                  | PostgreSQL connection
                  | using a database driver
                  v
       +----------------------+
       | SUPABASE POSTGRESQL  |
       |----------------------|
       | women_skill_portal   |
       |                      |
       | 1. Women             |
       | 2. Skills            |
       | 3. Women_Skills      |
       | 4. Training_Providers|
       | 5. Training_Programs |
       | 6. Enrollments       |
       | 7. Employers         |
       | 8. Job_Postings      |
       | 9. Job_Applications  |
       | 10. Interviews       |
       | 11. Certifications   |
       | 12. Employment_Records|
       +----------------------+
```

## 3.2 Data Flow

Example: A woman applies for a job.

1. The woman opens the job listing in Next.js.
2. She clicks the Apply button.
3. Next.js sends a request to the Express API.
4. Express verifies her authentication and permissions.
5. The backend validates the job and checks whether she has already applied.
6. Express inserts a record into `women_skill_portal.job_applications`.
7. PostgreSQL validates the foreign keys and uniqueness constraint.
8. The API returns the application result.
9. Next.js displays the updated application status.

**Important:** The frontend must not connect directly to PostgreSQL using database credentials. All privileged database operations must remain on the server.

---

# 4. User Roles

The application will support four roles.

## 4.1 Woman

A woman can:

* Register and log in.
* Maintain personal and educational details.
* Add skills and proficiency levels.
* View training programs.
* Enroll in courses.
* View training progress.
* View earned certifications.
* Browse jobs.
* Apply for jobs.
* Track applications and interviews.
* View employment records.

## 4.2 Training Provider

A training provider can:

* Maintain institution details.
* Create training programs.
* Update program details.
* View programs offered by their institution.
* View enrollment lists for their programs.
* Update training completion status and scores.
* Support the issuance of certificates.

## 4.3 Employer

An employer can:

* Maintain company information.
* Create job postings.
* Update and close vacancies.
* View applications for their jobs.
* Shortlist candidates.
* Schedule interviews.
* Record recruitment outcomes.

## 4.4 Administrator

An administrator can:

* View portal statistics.
* Manage user access.
* Review training providers and employers.
* Monitor training programs.
* Monitor job postings.
* Review applications and employment outcomes.
* Manage inappropriate or expired listings.

Administrative actions must be restricted to authorized users.

---

# 5. Database Requirements

## 5.1 Schema

Schema name:

`women_skill_portal`

All 12 tables belong to this schema.

## 5.2 Table Specifications

### Table 1: Women

**Purpose:** Stores registered women's profiles.

Important attributes:

* `woman_id` — Primary key.
* `full_name` — Full name.
* `email` — Unique email address.
* `phone` — Contact number.
* `education_level` — Educational qualification.
* `address` — Address.

**Operations:** Create, view, and update profiles.

### Table 2: Skills

**Purpose:** Maintains the list of available skills.

Important attributes:

* `skill_id` — Primary key.
* `skill_name` — Unique skill name.
* `category` — Skill category.
* `description` — Skill description.

**Operations:** Add, view, update, and manage skills.

### Table 3: Women_Skills

**Purpose:** Connects women with their skills.

Important attributes:

* `woman_id` — Foreign key.
* `skill_id` — Foreign key.
* `proficiency_level` — Skill proficiency.

**Primary key:** `(woman_id, skill_id)`.

**Operations:** Add and remove skills from a woman's profile and update proficiency.

### Table 4: Training_Providers

**Purpose:** Stores institutions offering training.

Important attributes:

* `provider_id` — Primary key.
* `provider_name` — Institution name.
* `email` — Contact email.
* `phone` — Contact number.
* `address` — Institution address.

**Operations:** Manage training institution details.

### Table 5: Training_Programs

**Purpose:** Stores courses offered by training providers.

Important attributes:

* `program_id` — Primary key.
* `provider_id` — Foreign key.
* `program_name` — Course name.
* `duration_weeks` — Course duration.
* `course_fee` — Course fee.

**Operations:** Create, view, update, and manage training programs.

### Table 6: Enrollments

**Purpose:** Records enrollment in training programs.

Important attributes:

* `enrollment_id` — Primary key.
* `woman_id` — Foreign key.
* `program_id` — Foreign key.
* `enrollment_date` — Enrollment date.
* `completion_status` — Training status.

**Operations:** Enroll women and track progress.

The unique constraint on `(woman_id, program_id)` prevents duplicate enrollment records for the same woman and program.

### Table 7: Employers

**Purpose:** Stores company information.

Important attributes:

* `employer_id` — Primary key.
* `company_name` — Company name.
* `industry` — Industry.
* `email` — Unique company email.
* `phone` — Contact number.
* `address` — Company address.

**Operations:** Manage employer profiles.

### Table 8: Job_Postings

**Purpose:** Stores job vacancies.

Important attributes:

* `job_id` — Primary key.
* `employer_id` — Foreign key.
* `job_title` — Job title.
* `job_description` — Job details.
* `salary` — Offered salary.
* `job_location` — Location.
* `employment_type` — Employment type.
* `posted_date` — Posting date.

**Operations:** Publish, view, update, and close jobs.

### Table 9: Job_Applications

**Purpose:** Stores applications submitted by women.

Important attributes:

* `application_id` — Primary key.
* `woman_id` — Foreign key.
* `job_id` — Foreign key.
* `application_date` — Application date.
* `application_status` — Current status.

**Operations:** Apply for jobs and track application progress.

The unique constraint on `(woman_id, job_id)` prevents duplicate applications for the same job.

### Table 10: Interviews

**Purpose:** Stores interview schedules and outcomes.

Important attributes:

* `interview_id` — Primary key.
* `application_id` — Foreign key.
* `interview_date` — Interview date and time.
* `interview_mode` — Online, offline, or telephone.
* `interview_status` — Interview status.

**Operations:** Schedule interviews and record results.

### Table 11: Certifications

**Purpose:** Records certificates earned by women.

Important attributes:

* `certification_id` — Primary key.
* `woman_id` — Foreign key.
* `program_id` — Foreign key.
* `certificate_name` — Certificate name.
* `issue_date` — Issue date.
* `certificate_number` — Unique certificate number.

**Operations:** Issue and view certificates.

### Table 12: Employment_Records

**Purpose:** Tracks employment outcomes.

Important attributes:

* `employment_id` — Primary key.
* `woman_id` — Foreign key.
* `job_id` — Foreign key.
* `joining_date` — Joining date.
* `salary` — Offered salary.
* `employment_status` — Current employment status.

**Operations:** Record successful placements and track employment status.

---

# 6. Functional Requirements

## FR-01: Registration and Authentication

* Users must be able to register and log in.
* Authentication should use Supabase Auth.
* Each user must be associated with an application role.
* Only authorized users can access protected features.
* Users must be able to log out.

**Database:** Supabase Auth and the application profile data associated with `Women`, `Training_Providers`, or `Employers`.

**Note:** The existing 12 tables do not contain an application user-role table. A separate `user_profiles` table is recommended to map Supabase Auth user IDs to roles. Authentication accounts should not be stored as plain-text passwords in the `Women` table.

## FR-02: Women Profile Management

* Women can view their profile.
* Women can update their educational details.
* Women can maintain contact information.
* Women can add skills and proficiency levels.

**Tables:** `Women`, `Skills`, `Women_Skills`.

## FR-03: Training Management

* Training providers can publish courses.
* Women can browse courses.
* Women can enroll in a course.
* Providers can update course completion information.
* Women can view their enrollment status.

**Tables:** `Training_Providers`, `Training_Programs`, `Enrollments`.

## FR-04: Certification Management

* Completed training can lead to a certificate.
* Authorized providers can record certificate details.
* Women can view their certificates.

**Tables:** `Enrollments`, `Certifications`.

A business rule should prevent certificates from being issued for incomplete training unless an explicit exception is allowed.

## FR-05: Job Management

* Employers can publish vacancies.
* Women can view available jobs.
* Employers can update and close their postings.
* Job details must include the employer and job description.

**Tables:** `Employers`, `Job_Postings`.

## FR-06: Job Application Management

* Women can apply for available jobs.
* The system must prevent duplicate applications.
* Women can view application statuses.
* Employers can review applications for their own jobs.

**Tables:** `Job_Postings`, `Job_Applications`, `Women`.

## FR-07: Interview Management

* Employers can schedule interviews.
* Applicants can view their interview schedules.
* Authorized employers can update interview statuses.
* The system can store feedback where appropriate.

**Tables:** `Interviews`, `Job_Applications`.

## FR-08: Employment Tracking

* Authorized users can record successful placements.
* Employment information must reference a woman and a job.
* Administrators can view employment statistics.
* Employment status can be updated when circumstances change.

**Table:** `Employment_Records`.

## FR-09: Dashboard and Reports

The portal should provide:

* Total registered women.
* Total available skills.
* Total training programs.
* Total enrollments.
* Total employers.
* Total open job postings.
* Total applications.
* Total interviews.
* Total certifications.
* Total employment placements.

Statistics should be calculated from database queries instead of stored as duplicate values.

---

# 7. Backend Requirements: Node.js and Express.js

## 7.1 Backend Structure

Recommended folder structure:

```text
backend/
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   └── validate.js
│   │
│   ├── routes/
│   │   ├── women.routes.js
│   │   ├── skills.routes.js
│   │   ├── training.routes.js
│   │   ├── enrollment.routes.js
│   │   ├── employers.routes.js
│   │   ├── jobs.routes.js
│   │   ├── applications.routes.js
│   │   ├── interviews.routes.js
│   │   ├── certifications.routes.js
│   │   └── employment.routes.js
│   │
│   ├── controllers/
│   │   ├── women.controller.js
│   │   ├── skills.controller.js
│   │   ├── training.controller.js
│   │   ├── jobs.controller.js
│   │   └── applications.controller.js
│   │
│   ├── services/
│   │   ├── women.service.js
│   │   ├── training.service.js
│   │   └── jobs.service.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .gitignore
└── package.json
```

Additional controllers and services should be created for the remaining modules as implementation progresses.

## 7.2 API Endpoints

Use the base URL:

`/api/v1`

### Women

| Method | Endpoint     | Purpose                           |
| ------ | ------------ | --------------------------------- |
| GET    | `/women/me`  | Get the logged-in woman's profile |
| PUT    | `/women/me`  | Update the profile                |
| GET    | `/women/:id` | View an authorized profile        |

### Skills

| Method | Endpoint                    | Purpose                                  |
| ------ | --------------------------- | ---------------------------------------- |
| GET    | `/skills`                   | List skills                              |
| POST   | `/skills`                   | Create a skill; authorized role required |
| POST   | `/women/me/skills`          | Add a skill to the profile               |
| DELETE | `/women/me/skills/:skillId` | Remove a skill                           |

### Training

| Method | Endpoint                        | Purpose                   |
| ------ | ------------------------------- | ------------------------- |
| GET    | `/training/programs`            | List training programs    |
| GET    | `/training/programs/:id`        | Get program details       |
| POST   | `/training/programs`            | Create a program          |
| PUT    | `/training/programs/:id`        | Update a program          |
| POST   | `/training/programs/:id/enroll` | Enroll in a program       |
| GET    | `/training/enrollments/me`      | View personal enrollments |

### Employers and Jobs

| Method | Endpoint                 | Purpose                                 |
| ------ | ------------------------ | --------------------------------------- |
| POST   | `/employers`             | Create an employer profile              |
| GET    | `/jobs`                  | List job postings                       |
| GET    | `/jobs/:id`              | View job details                        |
| POST   | `/jobs`                  | Publish a job                           |
| PUT    | `/jobs/:id`              | Update a job                            |
| POST   | `/jobs/:id/apply`        | Apply for a job                         |
| GET    | `/applications/me`       | View personal applications              |
| GET    | `/jobs/:id/applications` | View applications for an employer's job |

### Interviews

| Method | Endpoint                       | Purpose                             |
| ------ | ------------------------------ | ----------------------------------- |
| POST   | `/applications/:id/interviews` | Schedule an interview               |
| GET    | `/interviews/me`               | View authorized interview schedules |
| PATCH  | `/interviews/:id`              | Update interview details or status  |

### Certifications and Employment

| Method | Endpoint             | Purpose                                  |
| ------ | -------------------- | ---------------------------------------- |
| GET    | `/certifications/me` | View personal certificates               |
| POST   | `/certifications`    | Record an authorized certificate         |
| GET    | `/employment/me`     | View personal employment records         |
| POST   | `/employment`        | Record a verified placement              |
| GET    | `/admin/statistics`  | Retrieve authorized dashboard statistics |

All endpoints must validate the caller's identity and permissions.

---

# 8. Database Connection Requirements

The Node.js backend will connect to Supabase PostgreSQL.

## 8.1 Recommended Method

Use the PostgreSQL driver `pg` with a Supabase connection string.

Install the packages:

```bash
npm install express pg dotenv cors
```

Use environment variables:

```env
PORT=5000
DATABASE_URL=your_supabase_postgresql_connection_string
```

Do not commit `.env` to GitHub.

## 8.2 Database Configuration

The backend database configuration should:

1. Create a PostgreSQL connection pool.
2. Read the connection string from an environment variable.
3. Use parameterized SQL queries.
4. Handle database errors.
5. Close connections when the server shuts down.

For example, a query should use parameters rather than concatenate user input:

```javascript
const result = await pool.query(
  `SELECT woman_id, full_name, email
   FROM women_skill_portal.women
   WHERE woman_id = $1`,
  [womanId]
);
```

The `$1` parameter helps prevent SQL injection.

**Security requirement:** If the application connects directly using a privileged database account, PostgreSQL RLS policies may not protect data in the way you expect. Prefer a restricted database role, enforce authorization in the backend, and configure appropriate RLS policies for the application's access model. Never expose database credentials or Supabase service-role keys to the browser.

---

# 9. Frontend Requirements: Next.js

## 9.1 Recommended Structure

```text
frontend/
│
├── app/
│   ├── page.js
│   ├── login/
│   │   └── page.js
│   ├── register/
│   │   └── page.js
│   ├── dashboard/
│   │   └── page.js
│   ├── profile/
│   │   └── page.js
│   ├── skills/
│   │   └── page.js
│   ├── training/
│   │   └── page.js
│   ├── jobs/
│   │   ├── page.js
│   │   └── [id]/
│   │       └── page.js
│   ├── applications/
│   │   └── page.js
│   ├── interviews/
│   │   └── page.js
│   ├── certifications/
│   │   └── page.js
│   ├── employment/
│   │   └── page.js
│   └── admin/
│       └── page.js
│
├── components/
│   ├── Navbar.js
│   ├── Sidebar.js
│   ├── JobCard.js
│   ├── TrainingCard.js
│   ├── ProfileForm.js
│   └── StatusBadge.js
│
├── services/
│   └── api.js
│
├── .env.local
└── package.json
```

## 9.2 Required Pages

### Home Page

* Project introduction.
* Main features.
* Training and employment highlights.
* Login and registration buttons.

### Registration and Login

* User registration.
* Login and logout.
* Role-based dashboard navigation.
* Form validation and error messages.

### Women Dashboard

* Profile summary.
* Skills.
* Training enrollments.
* Recommended or available jobs.
* Application statuses.
* Interviews.
* Certifications.
* Employment information.

### Training Dashboard

* Available training programs.
* Program descriptions.
* Provider details.
* Enrollment actions.
* Training progress.

### Jobs Dashboard

* Job listing cards.
* Search by job title.
* Filter by location and employment type.
* Job detail page.
* Apply button.
* Application tracking.

### Employer Dashboard

* Company profile.
* Create and manage job postings.
* View applications.
* Shortlist candidates.
* Schedule interviews.

### Administrator Dashboard

* User statistics.
* Training statistics.
* Job statistics.
* Application statistics.
* Employment outcomes.

---

# 10. Database Normalization

The schema is designed around 1NF, 2NF, and 3NF.

## 10.1 First Normal Form (1NF)

**Rule:** Each attribute should contain an atomic value, without repeating groups.

Application:

* Each woman has a separate record.
* Each skill has its own record.
* Multiple skills are represented using separate `Women_Skills` rows.
* Multiple applications are represented using separate `Job_Applications` rows.

## 10.2 Second Normal Form (2NF)

**Rule:** Every non-key attribute must depend on the whole candidate key.

Application:

`Women_Skills` uses a composite primary key:

`(woman_id, skill_id)`

The proficiency level depends on the particular woman-skill combination.

Skill descriptions are stored in `Skills`, while personal details are stored in `Women`.

This avoids partial dependencies.

## 10.3 Third Normal Form (3NF)

**Rule:** Non-key attributes must not depend transitively on a candidate key.

Application:

* Company details are stored in `Employers`.
* Job details are stored in `Job_Postings`.
* Training provider details are stored in `Training_Providers`.
* Course details are stored in `Training_Programs`.
* Personal details are stored in `Women`.

For example, the employer's name is not repeated in every job posting. The job posting references `employer_id`.

**Expected outcome:** Reduced redundancy and fewer insertion, update, and deletion anomalies.

The final implementation should be checked against the actual functional dependencies of all attributes before claiming formal 3NF compliance.

---

# 11. Relationships and Participation Constraints

## 11.1 Relationship Cardinality

| Relationship                           | Cardinality |
| -------------------------------------- | ----------- |
| Women — Skills                         | M:N         |
| Training Providers — Training Programs | 1:N         |
| Women — Enrollments                    | 1:N         |
| Training Programs — Enrollments        | 1:N         |
| Employers — Job Postings               | 1:N         |
| Women — Job Applications               | 1:N         |
| Job Postings — Job Applications        | 1:N         |
| Job Applications — Interviews          | 1:N         |
| Women — Certifications                 | 1:N         |
| Training Programs — Certifications     | 1:N         |
| Women — Employment Records             | 1:N         |
| Job Postings — Employment Records      | 1:N         |

## 11.2 Participation Constraints

**Total participation** means every entity on the specified side must participate in the relationship.

**Partial participation** means participation is optional.

| Relationship                           | Participation            | Explanation                                        |
| -------------------------------------- | ------------------------ | -------------------------------------------------- |
| Women — Women_Skills                   | Partial for Women        | A woman can register without adding a skill.       |
| Skills — Women_Skills                  | Partial for Skills       | A skill may exist before anyone selects it.        |
| Training Providers — Training Programs | Partial for providers    | A provider can register before creating a program. |
| Training Programs — Training Providers | Total for programs       | Every program must reference a provider.           |
| Women — Enrollments                    | Partial for Women        | A woman need not enroll in a course.               |
| Training Programs — Enrollments        | Partial for programs     | A program may have no enrollments.                 |
| Employers — Job Postings               | Partial for Employers    | An employer may register before posting a job.     |
| Job Postings — Employers               | Total for postings       | Every posting must reference an employer.          |
| Women — Job Applications               | Partial for Women        | A woman may not apply for a job.                   |
| Job Postings — Job Applications        | Partial for postings     | A job may receive no applications.                 |
| Job Applications — Interviews          | Partial for applications | An application may not reach the interview stage.  |
| Women — Certifications                 | Partial for Women        | A woman may not have a certificate.                |
| Women — Employment Records             | Partial for Women        | A woman may not yet be employed.                   |

In the relational schema, `NOT NULL` foreign keys enforce mandatory references on the child side. They do not automatically enforce that every parent has at least one child record.

---

# 12. Security Requirements

The portal handles personal and employment information, so security is essential.

1. Use Supabase Auth for authentication.
2. Store user roles in a dedicated profile table.
3. Enforce authorization in Express middleware.
4. Validate all request bodies and URL parameters.
5. Use parameterized SQL queries.
6. Configure appropriate PostgreSQL RLS policies.
7. Restrict employers to applications for their own jobs.
8. Restrict providers to programs they manage.
9. Restrict women to their own profile and personal records.
10. Never expose database passwords or privileged service keys in frontend code.

The existing 12-table schema should be supplemented with a `user_profiles` table for authentication-to-role mapping if the portal supports multiple account types.

---

# 13. Non-Functional Requirements

## Performance

* Use pagination for jobs, applications, and training programs.
* Add indexes to frequently queried foreign keys and filter columns when appropriate.
* Avoid loading all records at once.
* Use efficient SQL joins for dashboard data.

## Reliability

* Validate data before insertion.
* Use database constraints to protect referential integrity.
* Use transactions for multi-step operations.
* Return clear error messages without exposing database internals.

## Usability

* Use responsive layouts.
* Provide simple forms.
* Show clear application and enrollment statuses.
* Display loading states and useful validation messages.

## Maintainability

* Keep routes, controllers, services, and database configuration separate.
* Use consistent naming conventions.
* Store secrets in environment variables.
* Track source-code changes through Git.

---

# 14. Testing Requirements

## Database Testing

Verify that:

* All 12 tables are created successfully.
* Primary keys are unique.
* Foreign keys reject invalid references.
* Email uniqueness constraints work.
* Duplicate skill mappings are rejected.
* Duplicate enrollments are rejected.
* Duplicate applications for the same job are rejected.

## Backend Testing

Verify that:

* Valid API requests succeed.
* Invalid inputs return appropriate errors.
* Unauthenticated requests to protected endpoints are rejected.
* Unauthorized roles cannot access restricted operations.
* Users cannot access another user's private information.
* Employers cannot manage another employer's job postings.

## Frontend Testing

Verify that:

* Registration and login work.
* Dashboard navigation is correct.
* Profile updates are reflected in the database.
* Training enrollment works.
* Job applications are displayed correctly.
* Interview details and certificates appear correctly.
* Errors are displayed in a user-friendly manner.

## Integration Testing

Verify the complete data flow:

`Next.js → Express.js → Supabase PostgreSQL → Express.js → Next.js`

---

# 15. Implementation Roadmap

## Phase 1: Database Setup

* Create the `women_skill_portal` schema.
* Create the 12 tables in dependency order.
* Verify primary and foreign keys.
* Test constraints.
* Insert sample data.

**Deliverable:** Working PostgreSQL database.

## Phase 2: Backend Setup

* Initialize the Node.js project.
* Install Express and PostgreSQL dependencies.
* Configure the database connection.
* Create routes and controllers.
* Implement authentication verification.
* Implement role-based authorization.
* Test APIs using Postman.

**Deliverable:** Working REST API.

## Phase 3: Frontend Setup

* Create the Next.js project.
* Configure Tailwind CSS.
* Create shared components.
* Implement login and registration pages.
* Build dashboards.
* Connect frontend pages to backend endpoints.

**Deliverable:** Working web interface.

## Phase 4: Business Logic

* Implement profile and skill management.
* Implement training and enrollment workflows.
* Implement job postings and applications.
* Implement interviews and certifications.
* Implement employment tracking.

**Deliverable:** Complete core portal functionality.

## Phase 5: Security and Testing

* Configure RLS policies.
* Test role permissions.
* Test all database relationships.
* Validate error handling.
* Test the full application flow.

**Deliverable:** Tested and secured mini project.

## Phase 6: Documentation and Demonstration

* Prepare the ER diagram.
* Document the relational schema.
* Explain normalization.
* Explain participation constraints.
* Demonstrate SQL joins and aggregate queries.
* Prepare screenshots and a project report.

**Deliverable:** Final DBMS mini-project submission.

---

# 16. Final Acceptance Criteria

The project will be considered complete when:

* The 12 database tables exist and work correctly.
* The schema preserves referential integrity.
* The database design follows 1NF, 2NF, and 3NF.
* Users can register and access authorized features.
* Women can maintain profiles and skills.
* Training providers can manage training programs.
* Women can enroll in training programs.
* Employers can publish jobs.
* Women can apply for jobs.
* Employers can manage applications and interviews.
* Certifications and employment outcomes can be recorded.
* Dashboard statistics are generated from SQL queries.
* The Next.js frontend communicates with the Express backend.
* Database access is appropriately secured.
* The project can be demonstrated end-to-end.

---

# 17. Conclusion

The Women Skill Development & Employment Portal provides an integrated platform for women's professional development and employment.

Its normalized PostgreSQL database manages profiles, skills, training programs, enrollments, employers, jobs, applications, interviews, certifications, and employment records.

The combination of Supabase PostgreSQL, Node.js, Express.js, and Next.js demonstrates core DBMS concepts alongside practical full-stack development.

The final deliverable is a functional web application that demonstrates relational database design, SQL operations, REST APIs, authentication, authorization, normalization, participation constraints, and real-world data management.
