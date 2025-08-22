# PulseFlow API Documentation

## Overview

The PulseFlow API provides endpoints for managing employee wellbeing data, triggering interventions, and accessing analytics. All endpoints require authentication unless otherwise specified.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

PulseFlow uses Supabase Auth for authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Health Check

#### GET /health

Check the health status of the application and its dependencies.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": "45ms"
    },
    "environment": {
      "status": "healthy",
      "missingVars": []
    },
    "integrations": {
      "slack": "configured",
      "salesforce": "configured",
      "openai": "configured"
    }
  }
}
```

### Interventions

#### POST /interventions

Trigger wellbeing interventions for a user.

**Request Body:**
```json
{
  "userId": "optional-user-id",
  "triggerType": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "riskLevel": "high",
    "riskScore": 0.75,
    "confidence": 0.9,
    "actionsTriggered": 3,
    "actions": [
      {
        "type": "manager_alert",
        "priority": "high",
        "message": "Employee showing high burnout risk"
      },
      {
        "type": "slack_message",
        "priority": "high",
        "message": "Wellbeing check-in sent"
      }
    ]
  }
}
```

#### GET /interventions

Get intervention history for a user.

**Query Parameters:**
- `userId` (optional): User ID to get history for

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "interventionHistory": [
      {
        "id": "1",
        "timestamp": "2024-01-01T12:00:00.000Z",
        "type": "slack_message",
        "priority": "medium",
        "message": "Wellbeing check-in sent",
        "status": "completed"
      }
    ],
    "totalInterventions": 5,
    "lastIntervention": "2024-01-01T12:00:00.000Z"
  }
}
```

### Slack Integration

#### GET /integrations/slack

Get Slack data for a user.

**Query Parameters:**
- `days` (optional): Number of days to retrieve (default: 7)
- `userId` (optional): User ID to get data for

**Response:**
```json
{
  "data": [
    {
      "userId": "user123",
      "date": "2024-01-01T00:00:00.000Z",
      "messageCount": 25,
      "sentimentScore": 0.3,
      "responseTime": 2.5,
      "activeHours": 8
    }
  ]
}
```

#### POST /integrations/slack

Send a message via Slack.

**Request Body:**
```json
{
  "message": "Hello from PulseFlow!",
  "channel": "#general"
}
```

**Response:**
```json
{
  "success": true
}
```

### Salesforce Integration

#### GET /integrations/salesforce

Get Salesforce data for a user.

**Query Parameters:**
- `days` (optional): Number of days to retrieve (default: 7)
- `userId` (optional): User ID to get data for

**Response:**
```json
{
  "data": [
    {
      "userId": "user123",
      "date": "2024-01-01T00:00:00.000Z",
      "activitiesLogged": 12,
      "dealsProgressed": 2,
      "clientInteractions": 8,
      "pipelineValue": 75000
    }
  ]
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General endpoints**: 100 requests per minute per user
- **Intervention endpoints**: 10 requests per minute per user
- **Health check**: 60 requests per minute (no authentication required)

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

PulseFlow supports webhooks for real-time notifications:

### Slack Events

Configure your Slack app to send events to:
```
POST /api/slack/events
```

### Salesforce Webhooks

Configure Salesforce to send updates to:
```
POST /api/salesforce/webhooks
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { PulseFlowClient } from '@pulseflow/sdk';

const client = new PulseFlowClient({
  apiUrl: 'https://your-domain.com/api',
  token: 'your-jwt-token'
});

// Trigger intervention
const result = await client.interventions.trigger({
  userId: 'user123',
  triggerType: 'manual'
});

// Get wellbeing data
const data = await client.slack.getData({
  userId: 'user123',
  days: 30
});
```

### Python

```python
from pulseflow import PulseFlowClient

client = PulseFlowClient(
    api_url='https://your-domain.com/api',
    token='your-jwt-token'
)

# Trigger intervention
result = client.interventions.trigger(
    user_id='user123',
    trigger_type='manual'
)

# Get wellbeing data
data = client.slack.get_data(
    user_id='user123',
    days=30
)
```

## Testing

Use the following test endpoints in development:

```bash
# Health check
curl http://localhost:3000/api/health

# Test intervention (requires auth)
curl -X POST http://localhost:3000/api/interventions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"triggerType": "manual"}'
```

## Support

For API support and questions:
- Documentation: [docs.pulseflow.com](https://docs.pulseflow.com)
- Email: api-support@pulseflow.com
- GitHub Issues: [github.com/your-org/pulseflow/issues](https://github.com/your-org/pulseflow/issues)
