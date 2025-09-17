# Quick Test Setup Script for Bank Muscat Payment Gateway (PowerShell)
# این script تمام تست‌های لازم را به ترتیب اجرا می‌کند

Write-Host "🏦 Bank Muscat Payment Gateway - Quick Test Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Function to print colored output
function Write-Status($message) {
    Write-Host "[INFO] $message" -ForegroundColor Blue
}

function Write-Success($message) {
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Write-Error($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

function Write-Warning($message) {
    Write-Host "[WARNING] $message" -ForegroundColor Yellow
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    exit 1
}

# Step 1: Check Prerequisites
Write-Status "Checking prerequisites..."

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js found: $nodeVersion"
}
catch {
    Write-Error "Node.js is not installed. Please install Node.js first."
    exit 1
}

# Check Firebase CLI
try {
    $firebaseVersion = firebase --version
    Write-Success "Firebase CLI found: $firebaseVersion"
}
catch {
    Write-Warning "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
}

# Step 2: Install Dependencies
Write-Status "Installing dependencies..."

if (Test-Path "functions") {
    Set-Location "functions"
    if (-not (Test-Path "node_modules")) {
        Write-Status "Installing Functions dependencies..."
        npm install
    }
    else {
        Write-Success "Functions dependencies already installed"
    }
    Set-Location ".."
}
else {
    Write-Error "functions directory not found"
    exit 1
}

# Install root dependencies
if (-not (Test-Path "node_modules")) {
    Write-Status "Installing root dependencies..."
    npm install
}
else {
    Write-Success "Root dependencies already installed"
}

# Step 3: Check Environment Variables
Write-Status "Checking environment variables..."

Set-Location "functions"

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Warning ".env file not found. Creating from .env.example..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Success ".env file created from .env.example"
    }
    else {
        Write-Error ".env.example not found. Please check the setup."
        exit 1
    }
}
else {
    Write-Success ".env file exists"
}

# Check required environment variables
$requiredVars = @("BANK_MUSCAT_MERCHANT_ID", "BANK_MUSCAT_ACCESS_CODE", "BANK_MUSCAT_WORKING_KEY")

# Load .env file
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$missingVars = @()
foreach ($var in $requiredVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "Process")
    if ([string]::IsNullOrEmpty($value)) {
        $missingVars += $var
    }
    else {
        Write-Success "$var is set"
    }
}

if ($missingVars.Count -gt 0) {
    Write-Error "Missing environment variables: $($missingVars -join ', ')"
    Write-Warning "Please update .env file with your Bank Muscat credentials"
    exit 1
}

Set-Location ".."

# Step 4: Start Firebase Emulator
Write-Status "Starting Firebase emulator..."

# Check if emulator is already running
$port5001InUse = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
if ($port5001InUse) {
    Write-Warning "Port 5001 is already in use. Emulator might be running."
    Write-Status "Continuing with tests..."
}
else {
    Write-Status "Starting Firebase emulator in background..."
    
    # Start emulator in background job
    $emulatorJob = Start-Job -ScriptBlock {
        firebase emulators:start --only functions
    }
    
    # Wait for emulator to start
    Write-Status "Waiting for emulator to start..."
    $timeout = 30
    $elapsed = 0
    
    do {
        Start-Sleep -Seconds 1
        $elapsed++
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5001" -TimeoutSec 1 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "Firebase emulator is running"
                break
            }
        }
        catch {
            # Continue waiting
        }
        
        if ($elapsed -ge $timeout) {
            Write-Error "Emulator failed to start within $timeout seconds"
            Stop-Job $emulatorJob
            Remove-Job $emulatorJob
            exit 1
        }
    } while ($elapsed -lt $timeout)
}

# Step 5: Run Tests
Write-Status "Running backend tests..."

Set-Location "functions"

# Test configuration
Write-Status "Testing configuration..."
node test-bank-muscat.js config

# Test payment creation
Write-Status "Testing payment creation..."
$createTestResult = node test-bank-muscat.js create
if ($LASTEXITCODE -eq 0) {
    Write-Success "Payment creation test passed"
}
else {
    Write-Error "Payment creation test failed"
}

# Run all tests
Write-Status "Running complete test suite..."
$allTestsResult = node test-bank-muscat.js all
if ($LASTEXITCODE -eq 0) {
    Write-Success "All backend tests passed"
}
else {
    Write-Warning "Some backend tests failed. Check the output above."
}

Set-Location ".."

# Step 6: Test Frontend (if available)
if ((Get-Command npm -ErrorAction SilentlyContinue) -and (Test-Path "vite.config.ts")) {
    Write-Status "Frontend testing setup available"
    Write-Status "To test frontend:"
    Write-Host "  1. Run: npm run dev" -ForegroundColor White
    Write-Host "  2. Open: http://localhost:5173" -ForegroundColor White
    Write-Host "  3. Navigate to the BankMuscatTestPage component" -ForegroundColor White
}
else {
    Write-Warning "Frontend testing setup not detected"
}

# Step 7: Summary and Next Steps
Write-Host ""
Write-Host "🎉 Quick Test Setup Complete!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""
Write-Success "✅ Prerequisites checked"
Write-Success "✅ Dependencies installed"
Write-Success "✅ Environment configured"
Write-Success "✅ Firebase emulator running"
Write-Success "✅ Backend tests executed"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review test results above" -ForegroundColor White
Write-Host "  2. Test payment flow manually with test cards:" -ForegroundColor White
Write-Host "     - Success: 5123456789012346 (Exp: 05/21, CVV: 100)" -ForegroundColor Green
Write-Host "     - Failure: 5123456789012353 (Exp: 05/21, CVV: 100)" -ForegroundColor Red
Write-Host "  3. Configure Bank Muscat portal with webhook URLs" -ForegroundColor White
Write-Host "  4. Deploy to staging: firebase deploy --only functions" -ForegroundColor White
Write-Host "  5. Test end-to-end payment flow" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - Full Testing Guide: .\TESTING_GUIDE.md" -ForegroundColor White
Write-Host "  - Setup Instructions: .\BANK_MUSCAT_SETUP.md" -ForegroundColor White
Write-Host "  - API Documentation: .\functions\PAYMENT_API_DOCUMENTATION.md" -ForegroundColor White
Write-Host ""

# Cleanup function
function Stop-Emulator {
    if ($emulatorJob) {
        Write-Status "Stopping Firebase emulator..."
        Stop-Job $emulatorJob -ErrorAction SilentlyContinue
        Remove-Job $emulatorJob -ErrorAction SilentlyContinue
    }
}

# Set cleanup for Ctrl+C
$null = Register-EngineEvent PowerShell.Exiting -Action { Stop-Emulator }

# Keep script running to maintain emulator
Write-Status "Firebase emulator is running. Press Ctrl+C to stop."
Write-Status "You can now run additional tests or start your frontend development server."

try {
    # Wait for user to stop
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Stop-Emulator
}