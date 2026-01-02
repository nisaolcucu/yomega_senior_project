const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı!');
    
    // Admin kullanıcısı oluştur veya güncelle
    const adminEmail = 'admin@test.com';
    console.log(`${adminEmail} kullanıcısı kontrol ediliyor...`);
    
    let user = await User.findByEmail(adminEmail);
    
    if (!user) {
      console.log('Admin kullanıcısı oluşturuluyor...');
      user = new User({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        isActive: true,
        isApproved: true
      });
      await user.save();
      console.log('Admin kullanıcısı oluşturuldu!');
    } else {
      console.log('Mevcut kullanıcı admin yapılıyor...');
      user.role = 'admin';
      user.isActive = true;
      user.isApproved = true;
      await user.save();
      console.log('Kullanıcı admin yapıldı!');
    }
    
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    
    mongoose.connection.close();
    console.log('Bağlantı kapatıldı');
    
  } catch (error) {
    console.error('Hata:', error.message);
    process.exit(1);
  }
}

createAdmin();