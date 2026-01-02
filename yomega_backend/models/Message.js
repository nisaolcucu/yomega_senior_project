const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['announcement', 'direct', 'support'],
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null  // null = tüm üyelere (announcement)
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null  // Yanıt mesajları için
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index'ler - hızlı arama için
messageSchema.index({ from: 1, createdAt: -1 });
messageSchema.index({ to: 1, isRead: 1, createdAt: -1 });
messageSchema.index({ type: 1, status: 1 });

// Virtuals - reply sayısı
messageSchema.virtual('replies', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'parentMessage'
});

module.exports = mongoose.model('Message', messageSchema);