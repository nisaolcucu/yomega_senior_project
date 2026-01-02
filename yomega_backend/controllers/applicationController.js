const Application = require('../models/Application');
const Program = require('../models/Program');

// Başvuru oluştur (Public/Member)
const createApplication = async (req, res) => {
  try {
    const { type, applicant, courseApplication, speakerApplication, message } = req.body;

    // Gerekli alanları kontrol et
    if (!type || !applicant || !applicant.name || !applicant.email) {
      return res.status(400).json({
        success: false,
        message: 'Başvuru türü ve başvuran bilgileri (isim, email) gereklidir'
      });
    }

    // Type'a göre özel kontroller
    if (type === 'course' && (!courseApplication || !courseApplication.programId)) {
      return res.status(400).json({
        success: false,
        message: 'Kurs başvurusu için program seçimi gereklidir'
      });
    }

    if (type === 'speaker' && (!speakerApplication || !speakerApplication.proposedTopic)) {
      return res.status(400).json({
        success: false,
        message: 'Konuşmacı başvurusu için konu önerisi gereklidir'
      });
    }

    // YENİ: Contact formu için mesaj kontrolü
    if (type === 'contact' && !message) {
      return res.status(400).json({
        success: false,
        message: 'İletişim mesajı gereklidir'
      });
    }

    const applicationData = {
      type,
      applicant: {
        ...applicant,
        userId: req.user ? req.user._id : null
      }
    };

    if (type === 'course') {
      const program = await Program.findById(courseApplication.programId);
      if (!program) {
        return res.status(404).json({
          success: false,
          message: 'Seçilen program bulunamadı'
        });
      }

      applicationData.courseApplication = {
        ...courseApplication,
        programTitle: program.title
      };
    }

    if (type === 'speaker') {
      applicationData.speakerApplication = speakerApplication;
    }

    // YENİ: Contact formu için mesaj ekle
    if (type === 'contact') {
      applicationData.notes = [{
        message: message,
        author: null, // ← Anonim kullanıcı için null
        isPrivate: false,
        createdAt: new Date()
      }];
    }

    const application = new Application(applicationData);
    await application.save();

    // Populate program bilgisi
    if (type === 'course') {
      await application.populate('courseApplication.programId', 'title dateTime');
    }

    res.status(201).json({
      success: true,
      message: type === 'contact' ? 'Mesajınız başarıyla alındı' : 'Başvurunuz başarıyla alındı',
      data: { application }
    });

  } catch (error) {
    console.error('Create Application Error:', error);

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Başvuru oluşturulurken hata oluştu'
    });
  }
};

// Kullanıcının başvurularını getir (Member)
const getUserApplications = async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await Application.findUserApplications(userId);

    res.json({
      success: true,
      data: { applications }
    });

  } catch (error) {
    console.error('Get User Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Başvurular getirilirken hata oluştu'
    });
  }
};

// Tek başvuru detayı (Member - kendi başvurusu veya Admin)
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const application = await Application.findById(id)
      .populate('courseApplication.programId', 'title dateTime')
      .populate('reviewedBy', 'name')
      .populate('notes.author', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    // Yetki kontrolü - sadece kendi başvurusu veya admin
    const isOwner = application.applicant.userId &&
      application.applicant.userId.toString() === user._id.toString();
    const isAdmin = user.isAdmin();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bu başvuruya erişim yetkiniz yok'
      });
    }

    // Eğer admin değilse private notları filtrele
    if (!isAdmin) {
      application.notes = application.notes.filter(note => !note.isPrivate);
    }

    res.json({
      success: true,
      data: { application }
    });

  } catch (error) {
    console.error('Get Application By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Başvuru getirilirken hata oluştu'
    });
  }
};

// ===== ADMIN İŞLEMLERİ =====

// Tüm başvuruları getir (Admin only)
const getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, priority } = req.query;

    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const applications = await Application.find(query)
      .populate('applicant.userId', 'name email')
      .populate('courseApplication.programId', 'title dateTime')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get All Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Başvurular getirilirken hata oluştu'
    });
  }
};

// Bekleyen başvuruları getir (Admin only)
const getPendingApplications = async (req, res) => {
  try {
    const applications = await Application.findPendingApplications();

    res.json({
      success: true,
      data: { applications }
    });

  } catch (error) {
    console.error('Get Pending Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Bekleyen başvurular getirilirken hata oluştu'
    });
  }
};

// Geciken başvuruları getir (Admin only)
const getOverdueApplications = async (req, res) => {
  try {
    const applications = await Application.findOverdueApplications();

    res.json({
      success: true,
      data: { applications }
    });

  } catch (error) {
    console.error('Get Overdue Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Geciken başvurular getirilirken hata oluştu'
    });
  }
};

// Başvuruyu onayla (Admin only)
const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, conditions, assignedProgram } = req.body;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    const approvalDetails = {};
    if (scheduledDate) approvalDetails.scheduledDate = scheduledDate;
    if (conditions) approvalDetails.conditions = conditions;
    if (assignedProgram) approvalDetails.assignedProgram = assignedProgram;

    await application.approve(req.user._id, approvalDetails);

    res.json({
      success: true,
      message: 'Başvuru başarıyla onaylandı',
      data: { application }
    });

  } catch (error) {
    console.error('Approve Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Başvuru onaylanırken hata oluştu'
    });
  }
};

// Başvuruyu reddet (Admin only)
const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    await application.reject(req.user._id, reason);

    res.json({
      success: true,
      message: 'Başvuru reddedildi',
      data: { application }
    });

  } catch (error) {
    console.error('Reject Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Başvuru reddedilirken hata oluştu'
    });
  }
};

// Başvuruyu bekleme listesine al (Admin only)
const moveToWaitlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    await application.moveToWaitlist(req.user._id, reason);

    res.json({
      success: true,
      message: 'Başvuru bekleme listesine alındı',
      data: { application }
    });

  } catch (error) {
    console.error('Move To Waitlist Error:', error);
    res.status(500).json({
      success: false,
      message: 'Başvuru bekleme listesine alınırken hata oluştu'
    });
  }
};

// Başvuru incelemeye al (Admin only)
const startReview = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    await application.startReview(req.user._id);

    res.json({
      success: true,
      message: 'Başvuru incelemeye alındı',
      data: { application }
    });

  } catch (error) {
    console.error('Start Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Başvuru incelemeye alınırken hata oluştu'
    });
  }
};

// Başvuruya not ekle (Admin only)
const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isPrivate = true } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Not mesajı gereklidir'
      });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    await application.addNote(message, req.user._id, isPrivate);

    res.json({
      success: true,
      message: 'Not başarıyla eklendi'
    });

  } catch (error) {
    console.error('Add Note Error:', error);
    res.status(500).json({
      success: false,
      message: 'Not eklenirken hata oluştu'
    });
  }
};

// Başvuru güncelle (Admin only)
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Sistem alanlarını koruma
    delete updateData.submittedAt;
    delete updateData.reviewedAt;
    delete updateData.reviewedBy;

    const application = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('courseApplication.programId', 'title dateTime')
      .populate('reviewedBy', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Başvuru başarıyla güncellendi',
      data: { application }
    });

  } catch (error) {
    console.error('Update Application Error:', error);

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Başvuru güncellenirken hata oluştu'
    });
  }
};

module.exports = {
  // Public/Member endpoints
  createApplication,
  getUserApplications,
  getApplicationById,

  // Admin endpoints
  getAllApplications,
  getPendingApplications,
  getOverdueApplications,
  approveApplication,
  rejectApplication,
  moveToWaitlist,
  startReview,
  addNote,
  updateApplication
};