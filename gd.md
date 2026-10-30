ASK: Redesign My Existing EmpowerHer Frontend Using Google Stitch

Act as a senior Next.js frontend developer and UI/UX engineer.

I have already completed the backend for my EmpowerHer Skills Portal — Women Skill Development & Employment Portal. I now want you to update my existing frontend code to match my Google Stitch designs and implement all frontend pages and functionality required by my PRD.

IMPORTANT: My backend is already implemented. Do not rebuild, replace, or unnecessarily modify it. Focus on the existing frontend.

Do not create a separate demo application. Work directly inside my existing project repository.

1. EXISTING GOOGLE STITCH PROJECT

Use my existing Google Stitch project as the visual source of truth.

Project name: EmpowerHer Skills Portal
Project ID: 15368252446676767322
Device type: Desktop
Theme: Light mode
Font: Inter
Primary brand color: #6c3ce9
Design 1: Homepage and Opportunity Portal

Screen ID: 3311948e0f8e4a97bdf9d003f0bc97e8

Use this screen as the primary reference for:

Homepage layout.
Navigation bar.
Hero section.
Calls to action.
Featured training programs.
Featured employment opportunities.
Platform benefits.
Footer.
Design 2: Candidate Personal Dashboard

Screen ID: 9f34be8c667c4c018900cf2f56d96e86

Use this screen as the reference for:

Candidate dashboard layout.
Profile summary.
Skills overview.
Training progress.
Job application status.
Upcoming interviews.
Certifications.
Dashboard navigation and cards.
Design 3: Training Programs and Course Marketplace

Screen ID: 165de445a4fe48d08d85f6e42978de3e

Use this screen as the reference for:

Training marketplace.
Program cards.
Search and filtering.
Course information.
Provider details.
Enrollment actions.
Design 4: Authentication and Role Selection

Screen ID: 819e4e472bbc4f94bf80519fb54801f9

Use this screen as the reference for:

Login.
Registration.
Role selection.
Authentication forms.
Validation messages.
Authentication-related layout and styling.
Design 5: EmpowerHer Career and Skill Platform

Screen ID: 74da3584678049688c3a5966e7a03bf2

Use this screen as an additional reference for:

Overall visual identity.
Layout patterns.
Typography.
Cards and buttons.
Shared components.
Spacing and visual consistency.
Design rules
Inspect the actual Stitch screens before implementing them whenever the available tools permit.
Reproduce their actual layouts, colors, typography, spacing, components, and visual hierarchy.
Use all five screens as references for a unified application.
Do not invent a completely different design.
Do not replace the designs with a generic dashboard template.
Maintain the light theme, Inter font, and #6c3ce9 primary color.
Treat the screen dimensions as reference sizes, not fixed browser dimensions.
If you cannot access the Stitch project directly, ask me for screenshots or exported assets. Do not pretend to have inspected inaccessible designs.
2. INSPECT MY EXISTING FRONTEND FIRST

Before modifying the code, inspect my repository and identify:

Existing Next.js version and configuration.
Whether the project uses the App Router or Pages Router.
Current pages and routes.
Existing reusable components.
Tailwind CSS configuration.
Existing CSS files and theme variables.
Authentication implementation.
API service layer.
Environment variable configuration.
Existing loading, error, and validation handling.

My PRD specifies:

Next.js.
JavaScript.
Tailwind CSS.
Node.js and Express.js backend.
Supabase PostgreSQL database.
Supabase Auth.
Role-based access control.

Keep my existing technology stack and architecture.

Do not replace working frontend functionality just to make the redesign easier.

After inspecting the repository, proceed with implementing the redesign rather than stopping after providing an analysis or plan.

3. UPDATE THE ACTUAL FRONTEND CODE

Modify my existing source files to reproduce the Stitch designs.

Implement or improve:

Global styling and theme.
Shared page layouts.
Navigation components.
Sidebar components.
Buttons and forms.
Dashboard cards.
Data tables.
Search and filter components.
Status badges.
Modals and dialogs.
Loading indicators.
Empty states.
Error messages.
Responsive layouts.

Create reusable components where appropriate.

