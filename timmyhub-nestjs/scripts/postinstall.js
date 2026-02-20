/**
 * Chạy sau prisma generate.
 * Chỉ chạy db push + seed khi có DATABASE_URL (local). CI không set → bỏ qua.
 */
require('dotenv/config');
const { execSync } = require('child_process');
const path = require('path');

const hasDb = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '';

if (!hasDb) {
  console.log('⏭️  No DATABASE_URL — skipping prisma db push & seed (OK for CI)');
  process.exit(0);
}

const cwd = path.resolve(__dirname, '..');

try {
  console.log('📦 Prisma db push...');
  execSync('pnpm exec prisma db push --accept-data-loss', { cwd, stdio: 'inherit' });
  console.log('🌱 Running db:seed...');
  execSync('pnpm run db:seed', { cwd, stdio: 'inherit' });
  console.log('✅ Postinstall (db) done.');
} catch (e) {
  console.warn('⚠️  Postinstall db push/seed failed (check DATABASE_URL). Run manually: pnpm db:setup');
  process.exit(0); // không fail install
}
