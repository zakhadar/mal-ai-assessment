## Take-Home Assessment

## Fullstack Engineer

# Overview

Duration: 90 minutes (120 minutes maximum recording length)
Approach: Test-Driven Development (TDD) - Preferred
Platform:
● Mobile: Expo React Native
● Backend: Node.js + Express
Language: TypeScript (required, both mobile and backend)
Structure: This exercise has 3 progressive milestones. Complete them in order:
● Milestone 1 : Core end-to-end flow (55–65 minutes) - Average candidates should complete this
● Milestone 2 : Production-ready essentials (20–30 minutes) - Good candidates complete M1 +
partial/complete M
● Milestone 3 : Advanced feature (bonus) - Only if time permits (pick ONE)
Realistic expectation: Most candidates will complete Milestone 1 + part of Milestone 2. That’s success!

## Submission Deliverables

When you complete this assessment, you must submit via email:

### 1. Screen Recording (max 120 minutes)

```
● Your full screen visible at all times
● Continuous verbal commentary explaining your work
● Do not edit the recording
● Include a demo at the end (mobile + API)
```
### 2. Transcript

```
● Text transcript of your verbal commentary
```
### 3. GitHub Repository

● Your own GitHub repository with the completed code
● Include a README with setup and run instructions for both mobile and API
● Ensure the app runs and tests pass
● Meaningful commit history
Note: There will be a follow-up interview to discuss your submission.


## Background

eKYC (electronic Know Your Customer) is the process of verifying a customer’s identity remotely. You will build a
mobile onboarding flow and a backend API that accepts an onboarding submission and returns a server-backed
verification status.
This assessment focuses on fullstack fundamentals:
● Mobile state correctness (global ↔ local synchronization, persistence, error UX)
● API design and validation (consistent contracts, stable error formats)
● Session lifecycle (expiry, refresh, route guarding)
● End-to-end testing choices and production-minded architecture

## Product Requirements (What You’re Building)

Build a Mobile eKYC Onboarding feature with a server-backed status.

### Required Mobile Screens

1. Login
    ○ Email + password (simple validation)
    ○ Calls backend login API
2. Home
    ○ Shows user name (from /v1/me)
    ○ Shows current verification status (from /v1/verification/status)
    ○ Entry point to start/resume onboarding
3. Onboarding (multi-step)
    ○ Step 1: Profile (name, DOB, nationality)
    ○ Step 2: Document (document type + number)
    ○ Step 3: Address (address line + city + country)
    ○ Step 4: Consents (terms acceptance)
    ○ Step 5: Review & Submit
4. Settings
    ○ Theme toggle (light/dark)

### Navigation Expectations

```
● Unauthenticated users can only access Login
● Authenticated users can access Home / Onboarding / Settings
● When the session expires, user must be sent back to Login (route guard), with a clear message
```
## Suggested Repo Structure

You can choose any structure, but a monorepo is recommended:
● apps/api (Express + TypeScript)
● apps/mobile (Expo React Native + TypeScript)


```
JSON
JSON
JSON
```
## Data Models (Suggested)

You may adjust names/shape, but keep the intent and behaviors.

### User

#### {

```
"id": "USR-001",
"email": "jane.doe@example.com",
"fullName": "Jane Doe"
}
```
### Session

#### {

```
"accessToken": "access_abc",
"refreshToken": "refresh_def",
"expiresAt": "2026-01-16T10:30:00.000Z"
}
```
### Onboarding Draft (Client + Server)

#### {

```
"profile": {
"fullName": "Jane Doe",
"dateOfBirth": "1990-05-15",
"nationality": "US"
},
"document": {
"documentType": "PASSPORT",
```

```
JSON
"documentNumber": "P12345678"
},
"address": {
"addressLine1": "123 Main St",
"city": "Springfield",
"country": "US"
},
"consents": {
"termsAccepted": true
}
}
```
### Verification Status

#### {

```
"status": "NOT_STARTED" | "IN_PROGRESS" | "APPROVED" | "REJECTED" |
"MANUAL_REVIEW",
"updatedAt": "2026-01-16T10:35:00.000Z",
"details": {
"reasons": []
}
}
```
## API Contracts (Backend)

### Base URL

