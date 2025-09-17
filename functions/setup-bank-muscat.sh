#!/bin/bash

# Bank Muscat Payment Gateway Setup Script for SpiritHub Cafe
# This script sets up the complete payment integration

echo "🏦 Setting up Bank Muscat Payment Gateway for SpiritHub Cafe..."
echo "======================================================================"

# Check if we're in the functions directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the functions directory"
    exit 1
fi

# Install required dependencies
echo "📦 Installing required dependencies..."
npm install axios

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update the URLs in .env file if needed."
else
    echo "⚠️  .env file already exists. Please verify the configuration."
fi

# Build the functions
echo "🔨 Building TypeScript functions..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check for TypeScript errors."
    exit 1
fi

# Display configuration summary
echo ""
echo "📋 Bank Muscat Configuration Summary:"
echo "======================================"
echo "Merchant ID: 224"
echo "Access Code: AVDP00LA16BE47PDEB"
echo "Environment: UAT (Test)"
echo "Base URL: https://test-smartpay.bankmuscat.com"
echo ""

# Display Firebase configuration
echo "🔥 Firebase Functions Configuration:"
echo "====================================="
firebase functions:config:get

echo ""
echo "🚀 Setup Complete!"
echo "=================="
echo ""
echo "Next Steps:"
echo "1. Update your domain URLs in .env file:"
echo "   - BANK_MUSCAT_RETURN_URL=https://yourdomain.com/api/payments/confirm"
echo "   - BANK_MUSCAT_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook"
echo ""
echo "2. Deploy functions to Firebase:"
echo "   firebase deploy --only functions"
echo ""
echo "3. Configure Bank Muscat portal:"
echo "   - Webhook URL: https://yourdomain.com/api/payments/webhook"
echo "   - Return URL: https://yourdomain.com/api/payments/confirm"
echo ""
echo "4. Test payment integration:"
echo "   - Use test environment first (UAT)"
echo "   - Test with Bank Muscat test cards"
echo ""
echo "5. For production:"
echo "   - Change BANK_MUSCAT_ENVIRONMENT=PROD in .env"
echo "   - Update base URL to https://smartpay.bankmuscat.com"
echo "   - Redeploy functions"
echo ""
echo "📚 Documentation: Check PAYMENT_API_DOCUMENTATION.md for detailed guide"
echo ""
echo "🎉 Ready to accept Bank Muscat payments! ☕"