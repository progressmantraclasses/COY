import { Inject, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { MatchRecord, SwipeRecord } from '../discover/profile.types';

export const DATA_FILE = Symbol('DATA_FILE');

export interface DbShape {
  swipes: SwipeRecord[];
  matches: MatchRecord[];
}

const empty = (): DbShape => ({ swipes: [], matches: [] });

/**
 * Tiny JSON-file repository for swipes and matches.
 *
 * - Everything is kept in memory and written through to disk on every mutation,
 *   so state survives page reloads and server restarts.
 * - Writes are atomic: we write a temp file and `rename` it over the real one,
 *   so a crash mid-write can't leave a half-written, corrupt database.
 * - Node runs request handlers on one thread and every method here is
 *   synchronous, so read-check-write sequences can't interleave.
 */
@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private db: DbShape;

  constructor(@Inject(DATA_FILE) private readonly file: string) {
    this.db = this.load();
  }

  private load(): DbShape {
    try {
      if (!fs.existsSync(this.file)) return empty();
      const parsed = JSON.parse(fs.readFileSync(this.file, 'utf8')) as Partial<DbShape>;
      return {
        swipes: Array.isArray(parsed.swipes) ? parsed.swipes : [],
        matches: Array.isArray(parsed.matches) ? parsed.matches : [],
      };
    } catch (err) {
      this.logger.warn(`Could not read ${this.file}, starting empty: ${String(err)}`);
      return empty();
    }
  }

  private persist(): void {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.db, null, 2));
    fs.renameSync(tmp, this.file);
  }

  findSwipe(profileId: string): SwipeRecord | undefined {
    return this.db.swipes.find((s) => s.profileId === profileId);
  }

  swipedIds(): Set<string> {
    return new Set(this.db.swipes.map((s) => s.profileId));
  }

  /** Records a swipe and (optionally) a match in a single write. */
  recordSwipe(swipe: SwipeRecord, match?: MatchRecord): void {
    this.db.swipes.push(swipe);
    if (match) this.db.matches.push(match);
    this.persist();
  }

  matches(): MatchRecord[] {
    return [...this.db.matches];
  }

  reset(): void {
    this.db = empty();
    this.persist();
  }
}
