import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export function configureApp(app: { useGlobalPipes: (...p: ValidationPipe[]) => unknown }) {
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
}

/** Loads backend/.env if it exists (Node 20.12+ built-in). Missing file is fine. */
function loadEnv() {
  try {
    process.loadEnvFile();
  } catch {
    // no .env file: defaults are used
  }
}

async function bootstrap() {
  loadEnv();
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks(); // closes the MongoDB connection on Ctrl+C
  app.enableCors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim()),
  });
  configureApp(app);
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
