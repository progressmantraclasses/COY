"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Heart, RotateCcw, Sparkles, WifiOff, X } from "lucide-react";
import SwipeCard, { type SwipeCardHandle } from "@/components/SwipeCard";
import MatchReveal from "@/components/MatchReveal";
import { useDiscover } from "@/hooks/useDiscover";
import { API_URL, type SwipeAction } from "@/lib/api";

export default function DiscoverPage() {
  const { profiles, error, matchCount, reveal, refilling, closeReveal, swipe, reload, reset } = useDiscover();
  const topCard = useRef<SwipeCardHandle>(null);
  const hasCards = !!profiles && profiles.length > 0;

  const trigger = (action: SwipeAction) => topCard.current?.swipe(action);

  // Desktop keyboard shortcuts: ← pass, → like.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (reveal || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); topCard.current?.swipe("pass"); }
      if (e.key === "ArrowRight") { e.preventDefault(); topCard.current?.swipe("like"); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reveal]);

  return (
    <div className="discover">
      <header className="top">
        <Link href="/" className="wordmark" aria-label="Coy home">coy</Link>
        <Link href="/discover/matches" className="icon-btn" aria-label={`Matches (${matchCount})`}>
          <Heart size={20} strokeWidth={2.4} aria-hidden />
          {matchCount > 0 && <span key={matchCount} className="badge bump" aria-hidden>{matchCount}</span>}
        </Link>
      </header>

      <div className="discover-head">
        <div>
          <h1>Discover</h1>
          <p className="fine">Likes stay secret unless they&rsquo;re mutual.</p>
        </div>
        {hasCards && <span className="counter">{profiles.length} left</span>}
      </div>

      <section className="deck" aria-label="Profiles" aria-live="polite">
        {error ? (
          <div className="status lilac">
            <span className="status-icon"><WifiOff size={26} strokeWidth={2.4} aria-hidden /></span>
            <h1>Can&rsquo;t reach Discover</h1>
            <p>Make sure the API is running at {API_URL}, then try again.</p>
            <div className="actions">
              <button type="button" className="btn" onClick={() => void reload()}>
                <RotateCcw size={18} strokeWidth={2.6} aria-hidden /> Retry
              </button>
            </div>
          </div>
        ) : profiles === null || (!hasCards && refilling) ? (
          <div className="skeleton" aria-label="Loading profiles" />
        ) : !hasCards ? (
          <div className="status">
            <span className="status-icon"><Sparkles size={26} strokeWidth={2.4} aria-hidden /></span>
            <h1>You&rsquo;re all caught up</h1>
            <p>No new people right now. Check your matches, or come back later for fresh faces.</p>
            <div className="actions">
              <Link href="/discover/matches" className="btn">See matches</Link>
              <button type="button" className="btn quiet small" onClick={() => void reset()}>
                <RotateCcw size={16} strokeWidth={2.6} aria-hidden /> Reset demo
              </button>
            </div>
          </div>
        ) : (
          profiles.slice(0, 3).reverse().map((p) => {
            const depth = profiles.indexOf(p);
            return (
              <SwipeCard
                key={p.id}
                ref={depth === 0 ? topCard : undefined}
                profile={p}
                depth={depth}
                onSwiped={(action) => void swipe(p, action)}
              />
            );
          })
        )}
      </section>

      <div className="swipe-actions">
        <button type="button" className="round pass" onClick={() => trigger("pass")} disabled={!hasCards || !!error} aria-label="Pass">
          <X strokeWidth={3} aria-hidden />
        </button>
        <button type="button" className="round like" onClick={() => trigger("like")} disabled={!hasCards || !!error} aria-label="Like">
          <Heart strokeWidth={2.6} fill="currentColor" aria-hidden />
        </button>
      </div>
      <p className="fine key-hint">
        Drag the card, or use <kbd>&larr;</kbd> to pass and <kbd>&rarr;</kbd> to like
      </p>

      {reveal && <MatchReveal match={reveal} onClose={closeReveal} />}
    </div>
  );
}
