const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Program başlığı gereklidir'],
    trim: true,
    maxlength: [200, 'Başlık 200 karakterden uzun olamaz']
  },
  description: {
    type: String,
    required: [true, 'Program açıklaması gereklidir'],
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Kısa açıklama 300 karakterden uzun olamaz']
  },
  speaker: {
    name: {
      type: String,
      required: [true, 'Konuşmacı adı gereklidir'],
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      default: null
    },
    expertise: [{
      type: String,
      trim: true
    }],
    social: {
      linkedin: String,
      twitter: String,
      website: String
    }
  },
  dateTime: {
    type: Date,
    required: [true, 'Program tarihi gereklidir']
  },
  duration: {
    type: Number, // Dakika cinsinden
    required: [true, 'Program süresi gereklidir'],
    min: [15, 'Program süresi en az 15 dakika olmalıdır']
  },
  location: {
    type: {
      type: String,
      enum: ['online', 'physical', 'hybrid'],
      default: 'online'
    },
    address: String,
    room: String,
    onlineLink: String,
    capacity: {
      type: Number,
      min: [1, 'Kapasite en az 1 olmalıdır']
    }
  },
  category: {
    type: String,
    enum: ['workshop', 'seminer', 'panel', 'konferans', 'kurs'],
    required: [true, 'Program kategorisi gereklidir']
  },
  level: {
    type: String,
    enum: ['başlangıç', 'orta', 'ileri', 'tüm seviyeler'],
    default: 'tüm seviyeler'
  },
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: String,
    trim: true
  }],
  materials: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'dosya']
    }
  }],
  registration: {
    required: {
      type: Boolean,
      default: true
    },
    deadline: Date,
    fee: {
      type: Number,
      default: 0
    },
    maxParticipants: Number,
    currentParticipants: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['taslak', 'yayınlandı', 'iptal', 'tamamlandı'],
    default: 'taslak'
  },
  image: {
    type: String,
    default: null
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Program sonrası
  recording: {
    url: String,
    available: {
      type: Boolean,
      default: false
    }
  },
  feedback: {
    averageRating: {
      type: Number,
      min: 1,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },

  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'completed', 'cancelled'],
      default: 'registered'
    },
    certificateIssued: {
      type: Boolean,
      default: false
    }
  }],

  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
programSchema.index({ dateTime: 1 });
programSchema.index({ category: 1 });
programSchema.index({ status: 1 });
programSchema.index({ 'speaker.name': 'text', title: 'text' , description: 'text', shortDescription: 'text'});

// Virtuals
programSchema.virtual('isUpcoming').get(function() {
  return this.dateTime > new Date();
});

programSchema.virtual('isPast').get(function() {
  return this.dateTime < new Date();
});

programSchema.virtual('isToday').get(function() {
  const today = new Date();
  const programDate = new Date(this.dateTime);
  return today.toDateString() === programDate.toDateString();
});

programSchema.virtual('formattedDateTime').get(function() {
  return this.dateTime.toLocaleString('tr-TR');
});

programSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours} saat ${minutes > 0 ? minutes + ' dakika' : ''}`;
  }
  return `${minutes} dakika`;
});

programSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.registration.required) return false;
  if (this.registration.deadline && new Date() > this.registration.deadline) return false;
  if (this.registration.maxParticipants && 
      this.registration.currentParticipants >= this.registration.maxParticipants) return false;
  return this.status === 'yayınlandı' && this.isUpcoming;
});

// Static metodlar
programSchema.statics.findUpcomingPrograms = function() {
  return this.find({ 
    status: 'yayınlandı',
    dateTime: { $gt: new Date() }
  })
  .populate('organizer', 'name')
  .sort({ dateTime: 1 });
};

programSchema.statics.findTodaysPrograms = function() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  return this.find({
    status: 'yayınlandı',
    dateTime: { $gte: startOfDay, $lte: endOfDay }
  })
  .populate('organizer', 'name')
  .sort({ dateTime: 1 });
};

programSchema.statics.findByCategory = function(category) {
  return this.find({ 
    status: 'yayınlandı',
    category 
  })
  .populate('organizer', 'name')
  .sort({ dateTime: -1 });
};

// Instance metodlar
programSchema.methods.addParticipant = function() {
  if (this.registration.maxParticipants && 
      this.registration.currentParticipants >= this.registration.maxParticipants) {
    throw new Error('Program kapasitesi dolu');
  }
  
  this.registration.currentParticipants += 1;
  return this.save();
};

programSchema.methods.removeParticipant = function() {
  if (this.registration.currentParticipants > 0) {
    this.registration.currentParticipants -= 1;
    return this.save();
  }
};

module.exports = mongoose.model('Program', programSchema);