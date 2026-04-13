# REQ-001 – Power Overview Widget


---

## Business

Homeowners need an instant, at-a-glance snapshot of their household's current electricity situation when they open the app. Without this, the dashboard feels empty and uninformative on first load.

## Stakeholder

- As a **homeowner**, I want to see a summary card at the top of the dashboard showing the most recent power consumption reading, so I immediately know what my house is currently consuming.
- As a **homeowner**, I want the widget to show the date and time of the latest data point, so I know how up-to-date the information is.

## Solution

### Functional Requirements

- Display a summary card/widget that shows:
  - The **latest** `Global_active_power` value from the dataset
  - The corresponding `Date` and `Time` of that record
- The widget must be visible without scrolling (above the fold).

### Non-Functional Requirements

- The widget must render within **2 seconds** of the data being loaded.
- Values should be displayed with appropriate units (kW).

---
