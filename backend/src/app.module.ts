import { Module } from '@nestjs/common';
import * as path from 'path';
import { DiscoverController } from './discover/discover.controller';
import { DiscoverService, FEED_SEED, PROFILES } from './discover/discover.service';
import { SEED_PROFILES } from './seed/profiles.seed';
import { DATA_FILE, StoreService } from './store/store.service';

@Module({
  controllers: [DiscoverController],
  providers: [
    DiscoverService,
    StoreService,
    { provide: PROFILES, useValue: SEED_PROFILES },
    { provide: FEED_SEED, useValue: Number(process.env.FEED_SEED ?? 20261119) },
    {
      provide: DATA_FILE,
      useValue: process.env.DATA_FILE ?? path.join(process.cwd(), 'data', 'db.json'),
    },
  ],
})
export class AppModule {}
