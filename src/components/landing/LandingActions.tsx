"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";

export function LandingActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/sign-up">
        <Button>Get Started</Button>
      </Link>
      <Link href="/sign-in">
        <Button variant="secondary">Sign In</Button>
      </Link>
    </div>
  );
}
