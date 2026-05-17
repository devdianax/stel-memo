"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border-main bg-surface">
          <span className="text-2xl font-bold text-foreground">
            {String(timeLeft.days).padStart(2, "0")}
          </span>
        </div>
        <span className="mt-2 text-xs text-text-muted">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border-main bg-surface">
          <span className="text-2xl font-bold text-foreground">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
        </div>
        <span className="mt-2 text-xs text-text-muted">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border-main bg-surface">
          <span className="text-2xl font-bold text-foreground">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
        </div>
        <span className="mt-2 text-xs text-text-muted">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border-main bg-surface">
          <span className="text-2xl font-bold text-foreground">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </div>
        <span className="mt-2 text-xs text-text-muted">Seconds</span>
      </div>
    </div>
  );
}
