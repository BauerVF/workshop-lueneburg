# REQ-012 – Current Intensity Badge


---

## Business
Amperage (current intensity) is the figure that most directly causes tripped circuit breakers. Showing it prominently helps homeowners understand their risk of overload in plain terms.

## Stakeholder
- As a **homeowner**, I want to see the latest `Global_intensity` value displayed on the dashboard, so I can tell at a glance how much current my household is currently drawing.

## Solution

### Functional Requirements
- Display the most recent `Global_intensity` value from the dataset.
- Show the unit (A for amps) next to the value.
- Display the corresponding `Date` and `Time` of the reading as a subtitle.

### Non-Functional Requirements
- Must reuse the already-loaded signal data — no additional HTTP call.
- Must be a standalone Angular component.

---
