import { Profile } from '../src/discover/profile.types';
import { ProfileSource } from '../src/profiles/profile-source';

/** `ProfileSource` that returns a fixed list (and counts calls), instead of calling randomuser.me. */
export class StubSource extends ProfileSource {
  calls = 0;
  lastCount = 0;

  constructor(private readonly batch: Profile[] = [], private readonly fail = false) {
    super();
  }

  async fetch(count: number): Promise<Profile[]> {
    this.calls++;
    this.lastCount = count;
    if (this.fail) throw new Error('offline');
    return this.batch.slice(0, count);
  }
}
