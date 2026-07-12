┌────────────────────────────────────────────────────┐
                 │                    LEAD CAPTURE                     │
                 │  Website form / Email / Manual entry / RFP / Referral │
                 └───────────────────────┬────────────────────────────┘
                                          ▼
                              Dedup check (email match)
                                          ▼
                              Auto/manual assignment to a rep
                                          ▼
                         ┌────────────────────────────┐
                         │   LEAD (status: NEW)        │
                         │   → CONTACTED → QUALIFIED    │
                         └───────────────┬─────────────┘
                                          ▼
                         Convert: creates Contact record
                                          ▼
                         ┌────────────────────────────┐
                         │      DEAL (Kanban pipeline)  │
                         │  Discovery → Proposal →       │
                         │  Negotiation → Won / Lost     │
                         └───────────────┬─────────────┘
                                          ▼ (on Won)
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
          Invoice auto-drafted                     Notification sent to rep
          (product line items or                   Audit log entry written
           service milestones)
                    ▼
          DRAFT → SENT → PAID / OVERDUE
                    ▼
          Customer ledger updated
