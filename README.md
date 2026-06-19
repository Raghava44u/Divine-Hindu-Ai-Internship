# Divine Hindu CRM - Technical Case Study Submission

## Problem Statement Addressed
Divine Hindu receives sales leads frequently from an app. These leads need to be assigned to 10 sales agents in a fair, trackable, and organized manner. The challenge is to ensure that no lead is missed, duplicated, delayed, or assigned unfairly. The system must also help management track agent performance, follow-ups, pending leads, and conversions.

---

## 1. A Clear Workflow
1. **Capture:** Customer fills out the `public-form.html` (or via API from Mobile App).
2. **Ingestion:** FastAPI backend receives the payload, verifies it's not a duplicate, and saves it to MySQL.
3. **Routing:** The Intelligent Routing Engine instantly assigns the lead based on City -> Agent Workload -> Conversion Rate.
4. **Notification:** The assigned agent is immediately notified via UI polling and/or Celery-backed Email/WhatsApp.
5. **Action:** Agent opens the CRM Kanban board, drags the lead to "Contacted", and logs call outcomes.
6. **Follow-Up:** Agent schedules a follow-up date/time within the Lead Profile Panel.
7. **Escalation (SLA):** If the agent ignores the lead for 90 minutes, a background worker strips the lead and re-routes it to a different agent.

## 2. How Leads are Captured
Leads are seamlessly captured via a lightweight **Public Lead Generation Form (`public-form.html`)**. 
- Customers fill out their Name, Phone, Email, City, and the specific Product/Service they are interested in. 
- The form triggers a fast, asynchronous `POST` request to the backend API (`/api/v1/leads/`).
- The system automatically captures the lead's hidden source (e.g., Website, Mobile App, Facebook, WhatsApp).

## 2. How Duplicate Leads are Avoided
To prevent data pollution and agent confusion, a strict duplicate prevention engine is implemented.
- The `LeadService.create_lead` pipeline immediately queries the database to check if the incoming `phone_number` or `email` already exists.
- If a match is found, the system **rejects** creating a new database row. Instead, it logs a new activity on the existing lead's timeline, keeping all history consolidated.

## 3. How Leads are Assigned to Sales Agents
Instead of a naive "Round Robin" approach, this CRM features a **Smart Intelligent Routing Engine**. When a lead enters the system, the algorithm evaluates the 10 sales agents in this strict priority order:
1. **The Local Expert:** Matches the lead's `City` to agents operating in the same city.
2. **The Free Agent:** If multiple agents match, it checks agent workload, prioritizing agents with zero or few active leads.
3. **The High Converter:** If there is a tie, it breaks the tie by routing the lead to the agent with the highest historical conversion rate.

## 4. How Agents are Notified
Once a lead is assigned by the Routing Engine, agents are notified through a multi-channel approach:
- **Live UI Notifications:** The React frontend uses real-time polling to display a live unread notification counter on the agent's dashboard bell icon.
- **Background Alerts (Celery):** The backend is pre-configured with a Celery task queue capable of firing instant Email and WhatsApp alerts to the assigned agent without slowing down the main web server.

## 5. How Follow-Ups are Tracked
Agents have access to an interactive **Lead Profile Panel**. 
- They can log call outcomes and attach notes to a unified Activity Timeline.
- They can use the "Schedule Follow-up" feature to pick a specific Date and Time to reconnect with the lead. The backend securely tracks this in a dedicated `FollowUp` table and displays it on their dashboard.

## 6. How Missed or Delayed Leads are Reassigned (SLA Management)
To ensure zero lead leakage, a Celery Background Worker continuously runs a **Service Level Agreement (SLA) Monitor** every 5 minutes.
- **30 Minutes Idle:** If an agent hasn't touched a new lead in 30 minutes, an automated warning notification is generated.
- **90 Minutes Idle (Escalation):** If 90 minutes pass, the background worker aggressively unassigns the lead from the lazy agent, logs an "Escalation" activity, and feeds the lead back into the Intelligent Routing Engine to be given to an available agent instantly.

## 7. What Reports and Dashboards are Created
The frontend is built as a Single Page Application using React and TailwindCSS.
- **Kanban Board:** A visual pipeline (New -> Assigned -> Contacted -> In Progress -> Converted -> Lost) allowing agents to drag-and-drop leads to instantly update database statuses.
- **Management Dashboard:** A high-level view showing total revenue, conversion rates, and a breakdown of lead sources.
- **Agent Workload Tracker:** Management can click on any of the 10 agents to instantly pull up a modal showing exactly which leads that agent is holding and how long they have held them.

## 8. What Tools/Apps Were Used
This is a robust, full-stack deployment-ready architecture:
- **Backend:** FastAPI (Python) - chosen for its extreme speed and async capabilities.
- **Database:** MySQL (Relational data integrity) + SQLAlchemy (ORM).
- **Background Tasks:** Celery + Redis - handles SLA monitoring and outbound notifications without blocking the web server.
- **Frontend:** React + TailwindCSS + Vite.
- **Containerization:** Docker & Docker Compose - ensuring the entire stack runs perfectly on any machine with one command.

## 10. Step-by-Step Implementation Approach
1. **Database & Schema Design:** Setup MySQL with SQLAlchemy ORM, creating tables for `Leads`, `Agents`, `Activities`, and `FollowUps`.
2. **API Development:** Build blazing-fast REST APIs using FastAPI for lead ingestion and agent management.
3. **Core Logic Injection:** Write the Intelligent Routing Engine (`AssignmentService`) and Duplicate Check logic.
4. **Background Workers:** Setup Redis and Celery to handle asynchronous tasks like SLA monitoring and Email sending.
5. **Frontend UI:** Develop the React SPA with TailwindCSS, creating the Kanban Board and Dashboard metrics.
6. **Containerization:** Wrap everything in `docker-compose` for 1-click deployment.

## 11. Challenges & Solutions
- **Challenge:** Avoiding Round-Robin bottlenecks where lazy agents hoard leads.
  **Solution:** Built a dynamic routing engine that checks active workload and conversion rate rather than just assigning blindly.
- **Challenge:** Leads falling through the cracks if an agent is on leave or forgets.
  **Solution:** Implemented the 90-minute SLA Escalation Celery background worker to automatically reclaim ignored leads.
- **Challenge:** Duplicate lead entries polluting the CRM metrics.
  **Solution:** Strict backend validation throwing an immediate error if a phone number or email matches an existing entry, and instead appending a note to the original lead.

## 12. Making the Process Simple, Sorted, Scalable, and Ready to Deploy
- **Simple:** The UI strips away bloated enterprise CRM features, focusing solely on the Kanban pipeline and the unified activity timeline. Agents need zero training to drag-and-drop a card.
- **Sorted:** The Intelligent Routing Engine eliminates manual manager intervention. Managers no longer need to manually delegate leads.
- **Scalable:** Using FastAPI, Celery, and Redis means this system can effortlessly handle 10 leads a day or 10,000 leads a day.
- **Ready to Deploy:** The entire application (Frontend, Backend, Database, Redis, Celery) is containerized via Docker. It can be deployed to AWS EC2 or DigitalOcean with a single `docker compose up -d` command.

---
*Prepared for the Divine Hindu Technical Interview Evaluation.*
