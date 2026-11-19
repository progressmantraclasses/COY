"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Lock, MapPin, RotateCcw, WifiOff } from "lucide-react";
import Avatar from "@/components/Avatar";
import { api, API_URL, timeAgo, type Match } from "@/lib/api";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      setMatches(await api.matches());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <header className="top">
        <div className="top-title">
          <Link href="/discover" className="icon-btn" aria-label="Back to Discover">
            <ArrowLeft size={20} strokeWidth={2.4} aria-hidden />
          </Link>
          <span className="wordmark" aria-hidden>coy</span>
        </div>
        {matches && <span className="counter">{matches.length} {matches.length === 1 ? "match" : "matches"}</span>}
      </header>

      <section>
        <h1>Matches</h1>
        <p className="lede" style={{ marginTop: 10 }}>People who liked you back. Nobody else shows up here, ever.</p>
      </section>

      {error ? (
        <div className="status lilac" style={{ marginTop: 22 }}>
          <span className="status-icon"><WifiOff size={26} strokeWidth={2.4} aria-hidden /></span>
          <h1>Can&rsquo;t load matches</h1>
          <p>Make sure the API is running at {API_URL}.</p>
          <div className="actions">
            <button type="button" className="btn" onClick={() => void load()}>
              <RotateCcw size={18} strokeWidth={2.6} aria-hidden /> Retry
            </button>
          </div>
        </div>
      ) : matches === null ? (
        <ul className="rows" style={{ marginTop: 22 }} aria-label="Loading matches">
          {[0, 1, 2].map((i) => (
            <li key={i} className="row" style={{ height: 80 }} />
          ))}
        </ul>
      ) : matches.length === 0 ? (
        <div className="status" style={{ marginTop: 22 }}>
          <span className="sticker">No matches yet</span>
          <h1>Keep swiping</h1>
          <p>When someone you like has liked you too, they&rsquo;ll appear here, and only then.</p>
          <div className="actions">
            <Link href="/discover" className="btn">Go to Discover</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="section-head">
            <h2>Mutual likes</h2>
            <span className="fine">Newest first</span>
          </div>
          <ul className="rows">
            {matches.map((m) => (
              <li key={m.id} className="row matched">
                <Avatar name={m.name} photo={m.photo} />
                <div className="row-main">
                  <div className="row-name">{m.name}, {m.age}</div>
                  <div className="row-sub">
                    <MapPin size={12} strokeWidth={2.6} aria-hidden style={{ display: "inline", verticalAlign: "-1px", marginRight: 4 }} />
                    {m.college ? `${m.college} · ${m.city}` : m.city}
                  </div>
                  <ul className="pills" aria-label="Interests">
                    {m.interests.slice(0, 3).map((it, i) => (
                      <li key={it} className={`pill c${i % 5}`}>{it}</li>
                    ))}
                  </ul>
                </div>
                <div className="row-side">
                  <span className="pill sent" title={new Date(m.matchedAt).toLocaleString()}>
                    <Check size={13} strokeWidth={3} aria-hidden /> {timeAgo(m.matchedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="privacy-note">
        <Lock size={18} strokeWidth={2.4} aria-hidden />
        <p>
          <strong>Your likes are private.</strong> Coy never shows who liked you unless you liked them too. One-sided
          likes and passes are never revealed to anyone.
        </p>
      </div>
    </div>
  );
}
