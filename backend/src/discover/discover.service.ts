import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoreService } from '../store/store.service';
import { toPublicProfile } from './profile.mapper';
import {
  MatchView,
  Profile,
  PublicProfile,
  SwipeAction,
  SwipeResult,
} from './profile.types';

export const PROFILES = Symbol('PROFILES');
export const FEED_SEED = Symbol('FEED_SEED');

/** Small deterministic PRNG so the feed order is stable across reloads. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

@Injectable()
export class DiscoverService {
  private readonly byId: Map<string, Profile>;
  /**
   * Feed order is a seeded shuffle computed once, independent of `likedMe`.
   * Sorting likers to the top (a common "boost" trick) would let the user
   * infer who liked them from position alone, so we deliberately don't.
   */
  private readonly order: Profile[];

  constructor(
    @Inject(PROFILES) profiles: Profile[],
    @Inject(FEED_SEED) seed: number,
    private readonly store: StoreService,
  ) {
    this.byId = new Map(profiles.map((p) => [p.id, p]));
    this.order = seededShuffle(profiles, seed);
  }

  /** Profiles the user has not swiped on yet (public fields only). */
  getFeed(): PublicProfile[] {
    const swiped = this.store.swipedIds();
    return this.order.filter((p) => !swiped.has(p.id)).map(toPublicProfile);
  }

  swipe(profileId: string, action: SwipeAction): SwipeResult {
    const profile = this.byId.get(profileId);
    if (!profile) throw new NotFoundException('Profile not found');
    if (this.store.findSwipe(profileId)) {
      throw new ConflictException('Already swiped on this profile');
    }

    const at = new Date().toISOString();
    // A match needs BOTH sides: our like now, and their earlier like.
    const isMatch = action === 'like' && profile.likedMe;

    this.store.recordSwipe(
      { profileId, action, at },
      isMatch ? { profileId, matchedAt: at } : undefined,
    );

    // Non-matches all return the exact same shape, whether the other person
    // liked us or not, so a pass or a one-sided like leaks nothing.
    if (!isMatch) return { matched: false };
    return { matched: true, match: { ...toPublicProfile(profile), matchedAt: at } };
  }

  /** Mutual matches only, newest first. */
  getMatches(): MatchView[] {
    return this.store
      .matches()
      .map((m) => {
        const p = this.byId.get(m.profileId);
        return p ? { ...toPublicProfile(p), matchedAt: m.matchedAt } : null;
      })
      .filter((m): m is MatchView => m !== null)
      .sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
  }

  reset(): void {
    this.store.reset();
  }
}
