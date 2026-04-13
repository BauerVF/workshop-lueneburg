# REQ-005 – Peak Shaving Alert System


---

## Business
High electricity tariffs are often triggered by peak demand — short bursts of very high consumption that utilities charge a premium for. By automatically detecting when a household is approaching or sustaining a high load, the system can warn the homeowner in time to take action (e.g. turning off the dishwasher before starting the washing machine). This is the core differentiating feature of the product.

## Stakeholder
- As a **homeowner**, I want the system to automatically detect when my household is experiencing a consumption peak, so I can take action before my electricity bill spikes.
- As a **homeowner**, I want to see a visual alert on the dashboard when a peak is detected, so I am immediately aware of the situation.
- As a **homeowner**, I want to see a history of past peak events, so I can understand my peak patterns over time.
- As a **product owner**, I want the algorithm to be configurable (threshold, window), so we can tune it per household without code changes.

## Solution

### Functional Requirements
- Implement a **Peak Shaving detection algorithm** that:
  - Scans the time-series data for sequences where `Global_active_power` exceeds a configurable **threshold** (in kW) for a configurable number of **consecutive measurements**.
  - Marks each such sequence as a **peak event**.
- Display a **visual alert/badge** on the dashboard for any peak event detected in the currently viewed time range.
- Provide a **Peak Event Log** — a list of all detected peak events showing start time, end time, and maximum power during the event.
- The threshold and consecutive-measurement window must be **configurable** via a settings UI or config value (no hardcoding).

### Non-Functional Requirements
- The algorithm must complete its analysis of a full day's data (~1,440 records) in **under 500ms** in the browser.
- Peak events must be persisted for the session (not recalculated on every render).
- The algorithm must be unit-testable in isolation (pure function, no DOM/HTTP dependencies).

---
