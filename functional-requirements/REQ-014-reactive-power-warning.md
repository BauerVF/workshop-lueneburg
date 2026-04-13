# REQ-014 – Reactive Power Warning Flag


---

## Business
High reactive power relative to active power indicates poor power factor, which means the household is drawing more current than it needs to. Some commercial tariffs penalise low power factor. Flagging it early saves money.

## Stakeholder
- As a **homeowner**, I want a warning flag to appear when the reactive power is disproportionately high compared to the active power, so I know when my power factor is poor.

## Solution

### Functional Requirements
- Calculate the **power factor** for the latest reading:  
  `power_factor = Global_active_power / sqrt(Global_active_power² + Global_reactive_power²)`
- Show a warning icon/label if the power factor drops below **0.8**.
- Display the calculated power factor value (rounded to two decimal places) next to the warning.

### Non-Functional Requirements
- Calculation must be done in the component or service, not inline in the template.
- No external math library required — `Math.sqrt` is sufficient.

---
