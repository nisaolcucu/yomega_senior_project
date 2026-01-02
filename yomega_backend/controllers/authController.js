const User = require('../models/User'); // User.js'den User
const { generateToken } = require('../middleware/auth');
const { generateMembershipPDF } = require('../utils/pdfGenerator'); // ✅ YENİ

// Kullanıcı kaydı
// Kullanıcı kaydı
const register = async (req, res) => {
  try {
    const { name,
      surname,
      email,
      password,
      phone,
      expertise,
      university,
      department,
      fatherName,
      motherName,
      birthPlace,
      birthDate,
      tcNo,
      profession,
      bloodType,
      homePhone,
      workPhone,
      educationLevel,
      registeredCity,
      registeredDistrict,
      registeredNeighborhood,
      residenceAddress,
      workAddress } = req.body;

    // Gerekli alanları kontrol et
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'İsim, email ve şifre gereklidir'
      });
    }

    // Email kontrolü
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanımda'
      });
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    // Kullanıcı oluştur
    const userData = {
      name: name.trim(),
      surname: surname ? surname.trim() : '',
      email: email.toLowerCase().trim(),
      password,
      role: 'member',
      fatherName: fatherName || '',
      motherName: motherName || '',
      birthPlace: birthPlace || '',
      birthDate: birthDate || null,
      tcNo: tcNo || '',
      profession: profession || '',
      bloodType: bloodType || '',
      homePhone: homePhone || '',
      workPhone: workPhone || '',
      phone: phone || '',
      educationLevel: educationLevel || '',
      registeredCity: registeredCity || '',
      registeredDistrict: registeredDistrict || '',
      registeredNeighborhood: registeredNeighborhood || '',
      residenceAddress: residenceAddress || '',
      workAddress: workAddress || ''
    };

    // Opsiyonel alanlar
    if (expertise && Array.isArray(expertise)) {
      userData.expertise = expertise.filter(exp => exp.trim().length > 0);
    }

    const user = new User(userData);
    await user.save();

    // ✅ YENİ: PDF oluştur
    let pdfUrl = null;
    try {
      console.log('📄 Üyelik formu PDF oluşturuluyor:', user.name);

      pdfUrl = await generateMembershipPDF({
        _id: user._id,
        name: user.name,
        surname: user.surname || '',
        email: user.email,
        phone: user.phone || '',
        university: university || '',
        department: department || '',
        expertise: userData.expertise || [],
        fatherName: user.fatherName || '',
        motherName: user.motherName || '',
        birthPlace: user.birthPlace || '',
        birthDate: user.birthDate || '',
        tcNo: user.tcNo || '',
        profession: user.profession || '',
        bloodType: user.bloodType || '',
        homePhone: user.homePhone || '',
        workPhone: user.workPhone || '',
        educationLevel: user.educationLevel || '',
        registeredCity: user.registeredCity || '',
        registeredDistrict: user.registeredDistrict || '',
        registeredNeighborhood: user.registeredNeighborhood || '',
        residenceAddress: user.residenceAddress || '',
        workAddress: user.workAddress || ''
      });

      // PDF URL'ini kullanıcıya kaydet
      user.membershipForm.generatedPdfUrl = pdfUrl;
      user.membershipForm.generatedPdfCreatedAt = new Date();
      await user.save();

      console.log('✅ PDF başarıyla oluşturuldu:', pdfUrl);
    } catch (pdfError) {
      console.error('⚠️ PDF oluşturulamadı (kayıt devam ediyor):', pdfError.message);
      // PDF oluşmazsa da kayıt devam etsin
    }

    // Token oluştur
    const token = generateToken(user._id, user.role);

    // Güvenli kullanıcı bilgilerini döndür
    const safeUser = user.toSafeObject();

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: {
        user: safeUser,
        token,
        pdfUrl // ✅ YENİ: PDF URL'ini frontend'e gönder
      }
    });

  } catch (error) {
    console.error('Register Error:', error);

    // Mongoose validation hatalarını yakala
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    // Duplicate key hatası (email)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanımda'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Kullanıcı girişi
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Gerekli alanları kontrol et
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gereklidir'
      });
    }

    // Kullanıcıyı bul (şifre dahil)
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    // Hesap aktif mi kontrol et
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız deaktif durumda. Lütfen admin ile iletişime geçin'
      });
    }

    // Hesap onaylanmış mı kontrol et
    if (!user.isApproved) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız henüz onaylanmamış. Lütfen admin onayını bekleyin'
      });
    }

    // Şifre kontrolü
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    // Son giriş tarihini güncelle
    await user.updateLastLogin();

    // Token oluştur
    const token = generateToken(user._id, user.role);

    // Güvenli kullanıcı bilgilerini döndür
    const safeUser = user.toSafeObject();

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: safeUser,
        token
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu'
    });
  }
};

// Profil bilgilerini getir
const getProfile = async (req, res) => {
  try {
    const user = req.user; // authenticate middleware'den geliyor

    res.json({
      success: true,
      data: {
        user: user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil bilgileri alınırken hata oluştu'
    });
  }
};

// Profil güncelleme
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, bio, expertise } = req.body;

    // Güncellenecek alanları belirle
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (expertise && Array.isArray(expertise)) {
      updateData.expertise = expertise.filter(exp => exp.trim().length > 0);
    }

    // Kullanıcıyı güncelle
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      data: {
        user: user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Update Profile Error:', error);

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Profil güncellenirken hata oluştu'
    });
  }
};

// Şifre değiştirme
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre ve yeni şifre gereklidir'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Yeni şifre en az 6 karakter olmalıdır'
      });
    }

    // Kullanıcıyı şifre ile birlikte bul
    const user = await User.findById(req.user._id).select('+password');

    // Mevcut şifreyi kontrol et
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre yanlış'
      });
    }

    // Yeni şifreyi kaydet
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });

  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre değiştirilirken hata oluştu'
    });
  }
};

// Çıkış yapma (client tarafında token'i silmek yeterli)
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Başarıyla çıkış yapıldı'
  });
};

// Profil güncelle


// Şifre değiştir
module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,

};