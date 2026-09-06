import { apiClient } from "./client";
import {
  IAuthResponse,
  IChangePasswordPayload,
  IForgotPasswordPayload,
  ILoginPayload,
  IRegisterPayload,
  IRegisterResponse,
  IResendOtpPayload,
  IResetPasswordPayload,
  IVerifyOtpPayload,
  IVerifyResetOtpPayload,
} from "../types";

export const authApi = {
  register: (payload: IRegisterPayload) => {
    return apiClient<IRegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  verifyOtp: (payload: IVerifyOtpPayload) => {
    return apiClient<IAuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  resendOtp: (payload: IResendOtpPayload) => {
    return apiClient<{ email: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  login: (payload: ILoginPayload) => {
    return apiClient<IAuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  refreshToken: (token?: string) => {
    return apiClient<{ accessToken: string; expiresIn: number }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: token }),
      skipAuth: true,
    });
  },

  logout: () => {
    return apiClient<{ instructions: string }>("/auth/logout", {
      method: "POST",
    });
  },

  forgotPassword: (payload: IForgotPasswordPayload) => {
    return apiClient<null>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  verifyResetOtp: (payload: IVerifyResetOtpPayload) => {
    return apiClient<{ resetToken: string }>("/auth/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  resetPassword: (payload: IResetPasswordPayload) => {
    return apiClient<null>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  changePassword: (payload: IChangePasswordPayload) => {
    return apiClient<null>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
