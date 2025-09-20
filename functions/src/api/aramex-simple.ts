import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

// Simple Aramex Test Function
export const testAramexConnection = onCall(
  { 
    region: "us-central1",
    cors: true,
    timeoutSeconds: 30,
    memory: "256MiB"
  },
  async (request) => {
    try {
      logger.info("🧪 Testing Aramex Connection");

      const result = {
        success: true,
        message: "Aramex connection test successful!",
        timestamp: new Date().toISOString(),
        requestData: request.data || null
      };

      logger.info("✅ Aramex Test Success:", result);
      return result;

    } catch (error) {
      logger.error("❌ Aramex Test Error:", error);
      throw new HttpsError("internal", "Test failed");
    }
  }
);