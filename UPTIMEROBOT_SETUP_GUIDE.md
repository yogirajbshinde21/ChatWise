# UptimeRobot Setup Guide - Keep Your Render Backend Awake 24/7

## 🎯 Purpose
Render.com's free tier spins down backend services after 15 minutes of inactivity. UptimeRobot will ping your backend every 5 minutes to keep it awake and ensure your chat app is always responsive.

## 📊 Recommended Monitoring Endpoints

I've analyzed your backend and created **3 specialized endpoints** for UptimeRobot monitoring:

### 1. **`/health` - PRIMARY ENDPOINT** ✅ (RECOMMENDED)

**Full URL:** `https://backend-chatwise.onrender.com/health`

**What it does:**
- Checks if the server is running
- Verifies MongoDB database connection
- Returns detailed health status
- Returns 200 (healthy) or 503 (unhealthy)

**Why use this:**
- Most comprehensive check
- Ensures database connectivity
- Wakes up server AND establishes DB connection
- Returns meaningful status codes for monitoring

**Response Example:**
```json
{
  "status": "healthy",
  "message": "Server is running and database is connected",
  "database": "connected",
  "timestamp": "2025-12-01T10:30:00.000Z",
  "uptime": 3600
}
```

**Use Case:** Primary monitor - Set to check every 5 minutes

---

### 2. **`/ping` - LIGHTWEIGHT ENDPOINT** ⚡

**Full URL:** `https://backend-chatwise.onrender.com/ping`

**What it does:**
- Ultra-lightweight server check
- No database verification
- Instant response
- Always returns 200 if server is up

**Why use this:**
- Fastest response time
- Minimal server load
- Good for frequent checks
- No database overhead

**Response Example:**
```json
{
  "message": "pong",
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```

**Use Case:** Secondary monitor - Can check more frequently (every 3 minutes)

---

### 3. **`/api/test` - LEGACY ENDPOINT** 🔧

**Full URL:** `https://backend-chatwise.onrender.com/api/test`

**What it does:**
- Verifies backend configuration
- Shows environment info
- Confirms CORS settings

**Why use this:**
- Good for debugging
- Confirms environment setup
- No authentication required

**Response Example:**
```json
{
  "message": "Backend is working!",
  "nodeEnv": "production",
  "corsOrigin": "https://frontend-chatwise.onrender.com"
}
```

**Use Case:** Tertiary monitor - Optional, for redundancy

---

## 🚀 Step-by-Step UptimeRobot Setup

### Step 1: Create UptimeRobot Account
1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Sign up for a **free account**
3. Verify your email

### Step 2: Add Primary Monitor (`/health`)

1. Click **"+ Add New Monitor"**
2. Configure as follows:

   | Field | Value |
   |-------|-------|
   | **Monitor Type** | HTTP(s) |
   | **Friendly Name** | ChatWise Backend Health |
   | **URL** | `https://backend-chatwise.onrender.com/health` |
   | **Monitoring Interval** | Every 5 minutes |
   | **Monitor Timeout** | 30 seconds |
   | **HTTP Method** | GET |
   | **Expected Status Code** | 200 |

3. Click **"Create Monitor"**

### Step 3: Add Secondary Monitor (`/ping`) - OPTIONAL

1. Click **"+ Add New Monitor"**
2. Configure:

   | Field | Value |
   |-------|-------|
   | **Monitor Type** | HTTP(s) |
   | **Friendly Name** | ChatWise Backend Ping |
   | **URL** | `https://backend-chatwise.onrender.com/ping` |
   | **Monitoring Interval** | Every 3 minutes |
   | **Monitor Timeout** | 20 seconds |
   | **HTTP Method** | GET |

3. Click **"Create Monitor"**

### Step 4: Set Up Alert Contacts (OPTIONAL)

1. Go to **"My Settings"** → **"Alert Contacts"**
2. Add your email/Slack/Discord/Telegram
3. Configure alerts:
   - Alert when: Down
   - Alert after: 2 consecutive failures
   - Send alerts to: Your email

---

## ⚙️ Optimal Configuration

### Recommended Setup (Free Tier):

**Single Monitor Strategy:**
- Use **`/health`** endpoint only
- Check every **5 minutes**
- This gives you **288 checks per day** (well within free tier limit)
- Server will never spin down (15-minute timeout avoided)

**Dual Monitor Strategy (Advanced):**
- Primary: **`/health`** every 5 minutes
- Secondary: **`/ping`** every 3 minutes
- Provides redundancy and more frequent wake-ups

