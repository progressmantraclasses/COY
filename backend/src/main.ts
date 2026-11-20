import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { IncomingMessage, ServerResponse } from 'http';
import { AppModule } from './app.module';

type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;

/** App-wide setup shared by the local server, the Vercel handler and the e2e tests. */
export function configureApp(app: INestApplication) {
  app.enableCors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim()),
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
}

/** Loads backend/.env if it exists (Node 20.12+ built-in). Missing file is fine (e.g. on Vercel). */
function loadEnv() {
  try {
    process.loadEnvFile();
  } catch {
    // no .env file: real environment variables / defaults are used
  }
}

async function createApp(): Promise<INestApplication> {
  loadEnv();
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  return app;
}

// ---------------------------------------------------------------------------
// Serverless (Vercel): the default export is a request handler. The Nest app
// (and its MongoDB connection) is created on the first request and reused by
// later requests on the same warm instance.
// ---------------------------------------------------------------------------
let listener: Promise<RequestListener> | undefined;

function getListener(): Promise<RequestListener> {
  listener ??= (async () => {
    const app = await createApp();
    await app.init();
    return app.getHttpAdapter().getInstance() as RequestListener;
  })().catch((err) => {
    listener = undefined; // retry on the next request instead of caching the failure
    throw err;
  });
  return listener;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const app = await getListener();
    app(req, res);
  } catch (err) {
    console.error('Coy Discover API failed to start:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ statusCode: 500, message: 'API failed to start. Check the server logs.' }));
  }
}

// ---------------------------------------------------------------------------
// Local / long-running server: `npm run dev` or `node dist/main.js`.
// ---------------------------------------------------------------------------
async function bootstrap() {
  const app = await createApp();
  app.enableShutdownHooks(); // closes the MongoDB connection on Ctrl+C
  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
  console.log(`Coy Discover API listening on http://localhost:${port}`);
}

if (require.main === module) {
  bootstrap().catch((err: unknown) => {
    console.error('Coy Discover API failed to start:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
