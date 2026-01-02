// models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['course', 'speaker', 'contact'],
    required: [true, 'Başvuru türü gereklidir']
  },
  
  // Başvuran kişi bilgileri
  applicant: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // Üye değilse null olabilir
    },
    name: {
      type: String,
      required: [true, 'İsim gereklidir'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email gereklidir'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Telefon gereklidir'],
      trim: true
    },
    organization: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    }
  },

  // Kurs başvurusu için (type: 'course')
  courseApplication: {
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program'
    },
    programTitle: {
      type: String,
      trim: true
    },
    motivation: {
      type: String,
      maxlength: [1000, 'Motivasyon yazısı 1000 karakterden uzun olamaz']
    },
    experience: {
      type: String,
      maxlength: [500, 'Deneyim açıklaması 500 karakterden uzun olamaz']
    },
    expectations: {
      type: String,
      maxlength: [500, 'Beklentiler 500 karakterden uzun olamaz']
    }
  },

  // Konuşmacı başvurusu için (type: 'speaker')
  speakerApplication: {
    proposedTopic: {
      type: String,
      maxlength: [200, 'Konu başlığı 200 karakterden uzun olamaz']
    },
    topicDescription: {
      type: String,
      maxlength: [2000, 'Konu açıklaması 2000 karakterden uzun olamaz']
    },
    expertise: [{
      type: String,
      trim: true
    }],
    previousTalks: [{
      title: String,
      event: String,
      date: Date,
      audience: String
    }],
    bio: {
      type: String,
      maxlength: [1000, 'Biyografi 1000 karakterden uzun olamaz']
    },
    socialMedia: {
      linkedin: String,
      twitter: String,
      website: String,
      youtube: String
    },
    preferredFormat: {
      type: String,
      enum: ['sunum', 'workshop', 'panel', 'soru-cevap', 'demonstrasyon'],
      default: 'sunum'
    },
    duration: {
      type: Number, // dakika
      min: [15, 'Minimum süre 15 dakika'],
      max: [180, 'Maksimum süre 180 dakika']
    },
    targetAudience: {
      type: String,
      enum: ['başlangıç', 'orta', 'ileri', 'tüm seviyeler'],
      default: 'tüm seviyeler'
    },
    materials: [{
      type: String,
      trim: true
    }],
    cv: {
      filename: String,
      path: String,
      originalName: String
    },
    portfolio: {
      filename: String,
      path: String,
      originalName: String
    }
  },

  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected', 'waitlist'],
    default: 'pending'
  },

  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  notes: [{
    message: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    isPrivate: {
      type: Boolean,
      default: true // Admin notları varsayılan olarak private
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  reviewedAt: {
    type: Date,
    default: null
  },

  reviewComments: {
    type: String,
    maxlength: [1000, 'Değerlendirme yorumu 1000 karakterden uzun olamaz']
  },

  // Onaylanan başvurular için
  approvalDetails: {
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    scheduledDate: Date,
    assignedProgram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program'
    },
    conditions: [{
      type: String,
      trim: true
    }]
  },

  // İstatistikler
  submittedAt: {
    type: Date,
    default: Date.now
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
applicationSchema.index({ type: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ 'applicant.email': 1 });
applicationSchema.index({ submittedAt: -1 });
applicationSchema.index({ 'applicant.userId': 1 });

// Virtuals
applicationSchema.virtual('isActive').get(function() {
  return ['pending', 'reviewing', 'waitlist'].includes(this.status);
});

applicationSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

applicationSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

applicationSchema.virtual('isRejected').get(function() {
  return this.status === 'rejected';
});

applicationSchema.virtual('daysSinceSubmission').get(function() {
  return Math.floor((Date.now() - this.submittedAt) / (1000 * 60 * 60 * 24));
});

applicationSchema.virtual('isOverdue').get(function() {
  // 7 günden uzun pending olanlar gecikmiş sayılır
  return this.isPending && this.daysSinceSubmission > 7;
});

applicationSchema.virtual('statusTurkish').get(function() {
  const statusMap = {
    'pending': 'Beklemede',
    'reviewing': 'İnceleniyor',
    'approved': 'Onaylandı',
    'rejected': 'Reddedildi',
    'waitlist': 'Bekleme Listesi'
  };
  return statusMap[this.status] || this.status;
});

applicationSchema.virtual('typeTurkish').get(function() {
  return this.type === 'course' ? 'Kurs Başvurusu' : 'Konuşmacı Başvurusu';
});

// Static metodlar
applicationSchema.statics.findPendingApplications = function() {
  return this.find({ status: 'pending' })
    .populate('applicant.userId', 'name email')
    .populate('reviewedBy', 'name')
    .sort({ submittedAt: 1 }); // En eskiler önce
};

applicationSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('applicant.userId', 'name email')
    .populate('reviewedBy', 'name')
    .sort({ submittedAt: -1 });
};

applicationSchema.statics.findByType = function(type) {
  return this.find({ type })
    .populate('applicant.userId', 'name email')
    .populate('reviewedBy', 'name')
    .sort({ submittedAt: -1 });
};

applicationSchema.statics.findUserApplications = function(userId) {
  return this.find({ 'applicant.userId': userId })
    .populate('courseApplication.programId', 'title dateTime')
    .sort({ submittedAt: -1 });
};

applicationSchema.statics.findOverdueApplications = function() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.find({ 
    status: 'pending',
    submittedAt: { $lt: sevenDaysAgo }
  })
    .populate('applicant.userId', 'name email')
    .sort({ submittedAt: 1 });
};

// Instance metodlar
applicationSchema.methods.approve = function(userId, details = {}) {
  this.status = 'approved';
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  this.lastUpdated = new Date();
  
  this.approvalDetails = {
    approvedAt: new Date(),
    approvedBy: userId,
    ...details
  };
  
  return this.save();
};

applicationSchema.methods.reject = function(userId, comments = '') {
  this.status = 'rejected';
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  this.lastUpdated = new Date();
  this.reviewComments = comments;
  
  return this.save();
};

applicationSchema.methods.addNote = function(message, authorId, isPrivate = true) {
  this.notes.push({
    message,
    author: authorId,
    isPrivate
  });
  this.lastUpdated = new Date();
  
  return this.save();
};

applicationSchema.methods.moveToWaitlist = function(userId, reason = '') {
  this.status = 'waitlist';
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  this.lastUpdated = new Date();
  this.reviewComments = reason;
  
  return this.save();
};

applicationSchema.methods.startReview = function(userId) {
  this.status = 'reviewing';
  this.reviewedBy = userId;
  this.lastUpdated = new Date();
  
  return this.save();
};

// Middleware - son güncelleme tarihini otomatik güncelle
applicationSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Application', applicationSchema);