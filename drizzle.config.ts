import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// .env.localファイルを読み込む
dotenv.config({ path: '.env.local' });

export default {
  schema: './app/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  verbose: true,
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config; 