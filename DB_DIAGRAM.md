# Database Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o| AGENTS : "has profile"
    USERS {
        int id PK
        string email
        string hashed_password
        string full_name
        boolean is_active
        enum role "ADMIN, MANAGER, AGENT"
        datetime created_at
        datetime updated_at
    }
    
    AGENTS ||--o{ LEADS : "assigned to"
    AGENTS {
        int id PK
        int user_id FK
        boolean is_active_for_assignment
        int current_workload
        datetime created_at
        datetime updated_at
    }
    
    LEADS ||--o{ ACTIVITIES : "has"
    LEADS ||--o{ FOLLOWUPS : "has"
    LEADS {
        int id PK
        string lead_id "Unique identifier (DH-2026-000001)"
        string customer_name
        string phone_number
        string email
        string city
        string state
        string product_interested
        enum source "MOBILE_APP, WEBSITE, WHATSAPP, etc."
        string priority "HIGH, NORMAL, LOW"
        int lead_score
        enum status "NEW, ASSIGNED, CONTACTED, etc."
        int agent_id FK
        datetime created_at
        datetime updated_at
    }

    ACTIVITIES }|--|| USERS : "performed by"
    ACTIVITIES {
        int id PK
        int lead_id FK
        int user_id FK
        enum action "CREATED, ASSIGNED, CONTACTED, etc."
        text remarks
        datetime created_at
        datetime updated_at
    }

    FOLLOWUPS }|--|| AGENTS : "scheduled for"
    FOLLOWUPS {
        int id PK
        int lead_id FK
        int agent_id FK
        date follow_up_date
        time follow_up_time
        datetime scheduled_datetime
        text remarks
        enum status "PENDING, COMPLETED, CANCELLED"
        enum reminder_type "EXACT_TIME, ONE_HOUR_BEFORE, etc."
        datetime created_at
        datetime updated_at
    }
```
