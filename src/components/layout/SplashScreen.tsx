"use client";

import { useEffect, useState } from "react";

import { APP_NAME } from "@/lib/constants";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 600);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white transition-opacity">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{APP_NAME}</h1>
    </div>
  );
}
