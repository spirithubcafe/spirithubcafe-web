import * as functions from "firebase-functions";

// Very simple test function using Firebase Functions v1
export const simpleTest = functions.https.onCall((data, context) => {
  return {
    success: true,
    message: "Simple test function working!",
    timestamp: new Date().toISOString(),
    data: data
  };
});