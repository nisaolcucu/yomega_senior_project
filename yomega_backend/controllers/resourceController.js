const Resource = require('../models/Resource');

// Kaynaklari getir (access kontrolü ile)
const getResources = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, difficulty } = req.query;
    const user = req.user; // authenticate middleware'den (opsiyonel)

    let query = { isActive: true };

    // Access kontrolü
    if (!user) {
      query.access = 'public';
    } else if (!user.isAdmin()) {
      query.access = { $in: ['public', 'members'] };
    }
    // Admin için tüm access seviyelerine erişim var

    if (category) query.category = category;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name')
      .sort({ publishDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Kullanıcı giriş yapmışsa, favorilere eklenmiş mi kontrol et
    const resourcesWithSaveStatus = resources.map(resource => {
      const resourceObj = resource.toObject();

      if (user && resource.savedBy) {
        resourceObj.isSaved = resource.savedBy.some(
          userId => userId.toString() === user._id.toString()
        );
      } else {
        resourceObj.isSaved = false;
      }

      return resourceObj;
    });

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      data: {
        resources: resourcesWithSaveStatus,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get Resources Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kaynaklar getirilirken hata oluştu'
    });
  }
};

// Tek kaynak getir
const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const resource = await Resource.findOne({ 
      _id: id, 
      isActive: true 
    }).populate('uploadedBy', 'name email');
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Kaynak bulunamadı'
      });
    }
    
    // Access kontrolü
    if (!resource.canAccess(user)) {
      return res.status(403).json({
        success: false,
        message: 'Bu kaynağa erişim yetkiniz yok'
      });
    }
    
    // Görüntüleme sayısını artır
    await resource.incrementViews();
    
    // Kullanıcı giriş yapmışsa, favorilere eklenmiş mi kontrol et
    const resourceObj = resource.toObject();
    
    if (user && resource.savedBy) {
      resourceObj.isSaved = resource.savedBy.some(
        userId => userId.toString() === user._id.toString()
      );
    } else {
      resourceObj.isSaved = false;
    }
    
    res.json({
      success: true,
      data: { resource: resourceObj }
    });

  } catch (error) {
    console.error('Get Resource By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kaynak getirilirken hata oluştu'
    });
  }
};

// Kategoriye göre kaynaklar
const getResourcesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const user = req.user;

    let query = { isActive: true, category };

    // Access kontrolü
    if (!user) {
      query.access = 'public';
    } else if (!user.isAdmin()) {
      query.access = { $in: ['public', 'members'] };
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name')
      .sort({ publishDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      data: {
        resources,
        category,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get Resources By Category Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori kaynakları getirilirken hata oluştu'
    });
  }
};

// Öne çıkan kaynaklar
const getFeaturedResources = async (req, res) => {
  try {
    const user = req.user;

    let query = { isActive: true, isFeatured: true };

    // Access kontrolü
    if (!user) {
      query.access = 'public';
    } else if (!user.isAdmin()) {
      query.access = { $in: ['public', 'members'] };
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name')
      .sort({ publishDate: -1 })
      .limit(6);

    // Kullanıcı giriş yapmışsa, favorilere eklenmiş mi kontrol et
    const resourcesWithSaveStatus = resources.map(resource => {
      const resourceObj = resource.toObject();

      if (user && resource.savedBy) {
        resourceObj.isSaved = resource.savedBy.some(
          userId => userId.toString() === user._id.toString()
        );
      } else {
        resourceObj.isSaved = false;
      }

      return resourceObj;
    });

    res.json({
      success: true,
      data: { resources: resourcesWithSaveStatus }
    });

  } catch (error) {
    console.error('Get Featured Resources Error:', error);
    res.status(500).json({
      success: false,
      message: 'Öne çıkan kaynaklar getirilirken hata oluştu'
    });
  }
};

// Popüler kaynaklar
const getPopularResources = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const user = req.user;

    let query = { isActive: true };

    // Access kontrolü
    if (!user) {
      query.access = 'public';
    } else if (!user.isAdmin()) {
      query.access = { $in: ['public', 'members'] };
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name')
      .sort({ downloadCount: -1, viewCount: -1 })
      .limit(limit * 1);

    res.json({
      success: true,
      data: { resources }
    });

  } catch (error) {
    console.error('Get Popular Resources Error:', error);
    res.status(500).json({
      success: false,
      message: 'Popüler kaynaklar getirilirken hata oluştu'
    });
  }
};

// Son eklenen kaynaklar
const getRecentResources = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const user = req.user;

    let query = { isActive: true };

    // Access kontrolü
    if (!user) {
      query.access = 'public';
    } else if (!user.isAdmin()) {
      query.access = { $in: ['public', 'members'] };
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name')
      .sort({ publishDate: -1 })
      .limit(limit * 1);

    res.json({
      success: true,
      data: { resources }
    });

  } catch (error) {
    console.error('Get Recent Resources Error:', error);
    res.status(500).json({
      success: false,
      message: 'Son kaynaklar getirilirken hata oluştu'
    });
  }
};

