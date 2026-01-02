const Program = require('../models/Program');

// Yaklaşan programları getir (public)
// Public route - Yaklaşan programları getir
const getUpcomingPrograms = async (req, res) => {
  try {
    const query = {
      status: 'yayınlandı',
      dateTime: { $gte: new Date() }
    };

    const programs = await Program.find(query)
      .populate('organizer', 'name')
      .sort({ dateTime: 1 });

    // Kullanıcı giriş yapmışsa kayıt durumunu ekle
    const programsWithStatus = programs.map(program => {
      const programObj = program.toObject();

      // Varsayılan: kayıtlı değil
      programObj.isUserRegistered = false;

      // participants array yoksa veya boşsa, devam et
      if (!program.participants || program.participants.length === 0) {
        return programObj;
      }

      // ⬇️⬇️⬇️ ÖNEMLİ DEĞİŞİKLİK ⬇️⬇️⬇️
      // Kullanıcı giriş yapmışsa VE req.user._id varsa kontrol et
      if (req.user && req.user._id) {
        const userId = req.user._id.toString();

        for (let participant of program.participants) {
          // participant.user undefined olabilir, kontrol et
          if (participant && participant.user && participant.user.toString() === userId) {
            programObj.isUserRegistered = true;
            programObj.userRegistrationStatus = participant.status;
            break;
          }
        }
      }

      return programObj;
    });

    res.json({
      success: true,
      data: {
        programs: programsWithStatus,
        count: programsWithStatus.length
      }
    });
  } catch (error) {
    console.error('Get Upcoming Programs Error:', error);
    console.error('Error stack:', error.stack); // ← Daha detaylı hata
    res.status(500).json({
      success: false,
      message: 'Programlar getirilirken hata oluştu'
    });
  }
};

// Bugünün programları (public)
const getTodaysPrograms = async (req, res) => {
  try {
    const programs = await Program.findTodaysPrograms();

    res.json({
      success: true,
      data: { programs }
    });

  } catch (error) {
    console.error('Get Todays Programs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Bugünün programları getirilirken hata oluştu'
    });
  }
};

// Tek program getir (public)
const getProgramById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const program = await Program.findOne({ 
      _id: id, 
      status: 'yayınlandı' 
    }).populate('organizer', 'name email');
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program bulunamadı'
      });
    }
    
    // Kullanıcı kayıtlı mı kontrol et
    const programObj = program.toObject();
    programObj.isUserRegistered = false;
    programObj.userRegistrationStatus = null;
    
    if (req.user && program.participants && program.participants.length > 0) {
      const userIdStr = req.user._id.toString();
      
      for (let participant of program.participants) {
        if (participant && participant.user) {
          const participantIdStr = participant.user.toString();
          
          if (participantIdStr === userIdStr) {
            programObj.isUserRegistered = true;
            programObj.userRegistrationStatus = participant.status;
            console.log('✅ User is registered!');
            break;
          }
        }
      }
    }
    
    console.log('📤 Sending isUserRegistered:', programObj.isUserRegistered);
    
    res.json({
      success: true,
      data: { program: programObj }
    });
    
  } catch (error) {
    console.error('Get Program By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Program getirilirken hata oluştu'
    });
  }
};

// Kategoriye göre programlar (public)
const getProgramsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const programs = await Program.findByCategory(category)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Program.countDocuments({
      status: 'yayınlandı',
      category
    });

    res.json({
      success: true,
      data: {
        programs,
        category,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get Programs By Category Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori programları getirilirken hata oluştu'
    });
  }
};

// Program aramasi (public)
const searchPrograms = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi gereklidir'
      });
    }

    const programs = await Program.find({
      status: 'yayınlandı',
      $text: { $search: q }
    })
      .populate('organizer', 'name')
      .sort({ score: { $meta: 'textScore' }, dateTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Program.countDocuments({
      status: 'yayınlandı',
      $text: { $search: q }
    });

    res.json({
      success: true,
      data: {
        programs,
        searchTerm: q,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Search Programs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Program arama sırasında hata oluştu'
    });
  }
};

// Bu haftanın programları (anasayfa için)
const getThisWeeksPrograms = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const programs = await Program.find({
      status: 'yayınlandı',
      dateTime: {
        $gte: today,
        $lte: nextWeek
      }
    })
      .populate('organizer', 'name')
      .sort({ dateTime: 1 })
      .limit(5);

    res.json({
      success: true,
      data: { programs }
    });

  } catch (error) {
    console.error('Get This Weeks Programs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Bu haftanın programları getirilirken hata oluştu'
    });
  }
};

// ===== ADMIN İŞLEMLERİ =====

// Program oluştur (Admin only)
const createProgram = async (req, res) => {
  try {
    const programData = {
      ...req.body,
      organizer: req.user._id
    };

    // Gerekli alanları kontrol et
    const { title, description, dateTime, duration, category, speaker } = programData;

    if (!title || !description || !dateTime || !duration || !category || !speaker?.name) {
      return res.status(400).json({
        success: false,
        message: 'Gerekli alanlar eksik: başlık, açıklama, tarih, süre, kategori ve konuşmacı adı'
      });
    }

    const program = new Program(programData);
    await program.save();

    await program.populate('organizer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Program başarıyla oluşturuldu',
      data: { program }
    });

  } catch (error) {
    console.error('Create Program Error:', error);

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Program oluşturulurken hata oluştu'
    });
  }
};

// Program güncelle (Admin only)
const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Organizer'ı değiştirmeye izin verme
    delete updateData.organizer;

    const program = await Program.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Program başarıyla güncellendi',
      data: { program }
    });

  } catch (error) {
    console.error('Update Program Error:', error);

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Program güncellenirken hata oluştu'
    });
  }
};

