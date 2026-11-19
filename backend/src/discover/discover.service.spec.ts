import { ConflictException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { SEED_PROFILES } from '../seed/profiles.seed';
import { StoreService } from '../store/store.service';
import { DiscoverService } from './discover.service';
import { Profile } from './profile.types';

const PROFILES: Profile[] = [
  { id: 'a', name: 'A', age: 21, photo: 'x', bio: 'b', city: 'c', interests: ['i'], likedMe: true },
  { id: 'b', name: 'B', age: 22, photo: 'x', bio: 'b', city: 'c', interests: ['i'], likedMe: false },
  { id: 'c', name: 'C', age: 23, photo: 'x', bio: 'b', city: 'c', college: 'U', interests: ['i'], likedMe: true },
  { id: 'd', name: 'D', age: 24, photo: 'x', bio: 'b', city: 'c', interests: ['i'], likedMe: false },
];

describe('DiscoverService', () => {
  let dir: string;
  let file: string;
  const make = (profiles = PROFILES) => new DiscoverService(profiles, 42, new StoreService(file));

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coy-'));
    file = path.join(dir, 'db.json');
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  describe('getFeed', () => {
    it('returns every profile before any swipes', () => {
      expect(make().getFeed().map((p) => p.id).sort()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('never returns a profile that has been swiped on (like or pass)', () => {
      const svc = make();
      svc.swipe('a', 'like');
      svc.swipe('b', 'pass');
      expect(svc.getFeed().map((p) => p.id).sort()).toEqual(['c', 'd']);
    });

    it('is deterministic for the same seed', () => {
      expect(make().getFeed().map((p) => p.id)).toEqual(make().getFeed().map((p) => p.id));
    });

    it('does not sort people who liked the user to the front', () => {
      const ids = make(SEED_PROFILES).getFeed().slice(0, 9).map((p) => p.id);
      const likers = SEED_PROFILES.filter((p) => p.likedMe).map((p) => p.id);
      expect(ids.every((id) => likers.includes(id))).toBe(false);
    });
  });

  describe('swipe', () => {
    it('creates a match only when both users liked each other', () => {
      const res = make().swipe('a', 'like');
      expect(res.matched).toBe(true);
      expect(res.match).toMatchObject({ id: 'a', name: 'A' });
      expect(typeof res.match!.matchedAt).toBe('string');
    });

    it('does not match when the other person has not liked the user', () => {
      expect(make().swipe('b', 'like')).toEqual({ matched: false });
    });

    it('a pass on someone who liked the user is indistinguishable from any other pass', () => {
      const svc = make();
      expect(svc.swipe('a', 'pass')).toEqual(svc.swipe('b', 'pass'));
      expect(svc.getMatches()).toEqual([]);
    });

    it('a one-sided like looks exactly like a pass (no hint about the other side)', () => {
      const svc = make();
      expect(svc.swipe('b', 'like')).toEqual(svc.swipe('d', 'pass'));
    });

    it('rejects swiping the same profile twice', () => {
      const svc = make();
      svc.swipe('a', 'pass');
      expect(() => svc.swipe('a', 'like')).toThrow(ConflictException);
      expect(svc.getMatches()).toEqual([]);
    });

    it('rejects unknown profiles', () => {
      expect(() => make().swipe('nope', 'like')).toThrow(NotFoundException);
    });
  });

  describe('getMatches', () => {
    it('lists only mutual matches, newest first', async () => {
      const svc = make();
      svc.swipe('a', 'like');
      await new Promise((r) => setTimeout(r, 5));
      svc.swipe('c', 'like');
      svc.swipe('b', 'like'); // one-sided
      svc.swipe('d', 'pass');
      expect(svc.getMatches().map((m) => m.id)).toEqual(['c', 'a']);
    });
  });

  describe('privacy', () => {
    it('never serialises likedMe in feed, swipe or matches responses', () => {
      const svc = make(SEED_PROFILES);
      const feed = JSON.stringify(svc.getFeed());
      const liker = SEED_PROFILES.find((p) => p.likedMe)!;
      const swipe = JSON.stringify(svc.swipe(liker.id, 'like'));
      const matches = JSON.stringify(svc.getMatches());
      for (const body of [feed, swipe, matches]) expect(body).not.toMatch(/likedMe/);
    });

    it('returns only allow-listed fields', () => {
      const keys = Object.keys(make().getFeed().find((p) => p.id === 'c')!).sort();
      expect(keys).toEqual(['age', 'bio', 'city', 'college', 'id', 'interests', 'name', 'photo']);
    });
  });

  describe('persistence', () => {
    it('keeps swipes and matches across a restart (fresh store on the same file)', () => {
      const first = make();
      first.swipe('a', 'like');
      first.swipe('b', 'pass');

      const second = make();
      expect(second.getFeed().map((p) => p.id).sort()).toEqual(['c', 'd']);
      expect(second.getMatches().map((m) => m.id)).toEqual(['a']);
      expect(() => second.swipe('a', 'like')).toThrow(ConflictException);
    });

    it('starts empty when the data file is corrupt', () => {
      fs.writeFileSync(file, '{not json');
      expect(make().getFeed()).toHaveLength(4);
    });

    it('reset clears swipes and matches', () => {
      const svc = make();
      svc.swipe('a', 'like');
      svc.reset();
      expect(svc.getFeed()).toHaveLength(4);
      expect(svc.getMatches()).toEqual([]);
    });
  });
});
