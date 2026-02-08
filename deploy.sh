#!/bin/bash

# Configuration
VPS_USER="root"
VPS_HOST="72.62.162.228"
REMOTE_DIR="/root/janparras-mk"
REPO_URL="git@github.com:josephdelgadoa/mk-janparras.git"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deploying to $VPS_HOST...${NC}"

# 1. Update Remote Codebase via Git or Rsync
echo -e "${GREEN}Updating remote codebase...${NC}"
ssh $VPS_USER@$VPS_HOST << EOF
    if [ ! -d "$REMOTE_DIR" ]; then
        echo "Cloning repository..."
        git clone $REPO_URL $REMOTE_DIR
    else
        echo "Pulling latest changes..."
        cd $REMOTE_DIR
        git pull origin main || git pull origin master
    fi
EOF

# 2. Copy Local Environment Configuration
echo -e "${GREEN}Copying local .env file...${NC}"
scp .env $VPS_USER@$VPS_HOST:$REMOTE_DIR/.env

# 3. Deploy with Docker Compose
echo -e "${GREEN}Building and deploying container...${NC}"
ssh $VPS_USER@$VPS_HOST << EOF
    cd $REMOTE_DIR
    
    # Ensure Docker is installed (basic check)
    if ! command -v docker &> /dev/null; then
        echo "${RED}Docker not found. Installing...${NC}"
        apk add --update docker docker-compose openrc
        service docker start
    fi

    # Build and Start Containers
    docker compose up -d --build --remove-orphans

    # Prune unused images to save space
    docker image prune -f

    echo "Deployment complete! App should be running on http://$VPS_HOST"
EOF
