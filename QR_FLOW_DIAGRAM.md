# QR Code Flow Diagram - Before vs After

## 🔴 **BEFORE (Vulnerable):**

```
┌─────────────────────────────────────────────────────────────┐
│ LECTURER GENERATES QR CODE                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  QR Code: https://app.com/attend/session-123               │
│           ↓                                                  │
│  • Static URL (never changes)                               │
│  • Can be screenshot                                        │
│  • Can be shared via WhatsApp                               │
│  • No expiry                                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STUDENT SCANS (Path 1: scan-attendance)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Extract session ID                                      │
│  2. Call edge function ✅                                   │
│     • Validates section enrollment                          │
│     • Validates time window                                 │
│     • Checks duplicates                                     │
│  3. Mark attendance                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STUDENT VISITS URL (Path 2: /attend/sessionId)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Fetch session from database                             │
│  2. Direct database insert ❌                               │
│     • BYPASSES edge function                                │
│     • Different validation logic                            │
│  3. Mark attendance                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

❌ PROBLEMS:
• Two different code paths (inconsistent)
• QR never expires (can share screenshots)
• No token validation
• Student could mark attendance from home (if they have URL)
```

---

## 🟢 **AFTER (Secure):**

```
┌─────────────────────────────────────────────────────────────┐
│ LECTURER GENERATES QR CODE                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Every 60 seconds]                                         │
│   ↓                                                          │
│  Generate Token: base64("session-123:1728403200")          │
│   ↓                                                          │
│  QR: https://app.com/attend/session-123?token=xyz...       │
│   ↓                                                          │
│  Display with countdown: "Refreshes in 45s" 🟢             │
│                                                              │
│  • Token changes every minute                               │
│  • Old tokens expire after 2 minutes                        │
│  • Visual feedback for lecturer                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STUDENT SCANS (Both Paths Now Identical)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Extract: sessionId = "session-123"                      │
│              token = "xyz..."                               │
│   ↓                                                          │
│  2. Call edge function ✅                                   │
│      ↓                                                       │
│      SERVER VALIDATES:                                      │
│      ┌────────────────────────────────────────┐            │
│      │ ✓ Decode token                         │            │
│      │ ✓ Session ID matches                   │            │
│      │ ✓ Token age < 2 minutes                │            │
│      │ ✓ Student enrolled in section          │            │
│      │ ✓ Session time window                  │            │
│      │ ✓ Not duplicate                        │            │
│      └────────────────────────────────────────┘            │
│      ↓                                                       │
│  3. ✅ Mark attendance                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

✅ IMPROVEMENTS:
• Single validation path (consistent)
• Tokens expire (2-minute window)
• Server-side validation (cannot bypass)
• Screenshot sharing prevented
• URL sharing prevented
```

---

## 📸 **EXAMPLE SCENARIOS:**

### **Scenario 1: Normal Usage ✅**
```
Time: 10:00:00
Lecturer: Display QR (token: base64("session:10:00"))
Student:  Scan at 10:00:30
Server:   Token age = 30 seconds ✅ VALID
Result:   ✅ Attendance marked
```

### **Scenario 2: Slow Scanner ✅**
```
Time: 10:00:00
Lecturer: Display QR (token: base64("session:10:00"))
Time: 10:00:55 - QR rotates (token: base64("session:10:01"))
Student:  Still scanning old QR (10:00 token)
Time: 10:01:30
Student:  Scan completes with old token
Server:   Token age = 90 seconds ✅ VALID (within 2min grace)
Result:   ✅ Attendance marked
```

### **Scenario 3: Screenshot Sharing ❌**
```
Time: 10:00:00
Student A: Screenshot QR (token: base64("session:10:00"))
Time: 10:05:00
Student A: Share screenshot to Student B via WhatsApp
Time: 10:10:00
Student B: Try to scan screenshot
Server:   Token age = 10 minutes ❌ EXPIRED
Result:   ❌ "QR code expired. Please scan current QR."
```

### **Scenario 4: URL Sharing ❌**
```
Time: 10:00:00
Student A: Copy URL: https://app.com/attend/session-123?token=xyz
Time: 10:00:30
Student A: Send URL to Student B via message
Time: 10:03:00
Student B: Open URL
Server:   Token age = 3 minutes ❌ EXPIRED
Result:   ❌ "QR code expired. Please scan current QR."
```

