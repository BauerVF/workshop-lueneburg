# REQ-006 – Automated Pattern Recognition & Anomaly Detection


---

## Business
Beyond peak events, subtle anomalies in consumption patterns can indicate faulty appliances, unexpected standby loads, or even security issues (e.g. an intruder leaving lights on). Automated pattern recognition adds intelligent, proactive value on top of passive monitoring — moving the product from a dashboard to a smart home advisor.

## Stakeholder
- As a **homeowner**, I want the system to learn my "normal" usage patterns (e.g. typical consumption on a weekday morning) and alert me when something deviates significantly, so I can investigate potential issues before they become expensive.
- As a **homeowner**, I want to see detected anomalies highlighted on the timeline chart, so I can visually understand when and how my usage deviated from the norm.
- As a **homeowner**, I want a weekly summary report showing my average consumption per zone, compared to the previous week, so I can track whether my energy-saving efforts are working.
- As a **product owner**, I want the system to suggest the most likely cause of an anomaly (e.g. "Unusual kitchen activity at 3am"), so users feel the app is intelligent, not just a data viewer.

## Solution

### Functional Requirements
- Build a **baseline model** that calculates the expected consumption profile for each hour of the day, separately for weekdays and weekends, based on historical data.
- Implement an **anomaly detection engine** that compares real-time (simulated) readings against the baseline and flags any reading that deviates by more than a configurable percentage.
- Detected anomalies must be:
  - Highlighted visually on the timeline chart (e.g. red marker).
  - Listed in an anomaly log with timestamp, measured value, expected value, and deviation %.
- Implement a **weekly summary view** showing:
  - Total consumption per zone (kWh) for the current week vs. the previous week.
  - A trend indicator (up/down/unchanged) per zone.
- The system should attempt to **classify anomalies** into categories:
  - Unexpected high load (possible appliance fault)
  - Unexpected overnight load (possible security concern)
  - Sudden drop to near-zero (possible meter issue)

### Non-Functional Requirements
- Baseline calculation must run as a background / deferred operation and must not block the UI.
- The anomaly detection algorithm must be explainable — each alert must reference the specific rule or deviation that triggered it.
- The weekly summary must be accurate to within ±1 Wh of ground truth.
- All algorithms must be implemented as pure, unit-testable functions.

---
