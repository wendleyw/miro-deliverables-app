#!/bin/bash

# Miro Deliverables App - GitHub Deploy Script
echo "🚀 Deploying Miro Deliverables App to GitHub"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    print_error "manifest.json not found. Please run this script from the miro-deliverables-app directory."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Miro Deliverables App"
fi

# Get GitHub username
if [ -z "$1" ]; then
    echo -n "Enter your GitHub username: "
    read GITHUB_USERNAME
else
    GITHUB_USERNAME=$1
fi

print_status "GitHub username: $GITHUB_USERNAME"

# Check if remote origin exists
if git remote get-url origin >/dev/null 2>&1; then
    print_warning "Remote origin already exists. Updating..."
    git remote set-url origin "https://github.com/$GITHUB_USERNAME/miro-deliverables-app.git"
else
    print_status "Adding remote origin..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/miro-deliverables-app.git"
fi

# Add all changes
print_status "Adding changes to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit."
else
    echo -n "Enter commit message (or press Enter for default): "
    read COMMIT_MESSAGE
    
    if [ -z "$COMMIT_MESSAGE" ]; then
        COMMIT_MESSAGE="Update Miro Deliverables App - $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    print_status "Committing changes..."
    git commit -m "$COMMIT_MESSAGE"
fi

# Push to GitHub
print_status "Pushing to GitHub..."
git branch -M main

if git push -u origin main; then
    print_success "Successfully pushed to GitHub!"
    echo ""
    echo "📋 Next Steps:"
    echo "=============="
    echo "1. 🌐 Create repository on GitHub:"
    echo "   https://github.com/new"
    echo "   Repository name: miro-deliverables-app"
    echo ""
    echo "2. 🚀 Deploy to Netlify:"
    echo "   https://netlify.com"
    echo "   Connect GitHub repo: $GITHUB_USERNAME/miro-deliverables-app"
    echo ""
    echo "3. 🎯 Configure Miro App:"
    echo "   https://developers.miro.com"
    echo "   App URL: https://YOUR-NETLIFY-URL.netlify.app/index.html"
    echo ""
    echo "📖 Full instructions: GITHUB_DEPLOY.md"
else
    print_error "Failed to push to GitHub."
    echo ""
    echo "📋 Manual Steps:"
    echo "==============="
    echo "1. Create repository on GitHub: https://github.com/new"
    echo "2. Repository name: miro-deliverables-app"
    echo "3. Run: git remote set-url origin https://github.com/$GITHUB_USERNAME/miro-deliverables-app.git"
    echo "4. Run: git push -u origin main"
fi

echo ""
print_success "Deploy script completed!"