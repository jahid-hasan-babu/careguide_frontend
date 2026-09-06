"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../redux/hooks";

export default function HomePage() {
  const router = useRouter();
  const { user, token, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (initialized) {
      if (token && user) {
        router.replace("/notes");
      } else {
        router.replace("/login");
      }
    }
  }, [initialized, token, user, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-main)",
      }}
    >
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );
}
