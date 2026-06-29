/**
 * Per-question countdown timer (30 seconds).
 * Remounts via parent `key` prop when the question changes.
 */

"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_SECONDS = 30;

interface TimerProps {
  questionKey: string;
  seconds?: number;
  onTimeout: () => void;
  paused?: boolean;
}

export default function Timer({
  questionKey,
  seconds = DEFAULT_SECONDS,
  onTimeout,
  paused = false,
}: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const hasTimedOut = useRef(false);

  useEffect(() => {
    hasTimedOut.current = false;
  }, [questionKey]);

  useEffect(() => {
    if (paused || remaining <= 0) return;

    const id = setInterval(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [remaining, paused, questionKey]);

  useEffect(() => {
    if (remaining <= 0 && !hasTimedOut.current) {
      hasTimedOut.current = true;
      onTimeout();
    }
  }, [remaining, onTimeout]);

  const pct = (remaining / seconds) * 100;
  const urgent = remaining <= 10;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            urgent ? "bg-red-500" : "bg-indigo-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`min-w-[3ch] text-right font-mono text-[11px] font-medium tabular-nums sm:text-xs ${
          urgent ? "text-red-500" : "text-zinc-600 dark:text-zinc-300"
        }`}
      >
        {remaining}s
      </span>
    </div>
  );
}
