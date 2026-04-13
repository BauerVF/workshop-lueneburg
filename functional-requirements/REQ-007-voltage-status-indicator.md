# REQ-007 – Voltage Status Indicator


---

## Business
Abnormal voltage levels can damage household appliances. A quick visual status indicator gives homeowners confidence that their supply voltage is within a healthy range without requiring any technical knowledge.

## Stakeholder
- As a **homeowner**, I want to see a colour-coded indicator showing whether the current voltage is within a normal range, so I can spot potential supply issues at a glance.

## Solution

### Functional Requirements
- Display the latest `Voltage` reading on the dashboard.
- Colour-code the indicator:
  - 🟢 **Green**: 220–240 V (normal)
  - 🟡 **Yellow**: 210–220 V or 240–250 V (marginal)
  - 🔴 **Red**: below 210 V or above 250 V (critical)

### Non-Functional Requirements
- Must be implemented as a standalone Angular component.
- No external library required.

---