Maintain consistent styling across every page.

Do not duplicate large blocks of code across different pages.

4. IMPLEMENT ALL REQUIRED FRONTEND PAGES

Follow the pages and functionality defined in my PRD.

A. Public homepage

Follow Stitch Design 1.

Implement:

Navigation bar.
Hero section.
Platform introduction.
Training program highlights.
Job opportunity highlights.
Platform benefits.
Login and registration buttons.
Footer.

Connect training and job highlights to the existing APIs wherever supported.

B. Authentication

Follow Stitch Design 4.

Implement:

Login page.
Registration page.
User role selection.
Form validation.
Loading and error states.
Logout.
Protected routes.
Role-appropriate redirects.

Integrate with my existing authentication implementation.

Supported roles:

Woman / Candidate.
Training Provider.
Employer.
Administrator.

Do not replace the existing authentication system with a fake login implementation.

C. Candidate dashboard

Follow Stitch Design 2 as closely as possible.

Implement:

Candidate profile summary.
Skills overview.
Training enrollments.
Training progress.
Recommended or available jobs.
Job application statuses.
Upcoming interviews.
Certifications.
Employment records.
Relevant dashboard statistics.

Connect the interface to my existing backend APIs.

Display real data when available.

Provide appropriate loading, empty, and error states.

D. Training marketplace

Follow Stitch Design 3.

Implement:

Training program listing.
Program cards.
Search and filters.
Training provider information.
Course details.
Enrollment actions.
Enrollment status.
Training progress where supported.

Use the existing training and enrollment API endpoints.

E. Job marketplace

Implement:

Job listings.
Job search.
Location filters.
Employment-type filters.
Job details.
Employer information.
Apply action.
Application status.
Application history.

Use the existing backend endpoints.

Prevent duplicate submissions in the UI and display backend validation errors correctly.

F. Training provider dashboard

Implement the frontend required for training providers to:

View their dashboard.
Manage their provider profile.
View their training programs.
Create or edit programs where supported.
View enrolled candidates.
Update training-related information where supported by the backend.
G. Employer dashboard

Implement the frontend required for employers to:

Manage company information.
Create and edit job postings.
View their job listings.
Close vacancies.
Review job applications.
Shortlist candidates.
Schedule interviews.
View relevant recruitment information.
H. Administrator dashboard

Implement:

Dashboard statistics.
User management.
Training provider management.
Training program oversight.
Employer management.
Job posting oversight.
Application statistics.
Employment outcome summaries.

Use existing backend capabilities. If an administrative API is missing, report the missing capability rather than rebuilding the backend.

I. Additional pages

Implement or complete:

Candidate profile.
Skills management.
Training details.
Enrolled training programs.
Job details.
Job applications.
Interview schedules.
Certifications.
Employment records.
Relevant profile-management pages for employers and training providers.

Use the existing routing conventions and avoid creating duplicate routes for functionality that already exists.

5. CONNECT TO MY EXISTING BACKEND

This is a frontend redesign, not a backend rewrite.

Inspect the existing API service layer and reuse the available endpoints.

My PRD specifies the following API patterns:

/api/v1/women/me
/api/v1/women/me/skills
/api/v1/skills
/api/v1/training/programs
/api/v1/training/programs/:id
/api/v1/training/programs/:id/enroll
/api/v1/training/enrollments/me
/api/v1/jobs
/api/v1/jobs/:id
/api/v1/jobs/:id/apply
/api/v1/applications/me
/api/v1/jobs/:id/applications
/api/v1/applications/:id/interviews
/api/v1/interviews/me
/api/v1/certifications/me
/api/v1/employment/me
/api/v1/admin/statistics

These are the endpoint patterns described in my PRD. Verify the actual implemented routes in my backend before using them.

Do not assume every endpoint exists or change the frontend to call an endpoint without verifying its actual contract.

Preserve:

Existing API base URL.
Existing request and response formats.
Existing authentication headers or token handling.
Existing error-response format.
Existing environment variable names.
Existing backend business logic.

If my API service layer already handles requests, extend and reuse it.

If the frontend is not connected to the backend correctly, fix the integration without unnecessarily modifying backend code.

