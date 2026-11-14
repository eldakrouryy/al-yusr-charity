import type { ReactNode } from "react";

/**
 * Shows `children` in a box as tall as the longest of `all`, so the beads under it stay still when
 * a one-line dhikr is followed by a two-line one. Every phrase sits invisibly in the same grid
 * cell and sets the height; only the current one is seen and read out.
 */
export function StableText({ all, className = "", children }: { all: string[]; className?: string; children: ReactNode }) {
  return (
    <div className="grid [&>*]:[grid-area:1/1]">
      {all.map((t, i) => (
        <p key={i} className={`invisible ${className}`} aria-hidden>{t}</p>
      ))}
      <div className="flex items-center justify-center">{children}</div>
    </div>
  );
}
