const logger = require('../utils/logger');

module.exports = function setupSocket(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join a room for user-specific events
    socket.on('join-user-room', (userId) => {
      socket.join(`user:${userId}`);
    });

    // Join a challenge room
    socket.on('join-challenge', ({ challengeId, userId }) => {
      socket.join(`challenge:${challengeId}`);
      socket.to(`challenge:${challengeId}`).emit('player-joined', { userId });
    });

    // Leave challenge room
    socket.on('leave-challenge', ({ challengeId, userId }) => {
      socket.leave(`challenge:${challengeId}`);
      socket.to(`challenge:${challengeId}`).emit('player-left', { userId });
    });

    // Market simulation broadcast (admin-triggered)
    socket.on('market-event', (data) => {
      io.emit('market-update', data);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};
