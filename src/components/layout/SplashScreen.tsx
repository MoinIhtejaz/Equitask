"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { APP_NAME } from "@/lib/constants";

const DUNES = [
  {
    className: "left-[-18%] bottom-[16%] h-28 w-[136%] rotate-[1deg] opacity-85",
    duration: 7.2
  },
  {
    className: "left-[-14%] bottom-[11%] h-36 w-[132%] rotate-[-2deg] opacity-90",
    duration: 8.8
  },
  {
    className: "left-[-10%] bottom-[5%] h-44 w-[128%] rotate-[1.5deg] opacity-100",
    duration: 10.1
  }
] as const;

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => setVisible(false), prefersReducedMotion ? 850 : 2200);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.48, ease: [0.4, 0, 0.2, 1] } }}
          className="sand-splash fixed inset-0 z-[120] overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.24)_100%)]" />

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.7em] text-[#d0b178]/80">
              Student Collaboration
            </p>
            <h1 className="text-5xl font-semibold tracking-[-0.08em] text-[#f9edd3] sm:text-7xl">
              {APP_NAME}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#dcc8a1]/[0.78] sm:text-base">
              Fair group delivery with effort voting, clear ownership, and team-wide visibility.
            </p>
          </motion.div>

          <div className="pointer-events-none absolute inset-0">
            <motion.div
              initial={{ opacity: 0.15 }}
              animate={{ opacity: [0.18, 0.34, 0.18] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-0 top-[18%] h-px bg-[linear-gradient(90deg,transparent,rgba(217,191,146,0.7),transparent)]"
            />

            {DUNES.map((dune) => (
              <motion.div
                key={dune.className}
                className={`dune-band absolute ${dune.className}`}
                animate={{ x: ["-8%", "14%"] }}
                transition={{ duration: dune.duration, repeat: Infinity, ease: "linear" }}
              />
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
