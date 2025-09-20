/**
 * SpiritHub Cafe Firebase Functions
 * 
 * Complete API for mobile application integration
 */

import {setGlobalOptions} from "firebase-functions";

// Main API functions (Users, Products, Orders, etc.)
export * from './api';

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });
export {
  createPayment,
  paymentWebhook,
  confirmPayment
} from './api/payments';

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });
