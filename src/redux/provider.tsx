"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { fetchMyProfile, initializeFromStorage, logoutUser } from "./slices/authSlice";
import { removeToast } from "./slices/toastSlice";
import { useAppDispatch, useAppSelector } from "./hooks";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.toast.toasts);

  useEffect(() => {
    if (toasts.length > 0) {
      const latest = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        dispatch(removeToast(latest.id));
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" && <CheckCircle2 size={18} color="#10b981" />}
            {toast.type === "error" && <AlertCircle size={18} color="#f43f5e" />}
            {toast.type === "info" && <Info size={18} color="#6366f1" />}
          </div>
          <div style={{ flex: 1 }}>{toast.message}</div>
          <button
            className="toast-close"
            onClick={() => dispatch(removeToast(toast.id))}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeFromStorage());
    dispatch(fetchMyProfile());

    const handleUnauthorized = () => {
      dispatch(logoutUser());
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [dispatch]);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
