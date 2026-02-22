# Milestone 2 - Testing Setup Guide

## Overview
This guide explains how to set up and run tests for Milestone 2 features. Tests verify:
- Structured logging with correlation IDs
- Route guards and session expiry handling
- Refresh-then-retry token behavior
- Validation error formatting

---

## Backend Testing Setup

### Install Dependencies
```bash
cd apps/backend
npm install --save-dev jest supertest @types/jest @types/supertest
```

### Update `package.json`
Add test script:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Create Jest Config (`jest.config.js`)
```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
};
```

### Test Cases to Implement

**File: `src/__tests__/validation.test.ts`**

```typescript
import request from "supertest";
import app from "../server";

describe("Validation Error Responses", () => {
  let accessToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/v1/auth/login")
      .send({ email: "jane.doe@example.com", password: "password123" });
    accessToken = res.body.data.session.accessToken;
  });

  test("POST /v1/onboarding/submit returns fieldErrors on invalid input", async () => {
    const response = await request(app)
      .post("/v1/onboarding/submit")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        firstName: "", // Missing
        lastName: "Doe",
        // ... other fields
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details.fieldErrors).toBeDefined();
    expect(response.body.error.details.fieldErrors.firstName).toBeDefined();
  });

  test("POST /v1/onboarding/submit succeeds with valid input", async () => {
    const response = await request(app)
      .post("/v1/onboarding/submit")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        firstName: "Jane",
        lastName: "Doe",
        documentType: "passport",
        documentNumber: "123456789",
        addressLine1: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "US",
        consentProcessing: true,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.submissionId).toBeDefined();
  });
});
```

**File: `src/__tests__/correlation-id.test.ts`**

```typescript
import request from "supertest";
import app from "../server";

describe("Correlation ID Middleware", () => {
  test("X-Request-ID header is included in response", async () => {
    const response = await request(app).post("/v1/auth/login").send({
      email: "jane.doe@example.com",
      password: "password123",
    });

    expect(response.headers["x-request-id"]).toBeDefined();
    expect(response.headers["x-request-id"]).toMatch(/^[a-f0-9-]{8}$/);
  });

  test("Client-provided X-Request-ID is preserved", async () => {
    const customId = "custom-req-123";
    const response = await request(app)
      .post("/v1/auth/login")
      .set("X-Request-ID", customId)
      .send({
        email: "jane.doe@example.com",
        password: "password123",
      });

    expect(response.headers["x-request-id"]).toBe(customId);
  });

  test("Error responses include X-Request-ID", async () => {
    const response = await request(app)
      .get("/v1/me")
      .set("Authorization", "Bearer invalid");

    expect(response.headers["x-request-id"]).toBeDefined();
    expect(response.status).toBe(401);
  });
});
```

### Run Backend Tests
```bash
npm test
npm test -- --coverage  # With coverage
npm test -- --watch     # Watch mode
```

---

## Mobile Testing Setup

### Install Dependencies
```bash
cd apps/mobile
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native @types/jest ts-jest
```

### Update `package.json`
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Create Jest Config (`jest.config.js`)
```javascript
module.exports = {
  preset: "react-native",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/setup-tests.ts"],
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: { jsx: "react" },
    }],
  },
};
```

### Setup File (`setup-tests.ts`)
```typescript
import "@testing-library/jest-native/extend-expect";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
}));

// Mock react-native
jest.mock("react-native", () => ({
  ...jest.requireActual("react-native"),
  StatusBar: { setBarStyle: jest.fn() },
}));
```

### Test Cases to Implement

**File: `src/stores/__tests__/authStore.test.ts`**

```typescript
import { renderHook, act } from "@testing-library/react-native";
import { useAuthStore } from "../authStore";

describe("Auth Store - State Transitions", () => {
  beforeEach(() => {
    useAuthStore.setState({
      status: "logged_out",
      user: null,
      session: null,
      error: null,
    });
  });

  test("transitions from logged_out to logging_in", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoggingIn();
    });

    expect(result.current.status).toBe("logging_in");
  });

  test("transitions from logging_in to logged_in", () => {
    const { result } = renderHook(() => useAuthStore());
    const user = { id: "1", email: "test@example.com" };
    const session = {
      accessToken: "token",
      refreshToken: "refresh",
      expiresAt: new Date().toISOString(),
    };

    act(() => {
      result.current.setLoggedIn(user as any, session as any);
    });

    expect(result.current.status).toBe("logged_in");
    expect(result.current.user).toEqual(user);
  });

  test("transitions to expired status", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setExpired();
    });

    expect(result.current.status).toBe("expired");
    expect(result.current.error).toBe("Session expired. Please log in again.");
  });

  test("clears data on logout", () => {
    const { result } = renderHook(() => useAuthStore());
    const user = { id: "1", email: "test@example.com" };
    const session = {
      accessToken: "token",
      refreshToken: "refresh",
      expiresAt: new Date().toISOString(),
    };

    act(() => {
      result.current.setLoggedIn(user as any, session as any);
    });

    act(() => {
      result.current.setLoggedOut();
    });

    expect(result.current.status).toBe("logged_out");
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });
});
```

**File: `src/api/__tests__/client.test.ts`**

