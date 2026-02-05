const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// İmzalı form yükle
exports.uploadSignedForm = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yüklenmedi'
      });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Eğer önceden yüklenmiş form varsa, Cloudinary'den sil
    if (user.membershipForm?.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(user.membershipForm.cloudinaryPublicId);
        console.log('🗑️ Eski form Cloudinary\'den silindi');
      } catch (error) {
        console.error('Eski form silinemedi:', error);
      }
    }

    // Cloudinary bilgilerini kaydet
    user.membershipForm = {
      ...user.membershipForm,
      signedPdfUrl: req.file.path, // Cloudinary URL
      cloudinaryPublicId: req.file.filename, // Public ID (silmek için)
      signedPdfUploadedAt: new Date(),
      signedPdfStatus: 'pending'
    };

    await user.save();

    console.log('✅ Form Cloudinary\'e yüklendi:', {
      url: req.file.path,
      publicId: req.file.filename
    });

    res.json({
      success: true,
      message: 'İmzalı form başarıyla yüklendi',
      data: {
        fileUrl: req.file.path,
        uploadedAt: user.membershipForm.signedPdfUploadedAt,
        status: user.membershipForm.signedPdfStatus
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Form yüklenirken hata oluştu',
      error: error.message
    });
  }
};

// Kendi form durumunu getir
exports.getMyFormStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('membershipForm');

    res.json({
      success: true,
      data: {
        formInfo: user.membershipForm || null
      }
    });

  } catch (error) {
    console.error('Form status error:', error);
    res.status(500).json({
      success: false,
      message: 'Form durumu alınamadı'
    });
  }
};

// Tüm imzalı formları listele (Admin)
exports.getAllSignedForms = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {
      'membershipForm.signedPdfUrl': { $ne: null }
    };

    if (status && status !== 'all') {
      query['membershipForm.signedPdfStatus'] = status;
    }

    const users = await User.find(query)
      .select('name email membershipForm createdAt')
      .sort({ 'membershipForm.signedPdfUploadedAt': -1 });

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

    res.json({
      success: true,
      data: {
        forms: users,
        stats
      }
    });

  } catch (error) {
    console.error('Get all forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Formlar alınırken hata oluştu'
    });
  }
};

// Form durumunu güncelle (Admin)
exports.updateSignedFormStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, note } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum'
      });
    }

    const user = await User.findById(userId);

    if (!user || !user.membershipForm?.signedPdfUrl) {
      return res.status(404).json({
        success: false,
        message: 'Form bulunamadı'
      });
    }

    user.membershipForm.signedPdfStatus = status;
    user.membershipForm.signedPdfNote = note || '';
    user.membershipForm.signedPdfApprovedAt = new Date();
    user.membershipForm.signedPdfApprovedBy = req.user._id;

    await user.save();

    res.json({
      success: true,
      message: `Form ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`,
      data: { status }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Durum güncellenirken hata oluştu'
    });
  }
};

// Formu sil (Admin)
exports.deleteSignedForm = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user || !user.membershipForm?.signedPdfUrl) {
      return res.status(404).json({
        success: false,
        message: 'Form bulunamadı'
      });
    }

    // Cloudinary'den sil
    if (user.membershipForm.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(user.membershipForm.cloudinaryPublicId);
        console.log('🗑️ Form Cloudinary\'den silindi');
      } catch (error) {
        console.error('Cloudinary silme hatası:', error);
      }
    }

    // Database'den sil
    user.membershipForm = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Form silindi'
    });

  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({
      success: false,
      message: 'Form silinirken hata oluştu'
    });
  }
};