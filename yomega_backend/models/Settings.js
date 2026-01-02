const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Genel Ayarlar
  general: {
    siteName: {
      type: String,
      default: 'YÖMEGA'
    },
    siteDescription: {
      type: String,
      default: 'Yükseköğretim Mesleki Gelişim Ağı'
    },
    contactEmail: {
      type: String,
      default: ''  
      
    },
    contactPhone: String,
    address: String,
    language: {
      type: String,
      default: 'tr'
    },
    timezone: {
      type: String,
      default: 'Europe/Istanbul'
    }
  },

  // Sosyal Medya
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    youtube: String
  },

  // Email Ayarları
  email: {
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPassword: String,
    senderEmail: String,
    senderName: String,
    enableNotifications: {
      type: Boolean,
      default: true
    }
  },

  // Üyelik Ayarları
  membership: {
    autoApprove: {
      type: Boolean,
      default: false
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    minPasswordLength: {
      type: Number,
      default: 6
    },
    requireSpecialChar: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 30 // dakika
    }
  },

  // Güvenlik
  security: {
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 15 // dakika
    },
    enableTwoFactor: {
      type: Boolean,
      default: false
    },
    blockedIPs: [{
      type: String
    }]
  },

  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    googleAnalyticsId: String,
    facebookPixelId: String,
    enableSitemap: {
      type: Boolean,
      default: true
    }
  },

  // Bakım Modu
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'Sistemimiz şu anda bakımda. Lütfen daha sonra tekrar deneyin.'
    },
    allowedIPs: [{
      type: String
    }]
  },

  // Bildirim Ayarları
  notifications: {
    newMemberNotify: {
      type: Boolean,
      default: true
    },
    newApplicationNotify: {
      type: Boolean,
      default: true
    },
    newNewsNotify: {
      type: Boolean,
      default: false
    },
    notificationEmail: String
  },

  // Logo ve Görseller
  branding: {
    logo: String,
    favicon: String,
    primaryColor: {
      type: String,
      default: '#f66962'
    },
    secondaryColor: {
      type: String,
      default: '#685f78'
    }
  },

  // Sistem
  system: {
    lastBackup: Date,
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    enableLogs: {
      type: Boolean,
      default: true
    },
    logRetentionDays: {
      type: Number,
      default: 30
    }
  }

}, {
  timestamps: true
});

// Her zaman sadece 1 settings document olmalı
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);