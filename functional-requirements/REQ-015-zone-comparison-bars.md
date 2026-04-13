# REQ-015 – Appliance Zone Comparison Bars


---

## Business
A simple side-by-side comparison of the three metered zones (kitchen, laundry, heating/AC) gives homeowners an instant visual sense of where energy is being spent, without needing a full chart.

## Stakeholder
- As a **homeowner**, I want to see a horizontal bar for each appliance zone showing its total consumption for the most recent day, so I can compare zones without reading a chart.

## Solution

### Functional Requirements
- For the **last date** in the dataset, calculate the sum of:
  - `Sub_metering_1` → Kitchen
  - `Sub_metering_2` → Laundry room
  - `Sub_metering_3` → Heating / AC
- Display each as a labelled horizontal bar, scaled relative to the highest of the three values.
- Show the numeric total (in Wh) next to each bar.

### Non-Functional Requirements
- Bars must be implemented with CSS (`width` as a percentage) — no charting library needed.
- Must be a standalone Angular component.

---