You can choose the base URL, but be consistent (e.g., [http://localhost:3000).](http://localhost:3000).)

### Error Format (Must Be Consistent)


JSON
JSON
JSON
All non-2xx responses must follow a consistent JSON format:
{
"error": {
"code": "VALIDATION_ERROR",
"message": "Invalid input",
"details": {
"fieldErrors": {
"profile.fullName": "Required"
}
}
}
}
Rules:
● Don’t leak internals (stack traces)
● Avoid PII in error details
● Prefer stable code values (so the mobile app can handle errors reliably)

### 1) Login

Endpoint: POST /v1/auth/login
Request:
{
"email": "jane.doe@example.com",
"password": "password123"
}
Success (200):
{


JSON
"user": { "id": "USR-001", "email": "jane.doe@example.com", "fullName":
"Jane Doe" },
"session": { "accessToken": "access_abc", "refreshToken": "refresh_def",
"expiresAt": "..." }
}
Failure cases:
● Invalid credentials → 401-like error (use an error code like INVALID_CREDENTIALS)

### 2) Refresh Session

Endpoint: POST /v1/auth/refresh
Request:
{
"refreshToken": "refresh_def"
}
Success (200):
● Returns a new session with a later expiresAt
Failure cases:
● Invalid refresh token → 401-like error (must logout on mobile)

### 3) Get Current User

Endpoint: GET /v1/me
Auth: Authorization: Bearer <accessToken>
Rules:
● If access token is expired/invalid → 401-like error
● Otherwise returns the user

### 4) Submit Onboarding

Endpoint: POST /v1/onboarding/submit
Auth: Authorization: Bearer <accessToken>


JSON
JSON
JSON
Request:
{
"draft": { "profile": { }, "document": { }, "address": { }, "consents": { }
}
}
Rules:
● Validate draft server-side (required fields, basic formats)
● If missing/invalid → 400-like error with fieldErrors
● If access token expired/invalid → 401-like error
● On success, the server sets verification status to IN_PROGRESS (or directly MANUAL_REVIEW, your choice)
Success (200):
{
"submissionId": "SUB-123",
"status": "RECEIVED"
}

### 5) Get Verification Status

Endpoint: GET /v1/verification/status
Auth: Authorization: Bearer <accessToken>
Success (200):
{
"status": "IN_PROGRESS",
"updatedAt": "2026-01-16T10:35:00.000Z",
"details": { "reasons": [] }
}


## Mobile Requirements (Key Assessment Focus)

Your app must have multiple global states that interact:

1. Auth/Session state
    ○ status: logged_out | logging_in | logged_in | refreshing | expired
    ○ user + session
2. Theme state
    ○ theme: light | dark
    ○ Token-based theme values (colors/spacing) applied across app
3. Onboarding state
    ○ draft + currentStep
    ○ Submission state: idle | submitting | success | error
4. Verification status state
    ○ cached status from backend
    ○ loading/error handling

### Synchronization Requirements (Global ↔ Local)

This is a major part of the exercise:
● Form screens may keep local input state, but the draft must stay in sync with global onboarding state.
● Draft updates must not be lost during:
○ theme change
○ navigation between steps
○ app restart (if you persist the draft)
○ session expiry / logout (draft should be preserved unless you intentionally clear it and explain why)
● Submitting should only clear the draft on successful submission.

## Persistence Requirements

Persist at least:
● Theme (so it survives restart)
● Onboarding draft + current step (so the user can resume)
Session persistence is optional:
● If you persist it, use secure storage and handle expiry correctly.
● If you don’t persist it, that’s acceptable—just be consistent.

# MILESTONE 1: Core End-to-End Flow (55–65 minutes)

Target: Average candidates should complete this milestone.

## Goal

Deliver a working mobile app + API where a user can login, complete onboarding, submit, and view verification
status.


## Requirements

### 1.1 Backend: Basic API Working

```
● ✅ Express server runs locally
● ✅ Endpoints exist: login, refresh, me, submit, status
● ✅ Basic in-memory persistence (no DB required)
● ✅ Basic request validation (minimal is fine for M1)
● ✅ Consistent error format (even if not perfect yet)
```
### 1.2 Mobile: App Skeleton + Core Flow

```
● ✅ Login screen calls API
● ✅ Authenticated navigation (Home/Onboarding/Settings)
● ✅ Onboarding flow with 5 steps
● ✅ Submit calls API and shows loading + success/error
● ✅ Home shows /me and /verification/status
```
### 1.3 Theming

```
● ✅ Theme toggle exists
● ✅ Token-based theming applied app-wide
```
## Success Criteria for Milestone 1

```
● [ ] API runs; endpoints respond correctly
● [ ] Mobile runs; core flow works end-to-end
● [ ] Contracts match and are stable
● [ ] Loading/error states exist for key calls
● [ ] No crashes in the main happy path
```
## Suggested Tests for Milestone 1

```
● API: test_login_success_and_me_success
● Mobile: test_onboardingDraft_updates_and_progresses_steps (or equivalent)
```
# MILESTONE 2: Production-Ready Essentials (20–

# minutes)

Target: Good candidates complete Milestone 1 + meaningfully start/complete this milestone.

## Goal

Make the system production-minded: safe session handling, stronger validation and consistent errors, basic
observability, and tests for risky logic.

## Requirements


### 2.1 Backend Essentials

```
● ✅ Centralized request validation for submit (clear field errors)
● ✅ Auth middleware (bearer token parsing, expiry awareness)
● ✅ Consistent error mapping (400/401/500 with stable codes)
● ✅ Structured logging (basic is fine) and request IDs/correlation IDs
● ✅ Do not log tokens or sensitive PII
```
### 2.2 Mobile Session Lifecycle (Must Have)

```
● ✅ Guarded routes (unauthenticated cannot access Home/Onboarding)
● ✅ If token expired/401:
○ Attempt refresh once
○ Retry original request once
○ If refresh fails → logout + redirect to Login with clear UX message
● ✅ Avoid infinite retry loops
```
### 2.3 Testing (Must Have)

Write at least:
● ✅ API tests for submit validation error shape (fieldErrors)
● ✅ Mobile unit tests for auth/session state transitions OR a focused test for refresh-then-retry behavior

## Success Criteria for Milestone 2

Must complete to claim Milestone 2 completion:
● [ ] Refresh-then-retry behavior works (once) and is tested
● [ ] Submit validation produces stable, actionable errors
● [ ] Errors are handled safely end-to-end (no crashes, no silent failures)

# MILESTONE 3: Advanced Feature (Bonus - Pick ONE)

Only attempt this if Milestone 1 is done and Milestone 2 is solid.
Pick ONE:

### Option A: Idempotency for Submit

```
● Accept Idempotency-Key header on POST /v1/onboarding/submit
● Same key returns the same submissionId and does not create duplicates
● Add tests for duplicate submit behavior
```
### Option B: Async Verification Processing + Polling

```
● After submit, status becomes IN_PROGRESS
● Add POST /v1/verification/process (or a timed simulation) that transitions to APPROVED /
MANUAL_REVIEW / REJECTED
● Mobile polls status from Home with sensible intervals and cancellation
```

### Option C: Offline Queue (Mobile)

```
● Simulate offline toggle
● Queue onboarding submit attempts while offline
● Auto-retry when back online with clear UX indicators
```
### Option D: OpenAPI + Typed Client

```
● Provide an OpenAPI spec for the backend
● Generate a typed API client used by the mobile app
● Demonstrate contract safety and consistent error typing
```
## Time Management Guidance (90 minutes)

First 5 minutes:
● Read requirements carefully
● Decide your repo structure and core contracts (API + error format)
Minutes 5–70 (Milestone 1):
● Build the skeleton quickly (API routes + mobile navigation)
● Keep both apps runnable at all times
● Implement the happy path end-to-end early
Minutes 70–90 (Milestone 2):
● Add refresh-then-retry + route guards
● Harden server validation and error shapes
● Add minimal tests focused on risky logic
Only if extra time:
● Pick ONE Milestone 3 option

## Variation: WITH LLM Agent (This Interview)

AI tools are allowed. We will evaluate:
● How you prompt (clarity and constraints)
● Whether you review outputs critically
● Whether you test and fix issues
● Whether you can explain the final code
Rule: “AI helped write it” is not an excuse for broken behavior.

## Summary

What you’re building: a mobile eKYC onboarding flow backed by a Node/Express API, including session handling
and a server-backed verification status.


Key challenges:
● Contracts and consistent error handling across FE/BE
● Session expiry + refresh-then-retry correctness
● Mobile state synchronization and persistence
● Production-minded validation, logging, and testing
Expected completion: Milestone 1 + meaningful progress on Milestone 2 is good performance.


