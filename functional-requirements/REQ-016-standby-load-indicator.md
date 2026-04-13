# REQ-016 – Midnight Standby Load Indicator


---

## Business
Appliances left on standby overnight are "silent" energy wasters. The average power drawn between midnight and 5am is a good proxy for base standby load. Making this number visible motivates homeowners to unplug idle devices.

## Stakeholder
- As a **homeowner**, I want to see the average power consumption between 00:00 and 05:00 across all days in the dataset, so I can estimate how much energy my standby devices are costing me.

## Solution

### Functional Requirements
- Filter all records where the time is between `00:00:00` and `04:59:59` (inclusive).
- Calculate the **average `Global_active_power`** across those records.
- Display the result in kW (two decimal places) labelled as "Avg. Standby Load".
- Add a contextual label beneath it, e.g. "~X kWh wasted per night" (multiply by 5 hours).

### Non-Functional Requirements
- Filtering and calculation must be done once after data load, not on every render.
- No new HTTP calls or data sources.

---
