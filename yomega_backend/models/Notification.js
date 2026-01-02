const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['new_program', 'new_resource', 'new_news'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'bx-bell'
  },
  color: {
    type: String,
    default: '#667eea'
  },
  forAllUsers: {
    type: Boolean,
    default: true
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// İkon ve renk belirleme
notificationSchema.pre('save', function(next) {
  if (this.type === 'new_program') {
    this.icon = 'bx-calendar-event';
    this.color = '#667eea';
  } else if (this.type === 'new_resource') {
    this.icon = 'bx-book-bookmark';
    this.color = '#4facfe';
  } else if (this.type === 'new_news') {
    this.icon = 'bx-news';
    this.color = '#43e97b';
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);