### Free Tier Limits:
- ✅ Up to 50 monitors
- ✅ 5-minute monitoring interval
- ✅ 2 months of logs
- ✅ Email/SMS/Webhook alerts

---

## 🖥️ Frontend Monitoring - Is It Needed?

### ❌ **No monitoring needed for frontend**

**Reason:**
Your frontend is deployed as a **static site** on Render.com, which means:
- It's served from a CDN (Content Delivery Network)
- No server process running
- No spin-down/sleep behavior
- Always available instantly
- No need for wake-up pings

**Frontend URL:** `https://frontend-chatwise.onrender.com`
- This is just HTML, CSS, and JavaScript files
- Render serves them 24/7 without sleeping
- No monitoring required!

---

## 📈 Monitoring Dashboard

Once set up, you'll see:
- **Uptime percentage** (aim for 99.9%+)
- **Response time graphs**
- **Downtime alerts**
- **Incident history**

---

## 🔍 Testing Your Setup

### Test Endpoints Manually:

**Test `/health` endpoint:**
```bash
curl https://backend-chatwise.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Server is running and database is connected",
  "database": "connected",
  "timestamp": "2025-12-01T10:30:00.000Z",
  "uptime": 3600
}
```

**Test `/ping` endpoint:**
```bash
curl https://backend-chatwise.onrender.com/ping
```

Expected response:
```json
{
  "message": "pong",
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```

---

## 🎯 Summary & Recommendations

### **Best Practice Setup:**

1. **Primary Monitor:** `/health` - Every 5 minutes
   - Most reliable
   - Checks database connectivity
   - Prevents server sleep
   - Detects real issues

2. **Secondary Monitor (Optional):** `/ping` - Every 3 minutes
   - Provides redundancy
   - More frequent wake-ups
   - Lighter server load

3. **Frontend:** No monitoring needed (static site, doesn't sleep)

### **Expected Results:**

✅ **Before UptimeRobot:**
- First request after 15+ minutes: **10-30 seconds** (cold start)
- Users experience delays

✅ **After UptimeRobot:**
- All requests: **< 2 seconds** (server always warm)
- No cold starts
- Instant response for users

---

## 🔧 Troubleshooting

### Issue: Monitor shows "Down"
**Solution:**
- Check Render dashboard - Is service running?
- Verify URL is correct
- Check MongoDB connection in Render logs

### Issue: High response times
**Possible causes:**
- Database query slowness
- Cold start (first ping after sleep)
- Network latency

### Issue: Too many alerts
**Solution:**
- Increase "Alert after X failures" to 2-3
- Adjust timeout to 30 seconds
- Use `/ping` instead of `/health` for more tolerance

---

## 📊 Monitoring Best Practices

1. **Don't over-monitor:** 5 minutes is optimal for free tier
2. **Use `/health` as primary:** Ensures full stack health
3. **Set up email alerts:** Get notified of real issues
4. **Monitor response times:** Spike indicates problems
5. **Check weekly reports:** Understand uptime patterns

---

## 💰 Cost Comparison

| Monitoring | UptimeRobot Free | UptimeRobot Pro |
|------------|------------------|-----------------|
| **Monitors** | 50 | Unlimited |
| **Interval** | 5 min | 1 min |
| **SMS Alerts** | No | Yes |
| **Advanced Alerts** | Basic | Advanced |
| **Cost** | **$0/month** | $7/month |

**Recommendation:** Free tier is perfect for your use case!

---

## ✅ Quick Setup Checklist

- [ ] Created UptimeRobot account
- [ ] Added `/health` monitor (5-minute interval)
- [ ] (Optional) Added `/ping` monitor (3-minute interval)
- [ ] Set up email alert contacts
- [ ] Tested endpoints manually
- [ ] Verified monitors show "Up" status
- [ ] Confirmed backend stays awake after 20+ minutes

---

## 🎉 Final Result

**After completing this setup:**
- ✅ Backend stays awake 24/7
- ✅ No cold starts for users
- ✅ Instant response times
- ✅ Database always connected
- ✅ Get alerts if backend goes down
- ✅ Free solution, no cost

**Your chat app will be as responsive as paid hosting!** 🚀

---

**Questions?**
- UptimeRobot docs: https://uptimerobot.com/kb/
- Render docs: https://render.com/docs
- Check backend logs in Render dashboard for issues
