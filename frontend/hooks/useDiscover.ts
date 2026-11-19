"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type Match, type Profile, type SwipeAction } from "@/lib/api";
import { useToast } from "@/components/Toast";

export function useDiscover() {
  const toast = useToast();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [reveal, setReveal] = useState<Match | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [feed, matches] = await Promise.all([api.feed(), api.matches()]);
      setProfiles(feed);
      setMatchCount(matches.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Called once the card's exit animation finishes. The card is removed
   * optimistically; if the request fails we put it back on top.
   */
  const swipe = useCallback(
    async (profile: Profile, action: SwipeAction) => {
      setProfiles((list) => list?.filter((p) => p.id !== profile.id) ?? list);
      try {
        const res = await api.swipe(profile.id, action);
        if (res.matched && res.match) {
          setMatchCount((c) => c + 1);
          setReveal(res.match);
        } else {
          toast(action === "like" ? `Liked ${profile.name}. They'll only know if it's mutual.` : `Passed on ${profile.name}.`);
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) return; // already recorded, stay removed
        setProfiles((list) => (list ? [profile, ...list.filter((p) => p.id !== profile.id)] : [profile]));
        toast("Couldn't save that swipe. Try again.");
      }
    },
    [toast],
  );

  const reset = useCallback(async () => {
    setProfiles(null);
    try {
      await api.reset();
    } finally {
      await load();
    }
  }, [load]);

  return { profiles, error, matchCount, reveal, closeReveal: () => setReveal(null), swipe, reload: load, reset };
}
