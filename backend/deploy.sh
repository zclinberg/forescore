#!/bin/bash

# Create deployment package for AWS Lambda
echo "Creating Lambda deployment package..."

# Remove existing zip if it exists
rm -f golf-scoreboard-backend.zip

# Create a temporary directory for the package
mkdir -p package

# Install dependencies
pip install -r requirements.txt -t package/

# Copy application code
cp app.py package/

# Create zip file
cd package
zip -r ../golf-scoreboard-backend.zip .
cd ..

# Clean up
rm -rf package

echo "Deployment package created: golf-scoreboard-backend.zip"
echo "Package size: $(du -h golf-scoreboard-backend.zip | cut -f1)"