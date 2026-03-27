"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

export function LandingActions() {
  const router = useRouter();
  const [isStartingDemo, setIsStartingDemo] = useState(false);

  async function startDemo() {
    try {
      setIsStartingDemo(true);
      await fetch("/api/auth/demo", { method: "POST" });
      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsStartingDemo(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" onClick={startDemo} disabled={isStartingDemo}>
        {isStartingDemo ? "Entering demo..." : "Demo Login"}
      </Button>
      <Link href="/sign-up">
        <Button>Get Started</Button>
      </Link>
    </div>
  );
}
