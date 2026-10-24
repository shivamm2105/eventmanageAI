# CelebrAI — REST API Specification
## PromptWars Virtual Challenge 5 | API Reference

All requests and responses use JSON format. Date fields adhere to ISO 8601 (`YYYY-MM-DD` or full ISO timestamp).

---

### 1. System Endpoints

#### `GET /api/health`
Checks application health and external provider configuration status.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-10-24T08:02:07.898Z",
  "environment": "development",
  "services": {
    "database": "connected",
    "aiProvider": {
      "provider": "Google Gemini",
      "configured": true,
      "model": "gemini-2.5-flash"
    }
  }
}
```

#### `GET /api/system/status`
Returns non-sensitive operational metadata.

**Response `200 OK`**:
```json
{
  "appName": "CelebrAI - Intelligent Event Planner",
  "environment": "development",
  "uptimeSeconds": 142,
  "ai": {
    "isConfigured": true,
    "model": "gemini-2.5-flash",
    "rateLimitMax": 25,
    "rateLimitWindowMinutes": 15
  },
  "persistence": {
    "engine": "SQLite3 (WAL Mode)",
    "localDatabase": true
  }
}
#### `POST /api/system/configure-ai`
Validates a Gemini API Key live with Google GenAI SDK and switches application to live AI mode.

**Request Body**:
```json
{
  "apiKey": "AIzaSy...",
  "model": "gemini-2.5-flash"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Successfully connected to Google Gemini using gemini-2.5-flash!",
  "configured": true,
  "model": "gemini-2.5-flash"
}
```

#### `POST /api/system/disconnect-ai`
Clears in-memory API key and switches application safely back to interactive Demo Mode.

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Switched to Demo Mode. Real API calls are disabled.",
  "configured": false
}
```

---

### 2. AI Plan Generation Endpoint

#### `POST /api/events/generate-plan`
Generates a structured celebration blueprint using Google Gemini AI or deterministic Demo Mode.

**Rate Limit**: 25 requests per 15-minute window per IP.

**Request Body**:
```json
{
  "requirements": {
    "title": "Ananya & Rohan Jaipur Royal Wedding",
    "eventType": "wedding",
    "eventDate": "2026-12-23",
    "city": "Jaipur",
    "guestCount": 250,
    "budget": 1500000,
    "currency": "INR",
    "venuePreference": "banquet",
    "themePreference": "Royal Velvet & Marigold",
    "dietaryPreferences": ["Vegetarian", "Jain Options Available"],
    "additionalInstructions": "Include fireworks if allowed"
  },
  "demoMode": false
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "plan": {
      "eventTitle": "Ananya & Rohan Jaipur Royal Wedding",
      "summary": "Curated celebration plan...",
      "planningAssumptions": ["Guest count estimated at 250..."],
      "recommendedTheme": {
        "name": "Royal Velvet & Marigold",
        "colorPalette": ["#4C1D95", "#7C3AED", "#F59E0B", "#FDF4FF"],
        "vibeDescription": "A sophisticated celebration...",
        "decorConcepts": ["Cascading floral canopy...", "Monogram photo backdrop..."]
      },
      "budgetItems": [
        {
          "id": "budget-1",
          "category": "Venue & Infrastructure",
          "estimatedAmount": 405000,
          "actualAmount": 0,
          "notes": "Indoor banquet space in Jaipur",
          "isCustom": false
        }
      ],
      "contingencyReserve": {
        "amount": 150000,
        "percentage": 10,
        "rationale": "Reserved for unforeseen expenses"
      },
      "timeline": [
        {
          "id": "task-1",
          "title": "Finalize venue contract",
          "category": "Venue",
          "phase": "3-6 months before",
          "dueDate": "2026-08-25",
          "completed": false,
          "priority": "critical"
        }
      ],
      "vendorCategories": [
        {
          "id": "vendor-1",
          "category": "Venue",
          "status": "research",
          "vendorName": "",
          "contactPerson": "",
          "phone": "",
          "email": "",
          "estimatedBudget": 405000,
          "actualCost": 0,
          "notes": "",
          "questionsToAsk": [
            "What is the noise curfew for outdoor sound?",
            "Does rental include setup and teardown hours?"
          ]
        }
      ],
      "personalizedIdeas": {
        "entertainment": ["Live acoustic welcome performance"],
        "diningExperience": ["Live chaat & dessert counters"],
        "guestExperience": ["Handwritten welcome cards"],
        "ecoFriendlyTips": ["Biodegradable tableware"]
      },
      "riskAndContingencies": [
        {
          "risk": "Unexpected guest turnout increase",
          "mitigation": "Maintain 10% food buffer with caterer",
          "severity": "medium"
        }
      ],
      "isDemoPlan": false,
      "generatedAt": "2026-10-24T08:15:00.000Z",
      "modelUsed": "gemini-2.5-flash"
    },
    "isDemo": false
  }
}
```

**Error Response `400 Bad Request` (Zod Validation Failure)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data provided.",
    "details": [
      {
        "path": "requirements.title",
        "message": "Title must be at least 3 characters long"
      }
    ]
  }
}
```

---

### 3. Events CRUD Endpoints

#### `GET /api/events`
Lists all saved celebration plans.

#### `GET /api/events/:id`
Retrieves full details of an event by ID.

#### `POST /api/events`
Creates and persists a new celebration record.

#### `PUT /api/events/:id`
Updates requirements or customized plan (budget actuals, task statuses, vendor contacts).

#### `DELETE /api/events/:id`
Deletes a celebration plan.

#### `DELETE /api/events`
Clears all saved plans (user data deletion workflow).
