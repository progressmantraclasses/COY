/**
 * Internal profile record. `likedMe` models the other person's (secret) swipe on
 * the logged-in user. It is server-only state and must never be serialised to a
 * client — see `toPublicProfile`.
 */
export interface Profile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  college?: string;
  interests: string[];
  likedMe: boolean;
}

/** The only shape of a profile that is allowed to leave the server. */
export interface PublicProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  college?: string;
  interests: string[];
}

export type SwipeAction = 'like' | 'pass';

export interface SwipeRecord {
  profileId: string;
  action: SwipeAction;
  at: string;
}

export interface MatchRecord {
  profileId: string;
  matchedAt: string;
}

export interface MatchView extends PublicProfile {
  matchedAt: string;
}

export interface SwipeResult {
  matched: boolean;
  match?: MatchView;
}
