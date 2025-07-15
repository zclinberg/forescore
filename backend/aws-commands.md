# AWS Lambda Deployment Commands

## Prerequisites
1. Install AWS CLI and configure credentials:
```bash
aws configure
```

2. Create DynamoDB table:
```bash
aws dynamodb create-table \
    --table-name golf-scores \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

## Create Lambda Function
```bash
# Create IAM role for Lambda
aws iam create-role \
    --role-name golf-scoreboard-lambda-role \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }'

# Attach basic Lambda execution policy
aws iam attach-role-policy \
    --role-name golf-scoreboard-lambda-role \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Attach DynamoDB access policy
aws iam attach-role-policy \
    --role-name golf-scoreboard-lambda-role \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Create the Lambda function (replace ACCOUNT_ID with your AWS account ID)
aws lambda create-function \
    --function-name golf-scoreboard-backend \
    --runtime python3.9 \
    --role arn:aws:iam::ACCOUNT_ID:role/golf-scoreboard-lambda-role \
    --handler app.lambda_handler \
    --zip-file fileb://golf-scoreboard-backend.zip \
    --timeout 30 \
    --memory-size 256 \
    --environment Variables='{
        "DYNAMODB_TABLE_NAME":"golf-scores"
    }'
```

## Update Lambda Function
```bash
# Update function code
aws lambda update-function-code \
    --function-name golf-scoreboard-backend \
    --zip-file fileb://golf-scoreboard-backend.zip

# Update function configuration if needed
aws lambda update-function-configuration \
    --function-name golf-scoreboard-backend \
    --timeout 30 \
    --memory-size 256
```

## Create API Gateway (Optional)
```bash
# Create REST API
aws apigateway create-rest-api \
    --name golf-scoreboard-api \
    --description "Golf Scoreboard Backend API"

# Note: You'll need to configure resources, methods, and deployments
# This is complex via CLI - consider using AWS Console or CloudFormation
```

## Test the Function
```bash
# Test health endpoint
aws lambda invoke \
    --function-name golf-scoreboard-backend \
    --payload '{
        "httpMethod": "GET",
        "path": "/health",
        "headers": {}
    }' \
    response.json

cat response.json
```

## Environment Variables
Set these environment variables in your Lambda function:
- `DYNAMODB_TABLE_NAME`: golf-scores

## Deployment Script
Run the deployment script to create the ZIP package:
```bash
./deploy.sh
```

## Complete Deployment Flow
1. Create DynamoDB table
2. Create IAM role and policies
3. Run `./deploy.sh` to create deployment package
4. Create Lambda function
5. Test the function
6. Set up API Gateway (if needed for public access)