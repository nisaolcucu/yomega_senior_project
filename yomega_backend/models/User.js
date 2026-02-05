const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
    maxlength: [50, 'İsim 50 karakterden uzun olamaz']
  },
  surname: {
    type: String,
    trim: true
  },
  fatherName: {
    type: String,
    trim: true
  },
  motherName: {
    type: String,
    trim: true
  },
  birthPlace: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date
  },
  tcNo: {
    type: String,
    trim: true
  },
  profession: {
    type: String,
    trim: true
  },
  bloodType: {
    type: String,
    trim: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-', '']
  },
  homePhone: {
    type: String,
    trim: true
  },
  workPhone: {
    type: String,
    trim: true
  },
  educationLevel: {
    type: String,
    trim: true
  },
  registeredCity: {
    type: String,
    trim: true
  },
  registeredDistrict: {
    type: String,
    trim: true
  },
  registeredNeighborhood: {
    type: String,
    trim: true
  },
  residenceAddress: {
    type: String,
    trim: true
  },
  workAddress: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email gereklidir'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Geçerli bir email adresi giriniz'
    ]
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9\s\-\+\(\)]+$/, 'Geçerli bir telefon numarası giriniz']
  },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  hasPaid: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Biyografi 500 karakterden uzun olamaz']
  },
  expertise: [{
    type: String,
    trim: true
  }],
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  
  // ✅ YENİ: Üyelik formu bilgileri
  membershipForm: {
    // Otomatik oluşturulan PDF (kayıt sırasında)
    generatedPdfUrl: {
      type: String,
      default: null
    },
    generatedPdfCreatedAt: {
      type: Date,
      default: null
    },
    
    // Manuel yüklenen form (kayıt için)
    uploadedManualPdfUrl: {
      type: String,
      default: null
    },
    uploadedManualPdfAt: {
      type: Date,
      default: null
    },
    
    // İmzalı form (üye olduktan sonra yüklenir)
    signedPdfUrl: {
      type: String,
      default: null
    },
    cloudinaryPublicId: {  // ✅ YENİ EKLE
    type: String,
    default: null
    },
    signedPdfUploadedAt: {
      type: Date,
      default: null
    },
    signedPdfStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    signedPdfApprovedAt: {
      type: Date,
      default: null
    },
    signedPdfApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    signedPdfNote: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'membershipForm.signedPdfStatus': 1 }); // ✅ YENİ INDEX

// Virtual fields
userSchema.virtual('membershipDays').get(function() {
  return Math.floor((Date.now() - this.joinDate) / (1000 * 60 * 60 * 24));
});

// ✅ YENİ: İmzalı form yüklü mü kontrolü
userSchema.virtual('hasSignedForm').get(function() {
  return !!this.membershipForm?.signedPdfUrl;
});

// Şifre hash'leme middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Şifre karşılaştırma hatası');
  }
};

userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save({ validateBeforeSave: false });
};

userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

userSchema.methods.toSafeObject = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true }).select('-password');
};

userSchema.statics.findAdmins = function() {
  return this.find({ role: 'admin', isActive: true }).select('-password');
};

// ✅ YENİ: İmzalı form yüklemeyen üyeleri bul
userSchema.statics.findMembersWithoutSignedForm = function() {
  return this.find({
    isApproved: true,
    'membershipForm.signedPdfUrl': null
  }).select('-password');
};

// ✅ YENİ: Onay bekleyen imzalı formları bul
userSchema.statics.findPendingSignedForms = function() {
  return this.find({
    'membershipForm.signedPdfUrl': { $ne: null },
    'membershipForm.signedPdfStatus': 'pending'
  }).select('-password');
};

module.exports = mongoose.model('User', userSchema);
