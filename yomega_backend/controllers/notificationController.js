const Notification = require('../models/Notification');

// Kullanıcının bildirimlerini getir
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      isActive: true,
      $or: [
        { forAllUsers: true },
        { targetUsers: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50);

    // Okunma durumunu ekle
    const notificationsWithReadStatus = notifications.map(notif => {
      const isRead = notif.readBy.some(
        read => read.user.toString() === userId.toString()
      );
      return {
        ...notif.toObject(),
        isRead
      };
    });

    // Okunmamış sayısı
    const unreadCount = notificationsWithReadStatus.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: {
        notifications: notificationsWithReadStatus,
        unreadCount
      }
    });

  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler getirilirken hata oluştu'
    });
  }
};

// Bildirimi okundu işaretle
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    // Zaten okunmuş mu kontrol et
    const alreadyRead = notification.readBy.some(
      read => read.user.toString() === userId.toString()
    );

    if (!alreadyRead) {
      notification.readBy.push({ user: userId });
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Bildirim okundu işaretlendi'
    });

  } catch (error) {
    console.error('Mark As Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim güncellenirken hata oluştu'
    });
  }
};

// Tüm bildirimleri okundu işaretle
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      isActive: true,
      $or: [
        { forAllUsers: true },
        { targetUsers: userId }
      ]
    });

    for (const notif of notifications) {
      const alreadyRead = notif.readBy.some(
        read => read.user.toString() === userId.toString()
      );
      
      if (!alreadyRead) {
        notif.readBy.push({ user: userId });
        await notif.save();
      }
    }

    res.json({
      success: true,
      message: 'Tüm bildirimler okundu işaretlendi'
    });

  } catch (error) {
    console.error('Mark All As Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler güncellenirken hata oluştu'
    });
  }
};

// Bildirim oluştur (helper function - diğer controller'lardan çağrılacak)
const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create Notification Error:', error);
    throw error;
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};