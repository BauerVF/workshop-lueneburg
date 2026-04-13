# REQ-004 – Sub-Metering Breakdown Chart


---

## Business
Homeowners cannot reduce energy waste if they don't know which appliance groups are responsible. A visual breakdown of consumption per zone (kitchen, laundry, heating/AC) creates the transparency needed to drive behavioural change.

## Stakeholder
- As a **homeowner**, I want to see a chart that shows what proportion of my total energy consumption comes from the kitchen, laundry room, and heating/AC, so I know where to focus my energy-saving efforts.
- As a **homeowner**, I want this breakdown to be filterable by time period (e.g. per day or per week), so I can compare my habits across different periods.
- As a **product owner**, I want the breakdown to be visually distinct and engaging — not just numbers — to keep users coming back to the app.

## Solution

### Functional Requirements
- Display a **donut or pie chart** breaking down total energy consumption into:
  - Kitchen (`Sub_metering_1`)
  - Laundry room (`Sub_metering_2`)
  - Heating / AC (`Sub_metering_3`)
  - Other (the remainder of `Global_active_power` not covered by the three sub-meters)
- Each segment must show both a label and its percentage of the total.
- The chart must respond to the same time-range filter used in REQ-003 (if implemented), or have its own date selector.

### Non-Functional Requirements
- Segments must be visually distinguishable, with sufficient colour contrast for accessibility.
- Chart must update within **1 second** when the time range changes.

---
