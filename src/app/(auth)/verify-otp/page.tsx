"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Mail, ArrowRight, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { verifyOtp, fetchMyProfile } from "../../../redux/slices/authSlice";
import { showToast } from "../../../redux/slices/toastSlice";
import { authApi } from "../../../api/auth.api";

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams?.get("email") || "");
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    const result = await dispatch(
      verifyOtp({ email: email.trim().toLowerCase(), otp: otp.trim() })
    );

    if (verifyOtp.fulfilled.match(result)) {
      await dispatch(fetchMyProfile());
      dispatch(showToast({ message: "Email verified successfully! Welcome.", type: "success" }));
      router.push("/notes");
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;
    try {
      setResending(true);
      await authApi.resendOtp({ email: email.trim().toLowerCase() });
      dispatch(showToast({ message: "A fresh verification code has been dispatched!", type: "info" }));
      setCountdown(60);
    } catch (err: any) {
      dispatch(showToast({ message: err.message || "Failed to resend code", type: "error" }));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-fade">
        <div className="auth-header">
          <div className="auth-logo">
            <KeyRound size={24} />
          </div>
          <h1>Verify Email</h1>
          <p>Enter the 6-digit verification code sent to your email</p>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: "1.25rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">One-Time Password (OTP)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              autoFocus
              required
              style={{
                fontSize: "1.3rem",
                letterSpacing: "0.4em",
                textAlign: "center",
                fontWeight: 700,
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading || otp.length < 4}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          {countdown > 0 ? (
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Resend code in {countdown}s
            </span>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleResend}
              disabled={resending}
            >
              <RefreshCw size={14} className={resending ? "spinner" : ""} />
              <span>Resend Verification Code</span>
            </button>
          )}
        </div>

        <div className="auth-footer">
          Back to <Link href="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
