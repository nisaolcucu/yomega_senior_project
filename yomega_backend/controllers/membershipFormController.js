const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// İmzalı form yükleme (Üye)
const uploadSignedForm = async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yüklenmedi'
      });
    }

    console.log('📤 İmzalı form yükleniyor:', {
      userId,
      filename: file.filename,
      size: file.size
    });

    // Dosya yolunu kaydet
    const fileUrl = `/uploads/signed-forms/${file.filename}`;

    // User'ı güncelle
    const user = await User.findByIdAndUpdate(
      userId,
      {
        'membershipForm.signedPdfUrl': fileUrl,
        'membershipForm.signedPdfUploadedAt': new Date(),
        'membershipForm.signedPdfStatus': 'pending'
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    console.log('✅ İmzalı form başarıyla yüklendi:', user.name);

    res.json({
      success: true,
      message: 'İmzalı form başarıyla yüklendi',
      data: {
        user: user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('❌ Upload signed form error:', error);
    res.status(500).json({
      success: false,
      message: 'Form yüklenirken hata oluştu'
    });
  }
};

// Kullanıcının form bilgilerini getir (Üye)
const getMyFormStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('membershipForm name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: {
        formInfo: user.membershipForm
      }
    });

  } catch (error) {
    console.error('❌ Get form status error:', error);
    res.status(500).json({
      success: false,
      message: 'Form bilgileri alınırken hata oluştu'
    });
  }
};

// Tüm imzalı formları getir (Admin)
const getAllSignedForms = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { 'membershipForm.signedPdfUrl': { $ne: null } };

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query['membershipForm.signedPdfStatus'] = status;
    }

    const users = await User.find(query)
      .select('name email membershipForm createdAt')
      .sort({ 'membershipForm.signedPdfUploadedAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // İstatistikler
    const stats = {
      pending: await User.countDocuments({ 
        'membershipForm.signedPdfUrl': { $ne: null },
        'membershipForm.signedPdfStatus': 'pending'
      }),
      approved: await User.countDocuments({ 
        'membershipForm.signedPdfUrl': { $ne: null },
        'membershipForm.signedPdfStatus': 'approved'
      }),
      rejected: await User.countDocuments({ 
        'membershipForm.signedPdfUrl': { $ne: null },
        'membershipForm.signedPdfStatus': 'rejected'
      })
    };

    console.log('📋 İmzalı formlar listelendi:', {
      total,
      page,
      stats
    });

    res.json({
      success: true,
      data: {
        forms: users,
        stats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('❌ Get all signed forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Formlar getirilirken hata oluştu'
    });
  }
};

// İmzalı formu onayla/reddet (Admin)
const updateSignedFormStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, note } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum. "approved" veya "rejected" olmalı'
      });
    }

    const updateData = {
      'membershipForm.signedPdfStatus': status,
      'membershipForm.signedPdfNote': note || ''
    };

    if (status === 'approved') {
      updateData['membershipForm.signedPdfApprovedAt'] = new Date();
      updateData['membershipForm.signedPdfApprovedBy'] = req.user._id;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('name email membershipForm');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    console.log(`✅ İmzalı form ${status === 'approved' ? 'onaylandı' : 'reddedildi'}:`, {
      user: user.name,
      admin: req.user.name
    });

    res.json({
      success: true,
      message: `Form ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`,
      data: { user }
    });

  } catch (error) {
    console.error('❌ Update signed form status error:', error);
    res.status(500).json({
      success: false,
      message: 'Form durumu güncellenirken hata oluştu'
    });
  }
};

// İmzalı formu sil (Admin - kullanıcıdan kaldır)
const deleteSignedForm = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Dosyayı fiziksel olarak sil
    if (user.membershipForm?.signedPdfUrl) {
      const filePath = path.join(__dirname, '..', user.membershipForm.signedPdfUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Dosya silindi:', filePath);
      }
    }

    // DB'den temizle
    user.membershipForm.signedPdfUrl = null;
    user.membershipForm.signedPdfUploadedAt = null;
    user.membershipForm.signedPdfStatus = 'pending';
    user.membershipForm.signedPdfApprovedAt = null;
    user.membershipForm.signedPdfApprovedBy = null;
    user.membershipForm.signedPdfNote = '';

    await user.save();

    console.log('✅ İmzalı form kaldırıldı:', user.name);

    res.json({
      success: true,
      message: 'İmzalı form başarıyla kaldırıldı'
    });

  } catch (error) {
    console.error('❌ Delete signed form error:', error);
    res.status(500).json({
      success: false,
      message: 'Form silinirken hata oluştu'
    });
  }
};

module.exports = {
  uploadSignedForm,
  getMyFormStatus,
  getAllSignedForms,
  updateSignedFormStatus,
  deleteSignedForm
};