Im creating a zoo management system. Here are the user stories of the application, form these you should be able to identify the required requirements of the app:
User Stories
1. Admin (Management) User Stories
•	As an admin, I want to create, update, and remove staff members, so that I can manage who has access to the app.
o	Acceptance Criteria: Admin can add new staff members, update their assigned sections, or remove them from the system.
•	As an admin, I want to assign specific animal groups (sections) to each staff member, so that they can only access relevant sections of the zoo.
o	Acceptance Criteria: Admin can assign one or more sections (e.g., big cats, reptiles) to each staff member.
•	As an admin, I want to add, update, and remove animal groups and camps, so that I can maintain accurate information about the zoo’s enclosures.
o	Acceptance Criteria: Admin can manage animal groups (e.g., primates, exotic birds) and associated camps (enclosures).
•	As an admin, I want to add animals with their relevant information to animal groups, so that staff can view details about the animals they care for.
o	Acceptance Criteria: Admin can input animal details (species, name, health info) and associate them with specific animal groups.
•	As an admin, I want to CRUD species, so that I can keep the animal records up to date and accurate.
o	Acceptance Criteria: Admin can create, read, update, and delete species data in the app.
•	As an admin, I want to view and edit all forms submitted by staff, so that I can monitor zoo operations and ensure compliance.
o	Acceptance Criteria: Admin can access and edit daily food monitoring sheets, checklists, and other reports.

2. Staff User Stories
•	As a staff member, I want to log in and be taken directly to my assigned animal section, so that I can quickly access the relevant part of the app.
o	Acceptance Criteria: Upon login, the staff member is automatically redirected to their assigned section's dashboard.
•	As a staff member, I want to complete a daily food monitoring form for my section, so that I can record the animals’ feeding data.
o	Acceptance Criteria: Staff can input food monitoring data, such as feeding times and portions, into the daily form.
•	As a staff member, I want to fill out a daily checklist for the animals in my section, so that I can report on their health and well-being.
o	Acceptance Criteria: Staff can submit a checklist with observations like animal health, enclosure conditions, and behavior.
•	As a staff member, I want to complete the reptile room daily monitoring sheet, so that I can track the conditions in the reptile section.
o	Acceptance Criteria: Staff working in the reptile room can fill out a daily monitoring form, including temperature, humidity, and reptile conditions.
•	As a staff member, I want to submit a weekly filter and pump checklist, so that I can ensure equipment maintenance is logged.
o	Acceptance Criteria: Staff can fill out a weekly checklist on filter and pump status and any issues.
•	As a staff member, I want to record the electric fence readings daily, so that I can track the integrity of the zoo’s security measures.
o	Acceptance Criteria: Staff can log electric fence readings in a form that is submitted daily.
•	As a staff member, I want to record the weather conditions for the day, so that I can note how external factors may impact the animals.
o	Acceptance Criteria: Staff can input daily weather data, such as temperature, rainfall, and wind speed.
•	As a staff member, I want to submit a monthly fire extinguisher report, so that I can document the status of fire safety equipment.
o	Acceptance Criteria: Staff can log the condition and maintenance status of fire extinguishers on a monthly basis.

Admin-Only User Stories for Forms
•	As an admin, I want to view all staff submissions across different sections, so that I can review the daily operations in one place.
o	Acceptance Criteria: Admin has access to all forms and reports submitted by staff in all sections.
•	As an admin, I want to edit any submitted reports, so that I can correct or add information as needed.
o	Acceptance Criteria: Admin can open, modify, and resubmit any forms completed by staff members.

Summary of User Roles and User Stories
•	Admin: Oversees staff, animals, and operations. Has full access to manage sections, animals, species, and forms.
•	Staff: Limited to the sections assigned to them, responsible for daily and weekly reporting on animal care and zoo operations.
This structure ensures role-based access control and smooth workflow for both management and staff in the zoo's daily operations.

The application will also have a login page. There is no registration page as the admin will manually add staff members. The login will only have the staff name as the username and staff section. 

Upon logging in the staff will be redirected to their respective dashboard that will be made up of options for what forms they have access to fill.

Use the following roadmap and the information on the app above to create the app, follow the roadmap step by step completing one step after the other:
Phase 1: Core Setup and User Authentication
Login Screen with Authentication Logic

Implement the login screen with fields for username and staff section.
Redirect staff to their section-specific dashboard after login.
Role-Based Access Control (RBAC)

Set up RBAC to distinguish between admin and staff permissions.
Ensure admins have full access and staff are limited to their sections.
Phase 2: Admin Dashboard and Core Management Functions
Staff Management (Admin)

Create views and functions to add, update, and remove staff members.
Add the ability to assign specific sections to staff.
Animal and Section Management (Admin)

Build views and CRUD functionality for managing animal groups, camps, and species.
Form Management (Admin)

Set up access for admins to view, edit, and manage all forms submitted by staff.
Phase 3: Staff Dashboard and Daily Reporting Forms
Staff Dashboard with Section-Specific Forms

Develop the staff dashboard with options to view and complete daily forms.
Include forms for daily food monitoring, health checklist, reptile room, and electric fence readings.
Environmental Monitoring Forms (Staff)

Create a weather condition form and a weekly filter and pump checklist.
Set up the monthly fire extinguisher report form for fire safety logging.
Phase 4: Advanced Features and Reporting
Admin Overview Dashboard

Provide admins with a centralized view of all staff-submitted reports and daily operations.
Enhanced Data Validation and Feedback

Add validation for required fields in forms and feedback on successful submission.
Notifications and Reminders (Optional)

Set up reminders for staff to complete daily or weekly forms as needed. 
