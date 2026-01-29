# Health Monitoring Implementation Guide

## ✅ Implementation Complete

All requirements have been successfully implemented for comprehensive health monitoring with visual alerts.

---

## 📊 Health Check Endpoints

### 1. Order Service Health Checks

#### Basic Health: `GET /health`
```bash
curl http://localhost:3001/health
```

**Response (Healthy):**
```json
{
  "service": "order-service",
  "status": "healthy",
  "timestamp": "2026-01-29T10:05:11.601Z",
  "checks": {
    "database": "up",
    "redis": "up"
  },
  "details": {
    "database": {
      "connection": "ok",
      "orders_table": "accessible"
    },
    "redis": {
      "ping": "ok",
      "read_write": "ok"
    }
  }
}
```

**Response (Degraded - Database Issue):**
```json
{
  "service": "order-service",
  "status": "degraded",
  "timestamp": "2026-01-29T10:05:11.601Z",
  "checks": {
    "database": "down",
    "database_error": "Orders table does not exist",
    "redis": "up"
  },
  "details": {
    "database": {
      "connection": "ok",
      "orders_table": "not accessible"
    }
  }
}
```
**HTTP Status:** 503 Service Unavailable

#### Deep Health: `GET /health/deep`
Checks downstream dependencies including Inventory Service.

```bash
curl http://localhost:3001/health/deep
```

---

### 2. Inventory Service Health Checks

#### Basic Health: `GET /health`
```bash
curl http://localhost:3002/health
```

**Response (Healthy):**
```json
{
  "service": "inventory-service",
  "status": "healthy",
  "timestamp": "2026-01-29T10:05:19.055Z",
  "checks": {
    "database": "up",
    "redis": "up"
  },
  "details": {
    "database": {
      "connection": "ok",
      "inventory_table": "accessible",
      "item_count": "5"
    },
    "redis": {
      "ping": "ok",
      "read_write": "ok"
    }
  }
}
```

**Response (Degraded - Redis Issue):**
```json
{
  "service": "inventory-service",
  "status": "degraded",
  "timestamp": "2026-01-29T10:05:19.055Z",
  "checks": {
    "database": "up",
    "redis": "down",
    "redis_error": "Redis read/write verification failed"
  },
  "details": {
    "redis": {
      "ping": "failed",
      "read_write": "failed"
    }
  }
}
```
**HTTP Status:** 503 Service Unavailable

---

## 🔍 What Each Health Check Verifies

### Database Health Verification
- ✅ **Connection Test**: Executes `SELECT 1` to verify connectivity
- ✅ **Table Existence**: Checks `information_schema.tables` for required tables
  - Order Service: Verifies `orders` table exists
  - Inventory Service: Verifies `inventory` table exists
- ✅ **Query Capability**: Executes `SELECT COUNT(*)` to verify table is readable
- ✅ **Detailed Error Messages**: Returns specific error when table is not accessible

### Redis Health Verification
- ✅ **Ping Test**: Verifies Redis server responds
- ✅ **Write Test**: Sets a test key with timestamp value (expires in 10s)
- ✅ **Read Test**: Retrieves the test key to verify read operations
- ✅ **Data Integrity**: Compares written vs read values
- ✅ **Cleanup**: Deletes test key after verification

### Downstream Dependencies
- ✅ **Order Service → Inventory Service**: `/health/deep` endpoint checks inventory service availability
- ✅ **Circuit Breaker Integration**: Respects existing circuit breaker patterns

---

## 🚨 Visual Alert System

### Access the Health Dashboard
1. Navigate to: **http://localhost:3000**
2. Click on the **"Health"** tab in the navigation

### Alert Thresholds

#### 🟢 **GREEN - Optimal Performance**
- **Condition**: Average response time < 500ms
- **Status**: "System responding optimally"
- **Visual**: Green banner with checkmark

#### 🟡 **YELLOW - Warning**
- **Condition**: Average response time 500-1000ms
- **Status**: "⚡ Slight delay detected"
- **Visual**: Yellow banner

#### 🔴 **RED - Critical Alert**
- **Condition**: Average response time > 1000ms (1 second)
- **Status**: "⚠️ CRITICAL ALERT - Response time exceeds 1 second threshold"
- **Visual**: 
  - Red gradient banner with animated warning icon 🚨
  - Large bold response time display
  - Pulsing animation to draw attention

### Rolling Window Calculation

The system tracks **Order Service response time** over a **30-second rolling window**:

- Measurements taken every **2 seconds**
- Stores all measurements from the last **30 seconds**
- Calculates **average response time** across this window
- Automatically removes old measurements
- Visual indicator shows: "Tracking: X measurements over 30-second window"

---

## 🧪 Testing the System

### Test 1: Normal Operation (Green Status)

1. Open **http://localhost:3000**
2. Navigate to **Health** tab
3. **Expected Result**: 
   - Green response time indicator
   - Both services showing "✓ Online"
   - Response time < 500ms

### Test 2: Simulate Performance Degradation (Red Alert)

1. Open **http://localhost:3000**
2. Go to **Health** tab (keep it open)
3. Switch to **Chaos Control** tab
4. Click **"🟠 Moderate Chaos"** preset
5. Switch back to **Health** tab
6. **Expected Result**:
   - Response time increases to ~5000ms
   - Indicator changes from Green → Yellow → Red
   - 🚨 Critical Alert banner appears
   - Animated warning icon pulses

