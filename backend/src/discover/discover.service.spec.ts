import { ConflictException, NotFoundException } from '@nestjs/common';
import { StubSource } from '../../test/stub-source';
import { MemoryStore } from '../store/memory.store';
import { fromRandomUser } from '../profiles/profile-source';
import { SEED_PROFILES } from '../seed/profiles.seed';
import { StoreService } from '../store/store.service';
import { DiscoverService, RefillOptions } from './discover.service';
import { Profile } from './profile.types';

const PROFILES: Profile[] = [
  { id: 'a', name: 'A', age: 21, photo: 'x', bio: 'b', city: 'c', interests: ['i'], likedMe: true },
  { id: 'b', name: 'B', age: 22, photo: 'x', bio: 'b', city: 'c', interests: ['i'], likedMe: false },
  { id: 'c', name: 'C', age: 23, photo: 'x', bio: 'b', city: 'c', college: 'U', interests: ['i'], likedMe: true },
  { id: 'd', name: 'D', age: 24, photo: 'x', bio: 'b', city: 'c', interests: ['i'], likedMe: false },
];

const FRESH: Profile[] = [
  { id: 'ru-1', name: 'R1', age: 25, photo: 'x', bio: 'b', city: 'c', interests: ['i'], likedMe: false },
  { id: 'ru-2', name: 'R2', age: 26, photo: 'x', bio: 'b', city: 'c', interests: ['i'], likedMe: true },
];

const NO_REFILL: RefillOptions = { enabled: false, threshold: 5, batch: 20, maxProfiles: 100 };
const REFILL: RefillOptions = { enabled: true, threshold: 3, batch: 20, maxProfiles: 100 };

interface MakeOpts {
  profiles?: Profile[];
  store?: StoreService;
  source?: StubSource;
  refill?: RefillOptions;
}

async function make(opts: MakeOpts = {}): Promise<DiscoverService> {
  const svc = new DiscoverService(
    opts.profiles ?? PROFILES,
    42,
    opts.refill ?? NO_REFILL,
    opts.store ?? new MemoryStore(),
    opts.source ?? new StubSource(),
  );
  await svc.onModuleInit();
  return svc;
}

const ids = (list: { id: string }[]) => list.map((p) => p.id);

