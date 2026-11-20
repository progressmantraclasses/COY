import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ProfileSource } from '../profiles/profile-source';
import { AlreadySwipedError, StoreService } from '../store/store.service';
import { toPublicProfile } from './profile.mapper';
import {
  MatchView,
  Profile,
  PublicProfile,
  SwipeAction,
  SwipeResult,
} from './profile.types';

/** Profiles written to the database on startup (if not there yet). */
export const SEED_PROFILES_TOKEN = Symbol('SEED_PROFILES');
export const FEED_SEED = Symbol('FEED_SEED');
export const REFILL_OPTIONS = Symbol('REFILL_OPTIONS');

export interface RefillOptions {
  /** Fetch more real profiles when the feed runs low. */
  enabled: boolean;
  /** Refill when fewer than this many unswiped profiles are left. */
  threshold: number;
  /** How many profiles to ask the source for. */
  batch: number;
  /**
   * Stop fetching once this many profiles are stored, so the feed can still
   * end and the "all caught up" empty state is reachable.
   */
  maxProfiles: number;
}

/**
 * Seeded position of a profile in the feed (FNV-1a + murmur3 finaliser).
 * It depends only on the id and the seed, never on `likedMe`, so the order
 * is stable across reloads and new profiles slot in without reshuffling.
 */
export function feedRank(id: string, seed: number): number {
  let h = (0x811c9dc5 ^ seed) >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

@Injectable()
export class DiscoverService implements OnModuleInit {
  private readonly logger = new Logger(DiscoverService.name);
  private refilling?: Promise<void>;

  constructor(
    @Inject(SEED_PROFILES_TOKEN) private readonly seedProfiles: Profile[],
    @Inject(FEED_SEED) private readonly seed: number,
    @Inject(REFILL_OPTIONS) private readonly refillOptions: RefillOptions,
    private readonly store: StoreService,
    private readonly source: ProfileSource,
  ) {}

  async onModuleInit(): Promise<void> {
    const added = await this.store.addProfiles(this.seedProfiles);
    if (added > 0) this.logger.log(`Seeded ${added} profiles`);
  }

  /**
   * Profiles the user has not swiped on yet (public fields only). Sorting
   * likers to the top (a common "boost" trick) would let the user infer who
   * liked them from position alone, so the order ignores `likedMe`.
   */
  async getFeed(): Promise<PublicProfile[]> {
    let { feed, total } = await this.unswiped();
    const { enabled, threshold, maxProfiles } = this.refillOptions;
    if (enabled && feed.length < threshold && total < maxProfiles) {
      await this.refill(maxProfiles - total);
      ({ feed } = await this.unswiped());
    }
    return feed.map(toPublicProfile);
  }

  private async unswiped(): Promise<{ feed: Profile[]; total: number }> {
    const [profiles, swiped] = await Promise.all([this.store.profiles(), this.store.swipedIds()]);
    const feed = profiles
      .filter((p) => !swiped.has(p.id))
      .map((p) => ({ p, rank: feedRank(p.id, this.seed) }))
      .sort((a, b) => a.rank - b.rank || a.p.id.localeCompare(b.p.id))
      .map(({ p }) => p);
    return { feed, total: profiles.length };
  }

  /** Pulls real profiles from the source. One refill at a time; failures are logged, not thrown. */
  private refill(room: number): Promise<void> {
    this.refilling ??= (async () => {
      try {
        const fresh = await this.source.fetch(Math.min(this.refillOptions.batch, room));
        const added = await this.store.addProfiles(fresh);
        this.logger.log(`Feed was low: added ${added} new profiles`);
      } catch (err) {
        this.logger.warn(`Could not fetch new profiles: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        this.refilling = undefined;
      }
    })();
    return this.refilling;
  }

  async swipe(profileId: string, action: SwipeAction): Promise<SwipeResult> {
    const profile = await this.store.findProfile(profileId);
    if (!profile) throw new NotFoundException('Profile not found');

    const at = new Date().toISOString();
    // A match needs BOTH sides: our like now, and their earlier like.
    const isMatch = action === 'like' && profile.likedMe;

    try {
      await this.store.recordSwipe(
        { profileId, action, at },
        isMatch ? { profileId, matchedAt: at } : undefined,
      );
    } catch (err) {
      if (err instanceof AlreadySwipedError) {
        throw new ConflictException('Already swiped on this profile');
      }
      throw err;
    }

    // Non-matches all return the exact same shape, whether the other person
    // liked us or not, so a pass or a one-sided like leaks nothing.
    if (!isMatch) return { matched: false };
    return { matched: true, match: { ...toPublicProfile(profile), matchedAt: at } };
  }

  /** Mutual matches only, newest first. */
  async getMatches(): Promise<MatchView[]> {
    const [matches, profiles] = await Promise.all([this.store.matches(), this.store.profiles()]);
    const byId = new Map(profiles.map((p) => [p.id, p]));
    return matches
      .map((m) => {
        const p = byId.get(m.profileId);
        return p ? { ...toPublicProfile(p), matchedAt: m.matchedAt } : null;
      })
      .filter((m): m is MatchView => m !== null)
      .sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
  }

  reset(): Promise<void> {
    return this.store.reset();
  }
}