// Program sil (Admin only)
const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Silme isteği:', id);  // ✅ Debug

    const program = await Program.findByIdAndDelete(id);  // ✅ KALICI SİLME

    if (!program) {
      console.log('❌ Program bulunamadı');
      return res.status(404).json({
        success: false,
        message: 'Program bulunamadı'
      });
    }

    console.log('✅ Program silindi:', program.title);  // ✅ Debug

    res.json({
      success: true,
      message: 'Program başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete Program Error:', error);
    res.status(500).json({
      success: false,
      message: 'Program silinirken hata oluştu',
      error: error.message
    });
  }
};

// Tüm programları getir (Admin only)
const getAllProgramsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;

    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const programs = await Program.find(query)
      .populate('organizer', 'name email')
      .sort({ dateTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Program.countDocuments(query);

    res.json({
      success: true,
      data: {
        programs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get All Programs Admin Error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin programlar getirilirken hata oluştu'
    });
  }
};

// Programa katılımcı ekle
const addParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program bulunamadı'
      });
    }

    if (!program.isRegistrationOpen) {
      return res.status(400).json({
        success: false,
        message: 'Bu programa kayıt açık değil'
      });
    }

    await program.addParticipant();

    res.json({
      success: true,
      message: 'Katılımcı başarıyla eklendi',
      data: {
        currentParticipants: program.registration.currentParticipants
      }
    });

  } catch (error) {
    console.error('Add Participant Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Katılımcı eklenirken hata oluştu'
    });
  }
};

// Programdan katılımcı çıkar
const removeParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program bulunamadı'
      });
    }

    await program.removeParticipant();

    res.json({
      success: true,
      message: 'Katılımcı başarıyla çıkarıldı',
      data: {
        currentParticipants: program.registration.currentParticipants
      }
    });

  } catch (error) {
    console.error('Remove Participant Error:', error);
    res.status(500).json({
      success: false,
      message: 'Katılımcı çıkarılırken hata oluştu'
    });
  }
};

// Etkinliğe kayıt ol
const registerForProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user._id;

    const program = await Program.findById(programId);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Zaten kayıtlı mı kontrol et
    const alreadyRegistered = program.participants.some(
      p => p.user.toString() === userId.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Bu etkinliğe zaten kayıtlısınız'
      });
    }

    // Kapasite kontrolü
    if (program.registration.maxParticipants &&
      program.participants.length >= program.registration.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Etkinlik kapasitesi dolu'
      });
    }

    // Kayıt ekle
    program.participants.push({
      user: userId,
      status: 'registered'
    });

    program.registration.currentParticipants = program.participants.length;
    await program.save();

    res.json({
      success: true,
      message: 'Etkinliğe başarıyla kaydoldunuz',
      data: { program }
    });
  } catch (error) {
    console.error('Register for Program Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında hata oluştu'
    });
  }
};

// Kullanıcının etkinliklerini getir
const getUserPrograms = async (req, res) => {
  try {
    const userId = req.user._id;

    const programs = await Program.find({
      'participants.user': userId
    })
      .populate('organizer', 'name')
      .sort({ dateTime: -1 });

    // Etkinlikleri kategorilere ayır
    const now = new Date();
    const upcoming = [];
    const past = [];
    const completed = [];

    programs.forEach(program => {
      const userParticipation = program.participants.find(
        p => p.user.toString() === userId.toString()
      );

      const programData = {
        ...program.toObject(),
        userStatus: userParticipation.status,
        registeredAt: userParticipation.registeredAt
      };

      if (program.dateTime > now) {
        upcoming.push(programData);
      } else if (userParticipation.status === 'completed') {
        completed.push(programData);
      } else {
        past.push(programData);
      }
    });

    res.json({
      success: true,
      data: {
        upcoming,
        past,
        completed,
        total: programs.length
      }
    });
  } catch (error) {
    console.error('Get User Programs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Etkinlikler getirilirken hata oluştu'
    });
  }
};

// Etkinlik kaydını iptal et
const unregisterFromProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user._id;

    const program = await Program.findById(programId);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Kullanıcı kayıtlı mı kontrol et
    const participantIndex = program.participants.findIndex(
      p => p.user.toString() === userId.toString()
    );

    if (participantIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Bu etkinliğe kayıtlı değilsiniz'
      });
    }

    // Kaydı sil
    program.participants.splice(participantIndex, 1);
    program.registration.currentParticipants = program.participants.length;
    await program.save();

    res.json({
      success: true,
      message: 'Etkinlik kaydınız başarıyla iptal edildi',
      data: { program }
    });
  } catch (error) {
    console.error('Unregister from Program Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt iptal edilirken hata oluştu'
    });
  }
};
// Geçmiş etkinlikler (Public)
const getPastPrograms = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const programs = await Program.find({
      dateTime: { $lt: new Date() },  // Geçmiş tarihler
      status: 'yayınlandı'  // Sadece yayınlanmış olanlar
    })
      .sort({ dateTime: -1 })  // En yeniden eskiye
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('organizer', 'name email');

    const total = await Program.countDocuments({
      dateTime: { $lt: new Date() },
      status: 'yayınlandı'
    });

    res.json({
      success: true,
      data: {
        programs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get Past Programs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Geçmiş etkinlikler getirilirken hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  // Public endpoints
  getUpcomingPrograms,
  getTodaysPrograms,
  getProgramById,
  getProgramsByCategory,
  searchPrograms,
  getThisWeeksPrograms,

  // Admin endpoints
  createProgram,
  updateProgram,
  deleteProgram,
  getAllProgramsAdmin,
  addParticipant,
  removeParticipant,
  registerForProgram,
  getUserPrograms,
  unregisterFromProgram,
  getPastPrograms
};