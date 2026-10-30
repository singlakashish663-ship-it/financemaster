require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const http = require('http');
const app  = require('./app');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const ensureMarketStocks = require('./seeds/ensureMarketStocks');

const PORT = process.env.PORT || 5000;

async function start() {
  // Try DB — but don't crash if unavailable
  try {
    await connectDB();
    try {
      await ensureMarketStocks();
      logger.info('Paper-trading stock universe is ready.');
    } catch (err) {
      logger.error('Paper-trading stock bootstrap failed:', err.message);
    }
  } catch (err) {
    logger.warn('⚠️  MongoDB unavailable — server starting without DB. Set MONGODB_URI in .env to connect.');
    logger.warn('    Free Atlas: https://mongodb.com/atlas/database');
  }

  const server = http.createServer(app);

  // Socket.IO
  try {
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET','POST'] },
    });
    require('./config/socket')(io);
  } catch (err) {
    logger.warn('Socket.IO init skipped:', err.message);
  }

  server.listen(PORT, () => {
    logger.info(`\n🚀 FinanceQuest server running on http://localhost:${PORT}`);
    logger.info(`   Health check: http://localhost:${PORT}/health`);
    logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`   DB: ${process.env.MONGODB_URI ? 'configured' : 'not configured — add MONGODB_URI to .env'}\n`);
  });

  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}

start().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
