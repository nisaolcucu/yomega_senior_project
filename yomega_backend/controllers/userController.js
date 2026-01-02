const User = require('../models/User');

// Kullanıcıyı sil (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Admin kendini silemesin
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Kendi hesabınızı silemezsiniz'
      });
    }
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken hata oluştu'
    });
  }
};

// Kullanıcı bilgilerini güncelle (Admin only)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = { ...req.body };
    
    // Şifre ve hassas alanları güncellemeye izin verme
    delete updateData.password;
    delete updateData.role;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: { user }
    });
    
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenirken hata oluştu'
    });
  }
};
// Tüm kullanıcıları getir (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: true })
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar getirilirken hata oluştu'
    });
  }
};
module.exports = {
  getAllUsers,
  deleteUser,
  updateUser
};