// Kaynak arama
const searchResources = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const user = req.user;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi gereklidir'
      });
    }

    let query = {
      isActive: true,
      $text: { $search: q }
    };

    // Access kontrolü
    if (!user) {
      query.access = 'public';
    } else if (!user.isAdmin()) {
      query.access = { $in: ['public', 'members'] };
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name')
      .sort({ score: { $meta: 'textScore' }, publishDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resource.countDocuments({
      isActive: true,
      $text: { $search: q }
    });

    res.json({
      success: true,
      data: {
        resources,
        searchTerm: q,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Search Resources Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kaynak arama sırasında hata oluştu'
    });
  }
};

// Kaynak indirme (Member/Admin)
const downloadResource = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'İndirmek için giriş yapmalısınız'
      });
    }

    const resource = await Resource.findOne({
      _id: id,
      isActive: true
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Kaynak bulunamadı'
      });
    }

    // Access kontrolü
    if (!resource.canAccess(user)) {
      return res.status(403).json({
        success: false,
        message: 'Bu kaynağa erişim yetkiniz yok'
      });
    }

    if (!resource.isDownloadable) {
      return res.status(400).json({
        success: false,
        message: 'Bu kaynak indirilebilir değil'
      });
    }

    // İndirme sayısını artır
    await resource.incrementDownloads();

    res.json({
      success: true,
      message: 'İndirme başlatıldı',
      data: {
        downloadUrl: `/uploads/${resource.file.filename}`,
        filename: resource.file.originalName
      }
    });

  } catch (error) {
    console.error('Download Resource Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kaynak indirilirken hata oluştu'
    });
  }
};

// ===== ADMIN İŞLEMLERİ =====

// Kaynak oluştur (Admin only)
const createResource = async (req, res) => {
  try {
    const resourceData = {
      ...req.body,
      uploadedBy: req.user._id
    };

    // Gerekli alanları kontrol et
    const { title, description, type, category } = resourceData;

    if (!title || !description || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Başlık, açıklama, tür ve kategori gereklidir'
      });
    }

    const resource = new Resource(resourceData);
    await resource.save();

    await resource.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Kaynak başarıyla oluşturuldu',
      data: { resource }
    });

  } catch (error) {
    console.error('Create Resource Error:', error);

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Kaynak oluşturulurken hata oluştu'
    });
  }
};

// Dosya ile birlikte kaynak oluştur (Admin only)
const createResourceWithFile = async (req, res) => {
  try {
    const resourceData = {
      ...req.body,
      uploadedBy: req.user._id
    };

    // Gerekli alanları kontrol et
    const { title, description, type, category } = resourceData;

    if (!title || !description || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Başlık, açıklama, tür ve kategori gereklidir'
      });
    }

    // Eğer dosya yüklendiyse dosya bilgilerini ekle
    if (req.file) {
      resourceData.file = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }

    const resource = new Resource(resourceData);
    await resource.save();

    await resource.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Kaynak başarıyla oluşturuldu',
      data: { resource }
    });

  } catch (error) {
    console.error('Create Resource With File Error:', error);

    // Hata durumunda yüklenen dosyayı sil
    if (req.file) {
      const fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error('File delete error:', deleteError);
      }
    }

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Kaynak oluşturulurken hata oluştu'
    });
  }
};

// Kaynak güncelle (Admin only)
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // uploadedBy'ı değiştirmeye izin verme
    delete updateData.uploadedBy;
    delete updateData.downloadCount;
    delete updateData.viewCount;

    const resource = await Resource.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name email');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Kaynak bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Kaynak başarıyla güncellendi',
      data: { resource }
    });

  } catch (error) {
    console.error('Update Resource Error:', error);

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Kaynak güncellenirken hata oluştu'
    });
  }
};

// Kaynak sil (Admin only)
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Kaynak bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Kaynak başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete Resource Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kaynak silinirken hata oluştu'
    });
  }
};

// Tüm kaynakları getir (Admin only)
const getAllResourcesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, type } = req.query;

    let query = {};

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (category) query.category = category;
    if (type) query.type = type;

    const resources = await Resource.find({ ...query, isActive: true })
      .populate('uploadedBy', 'name email')
      .sort({ publishDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resource.countDocuments(query);


    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get All Resources Admin Error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin kaynaklar getirilirken hata oluştu'
    });
  }
};

// Kullanıcının kaydettiği kaynakları getir
const getUserResources = async (req, res) => {
  try {
    const userId = req.user._id;

    // Kullanıcının kaydettiği kaynakları bul
    const resources = await Resource.find({
      savedBy: userId,
      isActive: true
    })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        resources,
        count: resources.length
      }
    });
  } catch (error) {
    console.error('Get User Resources Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kaynaklar getirilirken hata oluştu'
    });
  }
};

// Kaynağı favorilere ekle/çıkar
const toggleSaveResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Kaynak bulunamadı'
      });
    }

    // Zaten kayıtlı mı kontrol et
    const isSaved = resource.savedBy.some(
      user => user.toString() === userId.toString()
    );

    if (isSaved) {
      // Favorilerden çıkar
      resource.savedBy = resource.savedBy.filter(
        user => user.toString() !== userId.toString()
      );
      await resource.save();

      return res.json({
        success: true,
        message: 'Kaynak favorilerden çıkarıldı',
        data: { isSaved: false }
      });
    } else {
      // Favorilere ekle
      resource.savedBy.push(userId);
      await resource.save();

      return res.json({
        success: true,
        message: 'Kaynak favorilere eklendi',
        data: { isSaved: true }
      });
    }
  } catch (error) {
    console.error('Toggle Save Resource Error:', error);
    res.status(500).json({
      success: false,
      message: 'İşlem sırasında hata oluştu'
    });
  }
};

module.exports = {
  // Public/Member endpoints
  getResources,
  getResourceById,
  getResourcesByCategory,
  getFeaturedResources,
  getPopularResources,
  getRecentResources,
  searchResources,
  downloadResource,

  // Admin endpoints
  createResource,
  createResourceWithFile,  // ← BUNU EKLEDİNİZ
  updateResource,
  deleteResource,
  getAllResourcesAdmin,

  getUserResources,      // ← EKLE
  toggleSaveResource
};

