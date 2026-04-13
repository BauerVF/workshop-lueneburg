# REQ-011 – Dark Mode Toggle


---

## Business
Extended use of an energy monitoring dashboard often happens in the evening. A dark mode reduces eye strain and — fittingly for an energy app — uses less power on OLED screens.

## Stakeholder
- As a **homeowner**, I want to toggle between light and dark mode, so I can comfortably use the dashboard in low-light environments.
- As a **homeowner**, I want my preference to be remembered so I don't have to toggle it every time I open the app.

## Solution

### Functional Requirements
- Add a toggle button (icon or label) to the app header/navbar.
- Toggling applies a CSS class (e.g. `dark`) to the `<body>` or root element.
- All dashboard components must be visually usable in both modes.
- The selected mode must be persisted in `localStorage` and restored on next load.

### Non-Functional Requirements
- No external theming library required — CSS custom properties (`--color-bg`, `--color-text`, etc.) are sufficient.
- Toggle must respond within 100ms.

---
