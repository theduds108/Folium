"use client";

import { MotionConfig } from "motion/react";

/** Respeita a opção "reduzir movimento" do sistema em todas as animações. */
export function ProvedorMovimento({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
