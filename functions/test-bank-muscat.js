/**
 * Bank Muscat Payment Gateway Test Script
 * Use this to test your payment integration
 */

// Load environment variables
require('dotenv').config();
const axios = require('axios');

// Configuration
const CONFIG = {
  baseUrl: 'http://127.0.0.1:5001/spirithub-506f5/us-central1', // Firebase emulator
  // baseUrl: 'https://your-project.firebaseapp.com', // Production
  testAmount: 10.50,
  testCurrency: 'OMR',
  testEmail: 'test@spirithubcafe.com'
};

/**
 * Test payment creation
 */
async function testCreatePayment() {
  console.log('🧪 Testing Payment Creation...');
  console.log('===============================');

  try {
    const orderId = `TEST_ORDER_${Date.now()}`;
    
    const response = await axios.post(`${CONFIG.baseUrl}/createPayment`, {
      amount: CONFIG.testAmount,
      currency: CONFIG.testCurrency,
      orderId: orderId,
      customerEmail: CONFIG.testEmail,
      description: 'Test payment for SpiritHub Cafe',
      metadata: {
        testMode: true,
        timestamp: new Date().toISOString()
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Payment creation successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      console.log('\n🔗 Payment URLs:');
      console.log('Redirect URL:', response.data.data.redirectUrl);
      console.log('Checkout URL:', response.data.data.checkoutUrl);
      console.log('\n📝 Copy one of these URLs to test payment in browser');
      
      return {
        success: true,
        orderId: response.data.data.orderId,
        sessionId: response.data.data.sessionId
      };
    } else {
      console.log('❌ Payment creation failed:', response.data.message);
      return { success: false };
    }

  } catch (error) {
    console.log('❌ Payment creation error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
    return { success: false };
  }
}

/**
 * Test payment confirmation
 */
async function testPaymentConfirmation(orderId) {
  console.log('\n🧪 Testing Payment Confirmation...');
  console.log('===================================');

  try {
    const response = await axios.get(
      `${CONFIG.baseUrl}/confirmPayment?orderId=${orderId}`,
      {
        headers: {
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ Payment confirmation successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return { success: true };

  } catch (error) {
    console.log('❌ Payment confirmation error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
    return { success: false };
  }
}

/**
 * Test webhook simulation
 */
async function testWebhookSimulation(orderId) {
  console.log('\n🧪 Testing Webhook Simulation...');
  console.log('=================================');

  try {
    const webhookData = {
      orderId: orderId,
      transactionId: `TXN_${Date.now()}`,
      result: 'SUCCESS',
      amount: CONFIG.testAmount,
      currency: CONFIG.testCurrency,
      timestamp: new Date().toISOString(),
      merchantId: '224',
      authorizationCode: 'AUTH123456',
      receipt: 'RECEIPT789',
      responseCode: '00',
      responseMessage: 'Approved'
    };

    const response = await axios.post(`${CONFIG.baseUrl}/paymentWebhook`, webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Mode': 'true'
      },
      timeout: 30000
    });

    console.log('✅ Webhook simulation successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return { success: true };

  } catch (error) {
    console.log('❌ Webhook simulation error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
    return { success: false };
  }
}

/**
 * Test configuration
 */
async function testConfiguration() {
  console.log('🧪 Testing Configuration...');
  console.log('============================');

  const requiredEnvVars = [
    'BANK_MUSCAT_MERCHANT_ID',
    'BANK_MUSCAT_API_PASSWORD', 
    'BANK_MUSCAT_API_USERNAME'
  ];

  console.log('Environment Variables:');
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${envVar.includes('PASSWORD') ? '***HIDDEN***' : value}`);
    } else {
      console.log(`❌ ${envVar}: NOT SET`);
    }
  });

  console.log('\nConfiguration:');
  console.log(`Currency: ${CONFIG.testCurrency}`);
  console.log(`Test Amount: ${CONFIG.testAmount}`);
  console.log(`Base URL: ${CONFIG.baseUrl}`);
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🏦 Bank Muscat Payment Gateway Tests');
  console.log('====================================');
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log('');

  // Test 1: Configuration
  await testConfiguration();

  // Test 2: Create Payment
  const createResult = await testCreatePayment();
  
  if (createResult.success && createResult.orderId) {
    // Test 3: Payment Confirmation
    await testPaymentConfirmation(createResult.orderId);
    
    // Test 4: Webhook Simulation
    await testWebhookSimulation(createResult.orderId);
  }

  console.log('\n🎯 Test Summary');
  console.log('===============');
  console.log(`Completed at: ${new Date().toLocaleString()}`);
  console.log('');
  console.log('Next Steps:');
  console.log('1. If tests pass, try a real payment with test cards');
  console.log('2. Configure your Bank Muscat portal with webhook URLs');
  console.log('3. Test end-to-end payment flow');
  console.log('4. Switch to production when ready');
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'all';

// Handle different test commands
switch (command) {
  case 'create':
    testCreatePayment();
    break;
  case 'confirm':
    if (args[1]) {
      testPaymentConfirmation(args[1]);
    } else {
      console.log('❌ Please provide orderId: node test-payment.js confirm ORDER_ID');
    }
    break;
  case 'webhook':
    if (args[1]) {
      testWebhookSimulation(args[1]);
    } else {
      console.log('❌ Please provide orderId: node test-payment.js webhook ORDER_ID');
    }
    break;
  case 'config':
    testConfiguration();
    break;
  case 'all':
  default:
    runAllTests();
    break;
}

// Export for use in other files
module.exports = {
  testCreatePayment,
  testPaymentConfirmation,
  testWebhookSimulation,
  testConfiguration
};