// models/News.js
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Haber başlığı gereklidir'],
    trim: true,
    maxlength: [200, 'Başlık 200 karakterden uzun olamaz']
  },
  content: {
    type: String,
    required: [true, 'Haber içeriği gereklidir'],
    trim: true
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [500, 'Özet 500 karakterden uzun olamaz']
  },
  image: {
    type: String,
    default: null // Resim URL'i veya dosya yolu
  },
  category: {
    type: String,
    enum: ['genel', 'egitim', 'etkinlik', 'duyuru'],
    default: 'genel'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false // Öne çıkan haber
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // SEO için
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta açıklama 160 karakterden uzun olamaz']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
newsSchema.index({ title: 'text', content: 'text' }); // Arama için
newsSchema.index({ category: 1 });
newsSchema.index({ publishDate: -1 });
newsSchema.index({ isActive: 1 });
newsSchema.index({ slug: 1 });

// Slug oluşturma middleware
newsSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }
  next();
});

// Virtual - görüntüleme sayısı formatı
newsSchema.virtual('formattedViews').get(function() {
  if (this.views >= 1000) {
    return (this.views / 1000).toFixed(1) + 'K';
  }
  return this.views.toString();
});

// Static metodlar
newsSchema.statics.findActiveNews = function() {
  return this.find({ isActive: true })
   // .populate('author', 'name')
    .sort({ publishDate: -1 });
};

newsSchema.statics.findFeaturedNews = function() {
  return this.find({ isActive: true, isFeatured: true })
    .populate('author', 'name')
    .sort({ publishDate: -1 })
    .limit(3);
};

newsSchema.statics.findByCategory = function(category) {
  return this.find({ isActive: true, category })
    .populate('author', 'name')
    .sort({ publishDate: -1 });
};

// Instance metodlar
newsSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('News', newsSchema);