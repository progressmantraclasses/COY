import { MatchRecord, Profile, SwipeRecord } from '../discover/profile.types';
import { AlreadySwipedError, StoreService } from './store.service';

/**
 * In-memory `StoreService`, used by the tests and as a no-setup fallback when
 * `MONGODB_URI` isn't set. Data survives page reloads but not a server restart.
 */
export class MemoryStore extends StoreService {
  private profileList: Profile[] = [];
  private swipes: SwipeRecord[] = [];
  private matchList: MatchRecord[] = [];

  async profiles(): Promise<Profile[]> {
    return this.profileList.map((p) => ({ ...p }));
  }

  async findProfile(id: string): Promise<Profile | null> {
    const p = this.profileList.find((x) => x.id === id);
    return p ? { ...p } : null;
  }

  async addProfiles(profiles: Profile[]): Promise<number> {
    let added = 0;
    for (const p of profiles) {
      if (this.profileList.some((x) => x.id === p.id)) continue;
      this.profileList.push({ ...p });
      added++;
    }
    return added;
  }

  async swipedIds(): Promise<Set<string>> {
    return new Set(this.swipes.map((s) => s.profileId));
  }

  async recordSwipe(swipe: SwipeRecord, match?: MatchRecord): Promise<void> {
    if (this.swipes.some((s) => s.profileId === swipe.profileId)) {
      throw new AlreadySwipedError(swipe.profileId);
    }
    this.swipes.push({ ...swipe });
    if (match) this.matchList.push({ ...match });
  }

  async matches(): Promise<MatchRecord[]> {
    return this.matchList.map((m) => ({ ...m }));
  }

  async reset(): Promise<void> {
    this.swipes = [];
    this.matchList = [];
  }
}
