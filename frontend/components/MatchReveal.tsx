"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import Avatar from "./Avatar";
import type { Match } from "@/lib/api";

interface Props {
  match: Match;
  onClose: () => void;
}

const BURST = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 7) * 0.18}s`,
  size: 18 + ((i * 7) % 16),
}));

/** Full-screen pink "It's a match!" moment, modelled on Coy's own reveal sheet. */
export default function MatchReveal({ match, onClose }: Props) {
  const primary = useRef<HTMLAnchorElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    primary.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialog.current) {
        // Simple focus trap between the dialog's focusable elements.
        const els = dialog.current.querySelectorAll<HTMLElement>("a, button");
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="reveal" role="dialog" aria-modal="true" aria-labelledby="match-title" ref={dialog}>
      <div className="burst" aria-hidden>
        {BURST.map((b, i) => (
          <span key={i} style={{ left: b.left, animationDelay: b.delay }}>
            <Heart size={b.size} fill="currentColor" strokeWidth={0} />
          </span>
        ))}
      </div>

      <div className="pair">
        <Avatar name="You" label="You" size="lg" />
        <Avatar name={match.name} photo={match.photo} label={match.name} size="lg" />
        <span className="pair-heart" aria-hidden>
          <Heart size={22} fill="var(--pink)" strokeWidth={2.4} />
        </span>
      </div>

      <h2 id="match-title">It&rsquo;s a match!</h2>
      <p>
        You and <strong>{match.name}</strong> like each other. Only the two of you will ever know.
      </p>

      <div className="actions">
        <Link ref={primary} href="/discover/matches" className="btn" onClick={onClose}>
          See your matches
        </Link>
        <button type="button" className="btn ghost" onClick={onClose}>
          Keep swiping
        </button>
      </div>
    </div>
  );
}
