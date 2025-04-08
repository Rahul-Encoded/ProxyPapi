# 🚦 ProxyPapi

_Your API's ultimate wingman — handles rate limits so you don’t get ghosted by third-party services._

## 📌 Overview

**ProxyPapi** is a robust proxy API service designed to transparently manage rate limits for third-party APIs. Acting as an intermediary, it handles API key authentication, enforces rate-limiting policies, forwards requests, and ensures response integrity. Developers can seamlessly integrate with ProxyPapi without worrying about request throttling or exceeding rate limits.

ProxyPapi also provides real-time monitoring and analytics through Prometheus and Grafana integration, enabling developers to track API usage, performance, and queue statistics effectively.

---

## ⚙️ Tech Stack

- **Backend:** Express.js, TypeScript  
- **Database:** MongoDB (with Mongoose ODM)  
- **Auth:** API Key-Based Authentication  
- **Rate Limiting:** Custom Strategies (Token Bucket implemented; more strategies planned: Fixed Window, Sliding Log, Leaky Bucket)  
- **Monitoring:** Prometheus Metrics + Grafana Dashboards  

---

## 🚀 Features

### 🔐 **Authentication & Security**
- **API Key Generation:** Secure API keys are issued upon user registration.
- **API Key Validation:** All requests require a valid `x-api-key` header for authentication.

### 🏗️ **App Registration**
- Register third-party APIs (e.g., OpenAI, Gemini) to be proxied through ProxyPapi.
- Configure custom rate-limiting strategies per app.

### 🌀 **Transparent Proxying**
- Forward all requests to the corresponding registered third-party API while maintaining headers and query parameters.
- Ensure full request/response integrity, including error handling.

### ⏳ **Customizable Rate Limiting**
- **Token Bucket Strategy:** Each app gets a "bucket" with limited tokens. Requests consume tokens, which refill at regular intervals.
- **Configurable Parameters:**
  - `maxRequests`: Number of tokens in the bucket.
  - `windowMs`: Refill window duration in milliseconds.

### 🕓 **Rate Limit Exceeded Response**
When the rate limit is exceeded:
```json
{
    "error": "Rate limit exceeded",
    "message": "Your request has been queued and will be processed shortly.",
    "remainingTokens": 0
}
```

### 📡 **Dynamic API Key Handling**
- Supports different API key mechanisms dynamically:
  - For **OpenAI**, the `Authorization` header is used (`Bearer <API_KEY>`).
  - For **Gemini**, the API key is converted into a query parameter (`key=<API_KEY>`).

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
CORS_ORIGIN=http://localhost:51732
JWT_SECRET=yourSuperSecretKey

# 5. Run the app
npm run dev
```

---

## 📬 API Endpoints

### 🔐 **Auth & API Key**

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

### 🏗️ **App Registration**

#### `POST /apps/register`

Register a third-party API to be proxied through ProxyPapi.

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

### 🌀 **Proxy Requests**

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

### 🪄 **Dynamic API Key Handling**

#### Example: OpenAI
For OpenAI, the `Authorization` header is passed as-is:
```http
Authorization: Bearer YOUR_OPENAI_API_KEY
```

#### Example: Gemini
For Gemini, the API key is automatically converted into a query parameter:
```http
?key=YOUR_GEMINI_API_KEY
```

---

## 📊 Monitoring & Metrics

### Prometheus Metrics

ProxyPapi exposes metrics at the `/metrics` endpoint for Prometheus scraping. Metrics include:

- **Request Count:** `proxy_request_total`
- **Remaining Tokens:** `proxy_tokens_remaining`
- **Request Durations:** `proxy_request_duration_seconds`

### Grafana Dashboards

Visualize API usage, performance, and queue statistics using Grafana. Import the pre-built dashboard or create your own.

---

## 🧪 Example Requests & Usage

Use the provided Postman collection to test ProxyPapi endpoints:

👉 [Postman Collection](https://app.getpostman.com/join-team?invite_code=ceea0d83d93248724204ab59074ba1bda82d9fa503d4cb79e6271f7c18afa57f)

---

## 🧑‍💻 Development Notes

### 📋 Assumptions Made
- One API key per user for simplicity (can be extended to per-app keys).
- Rate limits are configured at the app level, not the user level.
- Token Bucket is the first implemented rate-limiting strategy.

---

### 🧱 Git Hygiene: Avoiding the Large File Trap

To prevent GitHub push failures due to large file sizes (like 100MB+), we’ve taken the following precautions:

- **`.gitignore`:**  
  We've added `data/*` to `.gitignore` to exclude bulky files (like API logs, request data dumps, etc.) from being tracked by Git.

- **`.gitattributes`:**  
  We’ve initialized [Git LFS (Large File Storage)](https://git-lfs.github.com) to manage any future large files efficiently without clogging the repo. This ensures the repo remains fast and pushable.

These steps help avoid the classic *“File exceeds GitHub’s 100MB limit”* error and keep the repo clean and developer-friendly. 🔥

---

### 📂 Directory Structure

```bash
ProxyPapi/
├── src/
│   ├── controllers/        # Handles business logic
│   ├── middlewares/        # Authentication, rate limiting, etc.
│   ├── models/             # Database schemas
│   ├── routes/             # API routes
│   ├── services/           # Core services (e.g., rate limiting, queuing)
│   ├── utils/              # Utility functions (e.g., metrics, helpers)
│   └── workers/            # Background workers (e.g., queue processing)
├── types                   # TypeScript type definitions
├── .env                    # Environment variables
├── prometheus.yml          # Prometheus configuration file
├── tsconfig.json           # TypeScript configuration
├── package.json            # Node.js dependencies
└── README.md               # This file
```

---

## 🌟 Bonus Ideas (Roadmap)

- **Multiple Rate-Limiting Strategies:** Implement Fixed Window, Sliding Log, and Leaky Bucket strategies.
- **Request Priority Levels:** Allow users to prioritize certain requests over others.
- **API Usage Dashboard:** Provide a web-based dashboard for monitoring API usage and performance.
- **Analytics + Error Logs:** Detailed logs and analytics for debugging and optimization.

---

## 💬 Wanna Contribute?

Pull up with a PR or suggest a feature — let’s make ProxyPapi the MVP of rate limiting. 😎