export const host = "http://127.0.0.1:8000";
export const authRoute = `${host}/api/auth/me`;
export const loginRoute = `${host}/api/auth/login/`;
export const mediaRoute = `${host}/media/`;

// OTP-based password reset
export const passwordResetSendOtp   = `${host}/api/auth/password-reset/send-otp/`;
export const passwordResetVerifyOtp = `${host}/api/auth/password-reset/verify-otp/`;
export const passwordResetReset     = `${host}/api/auth/password-reset/reset/`;
