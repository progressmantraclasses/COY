import { MatchRecord, Profile, SwipeRecord } from '../discover/profile.types';

/** Thrown by `recordSwipe` when the profile already has a swipe. */
export class AlreadySwipedError extends Error {
  constructor(profileId: string) {
    super(`Already swiped on ${profileId}`);
  }
}

/**
 * Storage contract for profiles, swipes and matches.
 *
 * The app uses `MongoStore` (MongoDB). Tests use an in-memory implementation
 * of the same contract, so they run without a database.
 */
export abstract class StoreService {
  /** Every profile, including the server-only `likedMe` flag. */
  abstract profiles(): Promise<Profile[]>;

  abstract findProfile(id: string): Promise<Profile | null>;

  /** Inserts profiles whose `id` is not stored yet. Returns how many were new. */
  abstract addProfiles(profiles: Profile[]): Promise<number>;

  abstract swipedIds(): Promise<Set<string>>;

  /**
   * Saves a swipe and (optionally) its match together: either both are saved
   * or neither is. Throws `AlreadySwipedError` if the profile was swiped before.
   */
  abstract recordSwipe(swipe: SwipeRecord, match?: MatchRecord): Promise<void>;

  abstract matches(): Promise<MatchRecord[]>;

  /** Clears swipes and matches. Profiles are kept. */
  abstract reset(): Promise<void>;
}
