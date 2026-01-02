// models/Resource.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Kaynak başlığı gereklidir'],
    trim: true,
    maxlength: [200, 'Başlık 200 karakterden uzun olamaz']
  },
  description: {
    type: String,
    required: [true, 'Kaynak açıklaması gereklidir'],
    trim: true,
    maxlength: [1000, 'Açıklama 1000 karakterden uzun olamaz']
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'audio', 'image', 'document', 'link', 'presentation', 'dataset'],
    required: [true, 'Kaynak türü gereklidir']
  },
  category: {
    type: String,
    enum: [
      'eğitim materyali',
      'araştırma',
      'makale',
      'sunum',
      'rapor',
      'rehber',
      'şablon',
      'video eğitim',
      'podcast',
      'diğer'
    ],
    required: [true, 'Kaynak kategorisi gereklidir']
  },
  
  file: {
    originalName: String,
    filename: String,
    path: String,
    size: Number, // bytes
    mimetype: String
  },
  url: {
    type: String,
    trim: true // Harici link için
  },
  thumbnail: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['başlangıç', 'orta', 'ileri', 'tüm seviyeler'],
    default: 'tüm seviyeler'
  },
  
  access: {
    type: String,
    enum: ['public', 'members', 'admin'],
    default: 'members'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  rating: {
  average: {
    type: Number,
    min: 1,
    max: 5
    // default kaldırın
  },
  count: {
    type: Number,
    default: 0
  }
  },
  author: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    organization: {
      type: String,
      trim: true
    }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: null
  },
  // SEO ve arama için
  keywords: [{
    type: String,
    trim: true
  }],
  // İstatistikler
  stats: {
    weeklyDownloads: {
      type: Number,
      default: 0
    },
    monthlyDownloads: {
      type: Number,
      default: 0
    }
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ category: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ access: 1 });
resourceSchema.index({ isActive: 1 });
resourceSchema.index({ publishDate: -1 });
resourceSchema.index({ downloadCount: -1 });

// Virtuals
resourceSchema.virtual('formattedSize').get(function() {
  if (!this.file || !this.file.size) return 'N/A';
  
  const bytes = this.file.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

resourceSchema.virtual('isDownloadable').get(function() {
  return this.type !== 'link' && this.file && this.file.path;
});

resourceSchema.virtual('fileExtension').get(function() {
  if (!this.file || !this.file.originalName) return null;
  return this.file.originalName.split('.').pop().toLowerCase();
});

resourceSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.publishDate) / (1000 * 60 * 60 * 24));
});

resourceSchema.virtual('isNew').get(function() {
  return this.ageInDays <= 7; // Son 7 gün
});

resourceSchema.virtual('popularityScore').get(function() {
  // Download ve view sayısına göre popülerlik skoru
  return (this.downloadCount * 2) + this.viewCount;
});

// Static metodlar
resourceSchema.statics.findPublicResources = function() {
  return this.find({ 
    isActive: true,
    access: 'public'
  })
  .populate('uploadedBy', 'name')
  .sort({ publishDate: -1 });
};

resourceSchema.statics.findMemberResources = function() {
  return this.find({ 
    isActive: true,
    access: { $in: ['public', 'members'] }
  })
  .populate('uploadedBy', 'name')
  .sort({ publishDate: -1 });
};

resourceSchema.statics.findByCategory = function(category) {
  return this.find({ 
    isActive: true,
    category
  })
  .populate('uploadedBy', 'name')
  .sort({ publishDate: -1 });
};

resourceSchema.statics.findByType = function(type) {
  return this.find({ 
    isActive: true,
    type
  })
  .populate('uploadedBy', 'name')
  .sort({ publishDate: -1 });
};

resourceSchema.statics.findFeatured = function() {
  return this.find({ 
    isActive: true,
    isFeatured: true
  })
  .populate('uploadedBy', 'name')
  .sort({ publishDate: -1 })
  .limit(6);
};

resourceSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('uploadedBy', 'name')
    .sort({ downloadCount: -1, viewCount: -1 })
    .limit(limit);
};

resourceSchema.statics.findRecent = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('uploadedBy', 'name')
    .sort({ publishDate: -1 })
    .limit(limit);
};

// Instance metodlar
resourceSchema.methods.incrementDownloads = function() {
  this.downloadCount += 1;
  this.stats.weeklyDownloads += 1;
  this.stats.monthlyDownloads += 1;
  this.lastAccessed = new Date();
  return this.save({ validateBeforeSave: false });
};

resourceSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  this.lastAccessed = new Date();
  return this.save({ validateBeforeSave: false });
};

resourceSchema.methods.addRating = function(rating) {
  const totalRating = (this.rating.average * this.rating.count) + rating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

resourceSchema.methods.canAccess = function(user) {
  if (this.access === 'public') return true;
  if (!user) return false;
  if (this.access === 'admin' && !user.isAdmin()) return false;
  return true;
};

module.exports = mongoose.model('Resource', resourceSchema);