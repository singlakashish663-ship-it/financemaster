const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserProfile' },
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: Schema.Types.ObjectId },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  success: { type: Boolean, default: true },
  errorMessage: { type: String },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, action: 1 });

// TTL: auto-delete logs older than 180 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
