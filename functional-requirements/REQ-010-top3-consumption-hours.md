# REQ-010 – Top 3 Highest Consumption Hours


---

## Business
Knowing *when* peak consumption happens is the first step to changing behaviour. A ranked list of the three most energy-intensive hours of the day gives homeowners a clear, actionable target.

## Stakeholder
- As a **homeowner**, I want to see a list of the top 3 hours of the day (across the full dataset) where my household consumed the most energy on average, so I know when to be most conscious of my usage.

## Solution

### Functional Requirements
- Group all records by **hour of day** (0–23).
- Calculate the **average `Global_active_power`** per hour across the entire dataset.
- Display the top 3 hours ranked by average consumption, showing:
  - The hour (e.g. "18:00 – 19:00")
  - The average power in kW (two decimal places)

### Non-Functional Requirements
- Calculation must be performed once, not on every render.
- Result must be a pure derived value from the loaded data.

---
