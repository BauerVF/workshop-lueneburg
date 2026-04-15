# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard >> REQ-008: shows daily total badge with kWh value and date
- Location: e2e\dashboard.spec.ts:43:7

# Error details

```
Error: page.waitForSelector: Target page, context or browser has been closed
Call log:
  - waiting for locator('.dashboard') to be visible

```

```
Error: browserContext.close: Target page, context or browser has been closed
```