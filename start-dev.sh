#!/bin/bash

# Miro Deliverables App - Development Server
echo "🚀 Starting Miro Deliverables App Development Server"
echo "=================================================="

# Check if port 8000 is available
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8000 is already in use"
    echo "Trying to find the process..."
    lsof -i :8000
    echo ""
    read -p "Kill existing process and continue? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Killing existing process..."
        lsof -ti:8000 | xargs kill -9
        sleep 2
    else
        echo "Exiting..."
        exit 1
    fi
fi

# Start the server
echo "🌐 Starting HTTP server on port 8000..."
echo ""
echo "📱 Access the app:"
echo "   • Test Page:  http://localhost:8000/test.html"
echo "   • Main App:   http://localhost:8000/index.html"
echo "   • Modal:      http://localhost:8000/modal.html"
echo ""
echo "🎯 For Miro integration:"
echo "   1. Go to developers.miro.com"
echo "   2. Create/edit your app"
echo "   3. Set App URL to: http://localhost:8000/index.html"
echo "   4. Install the app in your Miro team"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

# Try different Python commands
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "❌ Python not found. Please install Python or use an alternative:"
    echo "   • npx serve . -p 8000"
    echo "   • php -S localhost:8000"
    exit 1
fi