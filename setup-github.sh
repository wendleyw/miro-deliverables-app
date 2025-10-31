#!/bin/bash

# Setup GitHub Repository Script
echo "🚀 GitHub Repository Setup"
echo "=========================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
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

print_step "Checking git status..."
git status

echo ""
print_step "Getting your GitHub username..."
echo -n "Enter your GitHub username: "
read GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    print_error "GitHub username is required"
    exit 1
fi

echo ""
print_warning "IMPORTANT: Before continuing, make sure you have:"
echo "1. ✅ Created the repository on GitHub: https://github.com/new"
echo "2. ✅ Repository name: miro-deliverables-app"
echo "3. ✅ Set as Public (or Private)"
echo "4. ✅ DO NOT add README, .gitignore, or license"
echo ""
read -p "Have you created the repository on GitHub? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_warning "Please create the repository first:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: miro-deliverables-app"
    echo "3. Click 'Create repository'"
    echo "4. Then run this script again"
    exit 1
fi

print_step "Adding remote origin..."
REPO_URL="https://github.com/$GITHUB_USERNAME/miro-deliverables-app.git"

# Remove existing remote if it exists
git remote remove origin 2>/dev/null

# Add new remote
if git remote add origin "$REPO_URL"; then
    print_success "Remote origin added: $REPO_URL"
else
    print_error "Failed to add remote origin"
    exit 1
fi

print_step "Verifying remote..."
git remote -v

print_step "Committing any pending changes..."
git add .
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    git commit -m "Final commit before GitHub push - $(date '+%Y-%m-%d %H:%M:%S')"
fi

print_step "Pushing to GitHub..."
git branch -M main

if git push -u origin main; then
    print_success "Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Repository is now available at:"
    echo "   https://github.com/$GITHUB_USERNAME/miro-deliverables-app"
    echo ""
    echo "📋 Next Steps:"
    echo "=============="
    echo "1. 🌐 Deploy to Netlify:"
    echo "   • Go to: https://netlify.com"
    echo "   • Click: 'New site from Git'"
    echo "   • Connect GitHub and select: miro-deliverables-app"
    echo ""
    echo "2. 🎯 Configure Miro App:"
    echo "   • Go to: https://developers.miro.com"
    echo "   • Set App URL to your Netlify URL + /index.html"
    echo ""
    echo "3. ✅ Test the app:"
    echo "   • Install in your Miro team"
    echo "   • Test in a Miro board"
    
else
    print_error "Failed to push to GitHub"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "==================="
    echo "1. Check if repository exists: https://github.com/$GITHUB_USERNAME/miro-deliverables-app"
    echo "2. Verify your GitHub username is correct"
    echo "3. Make sure you have push permissions"
    echo ""
    echo "💡 Alternative: Try with personal access token:"
    echo "   git remote set-url origin https://$GITHUB_USERNAME:YOUR-TOKEN@github.com/$GITHUB_USERNAME/miro-deliverables-app.git"
    echo "   git push -u origin main"
fi

echo ""
print_success "Setup script completed!"