import app from './app.js';
import { env } from './config/env.js';
import db from './config/db.js';
import { seedDatabase } from './db/seed.js';

// Ensure seed data is initialized
try {
  seedDatabase();
} catch (err) {
  console.warn('Seed database note:', err.message);
}

const server = app.listen(env.PORT, () => {
  console.log('\n======================================================');
  console.log(`🇵🇰 AINA (AI National Assistant) Backend API Running`);
  console.log(`🌐 Server Port:     http://localhost:${env.PORT}`);
  console.log(`🏥 Health Check:    http://localhost:${env.PORT}/api/health`);
  console.log(`🤖 AI Engine:       ${env.GEMINI_API_KEY ? 'Gemini Live (' + env.GEMINI_MODEL + ')' : 'Built-in Pakistani Civic Matrix (Ready)'}`);
  console.log(`📁 Database:        SQLite WAL Mode (${env.DB_PATH})`);
  console.log(`⚡ Environment:     ${env.NODE_ENV}`);
  console.log('======================================================\n');
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    try {
      db.close();
      console.log('Database connection closed cleanly.');
    } catch (err) {
      console.error('Error closing database:', err.message);
    }
    process.exit(0);
  });

  // Force shutdown if taking too long
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
