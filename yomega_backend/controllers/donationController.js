const Donation = require('../models/Donation');

// Tüm bağışları getir
const getAllDonations = async (req, res) => {
  try {
    const { purpose, startDate, endDate, search, page = 1, limit = 50 } = req.query;
    
    let query = {};
    
    // Amaca göre filtrele
    if (purpose && purpose !== 'all') {
      query.purpose = purpose;
    }
    
    // Tarih aralığına göre filtrele
    if (startDate || endDate) {
      query.donationDate = {};
      if (startDate) {
        query.donationDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.donationDate.$lte = new Date(endDate);
      }
    }
    
    // Arama varsa
    if (search) {
      query.$or = [
        { donorName: { $regex: search, $options: 'i' } },
        { donorEmail: { $regex: search, $options: 'i' } },
        { purposeDetail: { $regex: search, $options: 'i' } }
      ];
    }
    
    const donations = await Donation.find(query)
      .populate('recordedBy', 'name email')
      .sort({ donationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Donation.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        donations,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Get All Donations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Bağışlar getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Yeni bağış kaydı oluştur
const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      donorPhone,
      amount,
      donationDate,
      purpose,
      purposeDetail,
      paymentMethod,
      isAnonymous,
      notes,
      receiptIssued
    } = req.body;
    
    const donationData = {
      donorName: isAnonymous ? 'Anonim' : donorName,
      donorEmail,
      donorPhone,
      amount,
      donationDate: donationDate || new Date(),
      purpose: purpose || 'genel',
      purposeDetail,
      paymentMethod: paymentMethod || 'havale',
      isAnonymous: isAnonymous || false,
      notes,
      receiptIssued: receiptIssued || false,
      recordedBy: req.user._id
    };
    
    const donation = new Donation(donationData);
    await donation.save();
    
    await donation.populate('recordedBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Bağış kaydı başarıyla oluşturuldu',
      data: { donation }
    });
    
  } catch (error) {
    console.error('Create Donation Error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Bağış kaydı oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

// Bağış kaydı güncelle
const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // recordedBy'ı değiştirmeye izin verme
    delete updateData.recordedBy;
    
    const donation = await Donation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('recordedBy', 'name email');
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Bağış kaydı bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Bağış kaydı başarıyla güncellendi',
      data: { donation }
    });
    
  } catch (error) {
    console.error('Update Donation Error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Bağış kaydı güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Bağış kaydı sil
const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const donation = await Donation.findByIdAndDelete(id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Bağış kaydı bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Bağış kaydı başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Delete Donation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Bağış kaydı silinirken hata oluştu',
      error: error.message
    });
  }
};

// Bağış istatistikleri
const getDonationStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Toplam bağış
    const totalDonations = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    
    // Bu yıl
    const yearStart = new Date(currentYear, 0, 1);
    const thisYearDonations = await Donation.aggregate([
      { $match: { donationDate: { $gte: yearStart } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    
    // Bu ay
    const monthStart = new Date(currentYear, currentMonth, 1);
    const thisMonthDonations = await Donation.aggregate([
      { $match: { donationDate: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    
    // Amaca göre dağılım
    const byPurpose = await Donation.aggregate([
      { $group: { _id: '$purpose', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    
    // Aylık trend (son 6 ay)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await Donation.aggregate([
      { $match: { donationDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        total: {
          amount: totalDonations[0]?.total || 0,
          count: totalDonations[0]?.count || 0
        },
        thisYear: {
          amount: thisYearDonations[0]?.total || 0,
          count: thisYearDonations[0]?.count || 0
        },
        thisMonth: {
          amount: thisMonthDonations[0]?.total || 0,
          count: thisMonthDonations[0]?.count || 0
        },
        byPurpose,
        monthlyTrend
      }
    });
    
  } catch (error) {
    console.error('Get Donation Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Bağış istatistikleri getirilirken hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getAllDonations,
  createDonation,
  updateDonation,
  deleteDonation,
  getDonationStats
};