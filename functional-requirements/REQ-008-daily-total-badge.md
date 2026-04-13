# REQ-008 – Daily Total Consumption Badge


---

## Business
Homeowners think about their energy cost in daily terms — "how much did I use today?" A single total figure per day makes the data immediately actionable and relatable.

## Stakeholder
- As a **homeowner**, I want to see the total energy consumed on the most recent day in the dataset displayed as a single number (in kWh), so I can quickly judge whether it was a high or low usage day.

## Solution

### Functional Requirements
- Calculate the total energy consumed on the **last date** present in the dataset.
- Display the result in **kWh**, rounded to two decimal places, in a prominent badge or card.
- Label the badge with the date it represents.

### Non-Functional Requirements
- Calculation must happen in the service/component, not in the template.
- Result must be derived from the loaded signal data — no extra HTTP request.

---
