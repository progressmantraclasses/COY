import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Collection, Db, MongoClient, MongoServerError } from 'mongodb';
import { MatchRecord, Profile, SwipeRecord } from '../discover/profile.types';
import { AlreadySwipedError, StoreService } from './store.service';

export const MONGO_CONFIG = Symbol('MONGO_CONFIG');

export interface MongoConfig {
  uri?: string;
  dbName: string;
}

interface ProfileDoc extends Profile {
  createdAt: Date;
}

const DUPLICATE_KEY = 11000;
/** Never send Mongo's internal `_id` up to the service layer. */
const NO_ID = { projection: { _id: 0 } } as const;

/**
 * MongoDB storage. Collections:
 * - `profiles`: every profile in the feed (seed + fetched), unique on `id`
 * - `swipes`:   one document per swiped profile, unique on `profileId`
 * - `matches`:  one document per mutual match, unique on `profileId`
 *
 * The unique index on `swipes.profileId` is what makes "no second swipe" safe
 * even when two requests race, and a transaction saves a swipe and its match
 * together.
 */
@Injectable()
export class MongoStore extends StoreService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoStore.name);
  private readonly client: MongoClient;
  private readonly db: Db;
  private ready?: Promise<void>;

  constructor(@Inject(MONGO_CONFIG) config: MongoConfig) {
    super();
    if (!config.uri) {
      throw new Error('MONGODB_URI is not set. Add it to backend/.env (see backend/.env.example).');
    }
    this.client = new MongoClient(config.uri, {
      serverSelectionTimeoutMS: 15000,
      appName: 'coy-discover',
      ignoreUndefined: true, // optional fields (e.g. `college`) are left out, not stored as null
    });
    this.db = this.client.db(config.dbName);
  }

  private get profilesCol(): Collection<ProfileDoc> {
    return this.db.collection<ProfileDoc>('profiles');
  }
  private get swipesCol(): Collection<SwipeRecord> {
    return this.db.collection<SwipeRecord>('swipes');
  }
  private get matchesCol(): Collection<MatchRecord> {
    return this.db.collection<MatchRecord>('matches');
  }

  /** Connects and creates indexes once; every method awaits this first. */
  private connect(): Promise<void> {
    this.ready ??= (async () => {
      await this.client.connect();
      await Promise.all([
        this.profilesCol.createIndex({ id: 1 }, { unique: true }),
        this.swipesCol.createIndex({ profileId: 1 }, { unique: true }),
        this.matchesCol.createIndex({ profileId: 1 }, { unique: true }),
      ]);
      this.logger.log(`Connected to MongoDB database "${this.db.databaseName}"`);
    })().catch((err) => {
      this.ready = undefined; // allow a later retry
      throw err;
    });
    return this.ready;
  }

  /** Fail fast at startup if the database can't be reached. */
  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  async profiles(): Promise<Profile[]> {
    await this.connect();
    return this.profilesCol.find({}, { projection: { _id: 0, createdAt: 0 } }).toArray();
  }

  async findProfile(id: string): Promise<Profile | null> {
    await this.connect();
    return this.profilesCol.findOne({ id }, { projection: { _id: 0, createdAt: 0 } });
  }

  async addProfiles(profiles: Profile[]): Promise<number> {
    if (profiles.length === 0) return 0;
    await this.connect();
    const now = new Date();
    const res = await this.profilesCol.bulkWrite(
      profiles.map((p) => ({
        updateOne: {
          filter: { id: p.id },
          update: { $setOnInsert: { ...p, createdAt: now } },
          upsert: true,
        },
      })),
      { ordered: false },
    );
    return res.upsertedCount;
  }

  async swipedIds(): Promise<Set<string>> {
    await this.connect();
    const docs = await this.swipesCol.find({}, { projection: { _id: 0, profileId: 1 } }).toArray();
    return new Set(docs.map((d) => d.profileId));
  }

  async recordSwipe(swipe: SwipeRecord, match?: MatchRecord): Promise<void> {
    await this.connect();
    const session = this.client.startSession();
    try {
      await session.withTransaction(async () => {
        await this.swipesCol.insertOne({ ...swipe }, { session });
        if (match) await this.matchesCol.insertOne({ ...match }, { session });
      });
    } catch (err) {
      if (err instanceof MongoServerError && err.code === DUPLICATE_KEY) {
        throw new AlreadySwipedError(swipe.profileId);
      }
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async matches(): Promise<MatchRecord[]> {
    await this.connect();
    return this.matchesCol.find({}, NO_ID).toArray();
  }

  async reset(): Promise<void> {
    await this.connect();
    await Promise.all([this.swipesCol.deleteMany({}), this.matchesCol.deleteMany({})]);
  }
}
