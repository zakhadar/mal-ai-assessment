# Getting Started - Step by Step

## Prerequisites ✅
- Node.js 18+ installed
- pnpm installed globally: `npm install -g pnpm`
- For mobile: Expo Go app (from App Store/Play Store) or Android Studio/Xcode

## Step 1: Clone & Install
```bash
cd mal-ai-assessment
pnpm install
```

This installs all dependencies for backend, mobile, and shared packages.

## Step 2: Start Backend (Terminal 1)
```bash
cd apps/backend
pnpm dev
```

Expected output:
```
✅ Server running on http://localhost:4000
📍 Health check: http://localhost:4000/health
🔐 Test credentials: jane.doe@example.com / password123
```

Wait for the server to fully start before moving to Step 3.

## Step 3: Start Mobile (Terminal 2)
```bash
cd apps/mobile
pnpm start
```

You'll see a QR code and options. Choose:
- **`i`** - iOS simulator (macOS + Xcode only)
- **`a`** - Android emulator (Android Studio)
- **`w`** - Web browser (limited UI but works)
- **Scan QR** - Use Expo Go app on your physical phone

## Step 4: Test the App

### Login
1. You should see the Login screen
2. Test credentials are pre-filled: `jane.doe@example.com` / `password123`
3. Tap **Log In**

### Home Screen
1. See your name and email
2. Verification Status shows "NOT_STARTED"
3. Refresh Status button works (try tapping it)

### Start Onboarding
1. Tap **Start Onboarding** button
2. Fill in test data:

**Step 1 - Profile:**
- Full Name: `Jane Doe`
- Date of Birth: `1990-05-15`
- Nationality: `US`

**Step 2 - Document:**
- Document Type: `PASSPORT`
- Document Number: `P12345678`

**Step 3 - Address:**
- Address Line 1: `123 Main St`
- City: `Springfield`
- Country: `US`

**Step 4 - Consents:**
- Check "I accept the terms and conditions" box

**Step 5 - Review:**
- Review all the information
- Tap **Submit**

### Verify Success
1. You should see "Success!" message
2. Go back to Home
3. Status should now show **IN_PROGRESS** (changes color to blue)

### Try Dark Mode
1. Go to **Settings** tab
2. Toggle **Dark Mode** on
3. Go back to Home
4. Everything should be dark!
5. Close and reopen app - theme persists ✨

## Step 5: Test API Directly (Optional)

In another terminal:
```bash
cd mal-ai-assessment
.\test-api.ps1  # Windows PowerShell
# or
bash test-api.sh  # macOS/Linux (create this file by copying the PowerShell version)
```

This runs 8 automated API tests and shows all endpoints working.

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 4000 is in use
# Windows:
netstat -ano | findstr :4000
# macOS/Linux:
lsof -i :4000

# Kill the process using port 4000 and restart
```

### Mobile can't connect to backend
- **Android Emulator**: Change `API_URL` in `apps/mobile/src/config.ts` to `http://10.0.2.2:4000`
- **iOS Simulator**: Use `http://localhost:4000` or your computer's IP address
- **Physical Device**: Use your computer's local IP like `http://192.168.1.100:4000`

### AsyncStorage errors
```bash
cd apps/mobile
rm -rf node_modules
pnpm install
expo start --clear
```

### Form won't submit
- Make sure all fields are filled in (check validation hints under each field)
- Network errors? Check backend is still running
- Look at your network tab in browser DevTools if using `web` platform

---

## API Documentation

See `README.md` for full API docs, or try curl commands:

```bash
# Login
curl -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@example.com","password":"password123"}'

# Get verification status (replace TOKEN with actual token from login response)
curl -X GET http://localhost:4000/v1/verification/status \
  -H "Authorization: Bearer TOKEN"
```

---

## What's Next (Milestone 2)

The app is fully functional for M1. For M2, we'll add:
- ✅ (Already done!) Automatic token refresh on session expiry
- ⬜ Route guards to prevent direct access to protected screens
- ⬜ Comprehensive test suite
- ⬜ Production logging and monitoring

---

## File Structure Quick Reference

```
mal-ai-assessment/
├── apps/backend/src/server.ts         ← Start here for API
├── apps/mobile/App.tsx                ← Start here for mobile
├── packages/shared/src/types.ts       ← API contracts
├── README.md                          ← Full documentation
├── MILESTONE_1_SUMMARY.md             ← What was built
└── test-api.ps1                       ← API validation tests
```

---

## Need Help?

1. **Check error message** - Shows which field has the issue
2. **Check backend logs** - Terminal where you ran `pnpm dev`
3. **Check mobile logs** - Metro bundler output if using Expo web/Android
4. **Review README.md** - Full API documentation with all endpoints
5. **Look at test-api.ps1** - Shows how to call each endpoint

---

Good luck! Feel free to explore the app. It's fully functional end-to-end. 🚀
