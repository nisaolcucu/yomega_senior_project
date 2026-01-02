const News = require('../models/News');
const Program = require('../models/Program');
const BoardMember = require('../models/BoardMember');
const Resource = require('../models/Resource');
const Application = require('../models/Application');
const User = require('../models/User');

// Anasayfa verilerini getir (public)
const getDashboardData = async (req, res) => {
  try {
    const user = req.user; // Opsiyonel auth

    // Paralel olarak tüm verileri çek
    const [
      featuredNews,
      thisWeekPrograms,
      recentResources,
      currentBoard,
      todaysPrograms
    ] = await Promise.all([
      // Öne çıkan haberler (son 3)
      News.find({ isActive: true, isFeatured: true })
        .populate('author', 'name')
        .sort({ publishDate: -1 })
        .limit(3),

      // Bu haftanın programları
      Program.find({
        status: 'yayınlandı',
        dateTime: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
        .populate('organizer', 'name')
        .sort({ dateTime: 1 })
        .limit(5),

      // Son eklenen kaynaklar
      Resource.find({
        isActive: true,
        ...(user ?
          (user.isAdmin() ? {} : { access: { $in: ['public', 'members'] } }) :
          { access: 'public' }
        )
      })
        .populate('uploadedBy', 'name')
        .sort({ publishDate: -1 })
        .limit(4),

      // Yönetim kurulu (sadece ilk 4 kişi)
      BoardMember.find({
        isActive: true,
        isPublic: true,
        $or: [
          { endDate: null },
          { endDate: { $gt: new Date() } }
        ]
      })
        .sort({ displayOrder: 1 })
        .limit(4),

      // Bugünün programları
      (() => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        return Program.find({
          status: 'yayınlandı',
          dateTime: { $gte: startOfDay, $lte: endOfDay }
        })
          .populate('organizer', 'name')
          .sort({ dateTime: 1 });
      })()
    ]);

    // Son haberler (öne çıkan olmayanlar)
    const recentNews = await News.find({
      isActive: true,
      isFeatured: false
    })
      .populate('author', 'name')
      .sort({ publishDate: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        featuredNews,
        recentNews,
        thisWeekPrograms,
        todaysPrograms,
        recentResources,
        currentBoard,
        stats: {
          totalPrograms: thisWeekPrograms.length,
          todayPrograms: todaysPrograms.length,
          totalNews: featuredNews.length + recentNews.length,
          totalBoardMembers: currentBoard.length
        }
      }
    });

  } catch (error) {
    console.error('Get Dashboard Data Error:', error);
    res.status(500).json({
      success: false,
      message: 'Anasayfa verileri getirilirken hata oluştu'
    });
  }
};

