import { Injectable } from '@nestjs/common';
import { Profile } from '../discover/profile.types';

/** Somewhere new profiles come from when the feed runs low. */
export abstract class ProfileSource {
  abstract fetch(count: number): Promise<Profile[]>;
}

/** Shape of the randomuser.me fields we request (`inc=login,name,dob,location,picture`). */
interface RandomUser {
  login: { uuid: string };
  name: { first: string };
  dob: { age: number };
  location: { city: string };
  picture: { large: string };
}

const API = 'https://randomuser.me/api/';
/** randomuser.me ages are spread 20–80, so ask for plenty and keep the 18–30s. */
const REQUEST_SIZE = 300;
const MIN_AGE = 18;
const MAX_AGE = 30;
const TIMEOUT_MS = 10_000;
/** Share of fetched people who have (secretly) liked the user, so matches stay possible. */
const LIKED_ME_PERCENT = 30;

// randomuser.me gives real-looking people (name, age, city, photo) but no bio or
// interests, so those are picked from these pools.
const BIOS = [
  'Chai over coffee, always. Will debate this.',
  'Weekend trekker, weekday overthinker.',
  'Looking for someone to split dessert with. I get the bigger half.',
  'Bookshelf is full, to-read list is fuller.',
  'Part-time foodie, full-time playlist curator.',
  'I make a mean Maggi and an even meaner Spotify Wrapped.',
  'Sunset chaser. Ask me about my favourite rooftop.',
  'Gym at 7, golgappe at 8. Balance.',
  'Learning guitar, badly. You can be my first audience.',
  'Will plan the trip if you handle the snacks.',
  'Dog person who is slowly becoming a cat person.',
  'Cricket on Sundays, cinema on Fridays.',
  'Fluent in sarcasm and three other languages.',
  'Probably at a café pretending to work.',
  'Street food critic with very strong momo opinions.',
  'Road trips, old songs, and long conversations.',
];

const INTERESTS = [
  'Travel', 'Music', 'Cricket', 'Cooking', 'Photography', 'Books', 'Movies',
  'Hiking', 'Yoga', 'Gaming', 'Dancing', 'Art', 'Coffee', 'Chai', 'Football',
  'Startups', 'Fitness', 'Poetry', 'Street food', 'Podcasts', 'Anime',
  'Board games', 'Cycling', 'Stand-up', 'Fashion', 'Badminton', 'Sketching',
];

/** Stable 32-bit hash so a given person always gets the same bio and interests. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pickInterests(seed: number): string[] {
  const out: string[] = [];
  for (let i = 0; out.length < 3; i++) {
    const item = INTERESTS[hash(`${seed}:${i}`) % INTERESTS.length];
    if (!out.includes(item)) out.push(item);
  }
  return out;
}

export function fromRandomUser(u: RandomUser): Profile {
  const h = hash(u.login.uuid);
  return {
    id: `ru-${u.login.uuid}`,
    name: u.name.first,
    age: u.dob.age,
    photo: u.picture.large,
    bio: BIOS[h % BIOS.length],
    city: u.location.city,
    interests: pickInterests(h),
    likedMe: h % 100 < LIKED_ME_PERCENT,
  };
}

/** Real-looking Indian profiles (name, age, city, photo) from randomuser.me. */
@Injectable()
export class RandomUserSource extends ProfileSource {
  async fetch(count: number): Promise<Profile[]> {
    const url = `${API}?nat=in&results=${REQUEST_SIZE}&inc=login,name,dob,location,picture&noinfo`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`randomuser.me responded with ${res.status}`);
    const body = (await res.json()) as { results?: RandomUser[] };
    return (body.results ?? [])
      .filter(
        (u) =>
          u.login?.uuid &&
          u.name?.first &&
          u.picture?.large &&
          u.location?.city &&
          u.dob?.age >= MIN_AGE &&
          u.dob?.age <= MAX_AGE,
      )
      .slice(0, count)
      .map(fromRandomUser);
  }
}
