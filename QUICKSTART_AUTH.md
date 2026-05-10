# Quick Start - Authentication Testing

## ⚡ 5-Minute Quick Start

### 1️⃣ Start Development Server
```bash
cd /workspaces/pulseFlow
npm run dev
```
✅ Wait for: "Local:        http://localhost:3000"

### 2️⃣ Open Browser
```
http://localhost:3000
```
✅ Should automatically redirect to http://localhost:3000/auth/login

### 3️⃣ Create Test Account
**Click "Create a new account"**

Fill in:
```
Full Name:  Test User
Email:      test@yourdomain.com
Password:   TestPassword123!
Department: Engineering
Role:       Employee (or Manager/Executive)
```

✅ Click "Create Account"

### 4️⃣ Verify Email
- Go to Supabase Dashboard
- Project: `nirtzamzrlzoiljeitix`
- Check Auth Emails sent
- Use the confirmation link (in development, can skip if auto-confirmed)

### 5️⃣ Sign In
**On login page:**
```
Email:    test@yourdomain.com
Password: TestPassword123!
```

✅ Click "Sign in"

**Expected**: Redirect to `/dashboard` ✓

---

## 🔍 What You Should See

### Terminal Output
```
✓ Compiled successfully in X.Xs
Ready in XXms
```

### Browser Console (F12)
```
✅ EXPECTED:
   GET https://localhost:3000/api/auth/me 401 (first visit before login)
   GET https://localhost:3000/api/wellbeing 200 (after login)

❌ NOT EXPECTED:
   Supabase admin credentials not configured (FIXED)
   Multiple GoTrueClient instances (FIXED)
```

### Dashboard After Login
Should show:
- ✅ Wellbeing Chart
- ✅ Productivity Correlation
- ✅ Team Health Heatmap
- ✅ Alerts and recommendations

---

## 🧪 Test All Features

### ✅ Test 1: Sign Up
```
URL: http://localhost:3000
Action: Click "Create a new account"
Expected: Can register new user
Result: ✓ Login page after signup confirmation
```

### ✅ Test 2: Login
```
URL: http://localhost:3000/auth/login
Action: Enter email & password, click Sign in
Expected: Redirect to dashboard
Result: ✓ /dashboard loads with user data
```

### ✅ Test 3: Password Reset
```
URL: http://localhost:3000/auth/login
Action: Click "Forgot your password?"
Step 1: Enter email → Click "Send Reset Link"
Step 2: Check email for reset link
Step 3: Click link → Set new password
Expected: Redirect to login with success message
Result: ✓ Can log in with new password
```

### ✅ Test 4: Session Persistence
```
URL: http://localhost:3000/dashboard
Action: Refresh page (F5)
Expected: Stay on dashboard (session persisted)
Result: ✓ Still authenticated
```

### ✅ Test 5: Logout (If Implemented)
```
URL: http://localhost:3000/dashboard
Action: Find and click "Sign out" button
Expected: Redirect to /auth/login
Result: ✓ Session cleared
```

---

## 🐛 Troubleshooting

### Issue: "Invalid email or password"
```
Solution:
1. Make sure you signed up first with /auth/signup
2. Check email spelling
3. Check password is correct
4. Try password reset: /auth/forgot-password
```

### Issue: Blank dashboard after login
```
Solution:
1. Database not set up yet
2. Run: npm run seed (if available)
3. Or manually add data to Supabase
```

### Issue: Still getting 401 errors
```
Solution:
1. Close browser completely
2. Clear cookies: DevTools → Application → Cookies
3. Restart npm run dev
4. Try login again
```

### Issue: Email not working
```
Solution:
1. Check spam folder
2. Go to Supabase Dashboard
3. Auth → Email Templates → Check sender
4. Create new account with different email
```

---

## 📊 Architecture at a Glance

```
Browser
  ↓
[Next.js App] (/auth/login, /auth/signup, /dashboard)
  ↓
[Supabase Auth] (Email/Password, Session Management)
  ↓
[Supabase Database] (Users, Wellbeing Metrics, Teams)
  ↓
[API Routes] (/api/auth/me, /api/wellbeing, /api/team)
```

---

## 🎯 Success Criteria

- ✅ Can create new account
- ✅ Can verify email
- ✅ Can log in with credentials
- ✅ Redirected to dashboard
- ✅ Dashboard shows data (or loading state)
- ✅ Can reset password
- ✅ Can refresh page while logged in
- ✅ Console has no critical errors

When all ✅, you're ready to deploy!

---

## 📝 Environment Check

Your environment is configured with:
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
```

All set! 🚀
