#!/bin/bash

# Miro Deliverables App - Deploy Script
# Este script automatiza o processo de deploy do app

set -e  # Exit on any error

echo "🚀 Miro Deliverables App - Deploy Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required files exist
print_status "Checking required files..."
required_files=("manifest.json" "index.html" "modal.html" "app.js" "modal.js" "styles.css" "config.js")

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

print_success "All required files found"

# Check if configuration is set
print_status "Checking configuration..."

if grep -q "YOUR_SUPABASE_URL" config.js; then
    print_warning "Supabase URL not configured in config.js"
    echo "Please update the configuration before deploying"
fi

if grep -q "YOUR_MIRO_APP_ID" config.js; then
    print_warning "Miro App ID not configured in config.js"
    echo "Please update the configuration before deploying"
fi

# Validate manifest.json
print_status "Validating manifest.json..."
if command -v jq &> /dev/null; then
    if jq empty manifest.json 2>/dev/null; then
        print_success "manifest.json is valid JSON"
    else
        print_error "manifest.json is not valid JSON"
        exit 1
    fi
else
    print_warning "jq not found, skipping JSON validation"
fi

# Create deployment package
print_status "Creating deployment package..."
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy files to deployment directory
cp manifest.json index.html modal.html app.js modal.js styles.css config.js "$DEPLOY_DIR/"

# Create .htaccess for proper MIME types (if deploying to Apache)
cat > "$DEPLOY_DIR/.htaccess" << EOF
# Miro App - Proper MIME types
AddType application/json .json
AddType text/html .html
AddType application/javascript .js
AddType text/css .css

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# CORS headers (if needed)
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
EOF

print_success "Deployment package created: $DEPLOY_DIR"

# Deployment options
echo ""
echo "📦 Deployment Options:"
echo "====================="
echo ""
echo "1. 🌐 Netlify (Recommended)"
echo "   - Drag and drop the '$DEPLOY_DIR' folder to netlify.com"
echo "   - Or use Netlify CLI: cd $DEPLOY_DIR && netlify deploy --prod"
echo ""
echo "2. ⚡ Vercel"
echo "   - cd $DEPLOY_DIR && vercel --prod"
echo ""
echo "3. 🔧 Manual Upload"
echo "   - Upload contents of '$DEPLOY_DIR' to your web server"
echo "   - Ensure HTTPS is enabled"
echo ""
echo "4. 🐳 Docker (Advanced)"
echo "   - Use the provided Dockerfile to containerize"
echo ""

# Check for deployment tools
print_status "Checking for deployment tools..."

if command -v netlify &> /dev/null; then
    echo ""
    read -p "Deploy to Netlify now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deploying to Netlify..."
        cd "$DEPLOY_DIR"
        netlify deploy --prod
        cd ..
        print_success "Deployed to Netlify!"
    fi
elif command -v vercel &> /dev/null; then
    echo ""
    read -p "Deploy to Vercel now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deploying to Vercel..."
        cd "$DEPLOY_DIR"
        vercel --prod
        cd ..
        print_success "Deployed to Vercel!"
    fi
else
    print_warning "No deployment tools found (netlify-cli or vercel)"
    echo "Install with: npm install -g netlify-cli or npm install -g vercel"
fi

echo ""
print_success "Deploy script completed!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. 🔗 Note your deployment URL"
echo "2. 🎯 Update Miro app settings with the new URL"
echo "3. 🔄 Update redirect URIs in Miro Developer Console"
echo "4. ✅ Test the app in a Miro board"
echo ""
echo "📖 For detailed instructions, see INSTALLATION.md"
echo ""