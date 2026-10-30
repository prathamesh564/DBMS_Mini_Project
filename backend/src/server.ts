import app from './app';
import { initDatabase, pool } from './config/database';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer(): Promise<void> {
  try {
    // 1. Verify and initialize database connection & schema
    await initDatabase();

    // 2. Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('================================================================');
      console.log(`🚀 Women Skill Development & Employment Portal Backend (TypeScript)`);
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`📋 Base API URL: http://localhost:${PORT}/api/v1`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('================================================================');
    });

    // Graceful Shutdown
    const handleShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down server gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await pool.end();
          console.log('PostgreSQL database pool closed.');
          process.exit(0);
        } catch (dbErr) {
          console.error('Error during database pool shutdown:', dbErr);
          process.exit(1);
        }
      });

      // Force close after 10 seconds timeout
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (err) {
    console.error('Critical failure during server startup:', err);
    process.exit(1);
  }
}

startServer();
