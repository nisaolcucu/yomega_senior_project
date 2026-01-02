const BoardMember = require('../models/BoardMember');

// Aktif yönetim kurulu üyelerini getir (public)
const getActiveBoardMembers = async (req, res) => {
  try {
    const boardMembers = await BoardMember.findActiveMembers();
    
    // ✅ Fotoğraf URL'lerini düzelt
    const membersWithPhotos = boardMembers.map(member => {
      const memberObj = member.toObject();
      
      if (memberObj.image) {
        // HTTP ile başlıyorsa dokunma
        if (memberObj.image.startsWith('http')) {
          return memberObj;
        }
        
        // ✅ ÇOKLU /uploads/ TEMIZLE
        let cleanPath = memberObj.image.replace(/\/uploads\/board-members\/+/g, '/uploads/board-members/');
        
        // /uploads ile başlıyorsa dokunma
        if (cleanPath.startsWith('/uploads')) {
          memberObj.image = cleanPath;
          return memberObj;
        }
        
        // Sadece filename ise /uploads ekle
        memberObj.image = `/uploads/board-members/${cleanPath}`;
      }
      
      return memberObj;
    });
    
    res.json({
      success: true,
      data: { boardMembers: membersWithPhotos }
    });
    
  } catch (error) {
    console.error('Get Active Board Members Error:', error);
    res.status(500).json({
      success: false,
      message: 'Yönetim kurulu üyeleri getirilirken hata oluştu'
    });
  }
};

// Pozisyona göre üyeler (public)
const getMembersByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    
    const members = await BoardMember.findByPosition(position);
    
    res.json({
      success: true,
      data: { members, position }
    });
    
  } catch (error) {
    console.error('Get Members By Position Error:', error);
    res.status(500).json({
      success: false,
      message: 'Pozisyon üyeleri getirilirken hata oluştu'
    });
  }
};

// Tek üye detayı (public)
const getBoardMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const member = await BoardMember.findOne({ 
      _id: id, 
      isActive: true, 
      isPublic: true 
    }).populate('addedBy', 'name');
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Yönetim kurulu üyesi bulunamadı'
      });
    }
    
    res.json({
      success: true,
      data: { member }
    });
    
  } catch (error) {
    console.error('Get Board Member By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Üye bilgileri getirilirken hata oluştu'
    });
  }
};

// Mevcut yönetim kurulu (public)
const getCurrentBoard = async (req, res) => {
  try {
    const boardMembers = await BoardMember.findCurrentBoard();
    
    // ✅ Fotoğraf URL'lerini düzelt
    const membersWithPhotos = boardMembers.map(member => {
      const memberObj = member.toObject();
      
      if (memberObj.image) {
        // HTTP ile başlıyorsa dokunma
        if (memberObj.image.startsWith('http')) {
          return memberObj;
        }
        
        // ✅ ÇOKLU /uploads/ TEMIZLE
        let cleanPath = memberObj.image.replace(/\/uploads\/board-members\/+/g, '/uploads/board-members/');
        
        // /uploads ile başlıyorsa dokunma
        if (cleanPath.startsWith('/uploads')) {
          memberObj.image = cleanPath;
          return memberObj;
        }
        
        // Sadece filename ise /uploads ekle
        memberObj.image = `/uploads/board-members/${cleanPath}`;
      }
      
      return memberObj;
    });
    
    // Pozisyonlara göre grupla
    const groupedByPosition = membersWithPhotos.reduce((acc, member) => {
      const position = member.position;
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(member);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: { 
        boardMembers: membersWithPhotos,
        groupedByPosition 
      }
    });
    
  } catch (error) {
    console.error('Get Current Board Error:', error);
    res.status(500).json({
      success: false,
      message: 'Mevcut yönetim kurulu getirilirken hata oluştu'
    });
  }
};

// ===== ADMIN İŞLEMLERİ =====

// ✅ CREATE
const createBoardMember = async (req, res) => {
  try {
    const memberData = {
      ...req.body,
      addedBy: req.user._id
    };
    
    // ✅ RESIM YÜKLEME - SADECE FILENAME
    if (req.file) {
      // SADECE filename al, /uploads ekleme!
      const filename = req.file.filename || req.file.path.split('/').pop();
      memberData.image = filename; // ✅ SADECE: atillaelci_1764437175537.png
      console.log('📸 Kaydedilen resim (filename only):', memberData.image);
    }
    
    // Gerekli alanları kontrol et
    const { name, position, startDate } = memberData;
    
    if (!name || !position || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'İsim, pozisyon ve başlama tarihi gereklidir'
      });
    }
    
    const member = new BoardMember(memberData);
    await member.save();
    
    await member.populate('addedBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Yönetim kurulu üyesi başarıyla oluşturuldu',
      data: { member }
    });
    
  } catch (error) {
    console.error('Create Board Member Error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Yönetim kurulu üyesi oluşturulurken hata oluştu'
    });
  }
};

