export const recoveryKeys = {
  all: ["recovery"] as const,
  sendOtp: ["recovery", "sendOtp"] as const,
  verifyOtp: ["recovery", "verifyOtp"] as const,
  resetPassword: ["recovery", "resetPassword"] as const,
};