// İstatistikler (admin only)
// İstatistikler (admin only)
const getAdminStats = async (req, res) => {
  try {
    // ✅ GERÇEK ZAMANLI USER İSTATİSTİKLERİ
    // ✅ GERÇEK ZAMANLI USER İSTATİSTİKLERİ (SADECE ONAYLANMIŞ ÜYELER)
    const totalUsers = await User.countDocuments({
      role: 'member',
      isApproved: true  // ✅ YENİ: Sadece onaylı üyeler
    });
    const paidUsers = await User.countDocuments({
      role: 'member',
      isApproved: true,  // ✅ YENİ: Sadece onaylı üyeler
      hasPaid: true
    });
    const unpaidUsers = await User.countDocuments({
      role: 'member',
      isApproved: true,  // ✅ YENİ: Sadece onaylı üyeler
      hasPaid: false
    });
    // ✅ GELİR HESAPLAMA (Her üye 500₺)
    const totalRevenue = paidUsers * 500;
    const paymentRate = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : 0;

    // Diğer istatistikler
    const [
      totalNews,
      totalPrograms,
      totalResources,
      totalApplications,
      pendingApplications,
      thisMonthNews,
      upcomingPrograms
    ] = await Promise.all([
      News.countDocuments({ isActive: true }),
      Program.countDocuments({ status: 'yayınlandı' }),
      Resource.countDocuments({ isActive: true }),
      Application.countDocuments({}),
      Application.countDocuments({ status: 'pending' }),
      News.countDocuments({
        isActive: true,
        publishDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      Program.countDocuments({
        status: 'yayınlandı',
        dateTime: { $gt: new Date() }
      })
    ]);

    // Son aktiviteler
    const recentActivities = await Promise.all([
      News.find({ isActive: true })
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title author createdAt')
        .lean()
        .then(items => items.map(item => ({
          type: 'news',
          title: item.title,
          author: item.author?.name || 'Bilinmiyor',
          date: item.createdAt
        }))),

      Application.find({})
        .sort({ submittedAt: -1 })
        .limit(5)
        .select('type applicant.name submittedAt status')
        .lean()
        .then(items => items.map(item => ({
          type: 'application',
          title: `${item.type === 'course' ? 'Kurs' : 'Konuşmacı'} başvurusu`,
          author: item.applicant?.name || 'Bilinmiyor',
          date: item.submittedAt,
          status: item.status
        })))
    ]);

    const allActivities = [...recentActivities[0], ...recentActivities[1]]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Yaklaşan programları getir
    const recentPrograms = await Program.find({
      status: 'yayınlandı',
      dateTime: { $gte: new Date() }
    })
      .sort({ dateTime: 1 })
      .limit(5)
      .select('title dateTime duration category speaker location registration')
      .lean();

    // Son 6 ayın üye istatistikleri
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUserStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Kategoriye göre etkinlik katılımları
    const eventCategoryStats = await Program.aggregate([
      {
        $match: {
          status: 'yayınlandı',
          dateTime: { $lte: new Date() }
        }
      },
      {
        $group: {
          _id: "$category",
          totalParticipants: { $sum: "$registration.currentParticipants" },
          count: { $sum: 1 }
        }
      }
    ]);

    // ✅ GÜNCELLENMIŞ STATS OBJESİ
    const stats = {
      // ✅ Ödeme İstatistikleri (YENİ)
      totalUsers,
      totalMembers: totalUsers,
      paidMembers: paidUsers,
      unpaidMembers: unpaidUsers,
      totalRevenue,
      paymentRate: parseFloat(paymentRate),

      // Diğer istatistikler
      totalNews,
      totalPrograms,
      totalResources,
      totalApplications,
      pendingApplications,
      thisMonthNews,
      upcomingPrograms,

      // Eski isimlerle uyumluluk (frontend değişmeden çalışsın)
      paidUsers,
      unpaidUsers
    };

    console.log('📊 ADMIN STATS CALCULATED:', stats);

    res.json({
      success: true,
      data: {
        stats,
        recentActivities: allActivities,
        recentPrograms,
        monthlyUserStats,
        eventCategoryStats
      }
    });

  } catch (error) {
    console.error('❌ Get Admin Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin istatistikleri getirilirken hata oluştu'
    });
  }
};

// Hızlı istatistikler (anasayfa için)
const getQuickStats = async (req, res) => {
  try {
    const [
      totalActivePrograms,
      totalNews,
      totalResources,
      totalBoardMembers
    ] = await Promise.all([
      Program.countDocuments({
        status: 'yayınlandı',
        dateTime: { $gt: new Date() }
      }),
      News.countDocuments({ isActive: true }),
      Resource.countDocuments({ isActive: true }),
      BoardMember.countDocuments({
        isActive: true,
        $or: [
          { endDate: null },
          { endDate: { $gt: new Date() } }
        ]
      })
    ]);

    res.json({
      success: true,
      data: {
        totalActivePrograms,
        totalNews,
        totalResources,
        totalBoardMembers
      }
    });

  } catch (error) {
    console.error('Get Quick Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Hızlı istatistikler getirilirken hata oluştu'
    });
  }
};

// Üye onaylama
const approveMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Üye başarıyla onaylandı',
      data: { user }
    });

  } catch (error) {
    console.error('Approve Member Error:', error);
    res.status(500).json({
      success: false,
      message: 'Üye onaylanırken hata oluştu'
    });
  }
};

// Üye reddetme
const rejectMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Üye başvurusu reddedildi',
      data: { user }
    });

  } catch (error) {
    console.error('Reject Member Error:', error);
    res.status(500).json({
      success: false,
      message: 'Üye reddedilirken hata oluştu'
    });
  }
};

// Bekleyen üyeleri getir
const getPendingMembers = async (req, res) => {
  try {
    const pendingMembers = await User.find({
      isApproved: false,
      isActive: true
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { members: pendingMembers }
    });

  } catch (error) {
    console.error('Get Pending Members Error:', error);
    res.status(500).json({
      success: false,
      message: 'Bekleyen üyeler getirilirken hata oluştu'
    });
  }
};

// Tüm üyeleri getir
const getAllMembers = async (req, res) => {
  try {
    const members = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { members }
    });

  } catch (error) {
    console.error('Get All Members Error:', error);
    res.status(500).json({
      success: false,
      message: 'Üyeler getirilirken hata oluştu'
    });
  }
};


module.exports = {
  getDashboardData,
  getAdminStats,
  getQuickStats,
  approveMember,
  rejectMember,
  getPendingMembers,
  getAllMembers,

};