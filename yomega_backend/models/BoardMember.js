// models/BoardMember.js
const mongoose = require('mongoose');

const boardMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
    maxlength: [100, 'İsim 100 karakterden uzun olamaz']
  },
  position: {
    type: String,
    required: [true, 'Pozisyon gereklidir'],
    enum: [
      // Yönetim Kurulu
      'başkan',
      'başkan yardımcısı',
      'genel sekreter',
      'sayman',
      'üye',
      
      // Denetim Kurulu
      'denetim kurulu başkanı',
      'denetim kurulu üyesi',
      
      // Kurucu
      'kurucu üye'
    ]
  },
  bio: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: null
  },
  contact: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Geçerli bir email adresi giriniz']
    },
    phone: {
      type: String,
      trim: true
    },
    office: {
      type: String,
      trim: true
    }
  },
  social: {
    linkedin: String,
    twitter: String,
    website: String,
    academia: String
  },
  experience: [{
    title: String,
    company: String,
    period: String,
    description: String
  }],
  education: [{
    degree: String,
    school: String,
    year: String,
    field: String
  }],
  expertise: [{
    type: String,
    trim: true
  }],
  achievements: [{
    type: String,
    trim: true
  }],
  startDate: {
    type: Date,
    required: [true, 'Göreve başlama tarihi gereklidir']
  },
  endDate: {
    type: Date,
    default: null // null = hala görevde
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0 // Sıralama için
  },
  isPublic: {
    type: Boolean,
    default: true // Web sitesinde gösterilsin mi?
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
boardMemberSchema.index({ position: 1 });
boardMemberSchema.index({ isActive: 1 });
boardMemberSchema.index({ displayOrder: 1 });
boardMemberSchema.index({ startDate: -1 });
// Text index for full-text search
boardMemberSchema.index({ name: 'text', position: 'text', bio: 'text', 'expertise': 'text' });

// Virtuals
boardMemberSchema.virtual('isCurrentlyActive').get(function() {
  return this.isActive && (!this.endDate || this.endDate > new Date());
});

boardMemberSchema.virtual('serviceDuration').get(function() {
  const endDate = this.endDate || new Date();
  const diffTime = endDate - this.startDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  
  if (years > 0) {
    return `${years} yıl ${months > 0 ? months + ' ay' : ''}`;
  }
  return `${months} ay`;
});

boardMemberSchema.virtual('positionLevel').get(function() {
  const hierarchy = {
    'başkan': 1,
    'başkan yardımcısı': 2,
    'genel sekreter': 3,
    'sayman': 4,
    'üye': 5,
    'denetim kurulu başkanı': 6,
    'denetim kurulu üyesi': 7,
    'kurucu üye': 8
  };
  return hierarchy[this.position] || 99;
});

// Static metodlar
boardMemberSchema.statics.findActiveMembers = function() {
  return this.find({ 
    isActive: true,
    isPublic: true,
    $or: [
      { endDate: null },
      { endDate: { $gt: new Date() } }
    ]
  })
  .sort({ displayOrder: 1, positionLevel: 1 });
};

boardMemberSchema.statics.findByPosition = function(position) {
  return this.find({ 
    position,
    isActive: true,
    isPublic: true
  })
  .sort({ startDate: -1 });
};

boardMemberSchema.statics.findCurrentBoard = function() {
  return this.find({
    isActive: true,
    isPublic: true,
    $or: [
      { endDate: null },
      { endDate: { $gt: new Date() } }
    ]
  })
  .populate('addedBy', 'name')
  .sort({ displayOrder: 1 });
};

// Position hierarchy için sanal alan
boardMemberSchema.virtual('positionTurkish').get(function() {
  const positions = {
    'başkan': 'Başkan',
    'başkan yardımcısı': 'Başkan Yardımcısı',
    'genel sekreter': 'Genel Sekreter',
    'sayman': 'Sayman',
    'üye': 'Üye',
    'denetim kurulu başkanı': 'Denetim Kurulu Başkanı',
    'denetim kurulu üyesi': 'Denetim Kurulu Üyesi',
    'kurucu üye': 'Kurucu Üye'
  };
  return positions[this.position] || this.position;
});

// Instance metodlar
boardMemberSchema.methods.endTerm = function(endDate = new Date()) {
  this.endDate = endDate;
  this.isActive = false;
  return this.save();
};

boardMemberSchema.methods.extendTerm = function() {
  this.endDate = null;
  this.isActive = true;
  return this.save();
};

module.exports = mongoose.model('BoardMember', boardMemberSchema);