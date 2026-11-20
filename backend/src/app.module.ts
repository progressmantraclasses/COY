import { Logger, Module } from '@nestjs/common';
import { DiscoverController } from './discover/discover.controller';
import {
  DiscoverService,
  FEED_SEED,
  REFILL_OPTIONS,
  RefillOptions,
  SEED_PROFILES_TOKEN,
} from './discover/discover.service';
import { ProfileSource, RandomUserSource } from './profiles/profile-source';
import { SEED_PROFILES } from './seed/profiles.seed';
import { MemoryStore } from './store/memory.store';
import { MONGO_CONFIG, MongoConfig, MongoStore } from './store/mongo.store';
import { StoreService } from './store/store.service';

@Module({
  controllers: [DiscoverController],
  providers: [
    DiscoverService,
    {
      // MongoDB when MONGODB_URI is set; otherwise an in-memory store, so the
      // app still runs with zero setup (data then resets on server restart).
      provide: StoreService,
      inject: [MONGO_CONFIG],
      useFactory: (config: MongoConfig): StoreService => {
        if (config.uri) return new MongoStore(config);
        new Logger('Storage').warn(
          'MONGODB_URI is not set: using in-memory storage. Swipes survive page reloads but not a server restart. ' +
            'Set MONGODB_URI in backend/.env to save data in MongoDB.',
        );
        return new MemoryStore();
      },
    },
    { provide: ProfileSource, useClass: RandomUserSource },
    { provide: SEED_PROFILES_TOKEN, useValue: SEED_PROFILES },
    // Factories (not useValue) so env vars are read at startup, after .env is loaded.
    {
      provide: MONGO_CONFIG,
      useFactory: (): MongoConfig => ({
        uri: process.env.MONGODB_URI?.trim() || undefined,
        dbName: process.env.MONGODB_DB || 'coy_discover',
      }),
    },
    {
      provide: FEED_SEED,
      useFactory: () => Number(process.env.FEED_SEED || 20261119),
    },
    {
      provide: REFILL_OPTIONS,
      useFactory: (): RefillOptions => ({
        enabled: process.env.PROFILE_REFILL !== 'false',
        threshold: 5,
        batch: 20,
        maxProfiles: Number(process.env.MAX_PROFILES || 100),
      }),
    },
  ],
})
export class AppModule {}
