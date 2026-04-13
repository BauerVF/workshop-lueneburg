# REQ-002 – Consumption Data Table


---

## Business
To build trust in the application and enable users to investigate specific time periods, the raw data must be accessible in a readable, structured format. Regulatory and audit needs may also require access to individual measurements.

## Stakeholder
- As a **homeowner**, I want to browse the raw consumption records in a paginated table, so I can look up specific readings without being overwhelmed by 148,000 rows at once.
- As a **homeowner**, I want to be able to filter the table by date, so I can focus on a specific day or period.

## Solution

### Functional Requirements
- Display the dataset in a table with the following columns:
  - `Date`, `Time`, `Global_active_power`, `Voltage`, `Global_intensity`
  - `Sub_metering_1`, `Sub_metering_2`, `Sub_metering_3`
- The table must be **paginated** — show a reasonable number of rows per page.
- Provide a **date filter** (input or date picker) that limits the visible rows to the selected date.

### Non-Functional Requirements
- The table must not cause the browser to freeze when rendering — avoid rendering all 148,000 rows into the DOM at once.
- Page navigation must feel immediate (< 100ms response).

---
