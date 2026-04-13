# REQ-003 – Consumption Timeline Chart


---

## Business
Raw numbers alone are hard to interpret. A time-series chart makes trends, spikes, and patterns immediately visible — this is the core visualisation that drives homeowner insight and engagement with the product.

## Stakeholder
- As a **homeowner**, I want to see a line chart of my household's `Global_active_power` over time, so I can visually identify when my consumption is highest or lowest.
- As a **homeowner**, I want to be able to zoom into a specific day or week, so I can investigate interesting periods in detail.
- As a **product owner**, I want the chart to be the centerpiece of the dashboard, so it immediately communicates value to new users.

## Solution

### Functional Requirements
- Render a **line chart** plotting `Global_active_power` (Y-axis) against time (X-axis).
- The X-axis must show meaningful time labels (e.g. hours within a day, or dates across a week).
- Allow the user to select a **time range** (e.g. a specific day or a 7-day window) that updates the chart.
- The chart must update reactively when the time range changes.

### Non-Functional Requirements
- The chart must render within **3 seconds** for a single day's worth of data (~1,440 data points).
- The chart library used must be compatible with Angular (no direct DOM manipulation).
- The chart must be responsive and not overflow its container on mobile screen widths.

---
