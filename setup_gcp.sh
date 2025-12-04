#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="spj-timer-prj"
SERVICE_NAME="propresenter-timer"
REGION="us-central1"

echo "Setting project ID to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

echo "Enabling required APIs..."
gcloud services enable run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    cloudresourcemanager.googleapis.com

echo "Granting Storage Object Viewer, Artifact Registry Writer, and Logs Writer roles to default Compute Engine Service Account..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
# Grant to the default compute service account which Cloud Build often uses by default
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/storage.objectViewer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/logging.logWriter"

echo "Creating Artifact Registry repository..."
# Check if repository exists
if ! gcloud artifacts repositories describe $SERVICE_NAME --location=$REGION --project=$PROJECT_ID &>/dev/null; then
    gcloud artifacts repositories create $SERVICE_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker repository for $SERVICE_NAME"
else
    echo "Repository $SERVICE_NAME already exists."
fi

echo "GCP setup complete!"