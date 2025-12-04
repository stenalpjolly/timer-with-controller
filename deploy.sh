#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="spj-timer-prj"
SERVICE_NAME="propresenter-timer"
REGION="us-central1"
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$SERVICE_NAME"

# Build and push the Docker image using Cloud Build
echo "Submitting build to Cloud Build..."
gcloud builds submit --tag $IMAGE_NAME .

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --project $PROJECT_ID

echo "Deployment complete!"