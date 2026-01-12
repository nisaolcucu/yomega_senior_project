const Dues = require('../models/Dues');
const User = require('../models/User');

// Tüm aidat kayıtlarını getir
const getAllDues = async (req, res) => {
  try {
    const { year, status, search } = req.query;

    let query = {};

    // Yıla göre filtrele
    if (year) {
      query.year = parseInt(year);
    }

    // Ödeme durumuna göre filtrele
    if (status === 'paid') {
      query.isPaid = true;
    } else if (status === 'unpaid') {
      query.isPaid = false;
    }

    const dues = await Dues.find(query)
      .populate('member', 'name email phone')
      .populate('recordedBy', 'name email')
      .sort({ year: -1, 'member.name': 1 });

    // Arama varsa
    let filteredDues = dues;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDues = dues.filter(due =>
        due.member?.name?.toLowerCase().includes(searchLower) ||
        due.member?.email?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: { dues: filteredDues, total: filteredDues.length }
    });

  } catch (error) {
    console.error('Get All Dues Error:', error);
    res.status(500).json({
      success: false,
      message: 'Aidat kayıtları getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Belirli bir yıla göre aidat durumu
const getDuesByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const User = require('../models/User');

    const members = await User.find({
      role: 'member',
      isApproved: true  // ✅ YENİ: Sadece onaylı üyeler
    })
      .select('name email hasPaid updatedAt createdAt')
      .sort({ name: 1 });

    // ✅ Her member için dues status oluştur
    const duesStatus = members.map(member => ({
      member: {
        _id: member._id,
        name: member.name,
        email: member.email
      },
      year: parseInt(year),
      amount: 600,
      isPaid: member.hasPaid || false,
      paidDate: member.hasPaid ? member.updatedAt : null,
      paymentMethod: member.hasPaid ? 'havale' : null,
      duesId: null, // User tablosunda saklı, ayrı dues kaydı yok
      notes: ''
    }));

    console.log(`📊 Dues for ${year}:`, {
      total: duesStatus.length,
      paid: duesStatus.filter(d => d.isPaid).length,
      unpaid: duesStatus.filter(d => !d.isPaid).length
    });

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        duesStatus
      }
    });

  } catch (error) {
    console.error('❌ Get Dues By Year Error:', error);
    res.status(500).json({
      success: false,
      message: 'Aidat kayıtları alınırken hata oluştu'
    });
  }
};

// Aidat durumu güncelle
const updateDuesStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPaid, amount, paidDate, paymentMethod, notes } = req.body;

    const updateData = {
      isPaid,
      amount,
      paymentMethod,
      notes,
      recordedBy: req.user._id
    };

    if (isPaid && paidDate) {
      updateData.paidDate = paidDate;
    } else if (isPaid && !paidDate) {
      updateData.paidDate = new Date();
    } else if (!isPaid) {
      updateData.paidDate = null;
    }

    const dues = await Dues.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('member', 'name email');

    if (!dues) {
      return res.status(404).json({
        success: false,
        message: 'Aidat kaydı bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Aidat durumu güncellendi',
      data: { dues }
    });

  } catch (error) {
    console.error('Update Dues Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Aidat durumu güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Yeni aidat kaydı oluştur
const createDues = async (req, res) => {
  try {
    const { member, year, amount, isPaid, paidDate, paymentMethod, notes } = req.body;

    console.log('📥 Gelen veri:', req.body)  // ✅ DEBUG

    // Aynı üye ve yıl için kayıt var mı kontrol et
    const existingDues = await Dues.findOne({ member, year });

    if (existingDues) {
      console.log('⚠️ Kayıt zaten var:', existingDues)  // ✅ DEBUG
      return res.status(400).json({
        success: false,
        message: 'Bu üye için bu yıla ait aidat kaydı zaten mevcut'
      });
    }

    const duesData = {
      member,
      year,
      amount: amount || 600,
      isPaid: isPaid || false,
      paymentMethod,
      notes,
      recordedBy: req.user._id
    };

    if (isPaid && paidDate) {
      duesData.paidDate = paidDate;
    } else if (isPaid) {
      duesData.paidDate = new Date();
    }
    console.log('💾 Kaydedilecek veri:', duesData)  // ✅ DEBUG

    const dues = new Dues(duesData);
    await dues.save();

    await dues.populate('member', 'name email');

    res.status(201).json({
      success: true,
      message: 'Aidat kaydı oluşturuldu',
      data: { dues }
    });

  } catch (error) {
    console.error('Create Dues Error:', error);
    res.status(500).json({
      success: false,
      message: 'Aidat kaydı oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

// Aidat kaydı sil
const deleteDues = async (req, res) => {
  try {
    const { id } = req.params;

    const dues = await Dues.findByIdAndDelete(id);

    if (!dues) {
      return res.status(404).json({
        success: false,
        message: 'Aidat kaydı bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Aidat kaydı silindi'
    });

  } catch (error) {
    console.error('Delete Dues Error:', error);
    res.status(500).json({
      success: false,
      message: 'Aidat kaydı silinirken hata oluştu',
      error: error.message
    });
  }
};

// Aidat istatistikleri
const getDuesStats = async (req, res) => {
  try {
    const User = require('../models/User');

    // ✅ User tablosundan gerçek zamanlı istatistikler
    // ✅ SADECE ONAYLANMIŞ ÜYELER için istatistikler
    const totalMembers = await User.countDocuments({
      role: 'member',
      isApproved: true  // ✅ YENİ
    });
    const paidDues = await User.countDocuments({
      role: 'member',
      isApproved: true,  // ✅ YENİ
      hasPaid: true
    });
    const unpaidDues = await User.countDocuments({
      role: 'member',
      isApproved: true,  // ✅ YENİ
      hasPaid: false
    });
    
    const totalAmount = paidDues * 600; // Her aidat 600₺
    const paymentRate = totalMembers > 0 ? ((paidDues / totalMembers) * 100).toFixed(1) : 0;

    console.log('📊 DUES STATS:', {
      totalMembers,
      paidDues,
      unpaidDues,
      totalAmount,
      paymentRate
    });

    res.json({
      success: true,
      data: {
        totalMembers,
        paidDues,
        unpaidDues,
        totalAmount,
        paymentRate: parseFloat(paymentRate)
      }
    });

  } catch (error) {
    console.error('❌ Get Dues Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınırken hata oluştu'
    });
  }
};

module.exports = {
  getAllDues,
  getDuesByYear,
  updateDuesStatus,
  createDues,
  deleteDues,
  getDuesStats
};