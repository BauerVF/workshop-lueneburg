# REQ-009 – Loading Skeleton Screen


---

## Business
The CSV is ~7.5 MB and takes a noticeable moment to load. A blank screen during load feels broken. A skeleton screen communicates that the app is working and sets professional quality expectations for stakeholders in demos.

## Stakeholder
- As a **homeowner**, I want to see placeholder content while the data is loading, so the app feels responsive and I know something is happening.

## Solution

### Functional Requirements
- While `loading()` is `true` on the `PowerConsumptionService`, display skeleton placeholder blocks in place of each dashboard widget.
- Once data is loaded, replace skeletons with the real content.
- Skeletons should roughly match the shape/size of the content they represent (e.g. a wide rectangle for a chart, a small square for a badge).

### Non-Functional Requirements
- Skeletons must use only CSS (no images, no external library required).
- The pulsing/shimmer animation is optional but encouraged.

---
