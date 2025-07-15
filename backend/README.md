# Golf Scoreboard Backend

A Python Flask backend for the Golf Scoreboard application, designed to be deployed as an AWS Lambda function.

## Features

- **RESTful API** with endpoints for golf score management
- **DynamoDB integration** for persistent data storage
- **CORS enabled** for frontend integration
- **Lambda-ready** with proper event handling
- **Error handling** and validation

## API Endpoints

### GET /api/scores
Returns all current golf scores for the tournament.

**Response:**
```json
{
  "scores": {
    "1": {
      "round1": [4, 3, 5, null, ...],
      "round2": [null, null, ...]
    }
  },
  "lastUpdated": "2025-01-14T12:00:00.000Z"
}
```

### PUT /api/scores
Updates a single golf score.

**Request Body:**
```json
{
  "pairingId": 1,
  "round": "round1",
  "holeIndex": 0,
  "score": 4
}
```

### GET /health
Health check endpoint.

## Deployment

1. **Create the deployment package:**
   ```bash
   ./deploy.sh
   ```

2. **Set up AWS resources:**
   - Follow the commands in `aws-commands.md`
   - Creates DynamoDB table, IAM roles, and Lambda function

3. **Update the function:**
   ```bash
   aws lambda update-function-code \
       --function-name golf-scoreboard-backend \
       --zip-file fileb://golf-scoreboard-backend.zip
   ```

## Local Development

```bash
pip install -r requirements.txt
python app.py
```

The server will run on `http://localhost:5000`

## Environment Variables

- `DYNAMODB_TABLE_NAME`: DynamoDB table name (default: "golf-scores")

## Data Structure

The backend stores golf scores in DynamoDB with this structure:
- **Primary Key**: `id` (String) - "current_tournament"
- **Attributes**:
  - `scores`: Map of pairing IDs to their round data
  - `lastUpdated`: ISO timestamp of last update

## Architecture

- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Boto3**: AWS SDK for DynamoDB operations
- **Lambda Handler**: WSGI adapter for serverless deployment