import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { ProfileSource } from '../src/profiles/profile-source';
import { SEED_PROFILES } from '../src/seed/profiles.seed';
import { StoreService } from '../src/store/store.service';
import { MemoryStore } from '../src/store/memory.store';
import { StubSource } from './stub-source';

describe('Discover API (e2e)', () => {
  let app: INestApplication;
  const liker = SEED_PROFILES.find((p) => p.likedMe)!;
  const nonLiker = SEED_PROFILES.find((p) => !p.likedMe)!;

  beforeEach(async () => {
    // Same app wiring as production, with the database and randomuser.me swapped for in-memory fakes.
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(StoreService)
      .useValue(new MemoryStore())
      .overrideProvider(ProfileSource)
      .useValue(new StubSource())
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /feed returns at least 30 unswiped profiles with public fields only', async () => {
    const res = await request(app.getHttpServer()).get('/feed').expect(200);
    expect(res.body.profiles.length).toBeGreaterThanOrEqual(30);
    expect(res.text).not.toMatch(/likedMe/);
    expect(res.text).not.toMatch(/_id/);
  });

  it('full flow: like a liker -> match, pass -> gone from feed, /matches lists only mutuals', async () => {
    const server = app.getHttpServer();

    const match = await request(server).post('/swipe').send({ profileId: liker.id, action: 'like' }).expect(200);
    expect(match.body).toMatchObject({ matched: true, match: { id: liker.id } });
    expect(match.text).not.toMatch(/likedMe/);

    const oneSided = await request(server).post('/swipe').send({ profileId: nonLiker.id, action: 'like' }).expect(200);
    expect(oneSided.body).toEqual({ matched: false });

    const feed = await request(server).get('/feed').expect(200);
    const ids = feed.body.profiles.map((p: { id: string }) => p.id);
    expect(ids).not.toContain(liker.id);
    expect(ids).not.toContain(nonLiker.id);

    const matches = await request(server).get('/matches').expect(200);
    expect(matches.body.matches.map((m: { id: string }) => m.id)).toEqual([liker.id]);
    expect(matches.text).not.toMatch(/likedMe/);
  });

  it('rejects a duplicate swipe with 409', async () => {
    const server = app.getHttpServer();
    await request(server).post('/swipe').send({ profileId: nonLiker.id, action: 'pass' }).expect(200);
    await request(server).post('/swipe').send({ profileId: nonLiker.id, action: 'like' }).expect(409);
  });

  it('validates input', async () => {
    const server = app.getHttpServer();
    await request(server).post('/swipe').send({ profileId: liker.id, action: 'superlike' }).expect(400);
    await request(server).post('/swipe').send({ action: 'like' }).expect(400);
    await request(server).post('/swipe').send({ profileId: liker.id, action: 'like', likedMe: true }).expect(400);
    await request(server).post('/swipe').send({ profileId: 'unknown', action: 'like' }).expect(404);
  });

  it('POST /reset restores the full feed', async () => {
    const server = app.getHttpServer();
    await request(server).post('/swipe').send({ profileId: liker.id, action: 'like' }).expect(200);
    await request(server).post('/reset').expect(200);
    const feed = await request(server).get('/feed').expect(200);
    expect(feed.body.profiles).toHaveLength(SEED_PROFILES.length);
    const matches = await request(server).get('/matches').expect(200);
    expect(matches.body.matches).toEqual([]);
  });
});

describe('Discover API without MONGODB_URI (zero-setup fallback)', () => {
  let app: INestApplication;
  const saved = process.env.MONGODB_URI;

  beforeEach(async () => {
    delete process.env.MONGODB_URI;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ProfileSource)
      .useValue(new StubSource())
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    if (saved === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = saved;
  });

  it('starts with in-memory storage and keeps swipes between requests', async () => {
    const server = app.getHttpServer();
    const before = await request(server).get('/feed').expect(200);
    expect(before.body.profiles).toHaveLength(SEED_PROFILES.length);

    const liker = SEED_PROFILES.find((p) => p.likedMe)!;
    await request(server).post('/swipe').send({ profileId: liker.id, action: 'like' }).expect(200);

    const after = await request(server).get('/feed').expect(200);
    expect(after.body.profiles).toHaveLength(SEED_PROFILES.length - 1);
    const matches = await request(server).get('/matches').expect(200);
    expect(matches.body.matches.map((m: { id: string }) => m.id)).toEqual([liker.id]);
  });
});

describe('Vercel serverless handler (default export of main.ts)', () => {
  const saved = { uri: process.env.MONGODB_URI, refill: process.env.PROFILE_REFILL };

  beforeAll(() => {
    // Existing env vars win over backend/.env, so this forces in-memory storage and no network.
    process.env.MONGODB_URI = '';
    process.env.PROFILE_REFILL = 'false';
  });

  afterAll(() => {
    for (const [key, value] of [['MONGODB_URI', saved.uri], ['PROFILE_REFILL', saved.refill]] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('exports a request handler that serves the API and reuses one app across requests', async () => {
    const { default: handler } = await import('../src/main');
    expect(typeof handler).toBe('function');

    await request(handler).get('/').expect(200, { ok: true, service: 'coy-discover-api' });
    const feed = await request(handler).get('/feed').expect(200);
    expect(feed.body.profiles).toHaveLength(SEED_PROFILES.length);

    const liker = SEED_PROFILES.find((p) => p.likedMe)!;
    await request(handler).post('/swipe').send({ profileId: liker.id, action: 'like' }).expect(200);
    // Same warm instance: the swipe from the previous request is still there.
    await request(handler).post('/swipe').send({ profileId: liker.id, action: 'pass' }).expect(409);
    await request(handler).post('/swipe').send({ profileId: liker.id, action: 'nope' }).expect(400);

    const cors = await request(handler).get('/feed').set('Origin', 'http://localhost:3000').expect(200);
    expect(cors.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });
});