// ✅ UPDATE
const updateBoardMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // ✅ RESIM GÜNCELLEME - SADECE FILENAME
    if (req.file) {
      // SADECE filename al, /uploads ekleme!
      const filename = req.file.filename || req.file.path.split('/').pop();
      updateData.image = filename; // ✅ SADECE: atillaelci_1764437175537.png
      console.log('📸 Güncellenen resim (filename only):', updateData.image);
    }
    
    // addedBy'ı değiştirmeye izin verme
    delete updateData.addedBy;
    
    const member = await BoardMember.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email');
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Yönetim kurulu üyesi bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Yönetim kurulu üyesi başarıyla güncellendi',
      data: { member }
    });
    
  } catch (error) {
    console.error('Update Board Member Error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Yönetim kurulu üyesi güncellenirken hata oluştu'
    });
  }
};
// Yönetim kurulu üyesi sil (Admin only)
const deleteBoardMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kalıcı olarak sil
    const member = await BoardMember.findByIdAndDelete(id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Yönetim kurulu üyesi bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Yönetim kurulu üyesi başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Delete Board Member Error:', error);
    res.status(500).json({
      success: false,
      message: 'Yönetim kurulu üyesi silinirken hata oluştu'
    });
  }
};

// Tüm üyeleri getir (Admin only)
const getAllBoardMembersAdmin = async (req, res) => {
  try {
    console.log('🔍 getAllBoardMembersAdmin çağrıldı');
    console.log('📊 Query params:', req.query);
    
    const { page = 1, limit = 100, status, position } = req.query;
    
    let query = {};
    
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (position) query.position = position;
    
    console.log('📊 MongoDB query:', query);
    
    const members = await BoardMember.find(query)
      .populate('addedBy', 'name email')
      .sort({ displayOrder: 1, startDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    console.log('✅ Bulunan üye sayısı:', members.length);
    console.log('📋 İlk 5 üye:', members.slice(0, 5).map(m => m.name));
    
    // ✅ Fotoğraf URL'lerini düzelt
    const membersWithPhotos = members.map(member => {
      const memberObj = member.toObject();
      
      if (memberObj.image) {
        console.log('🖼️ Original image path:', memberObj.image);
        
        // HTTP ile başlıyorsa dokunma
        if (memberObj.image.startsWith('http')) {
          return memberObj;
        }
        
        // ✅ ÇOKLU /uploads/ TEMIZLE
        let cleanPath = memberObj.image.replace(/\/uploads\/board-members\/+/g, '/uploads/board-members/');
        
        // /uploads ile başlıyorsa dokunma
        if (cleanPath.startsWith('/uploads')) {
          memberObj.image = cleanPath;
          console.log('✅ Cleaned path:', memberObj.image);
          return memberObj;
        }
        
        // Sadece filename ise /uploads ekle
        memberObj.image = `/uploads/board-members/${cleanPath}`;
        console.log('✅ Final path:', memberObj.image);
      }
      
      return memberObj;
    });
    
    const total = await BoardMember.countDocuments(query);
    
    console.log('📊 Total count:', total);
    
    res.json({
      success: true,
      data: {
        members: membersWithPhotos,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('❌ getAllBoardMembersAdmin Error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin yönetim kurulu getirilirken hata oluştu'
    });
  }
};

// Üye görev süresi bitir (Admin only)
const endMemberTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate } = req.body;
    
    const member = await BoardMember.findById(id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Yönetim kurulu üyesi bulunamadı'
      });
    }
    
    await member.endTerm(endDate);
    
    res.json({
      success: true,
      message: 'Üye görev süresi başarıyla sonlandırıldı',
      data: { member }
    });
    
  } catch (error) {
    console.error('End Member Term Error:', error);
    res.status(500).json({
      success: false,
      message: 'Görev süresi sonlandırılırken hata oluştu'
    });
  }
};

// Üye görev süresi uzat (Admin only)
const extendMemberTerm = async (req, res) => {
  try {
    const { id } = req.params;
    
    const member = await BoardMember.findById(id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Yönetim kurulu üyesi bulunamadı'
      });
    }
    
    await member.extendTerm();
    
    res.json({
      success: true,
      message: 'Üye görev süresi başarıyla uzatıldı',
      data: { member }
    });
    
  } catch (error) {
    console.error('Extend Member Term Error:', error);
    res.status(500).json({
      success: false,
      message: 'Görev süresi uzatılırken hata oluştu'
    });
  }
};



module.exports = {
  // Public endpoints
  getActiveBoardMembers,
  getMembersByPosition,
  getBoardMemberById,
  getCurrentBoard,
  
  // Admin endpoints
  createBoardMember,
  updateBoardMember,
  deleteBoardMember,
  getAllBoardMembersAdmin,
  endMemberTerm,
  extendMemberTerm
};