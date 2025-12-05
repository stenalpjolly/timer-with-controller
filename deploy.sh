#!/bin/bash

# Exit on error
set -e

# --- Configuration ---
# You can override these by setting environment variables before running the script
# Example: PROJECT_ID="my-project" ./deploy.sh
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
SERVICE_NAME="${SERVICE_NAME:-propresenter-timer}"
REGION="${REGION:-us-central1}"
REPO_NAME="${REPO_NAME:-$SERVICE_NAME}"

# --- Validation ---
if [ -z "$PROJECT_ID" ]; then
    echo "Error: No Google Cloud Project ID found."
    echo "Please set it via 'gcloud config set project YOUR_PROJECT_ID' or provide it as PROJECT_ID environment variable."
    exit 1
fi

IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME"

echo "========================================================"
echo "Deploying $SERVICE_NAME to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo "Image:   $IMAGE_NAME"
echo "========================================================"

# --- 1. Enable Required Services ---
echo "Ensuring required GCP services are enabled..."
gcloud services enable run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    cloudresourcemanager.googleapis.com

# --- 2. Create Artifact Registry Repository (if needed) ---
echo "Checking Artifact Registry..."
if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    echo "Creating Docker repository '$REPO_NAME' in $REGION..."
    gcloud artifacts repositories create "$REPO_NAME" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Docker repository for $SERVICE_NAME" \
        --project="$PROJECT_ID"
else
    echo "Repository '$REPO_NAME' already exists."
fi

# --- 3. Build and Push Docker Image ---
echo "Building and pushing Docker image using Cloud Build..."
gcloud builds submit --tag "$IMAGE_NAME" . --project "$PROJECT_ID"

# --- 4. Deploy to Cloud Run ---
echo "Deploying container to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_NAME" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --project "$PROJECT_ID"

echo ""
echo "✅ Deployment Success!"
echo "Your app is live. Check the URL above."