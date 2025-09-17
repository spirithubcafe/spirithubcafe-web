#!/bin/bash

# Quick Test Setup Script for Bank Muscat Payment Gateway
# این script تمام تست‌های لازم را به ترتیب اجرا می‌کند

echo "🏦 Bank Muscat Payment Gateway - Quick Test Setup"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Check Prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
else
    print_success "Node.js found: $(node --version)"
fi

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    print_warning "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    print_success "Firebase CLI found: $(firebase --version)"
fi

# Step 2: Install Dependencies
print_status "Installing dependencies..."

if [ -d "functions" ]; then
    cd functions
    if [ ! -d "node_modules" ]; then
        print_status "Installing Functions dependencies..."
        npm install
    else
        print_success "Functions dependencies already installed"
    fi
    cd ..
else
    print_error "functions directory not found"
    exit 1
fi

# Install root dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing root dependencies..."
    npm install
else
    print_success "Root dependencies already installed"
fi

# Step 3: Check Environment Variables
print_status "Checking environment variables..."

cd functions

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success ".env file created from .env.example"
    else
        print_error ".env.example not found. Please check the setup."
        exit 1
    fi
else
    print_success ".env file exists"
fi

# Check required environment variables
REQUIRED_VARS=("BANK_MUSCAT_MERCHANT_ID" "BANK_MUSCAT_ACCESS_CODE" "BANK_MUSCAT_WORKING_KEY")

source .env 2>/dev/null || true

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    else
        print_success "$var is set"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_error "Missing environment variables: ${MISSING_VARS[*]}"
    print_warning "Please update .env file with your Bank Muscat credentials"
    exit 1
fi

cd ..

# Step 4: Start Firebase Emulator
print_status "Starting Firebase emulator..."

# Check if emulator is already running
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 5001 is already in use. Emulator might be running."
    print_status "Continuing with tests..."
else
    print_status "Starting Firebase emulator in background..."
    firebase emulators:start --only functions &
    EMULATOR_PID=$!
    
    # Wait for emulator to start
    print_status "Waiting for emulator to start..."
    for i in {1..30}; do
        if curl -s http://localhost:5001 >/dev/null 2>&1; then
            print_success "Firebase emulator is running"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Emulator failed to start within 30 seconds"
            exit 1
        fi
        sleep 1
    done
fi

# Step 5: Run Tests
print_status "Running backend tests..."

cd functions

# Test configuration
print_status "Testing configuration..."
node test-bank-muscat.js config

# Test payment creation
print_status "Testing payment creation..."
if node test-bank-muscat.js create; then
    print_success "Payment creation test passed"
else
    print_error "Payment creation test failed"
fi

# Run all tests
print_status "Running complete test suite..."
if node test-bank-muscat.js all; then
    print_success "All backend tests passed"
else
    print_warning "Some backend tests failed. Check the output above."
fi

cd ..

# Step 6: Test Frontend (if React dev server is available)
if command -v npm &> /dev/null && [ -f "vite.config.ts" ]; then
    print_status "Frontend testing setup available"
    print_status "To test frontend:"
    echo "  1. Run: npm run dev"
    echo "  2. Open: http://localhost:5173"
    echo "  3. Navigate to the BankMuscatTestPage component"
else
    print_warning "Frontend testing setup not detected"
fi

# Step 7: Summary and Next Steps
echo ""
echo "🎉 Quick Test Setup Complete!"
echo "=============================="
echo ""
print_success "✅ Prerequisites checked"
print_success "✅ Dependencies installed"
print_success "✅ Environment configured"
print_success "✅ Firebase emulator running"
print_success "✅ Backend tests executed"
echo ""
echo "📋 Next Steps:"
echo "  1. Review test results above"
echo "  2. Test payment flow manually with test cards:"
echo "     - Success: 5123456789012346 (Exp: 05/21, CVV: 100)"
echo "     - Failure: 5123456789012353 (Exp: 05/21, CVV: 100)"
echo "  3. Configure Bank Muscat portal with webhook URLs"
echo "  4. Deploy to staging: firebase deploy --only functions"
echo "  5. Test end-to-end payment flow"
echo ""
echo "📚 Documentation:"
echo "  - Full Testing Guide: ./TESTING_GUIDE.md"
echo "  - Setup Instructions: ./BANK_MUSCAT_SETUP.md"
echo "  - API Documentation: ./functions/PAYMENT_API_DOCUMENTATION.md"
echo ""

# Cleanup function
cleanup() {
    if [ -n "$EMULATOR_PID" ]; then
        print_status "Stopping Firebase emulator..."
        kill $EMULATOR_PID 2>/dev/null || true
    fi
}

# Set trap for cleanup on script exit
trap cleanup EXIT

# Keep script running to maintain emulator
print_status "Firebase emulator is running. Press Ctrl+C to stop."
print_status "You can now run additional tests or start your frontend development server."

# Wait for user to stop
while true; do
    sleep 1
done