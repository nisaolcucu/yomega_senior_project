const Message = require('../models/Message');
const User = require('../models/User');

// ===== USER İŞLEMLERİ =====

// Kullanıcının mesajlarını getir
const getUserMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, status, page = 1, limit = 20 } = req.query;

    let query = {
      isActive: true,
      $or: [
        { to: userId },           // Kullanıcıya gönderilen
        { to: null, type: 'announcement' }  // Genel duyurular
      ]
    };

    if (type) query.type = type;
    if (status) query.status = status;

    const messages = await Message.find(query)
      .populate('from', 'name email role')
      .populate('parentMessage', 'subject')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(query);
    const unreadCount = await Message.countDocuments({
      ...query,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        messages,
        unreadCount,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get User Messages Error:', error);
    res.status(500).json({
      success: false,
      message: 'Mesajlar getirilirken hata oluştu'
    });
  }
};

// Destek talebi oluştur (User → Admin)
const createSupportRequest = async (req, res) => {
  try {
    const { subject, message, priority } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Konu ve mesaj gereklidir'
      });
    }

    const newMessage = new Message({
      type: 'support',
      from: req.user._id,
      to: null,  // Admin'e gidecek
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || 'normal',
      status: 'pending'
    });

    await newMessage.save();
    await newMessage.populate('from', 'name email');

    res.status(201).json({
      success: true,
      message: 'Destek talebiniz gönderildi',
      data: { message: newMessage }
    });

  } catch (error) {
    console.error('Create Support Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Destek talebi oluşturulurken hata oluştu'
    });
  }
};

// Mesajı okundu işaretle
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: id,
      $or: [
        { to: userId },
        { to: null, type: 'announcement' }
      ]
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mesaj bulunamadı'
      });
    }

    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({
      success: true,
      message: 'Mesaj okundu işaretlendi'
    });

  } catch (error) {
    console.error('Mark Message As Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj güncellenirken hata oluştu'
    });
  }
};

// Mesaja yanıt ver
const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Mesaj içeriği gereklidir'
      });
    }

    // Orijinal mesajı bul
    const originalMessage = await Message.findById(id);

    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: 'Mesaj bulunamadı'
      });
    }

    // Yanıt mesajı oluştur
    const reply = new Message({
      type: originalMessage.type,
      from: userId,
      to: originalMessage.from,  // Mesajı gönderene yanıt
      subject: `Re: ${originalMessage.subject}`,
      message: message.trim(),
      parentMessage: originalMessage._id,
      status: 'answered'
    });

    await reply.save();
    await reply.populate('from', 'name email role');

    // Orijinal mesajın durumunu güncelle
    if (originalMessage.status === 'pending') {
      originalMessage.status = 'answered';
      await originalMessage.save();
    }

    res.status(201).json({
      success: true,
      message: 'Yanıt gönderildi',
      data: { reply }
    });

  } catch (error) {
    console.error('Reply To Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Yanıt gönderilirken hata oluştu'
    });
  }
};

// ===== ADMIN İŞLEMLERİ =====

// Tüm mesajları getir (Admin)
const getAllMessages = async (req, res) => {
  try {
    const { type, status, priority, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };

    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const messages = await Message.find(query)
      .populate('from', 'name email role')
      .populate('to', 'name email')
      .populate('parentMessage', 'subject')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(query);
    
    // İstatistikler
    const stats = {
      pending: await Message.countDocuments({ ...query, status: 'pending' }),
      answered: await Message.countDocuments({ ...query, status: 'answered' }),
      closed: await Message.countDocuments({ ...query, status: 'closed' })
    };

    res.json({
      success: true,
      data: {
        messages,
        stats,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get All Messages Error:', error);
    res.status(500).json({
      success: false,
      message: 'Mesajlar getirilirken hata oluştu'
    });
  }
};

// Toplu duyuru gönder (Admin → Tüm Üyeler)
const sendAnnouncement = async (req, res) => {
  try {
    const { subject, message, priority } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Konu ve mesaj gereklidir'
      });
    }

    const announcement = new Message({
      type: 'announcement',
      from: req.user._id,
      to: null,  // Tüm üyelere
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || 'normal',
      status: 'closed'  // Duyurular yanıt gerektirmez
    });

    await announcement.save();
    await announcement.populate('from', 'name email');

    res.status(201).json({
      success: true,
      message: 'Duyuru başarıyla gönderildi',
      data: { announcement }
    });

  } catch (error) {
    console.error('Send Announcement Error:', error);
    res.status(500).json({
      success: false,
      message: 'Duyuru gönderilirken hata oluştu'
    });
  }
};

// Tek üyeye mesaj gönder (Admin → User)
const sendDirectMessage = async (req, res) => {
  try {
    const { userId, subject, message, priority } = req.body;

    if (!userId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı, konu ve mesaj gereklidir'
      });
    }

    // Kullanıcı var mı kontrol et
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    const directMessage = new Message({
      type: 'direct',
      from: req.user._id,
      to: userId,
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || 'normal'
    });

    await directMessage.save();
    await directMessage.populate('from', 'name email');
    await directMessage.populate('to', 'name email');

    res.status(201).json({
      success: true,
      message: 'Mesaj başarıyla gönderildi',
      data: { message: directMessage }
    });

  } catch (error) {
    console.error('Send Direct Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj gönderilirken hata oluştu'
    });
  }
};

// Mesaj durumunu güncelle (Admin)
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'answered', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum'
      });
    }

    const message = await Message.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('from', 'name email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mesaj bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Mesaj durumu güncellendi',
      data: { message }
    });

  } catch (error) {
    console.error('Update Message Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj güncellenirken hata oluştu'
    });
  }
};

// Mesajı sil (Admin)
// Mesajı sil (Admin veya mesaj sahibi)
const deleteMessage = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const isAdmin = req.user.role === 'admin';
  
      const message = await Message.findById(id);
  
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Mesaj bulunamadı'
        });
      }
  
      // Sadece admin veya mesajın alıcısı silebilir
      if (!isAdmin && message.to?.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bu mesajı silme yetkiniz yok'
        });
      }
  
      // Mesajı pasif yap (soft delete)
      message.isActive = false;
      await message.save();
  
      res.json({
        success: true,
        message: 'Mesaj silindi'
      });
  
    } catch (error) {
      console.error('Delete Message Error:', error);
      res.status(500).json({
        success: false,
        message: 'Mesaj silinirken hata oluştu'
      });
    }
  };
  // İletişim formu mesajı oluştur (Public - auth gerektirmez)
// İletişim formu mesajı oluştur (Public - auth gerektirmez)
const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanlar gereklidir'
      });
    }

    // Admin kullanıcısını bul (ilk admin'e gönder)
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      return res.status(500).json({
        success: false,
        message: 'Admin kullanıcı bulunamadı'
      });
    }

    const newMessage = new Message({
      type: 'support',
      from: null, // Anonim kullanıcı
      to: admin._id,
      subject: `İletişim: ${subject}`,
      message: `İsim: ${name}\nE-posta: ${email}\n\n${message}`,
      status: 'pending',
      priority: 'normal',
      metadata: {
        source: 'contact-form',
        contactName: name,
        contactEmail: email
      }
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi'
    });

  } catch (error) {
    console.error('Create Contact Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj gönderilirken hata oluştu'
    });
  }
};


module.exports = {
  // User endpoints
  getUserMessages,
  createSupportRequest,
  markMessageAsRead,
  replyToMessage,
  
  // Admin endpoints
  getAllMessages,
  sendAnnouncement,
  sendDirectMessage,
  updateMessageStatus,
  deleteMessage,
  createContactMessage
};