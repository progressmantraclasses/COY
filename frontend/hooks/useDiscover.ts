"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, type Match, type Profile, type SwipeAction } from "@/lib/api";
import { useToast } from "@/components/Toast";

/** Ask the API for more cards once fewer than this many are left in the deck. */
const LOW_WATER = 5;

export function useDiscover() {
  const toast = useToast();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [reveal, setReveal] = useState<Match | null>(null);
  const [refilling, setRefilling] = useState(false);

  const deckSize = useRef(0);
  /** Swiped this session (including requests still in flight), so they never come back. */
  const swiped = useRef(new Set<string>());
  const topUpRunning = useRef(false);
  const topUpAgain = useRef(false);

  useEffect(() => {
    deckSize.current = profiles?.length ?? 0;
  }, [profiles]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [feed, matches] = await Promise.all([api.feed(), api.matches()]);
      setProfiles(feed.filter((p) => !swiped.current.has(p.id)));
      setMatchCount(matches.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Fetches the feed again and appends cards we don't have yet. The server
   * adds real profiles to the feed when it runs low, so this keeps the deck
   * going without a page reload. Runs one at a time; a request made while
   * one is running is queued once.
   */
  const topUp = useCallback(async () => {
    if (topUpRunning.current) {
      topUpAgain.current = true;
      return;
    }
    topUpRunning.current = true;
    setRefilling(true);
    try {
      do {
        topUpAgain.current = false;
        try {
          const fresh = await api.feed();
          setProfiles((list) => {
            if (!list) return list;
            const have = new Set(list.map((p) => p.id));
            const add = fresh.filter((p) => !have.has(p.id) && !swiped.current.has(p.id));
            return add.length ? [...list, ...add] : list;
          });
        } catch {
          // Offline or API down: keep the cards we have; the next swipe tries again.
        }
      } while (topUpAgain.current);
    } finally {
      topUpRunning.current = false;
      setRefilling(false);
    }
  }, []);

  /**
   * Called once the card's exit animation finishes. The card is removed
   * optimistically; if the request fails we put it back on top.
   */
  const swipe = useCallback(
    async (profile: Profile, action: SwipeAction) => {
      swiped.current.add(profile.id);
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
        if (!(e instanceof ApiError && e.status === 409)) {
          // Not saved: put the card back on top. (409 means it was already saved, so it stays gone.)
          swiped.current.delete(profile.id);
          setProfiles((list) => (list ? [profile, ...list.filter((p) => p.id !== profile.id)] : [profile]));
          toast("Couldn't save that swipe. Try again.");
          return;
        }
      }
      // The swipe is saved, so the server's count of unswiped profiles is up to date.
      if (deckSize.current < LOW_WATER) void topUp();
    },
    [toast, topUp],
  );

  const reset = useCallback(async () => {
    setProfiles(null);
    try {
      await api.reset();
      swiped.current.clear();
    } finally {
      await load();
    }
  }, [load]);

  return {
    profiles,
    error,
    matchCount,
    reveal,
    refilling,
    closeReveal: () => setReveal(null),
    swipe,
    reload: load,
    reset,
  };
}
