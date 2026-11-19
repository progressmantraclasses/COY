import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { SEED_PROFILES } from '../src/seed/profiles.seed';
import { DATA_FILE } from '../src/store/store.service';

describe('Discover API (e2e)', () => {
  let app: INestApplication;
  let dir: string;
  const liker = SEED_PROFILES.find((p) => p.likedMe)!;
  const nonLiker = SEED_PROFILES.find((p) => !p.likedMe)!;

  beforeEach(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coy-e2e-'));
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DATA_FILE)
      .useValue(path.join(dir, 'db.json'))
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('GET /feed returns at least 30 unswiped profiles with public fields only', async () => {
    const res = await request(app.getHttpServer()).get('/feed').expect(200);
    expect(res.body.profiles.length).toBeGreaterThanOrEqual(30);
    expect(res.text).not.toMatch(/likedMe/);
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