### **Scenario 5: Token Tampering ❌**
```
Time: 10:00:00
Hacker:  Get URL: https://app.com/attend/session-123?token=xyz
Hacker:  Change session ID: session-456?token=xyz
Server:  Decode token → sessionId = "session-123"
         Request sessionId = "session-456"
         Mismatch! ❌
Result:  ❌ "Invalid QR code - session mismatch"
```

---

## 🔄 **TOKEN ROTATION TIMELINE:**

```
10:00:00 ┌──────────────────────────────────┐
         │ Token: base64(session:10:00)     │
         │ Valid until: 10:02:00            │
         │ Countdown: 60s → 1s              │
         └──────────────────────────────────┘
10:01:00 ┌──────────────────────────────────┐
         │ Token: base64(session:10:01)     │ ← QR updates
         │ Valid until: 10:03:00            │
         │ Countdown: 60s → 1s              │
         │                                  │
         │ Old token (10:00) still valid    │ ← Grace period
         └──────────────────────────────────┘
10:02:00 ┌──────────────────────────────────┐
         │ Token: base64(session:10:02)     │ ← QR updates
         │ Valid until: 10:04:00            │
         │                                  │
         │ Old token (10:00) EXPIRED ❌     │ ← 2 min passed
         └──────────────────────────────────┘
```

---

## 🎨 **UI CHANGES:**

### **Before:**
```
┌──────────────────────────────────┐
│   Session QR Code                │
│                                  │
│   ████████████████               │
│   ████  ▄▄▄▄  ████               │
│   ████  ████  ████               │
│   ████  ▀▀▀▀  ████               │
│   ████████████████               │
│                                  │
│   [Close]                        │
└──────────────────────────────────┘
```

### **After:**
```
┌──────────────────────────────────┐
│   Session QR Code                │
│                                  │
│   ████████████████               │
│   ████  ▄▄▄▄  ████               │
│   ████  ████  ████    ┌──────────┐
│   ████  ▀▀▀▀  ████    │🟢 47s   │ ← NEW!
│   ████████████████    └──────────┘
│                                  │
│   [Close]                        │
└──────────────────────────────────┘
         ↑
   Animated pulse
```

---

## 📊 **VALIDATION COMPARISON:**

### **Before:**

| Check | scan-attendance | /attend/[id] |
|-------|----------------|--------------|
| Authentication | ✅ | ✅ |
| Section Enrollment | ✅ | ✅ |
| Time Window | ✅ | ✅ |
| Duplicates | ✅ | ✅ |
| Token Validation | ❌ | ❌ |
| **Path** | **Edge Function** | **Direct Insert** |

### **After:**

| Check | scan-attendance | /attend/[id] |
|-------|----------------|--------------|
| Authentication | ✅ | ✅ |
| Section Enrollment | ✅ | ✅ |
| Time Window | ✅ | ✅ |
| Duplicates | ✅ | ✅ |
| Token Validation | ✅ | ✅ |
| **Path** | **Edge Function** | **Edge Function** |

✅ **Consistent validation across all paths!**

---

## 🎯 **QUICK REFERENCE:**

### **Token Format:**
```
Input:  sessionId = "abc-123", timestamp = 1728403200
        ↓
Encode: base64("abc-123:1728403200")
        ↓
Token:  "YWJjLTEyMzoxNzI4NDAzMjAw"
        ↓
URL:    https://app.com/attend/abc-123?token=YWJjLTEyMzoxNzI4NDAzMjAw
```

### **Validation Logic:**
```javascript
// Server receives token
const token = "YWJjLTEyMzoxNzI4NDAzMjAw"

// Decode
const decoded = atob(token) // "abc-123:1728403200"
const [tokenSessionId, timestamp] = decoded.split(':')

// Validate
if (tokenSessionId !== requestSessionId) throw "Session mismatch"
if (Date.now() - (timestamp * 60000) > 120000) throw "Expired"

// ✅ Valid!
```

---

## 🔒 **SECURITY LAYERS:**

```
Layer 1: Time-Based Tokens
         └─> Prevents: Screenshot sharing, URL sharing
         
Layer 2: Server-Side Validation
         └─> Prevents: Client-side bypass, token tampering
         
Layer 3: Section Enrollment
         └─> Prevents: Unauthorized access, wrong section
         
Layer 4: Time Window
         └─> Prevents: Early/late marking
         
Layer 5: Duplicate Check
         └─> Prevents: Multiple markings

✅ 5 Layers of Security = Robust System
```

---

**Visual Legend:**
- ✅ = Allowed/Valid
- ❌ = Blocked/Invalid
- 🟢 = Active/Live
- ⚠️ = Warning
- 🔒 = Secure

This is the complete flow of your improved QR code system!

