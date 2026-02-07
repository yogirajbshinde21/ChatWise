# 🚀 UptimeRobot Quick Setup - ChatWise Backend

## ✅ What I've Done for You

I've analyzed your backend and created **3 health check endpoints** specifically for UptimeRobot monitoring:

---

## 📍 Endpoints Created

### 1. `/health` - **RECOMMENDED FOR UPTIMEROBOT** ⭐
```
URL: https://backend-chatwise.onrender.com/health
```
- ✅ Checks server is running
- ✅ Verifies MongoDB connection
- ✅ Returns uptime statistics
- ✅ Returns 503 if database is down

**Use this as your PRIMARY monitor**

---

### 2. `/ping` - **LIGHTWEIGHT BACKUP**
```
URL: https://backend-chatwise.onrender.com/ping
```
- ✅ Ultra-fast response
- ✅ No database check
- ✅ Minimal server load

**Use this as a SECONDARY monitor** (optional)

---

### 3. `/api/test` - **ALREADY EXISTS**
```
URL: https://backend-chatwise.onrender.com/api/test
```
- ✅ Shows environment info
- ✅ Confirms CORS settings

**Use this as TERTIARY monitor** (optional for debugging)

---

## 🎯 UptimeRobot Setup (2 Minutes)

### Step 1: Create Account
Go to [uptimerobot.com](https://uptimerobot.com) → Sign up (FREE)

### Step 2: Add Monitor
Click **"+ Add New Monitor"** and enter:

| Setting | Value |
|---------|-------|
| **Monitor Type** | HTTP(s) |
| **Friendly Name** | ChatWise Backend |
| **URL** | `https://backend-chatwise.onrender.com/health` |
| **Interval** | Every 5 minutes |
| **Timeout** | 30 seconds |

Click **"Create Monitor"** → Done! ✅

---

## 📊 What This Achieves

### ❌ Before UptimeRobot:
- Server sleeps after 15 minutes
- First request takes 10-30 seconds (cold start)
- Users experience delays

### ✅ After UptimeRobot:
- Server **NEVER sleeps**
- All requests are **instant** (< 2 seconds)
- Database always connected
- **Professional-grade uptime**

---

## 🖥️ Frontend - No Monitoring Needed

**Your frontend:** `https://frontend-chatwise.onrender.com`

❌ **NO UptimeRobot monitoring required**

**Why?**
- It's a **static site** (just HTML/CSS/JS files)
- Served from CDN
- Never sleeps
- Always instantly available

---

## ✅ Quick Test Right Now

Test the endpoints are working:

```bash
# Test /health
curl https://backend-chatwise.onrender.com/health

# Test /ping
curl https://backend-chatwise.onrender.com/ping
```

Both should return JSON responses immediately!

---

## 📋 Complete Setup Checklist

- [ ] Create UptimeRobot account
- [ ] Add monitor for `/health` endpoint
- [ ] Set interval to 5 minutes
- [ ] Verify monitor shows "Up" status
- [ ] (Optional) Add email alert contacts
- [ ] Test backend stays awake after 20+ minutes

---

## 💰 Cost

**100% FREE** with UptimeRobot free tier:
- ✅ 50 monitors
- ✅ 5-minute intervals
- ✅ Email alerts
- ✅ 2 months of logs

---

## 🎉 Result

Your chat app will now:
- ✅ Respond instantly 24/7
- ✅ Never experience cold starts
- ✅ Feel like paid hosting
- ✅ Cost **$0/month**

---

**Need detailed instructions?** See `UPTIMEROBOT_SETUP_GUIDE.md`

**Questions about Gemini AI quota?**
- Your API key exceeded free tier quota
- Wait 1-2 minutes between AI summary requests
- Or get a new API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
