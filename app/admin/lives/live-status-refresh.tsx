"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const maximumTimeout = 2_147_000_000;

export function LiveStatusRefresh({
  transitions,
}: {
  transitions: string[];
}) {
  const router = useRouter();
  const transitionKey = transitions.join("|");

  useEffect(() => {
    const now = Date.now();
    const nextTransition = transitions
      .map((transition) => new Date(transition).getTime())
      .filter((timestamp) => Number.isFinite(timestamp) && timestamp > now)
      .sort((left, right) => left - right)[0];

    if (nextTransition === undefined) {
      return;
    }

    const timeout = window.setTimeout(
      () => router.refresh(),
      Math.min(nextTransition - now + 250, maximumTimeout),
    );

    return () => window.clearTimeout(timeout);
  }, [router, transitionKey, transitions]);

  return null;
}