```typescript
import { ApiClient } from "../client";
import { useAuthStore } from "../../stores/authStore";

describe("API Client - Refresh-Then-Retry", () => {
  let client: ApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ApiClient("http://localhost:4000");
    global.fetch = jest.fn();
  });

  test("retries request after successful token refresh on 401", async () => {
    const session = {
      accessToken: "old-token",
      refreshToken: "refresh-token",
      expiresAt: new Date().toISOString(),
    };
    const user = { id: "1", email: "test@example.com" };

    useAuthStore.setState({
      status: "logged_in",
      user: user as any,
      session: session as any,
    });

    let callCount = 0;
    (global.fetch as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          status: 401,
          json: () =>
            Promise.resolve({ error: { code: "TOKEN_EXPIRED" } }),
        });
      } else if (callCount === 2) {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              data: {
                session: {
                  accessToken: "new-token",
                  refreshToken: "refresh-token",
                  expiresAt: new Date().toISOString(),
                },
              },
            }),
        });
      } else {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ data: { success: true } }),
        });
      }
    });

    try {
      const result = await client.request("/v1/me", { method: "GET" });
      expect(result.data.success).toBe(true);
      expect(callCount).toBe(3); // request + refresh + retry
    } catch (error) {
      // Expected on refresh failure
    }
  });

  test("transitions to expired on refresh failure", async () => {
    const session = {
      accessToken: "old-token",
      refreshToken: "invalid-token",
      expiresAt: new Date().toISOString(),
    };
    const user = { id: "1", email: "test@example.com" };

    useAuthStore.setState({
      status: "logged_in",
      user: user as any,
      session: session as any,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      status: 401,
      json: () =>
        Promise.resolve({ error: { code: "TOKEN_EXPIRED" } }),
    });

    try {
      await client.request("/v1/me", { method: "GET" });
    } catch (error) {
      // Expected
    }

    expect(useAuthStore.getState().status).toBe("expired");
  });
});
```

### Run Mobile Tests
```bash
npm test
npm test -- --coverage
npm test -- --watch
```

---

## Manual Testing Checklist

### Backend M2 Features

**Correlation IDs**:
- [ ] Make API request (via client or curl)
- [ ] Check response headers for `x-request-id`
- [ ] Make error request (e.g., invalid auth)
- [ ] Verify `x-request-id` is in response
- [ ] Check backend logs for correlation ID format

**Validation Errors**:
- [ ] Send incomplete onboarding submission
- [ ] Verify 400 response with `fieldErrors` object
- [ ] Check each invalid field has error message
- [ ] Send valid submission
- [ ] Verify 200 response with `submissionId`

**Token Expiry**:
- [ ] Login and get access token
- [ ] Use manual POST to `/v1/me` with old token
- [ ] Verify 401 response with `TOKEN_EXPIRED` code
- [ ] Use missing auth header
- [ ] Verify 401 response with `UNAUTHORIZED` code

---

### Mobile M2 Features

**Route Guards**:
- [ ] Start app with `authStatus` = `"logged_out"`
- [ ] Verify LoginScreen displays
- [ ] Change `authStatus` to `"logged_in"` in store
- [ ] Verify Home screen displays
- [ ] Change `authStatus` to `"expired"`
- [ ] Verify SessionExpiredScreen displays
- [ ] Tap "Log In Again"
- [ ] Verify redirected to LoginScreen

**Session Expiry Screen**:
- [ ] Manually set `authStatus` to `"expired"`
- [ ] Verify screen title says "Session Expired"
- [ ] Verify message explains session timeout
- [ ] Verify button says "Log In Again"
- [ ] Confirm tapping button clears session and shows login

**Refresh-Then-Retry**:
- [ ] Login successfully
- [ ] Manually modify token in auth store to invalid value
- [ ] Tap "Refresh Status" button
- [ ] Observe automatic retry after refresh
- [ ] Check console for multiple API calls
- [ ] If refresh fails, verify SessionExpiredScreen appears

**Error Handling**:
- [ ] Make API call when offline
- [ ] Verify error message displays to user
- [ ] Come back online
- [ ] Try again successfully
- [ ] Submit incomplete form
- [ ] Verify field validation errors show

---

## CI/CD Integration

### GitHub Actions Example

**`.github/workflows/test.yml`**:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm --filter backend test

  mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm --filter mobile test
```

---

## Coverage Goals

| Component | Lines | Branches | Functions | Required |
|-----------|-------|----------|-----------|----------|
| Middleware | 90%+ | 85%+ | 100% | ✅ |
| Store | 95%+ | 90%+ | 100% | ✅ |
| API Client | 85%+ | 80%+ | 100% | ✅ |
| Error Handling | 100% | 95%+ | 100% | ✅ |

---

## Troubleshooting

### Backend Tests Fail
- **Issue**: `Cannot find module 'supertest'`
  - **Solution**: Run `npm install --save-dev supertest`
- **Issue**: Tests timeout
  - **Solution**: Increase jest timeout: `jest.setTimeout(10000)`

### Mobile Tests Fail
- **Issue**: `AsyncStorage` not mocked
  - **Solution**: Ensure `setup-tests.ts` is created and referenced
- **Issue**: `React Navigation` errors
  - **Solution**: Mock navigation in setup file

### Correlation ID Not Showing
- **Issue**: Logs don't show request ID
  - **Solution**: Check middleware order in server.ts (should be early)
- **Issue**: Client header not preserved
  - **Solution**: Verify middleware compares header correctly

---

## Next Steps
1. Install dependencies (see above)
2. Create test files using provided templates
3. Run `npm test` in each package
4. Verify coverage meets goals
5. Integrate into CI/CD pipeline

All tests are ready to be implemented and will ensure M2 features work correctly!
