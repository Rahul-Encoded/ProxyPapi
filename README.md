# 🚦 ProxyPapi

_Your API's ultimate wingman — handles rate limits so you don’t get ghosted by third-party services._

## 📌 Overview

**ProxyPapi** is a proxy API service that transparently manages rate limits for third-party APIs. Acting as an intermediary, it handles API key authentication, rate-limiting enforcement, and request forwarding, so developers can plug and play without stressing about request throttling.

---

## ⚙️ Tech Stack

- **Backend:** Express.js, TypeScript  
- **Database:** MongoDB (with Mongoose ODM)  
- **Auth:** API key-based  
- **Rate Limiting:** Custom strategies (Token Bucket for now; more to come 👀)  

---

## 🚀 Features

- 🔑 API Key Authentication
- 🧠 App (3rd-party API) Registration
- 🌀 Transparent Proxying with full request/response integrity
- ⏳ Customizable Rate Limiting per App
- 🕓 Smart Queuing when rate limits hit
- 📢 Queue Status Feedback

---

## 🛠️ Setup Instructions

```bash
# 1. Clone this repo
git clone https://github.com/yourusername/ProxyPapi.git

# 2. Move into the project folder
cd ProxyPapi

# 3. Install dependencies
npm install

# 4. Create a `.env` file and add the following:
# (Replace values as needed)
PORT=3000
MONGODB_URI=mongodb://localhost:27017/proxypapi
JWT_SECRET=yourSuperSecretKey

# 5. Run the app
npm run dev
```

---

## 📬 API Endpoints

### 🔐 Auth & API Key

#### `POST /register`
Register a user and receive an API key.

**Body:**
```json
{
  "email": "your@email.com"
}
```

**Response:**
```json
{
  "apiKey": "abcd-1234-..."
}
```

---

### 🏗️ App Registration

#### `POST /apps/register`

Register a third-party API you want to proxy through ProxyPapi.

**Headers:**
- `x-api-key: YOUR_API_KEY`

**Body:**
```json
{
  "name": "OpenAI",
  "baseURL": "https://api.openai.com/v1",
  "rateLimit": {
    "strategy": "token_bucket",
    "maxRequests": 60,
    "windowMs": 60000
  }
}
```

**Response:**
```json
{
  "appId": "app_abc123"
}
```

---

### 🌀 Proxy Requests

#### `ANY /apis/:appId/*`

All requests forwarded to the corresponding registered third-party API.

**Headers:**
- `x-api-key: YOUR_API_KEY`
- Any other headers required by the third-party API

**Example:**
```http
GET /apis/app_abc123/completions
```

ProxyPapi will forward this to:
```
https://api.openai.com/v1/completions
```

---

## ⛔ Rate Limiting Strategy

### 🪙 Token Bucket (default)

Each app gets a "bucket" with limited tokens. Each request consumes a token. Buckets refill at regular intervals.

**Configurable Parameters:**
- `maxRequests` – number of tokens
- `windowMs` – refill window in milliseconds

---

## 🧠 Request Queuing

When limits are hit, requests go into a queue instead of getting yeeted with a 429.

- Requests are retried automatically when the window resets.
- Queued requests receive a `202 Accepted` response with a status tracking ID.

### ✅ Status Endpoint (Coming Soon)
Check queue status using:
```http
GET /queue/:requestId
```

---

## 📈 Monitoring & Analytics

_Coming Soon_  
**📝 Placeholder for screenshots / demo:**  
> _Add screenshots or terminal logs showing usage patterns and rate limiting in action_

---

## 🧪 Example Requests & Usage

_Coming Soon_  
**📝 Placeholder for Postman collection, curl examples, etc.**

---

## ⚙️ Rate Limit Config Updates

_Coming Soon_  
**📝 Placeholder for instructions/screenshots on updating rate limit settings**

---

## 🧙‍♂️ Assumptions Made

- One API key per user for simplicity (can be extended to per-app keys)
- All rate limits are configured at app-level, not user-level
- Token Bucket is the first implemented strategy

---

## 📦 Directory Structure

```bash
ProxyPapi/
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── .env
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🌟 Bonus Ideas (On the roadmap)

- Multiple rate-limiting strategies (fixed window, sliding log, leaky bucket)
- Request priority levels
- API usage dashboard
- WebSocket updates for queued request statuses
- Analytics + error logs

---

## 💬 Wanna Contribute?

Pull up with a PR or suggest a feature — let’s make ProxyPapi the MVP of rate limiting. 😎

---

## 📄 License

MIT – Go wild (responsibly).

---

Let me know when you're ready to fill in the screenshots or want help with docs for queue tracking, analytics, or strategy switching.