Never expose database credentials or privileged service keys in browser code.

6. DESIGN SYSTEM

Create a consistent design system based on the Stitch references.

Colors
Primary: #6c3ce9.
Theme: Light.
Use supporting colors consistent with the actual designs.
Use clear, consistent colors for application and enrollment statuses.
Typography
Font: Inter.
Maintain consistent heading sizes, font weights, line heights, and body text.
Components

Match the Stitch designs for:

Header and navigation.
Sidebar.
Cards.
Buttons.
Input fields.
Search bars.
Filter controls.
Tables.
Status badges.
Progress indicators.
Dialogs.
Dropdowns.
Forms.
Notifications.
Visual quality
Professional women's skill-development and employment platform.
Clean spacing and alignment.
Consistent border radii.
Subtle shadows where shown in the designs.
Appropriate visual hierarchy.
Consistent iconography.
Readable content.
Polished interactive states.

Use the existing icon library if one is installed.

Avoid unnecessary animations, excessive gradients, random colors, and inconsistent styles.

7. RESPONSIVE BEHAVIOR

Although the Stitch project is configured for desktop, make the application responsive.

Support:

Desktop.
Tablet.
Mobile.

Ensure that:

Navigation adapts to smaller screens.
Dashboard sidebars collapse appropriately.
Card grids adjust to the available width.
Tables remain usable on mobile.
Forms fit smaller screens.
Dialogs fit within the viewport.
Buttons remain accessible.
No horizontal overflow occurs unintentionally.

Preserve the desktop design as the primary visual reference.

8. FUNCTIONAL REQUIREMENTS

Every visible interactive control must have a meaningful action.

Implement:

Functional navigation.
Working search and filters.
Working form submissions.
Appropriate form validation.
Correct API calls.
Loading states.
Success feedback.
Error feedback.
Empty states.
Role-based page visibility.
Appropriate unauthorized and expired-session handling.

Use real API data for functional features.

Do not use hardcoded sample data as a substitute for an existing working backend.

If sample data is required for a visual fallback, keep it clearly separated from the real API implementation and do not present it as real user information.

9. IMPLEMENTATION RULES
Modify the existing frontend files.
Use JavaScript unless the current project already requires TypeScript.
Keep the existing Next.js routing architecture.
Use Tailwind CSS according to the existing configuration.
Reuse existing dependencies and components.
Do not create a second application.
Do not rebuild the backend.
Do not modify database tables unnecessarily.
Do not remove working features.
Do not overwrite environment configuration.
Do not expose secrets.
Do not add unnecessary packages.
Keep the code maintainable and modular.

Do not stop after creating the homepage. Complete all required pages and the shared components needed to support them.

10. VALIDATION

After implementation:

Run the available frontend build.
Run linting if configured.
Fix errors introduced by your changes.
Verify the required routes.
Verify authentication flows where possible.
Verify that API requests use the correct endpoints.
Verify forms, navigation, and interactive controls.
Check desktop, tablet, and mobile layouts.
Confirm that existing backend integrations remain intact.
Report any failures or features that could not be verified.

Do not claim that a build or test succeeded unless you actually ran it.

11. FINAL ACCEPTANCE CRITERIA

The task is complete when:

My existing frontend has been updated rather than replaced.
The homepage closely matches Stitch Design 1.
The candidate dashboard closely matches Stitch Design 2.
The training marketplace closely matches Stitch Design 3.
Authentication closely matches Stitch Design 4.
Stitch Design 5 informs the overall visual consistency.
All required PRD pages are implemented.
The four user roles have appropriate interfaces.
Existing backend APIs are used correctly.
The UI displays real data where available.
Existing authentication and authorization behavior is preserved.
Forms and navigation work.
The interface is responsive.
The project builds successfully, or any remaining build failures are documented.
FINAL COMMAND

Update my existing frontend source code now. Use my five Google Stitch screens as the visual reference and my PRD as the functional specification. My backend is already complete, so concentrate on frontend design, implementation, API integration, responsiveness, and testing.

Inspect the code first, then make the actual changes. Do not return only instructions, sample code, mockups, or a proposed plan.