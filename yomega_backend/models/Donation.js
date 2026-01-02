const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: [true, 'Bağışçı adı gereklidir'],
    trim: true
  },
  donorEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  donorPhone: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Bağış miktarı gereklidir'],
    min: [1, 'Bağış miktarı en az 1₺ olmalıdır']
  },
  donationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  purpose: {
    type: String,
    enum: ['genel', 'proje', 'etkinlik', 'eğitim', 'diğer'],
    default: 'genel'
  },
  purposeDetail: {
    type: String,
    maxlength: 500
  },
  paymentMethod: {
    type: String,
    enum: ['nakit', 'havale', 'eft', 'kredi kartı', 'diğer'],
    default: 'havale'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  receiptIssued: {
    type: Boolean,
    default: false
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);