### Test 3: Verify Database Health Check

**Simulate database table missing:**

```bash
# Connect to postgres container
docker exec -it valerix-postgres psql -U valerix -d order_db

# Rename orders table (simulate missing table)
ALTER TABLE orders RENAME TO orders_backup;

# Exit postgres
\q

# Test health endpoint
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "service": "order-service",
  "status": "degraded",
  "checks": {
    "database": "down",
    "database_error": "relation \"orders\" does not exist"
  }
}
```
**HTTP Status:** 503

**Restore the table:**
```bash
docker exec -it valerix-postgres psql -U valerix -d order_db -c "ALTER TABLE orders_backup RENAME TO orders;"
```

### Test 4: Verify Redis Health Check

**Stop Redis temporarily:**

```bash
docker compose stop redis

# Test health endpoint
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "service": "order-service",
  "status": "degraded",
  "checks": {
    "redis": "down",
    "redis_error": "Connection is closed"
  }
}
```
**HTTP Status:** 503

**Restart Redis:**
```bash
docker compose start redis
```

---

## 📸 Dashboard Features

### Real-Time Monitoring
- Updates every **2 seconds**
- Shows current timestamp of last check
- Displays number of measurements in rolling window

### Service Cards
Each service card displays:
- **Header**: Color-coded (Green = healthy, Red = degraded)
- **Status Indicator**: Pulsing dot with animation
- **Database Details**: Connection status, table accessibility, item count
- **Redis Details**: Ping status, read/write capability
- **Error Messages**: Highlighted in red boxes with full error text

### System Metrics Panel
- Service online/offline status
- Average response time with color coding
- Last check timestamp
- Performance status badge (OPTIMAL/WARNING/CRITICAL)
- Visual progress bar showing response time vs threshold

### Performance Indicator Bar
- Shows response time relative to 2000ms max
- Color changes dynamically:
  - Green (0-500ms)
  - Yellow (500-1000ms)
  - Red (1000ms+)
- Scale markers: 0ms, 1000ms (threshold), 2000ms

---

## 🎯 Implementation Details

### Backend Changes

1. **Enhanced Database Health Checks**
   - Location: `services/{service}/src/config/database.js`
   - Verifies table existence via `information_schema`
   - Tests query execution with `SELECT COUNT(*)`
   - Returns detailed error messages

2. **Enhanced Redis Health Checks**
   - Location: `services/{service}/src/config/redis.js`
   - Performs read/write verification
   - Tests data integrity
   - Returns specific failure points

3. **Updated Health Controllers**
   - Location: `services/{service}/src/controllers/healthController.js`
   - Returns 503 status code on degraded state
   - Includes `details` object with component status
   - Provides granular error information

### Frontend Changes

1. **Enhanced Health Dashboard**
   - Location: `services/frontend/components/HealthDashboard.js`
   - Implements 30-second rolling window
   - Tracks Order Service response time separately
   - Animated alert system with Framer Motion
   - Real-time color-coded indicators

2. **Visual Components**
   - Critical alert banner (animated)
   - Service status cards with gradients
   - Performance metrics panel
   - Progress bar visualization

---

## 🔄 Continuous Monitoring

The dashboard automatically:
- ✅ Polls health endpoints every 2 seconds
- ✅ Maintains 30-second rolling window
- ✅ Triggers visual alerts on threshold breach
- ✅ Shows detailed error messages
- ✅ Animates status changes

---

## 📝 API Response Codes

| Status Code | Meaning | When It's Returned |
|-------------|---------|-------------------|
| 200 OK | Service healthy | All dependencies operational |
| 503 Service Unavailable | Service degraded | Database, Redis, or downstream service unavailable |

---

## 🎓 Demo Flow for Presentations

1. **Show Normal State**
   - Health Dashboard: All green
   - Response time < 100ms
   - All services "✓ Online"

2. **Apply Chaos**
   - Go to Chaos Control tab
   - Click "🟠 Moderate Chaos"
   - Return to Health tab

3. **Show Degradation**
   - Watch response time climb
   - Indicator turns yellow, then red
   - 🚨 Critical alert appears
   - Animated warning draws attention

4. **System Still Works**
   - Go to Orders tab
   - Place an order successfully
   - Show circuit breaker fallbacks

5. **Recovery**
   - Return to Chaos Control
   - Click "✅ Disable All Chaos"
   - Watch Health Dashboard recover to green

---

## ✨ Key Features Implemented

✅ **Comprehensive Dependency Verification**
- Not just "200 OK" - actual database table and Redis operation tests

✅ **Appropriate Error Messages**
- Specific error details (table missing, connection failed, read/write failed)

✅ **Visual Alert System**
- Color-coded thresholds (Green/Yellow/Red)
- 30-second rolling window average
- Animated critical alerts
- Real-time updates every 2 seconds

✅ **Production-Ready Monitoring**
- HTTP 503 status on degraded state
- Downstream dependency checks
- Detailed health reports
- Performance metrics tracking

---

## 🚀 Ready for Production

The health monitoring system is now fully operational and production-ready with:
- Proper status codes
- Detailed error messages
- Visual alerts with animations
- Real-time performance tracking
- Comprehensive dependency verification

Access it at: **http://localhost:3000** → **Health** tab