describe('DiscoverService', () => {
  describe('getFeed', () => {
    it('returns every profile before any swipes', async () => {
      expect(ids(await (await make()).getFeed()).sort()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('never returns a profile that has been swiped on (like or pass)', async () => {
      const svc = await make();
      await svc.swipe('a', 'like');
      await svc.swipe('b', 'pass');
      expect(ids(await svc.getFeed()).sort()).toEqual(['c', 'd']);
    });

    it('is deterministic for the same seed', async () => {
      expect(ids(await (await make()).getFeed())).toEqual(ids(await (await make()).getFeed()));
    });

    it('does not sort people who liked the user to the front', async () => {
      const feed = ids(await (await make({ profiles: SEED_PROFILES })).getFeed()).slice(0, 9);
      const likers = ids(SEED_PROFILES.filter((p) => p.likedMe));
      expect(feed.every((id) => likers.includes(id))).toBe(false);
    });
  });

  describe('refill with real profiles', () => {
    it('fetches new profiles when the feed runs low and includes them', async () => {
      const source = new StubSource(FRESH);
      const svc = await make({ source, refill: REFILL });
      await svc.swipe('a', 'pass');
      await svc.swipe('b', 'pass'); // 2 left, below threshold 3
      expect(ids(await svc.getFeed()).sort()).toEqual(['c', 'd', 'ru-1', 'ru-2']);
      expect(source.calls).toBe(1);
    });

    it('does not fetch while enough profiles are left', async () => {
      const source = new StubSource(FRESH);
      await (await make({ source, refill: REFILL })).getFeed();
      expect(source.calls).toBe(0);
    });

    it('fetched profiles can be swiped and matched like any other', async () => {
      const svc = await make({ profiles: [], source: new StubSource(FRESH), refill: REFILL });
      await svc.getFeed();
      expect((await svc.swipe('ru-2', 'like')).matched).toBe(true);
      expect(await svc.swipe('ru-1', 'like')).toEqual({ matched: false });
    });

    it('still serves the remaining feed if fetching fails', async () => {
      const svc = await make({ source: new StubSource([], true), refill: REFILL });
      await svc.swipe('a', 'pass');
      await svc.swipe('b', 'pass');
      expect(ids(await svc.getFeed()).sort()).toEqual(['c', 'd']);
    });

    it('never fetches when refill is disabled', async () => {
      const source = new StubSource(FRESH);
      const svc = await make({ profiles: [], source });
      expect(await svc.getFeed()).toEqual([]);
      expect(source.calls).toBe(0);
    });

    it('only fetches up to the profile cap', async () => {
      const source = new StubSource(FRESH);
      const svc = await make({ source, refill: { ...REFILL, maxProfiles: 5 } });
      await svc.swipe('a', 'pass');
      await svc.swipe('b', 'pass');
      expect(ids(await svc.getFeed()).sort()).toEqual(['c', 'd', 'ru-1']); // 4 stored, room for 1
      expect(source.lastCount).toBe(1);
    });

    it('shows the empty state once the cap is reached and everything is swiped', async () => {
      const source = new StubSource(FRESH);
      const svc = await make({ source, refill: { ...REFILL, maxProfiles: 4 } });
      for (const id of ['a', 'b', 'c', 'd']) await svc.swipe(id, 'pass');
      expect(await svc.getFeed()).toEqual([]);
      expect(source.calls).toBe(0);
    });

    it('maps a randomuser.me person to a full profile, the same way every time', () => {
      const person = {
        login: { uuid: '1b2c3d4e-0000-4000-8000-123456789abc' },
        name: { first: 'Priya' },
        dob: { age: 24 },
        location: { city: 'Nagpur' },
        picture: { large: 'https://randomuser.me/api/portraits/women/5.jpg' },
      };
      const p = fromRandomUser(person);
      expect(p).toMatchObject({
        id: 'ru-1b2c3d4e-0000-4000-8000-123456789abc',
        name: 'Priya',
        age: 24,
        city: 'Nagpur',
        photo: 'https://randomuser.me/api/portraits/women/5.jpg',
      });
      expect(p.bio.length).toBeGreaterThan(0);
      expect(new Set(p.interests).size).toBe(3);
      expect(typeof p.likedMe).toBe('boolean');
      expect(fromRandomUser(person)).toEqual(p);
    });
  });

  describe('swipe', () => {
    it('creates a match only when both users liked each other', async () => {
      const res = await (await make()).swipe('a', 'like');
      expect(res.matched).toBe(true);
      expect(res.match).toMatchObject({ id: 'a', name: 'A' });
      expect(typeof res.match!.matchedAt).toBe('string');
    });

    it('does not match when the other person has not liked the user', async () => {
      expect(await (await make()).swipe('b', 'like')).toEqual({ matched: false });
    });

    it('a pass on someone who liked the user is indistinguishable from any other pass', async () => {
      const svc = await make();
      expect(await svc.swipe('a', 'pass')).toEqual(await svc.swipe('b', 'pass'));
      expect(await svc.getMatches()).toEqual([]);
    });

    it('a one-sided like looks exactly like a pass (no hint about the other side)', async () => {
      const svc = await make();
      expect(await svc.swipe('b', 'like')).toEqual(await svc.swipe('d', 'pass'));
    });

    it('rejects swiping the same profile twice', async () => {
      const svc = await make();
      await svc.swipe('a', 'pass');
      await expect(svc.swipe('a', 'like')).rejects.toThrow(ConflictException);
      expect(await svc.getMatches()).toEqual([]);
    });

    it('rejects unknown profiles', async () => {
      await expect((await make()).swipe('nope', 'like')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMatches', () => {
    it('lists only mutual matches, newest first', async () => {
      const svc = await make();
      await svc.swipe('a', 'like');
      await new Promise((r) => setTimeout(r, 5));
      await svc.swipe('c', 'like');
      await svc.swipe('b', 'like'); // one-sided
      await svc.swipe('d', 'pass');
      expect(ids(await svc.getMatches())).toEqual(['c', 'a']);
    });
  });

  describe('privacy', () => {
    it('never serialises likedMe in feed, swipe or matches responses', async () => {
      const svc = await make({ profiles: SEED_PROFILES });
      const feed = JSON.stringify(await svc.getFeed());
      const liker = SEED_PROFILES.find((p) => p.likedMe)!;
      const swipe = JSON.stringify(await svc.swipe(liker.id, 'like'));
      const matches = JSON.stringify(await svc.getMatches());
      for (const body of [feed, swipe, matches]) expect(body).not.toMatch(/likedMe/);
    });

    it('returns only allow-listed fields', async () => {
      const keys = Object.keys((await (await make()).getFeed()).find((p) => p.id === 'c')!).sort();
      expect(keys).toEqual(['age', 'bio', 'city', 'college', 'id', 'interests', 'name', 'photo']);
    });
  });

  describe('persistence', () => {
    it('keeps swipes and matches across a restart (new service, same database)', async () => {
      const store = new MemoryStore();
      const first = await make({ store });
      await first.swipe('a', 'like');
      await first.swipe('b', 'pass');

      const second = await make({ store });
      expect(ids(await second.getFeed()).sort()).toEqual(['c', 'd']);
      expect(ids(await second.getMatches())).toEqual(['a']);
      await expect(second.swipe('a', 'like')).rejects.toThrow(ConflictException);
    });

    it('seeding on every startup never duplicates profiles', async () => {
      const store = new MemoryStore();
      await make({ store });
      await make({ store });
      expect(await store.profiles()).toHaveLength(PROFILES.length);
    });

    it('reset clears swipes and matches', async () => {
      const svc = await make();
      await svc.swipe('a', 'like');
      await svc.reset();
      expect(await svc.getFeed()).toHaveLength(4);
      expect(await svc.getMatches()).toEqual([]);
    });
  });
});
