# Workshop Lüneburg – Smart Powered Home

An Angular project serving as the foundation for an agile development workshop.

## About the Workshop

### Format

Agile **Mob-Programming** under time pressure.

### Schedule

**70-minute** development iterations with strict time management.

### Rotation

Every **10 minutes** the person at the keyboard changes. Roles rotate through the entire team.

### Roles

| Role                   | Responsibility                          |
| ---------------------- | --------------------------------------- |
| **Product Owner (PO)** | Prioritises features, sets direction    |
| **Tech Lead**          | Makes technical decisions, reviews code |
| **Scrum Master**       | Facilitates, keeps the process on track |
| **Developer**          | Implements at the keyboard              |

### Goal

Rapid development of a functional **MVP (Minimum Viable Product)** based on household power consumption data.

### Success Metrics

| Criterion                   | Weight |
| --------------------------- | ------ |
| Roadmap goals achieved      | 40 %   |
| Code quality & architecture | 40 %   |
| Design & fun factor         | 20 %   |

---

## Project Setup

```bash
cd src/smart-powered-home
npm install
npm start
```

The app will be available at `http://localhost:4200`.

## Tech Stack

- **Angular** (standalone components, signals)
- **TypeScript**
- Dataset: `household_power_consumption.csv` (~148,000 entries)

---

## Requirements

The workshop backlog is split into two folders:

- [`functional-requirements/`](functional-requirements/) — Features and behaviours the system must deliver (what it does).
- [`nonfunctional-requirements/`](nonfunctional-requirements/) — Quality constraints such as performance, accessibility, and responsiveness (how well it does it).

---

## Dataset – `household_power_consumption.csv`

The dataset contains minute-by-minute power consumption measurements from a household.

| Column                  | Type    | Description                                                                        |
| ----------------------- | ------- | ---------------------------------------------------------------------------------- |
| `Date`                  | Date    | Date of the observation                                                            |
| `Time`                  | Time    | Time of the observation                                                            |
| `Global_active_power`   | Numeric | Total active power consumed by the household (kilowatts)                           |
| `Global_reactive_power` | Numeric | Total reactive power consumed by the household (kilowatts)                         |
| `Voltage`               | Numeric | Voltage at which electricity is delivered to the household (volts)                 |
| `Global_intensity`      | Numeric | Average current intensity delivered to the household (amps)                        |
| `Sub_metering_1`        | Numeric | Active power consumed by the kitchen (kilowatts)                                   |
| `Sub_metering_2`        | Numeric | Active power consumed by the laundry room (kilowatts)                              |
| `Sub_metering_3`        | Numeric | Active power consumed by the electric water heater and air conditioner (kilowatts) |
