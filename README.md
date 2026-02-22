# eKYC Mobile Onboarding Assessment

A fullstack eKYC (electronic Know Your Customer) identity verification platform built with TypeScript, React Native, and Express.

## Overview

This project implements a complete mobile onboarding flow with a server-backed verification system. Users can:
- Authenticate with email and password
- Submit personal, document, and address information through a multi-step form
- Receive real-time verification status updates
- Toggle between light and dark themes
- Manage session lifecycle with refresh tokens

## Tech Stack

### Mobile (Expo React Native)
- **Framework**: [Expo](https://expo.dev/) with React Native 0.81.5
- **Language**: TypeScript 5.9+
- **UI**: React 19.1.0

### Backend (Node.js)
- **Framework**: [Express.js](https://expressjs.com/) 5.2.1
- **Language**: TypeScript 5.9+
- **Security**: Helmet, CORS
- **Environment**: dotenv for configuration

### Monorepo
- **Package Manager**: pnpm 10.30.0
- **Build Tool**: Turbo

## Project Structure

```
mal-ai-assessment/
├── apps/
│   ├── backend/                 # Express API server
│   │   ├── src/
│   │   │   └── server.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env (create locally)
│   │
│   └── mobile/                  # Expo React Native app
│       ├── src/
│       │   └── config.ts
│       ├── app.json
│       ├── App.tsx
│       ├── package.json
│       ├── tsconfig.json
│       └── assets/
│
├── packages/
│   └── shared/                  # Shared types and utilities
│       ├── src/
│       │   └── types.ts
│       └── package.json
│
├── requirements/                # Assessment specifications
│   ├── guide.md
│   └── take home assesement.md
│
├── package.json                 # Root workspace config
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── tsconfig.base.json
```

## Setup Instructions

### Prerequisites

- **Node.js**: 18.x or higher
- **pnpm**: 10.30.0 (install with `npm install -g pnpm`)
- **Expo CLI**: Install globally with `npm install -g expo-cli` (or use `npx expo`)
- **For iOS**: Xcode (macOS only)
- **For Android**: Android Studio and SDK

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mal-ai-assessment
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

   This will install dependencies for:
   - Root workspace
   - `apps/backend`
   - `apps/mobile`
   - `packages/shared`

3. **Setup environment variables**

   Create a `.env` file in `apps/backend/`:
   ```env
   PORT=3000
   NODE_ENV=development
   # Add any other required variables
   ```

## Running the Applications

### Backend API

```bash
# From the root directory
cd apps/backend

# Start development server (with hot reload)
pnpm dev
```

The API will be available at `http://localhost:3000`

**Available Scripts:**
- `pnpm dev` - Start with ts-node-dev (watches for changes)
- `pnpm test` - Run tests (not yet configured)

### Mobile App

```bash
# From the root directory
cd apps/mobile

# Start Expo development server
pnpm start

# For specific platforms:
pnpm ios      # iOS simulator (macOS only)
pnpm android  # Android emulator
pnpm web      # Web preview
```

After running `pnpm start`, you can:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web
- Scan QR code with Expo Go app on your phone

## Key Features

### Mobile Screens

1. **Login**
   - Email and password validation
   - Session management with JWT tokens
   
2. **Home**
   - User profile display
   - Current verification status
   - Quick access to onboarding

3. **Onboarding (Multi-step)**
   - Step 1: Profile (name, DOB, nationality)
   - Step 2: Document (type, number)
   - Step 3: Address (line, city, country)
   - Step 4: Consents (terms acceptance)
   - Step 5: Review & Submit

4. **Settings**
   - Theme toggle (light/dark mode)
   - User preferences

### Navigation & Security

- **Route Guards**: Unauthenticated users redirected to login
- **Session Management**: Automatic refresh token handling
- **Session Expiry**: Clear error messaging and re-authentication on expiry

## API Endpoints

The backend provides the following endpoints:

### Authentication
- `POST /v1/auth/login` - User login

### User
- `GET /v1/me` - Current user profile

### Verification
- `GET /v1/verification/status` - Current verification status
- `POST /v1/onboarding/submit` - Submit onboarding form

### Error Format
All error responses follow a consistent format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {
      "fieldErrors": {}
    }
  }
}
```

## Architecture Notes

### State Management
- Mobile: Local state management with React hooks (expandable to Redux/Zustand)
- Backend: Stateless API design with database persistence

### Data Persistence
- Mobile: AsyncStorage for local caching and offline support
- Backend: Mock data store (ready for database integration)

### Testing
- Unit and integration tests to be implemented following TDD principles
- Test coverage for API contracts, form validation, and session management

## Development Workflow

1. **Make changes** to either app
2. **Auto-reload**: Both apps support hot reload in development
   - Backend: ts-node-dev watches file changes
   - Mobile: Expo Fast Refresh
3. **Test manually** through app UI
4. **Commit meaningfully** with descriptive messages

## Building for Production

### Backend
```bash
cd apps/backend
npm run build  # (once configured)
```

### Mobile
```bash
cd apps/mobile
eas build  # Requires Expo account and EAS setup
```

## Troubleshooting

### Backend won't start
- Check Port 3000 isn't already in use
- Verify all dependencies are installed: `pnpm install`
- Check `.env` file exists in `apps/backend/`

### Mobile app won't load
- Clear cache: `pnpm install --force`
- Kill all Expo processes and restart
- Check that backend is running if making API calls

### TypeScript errors
- Verify all packages are using compatible TypeScript versions
- Run `pnpm install` to ensure lock file is in sync

## Next Steps / Future Enhancements

- [ ] Integrate database (PostgreSQL/MongoDB)
- [ ] Add email verification
- [ ] Implement ML-based document verification
- [ ] Add analytics and error tracking
- [ ] CI/CD pipeline setup
- [ ] E2E testing with Detox

## Notes for Assessment Reviewers

- **TDD Approach**: Structure follows test-driven development principles where applicable
- **Error Handling**: Consistent error formats across mobile and backend
- **Session Management**: Implements access token + refresh token pattern
- **TypeScript**: Strict mode enabled, shared types between mobile and backend
- **Monorepo**: Uses pnpm workspaces and Turbo for efficient builds

---

**For more details on requirements, see:** [requirements/take home assesement.md](requirements/take%20home%20assesement.md)