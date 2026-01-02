const User = require('../models/User');
const Program = require('../models/Program');
const Resource = require('../models/Resource');

// Anasayfa istatistikleri
const getHomeStats = async (req, res) => {
  try {
    // Toplam üye sayısı (onaylı ve aktif olanlar)
    const totalMembers = await User.countDocuments({ 
      isApproved: true, 
      isActive: true,
      role: 'member'
    });

    // Toplam etkinlik sayısı (yayınlanan)
    const totalPrograms = await Program.countDocuments({ 
      status: 'yayınlandı'
    });

    // Toplam kaynak sayısı (aktif)
    const totalResources = await Resource.countDocuments({ 
      isActive: true 
    });

    // Tamamlanan etkinlik sayısı (geçmiş tarihli)
    const completedPrograms = await Program.countDocuments({ 
      status: 'yayınlandı',
      dateTime: { $lt: new Date() }
    });

    res.json({
      success: true,
      data: {
        totalMembers,
        totalPrograms,
        totalResources,
        completedPrograms
      }
    });
  } catch (error) {
    console.error('Get Home Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler getirilirken hata oluştu'
    });
  }
};

module.exports = {
  getHomeStats
};