# REQ-013 – Record Count & Date Range Info Bar


---

## Business
Users and stakeholders need to know the scope of the data they are looking at — how many measurements, and what time period they cover. This is especially important during demos to set expectations.

## Stakeholder
- As a **homeowner**, I want to see a brief info bar on the dashboard showing the total number of records, the first date, and the last date in the dataset, so I understand what time span the app covers.

## Solution

### Functional Requirements
- Display a single info bar (e.g. below the header) showing:
  - Total record count (e.g. "148,320 records")
  - First date in the dataset
  - Last date in the dataset
- Values must be derived from the loaded data, not hardcoded.

### Non-Functional Requirements
- The bar must render in a single line on desktop without wrapping.
- Must use the `count` computed signal already on `PowerConsumptionService`.

---
