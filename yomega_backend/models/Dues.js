const mongoose = require('mongoose');

const duesSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 600
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['nakit', 'havale', 'eft', 'kredi kartı', 'diğer'],
    default: 'havale'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Bir üyenin bir yıl için sadece bir aidat kaydı olabilir
duesSchema.index({ member: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Dues', duesSchema);