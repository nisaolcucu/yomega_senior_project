const News = require('../models/News');

// Tüm haberleri getir (public)
const getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured } = req.query;
    
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    
    const news = await News.find(query)
      .populate('author', 'name')
      .sort({ publishDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await News.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        news,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Get All News Error:', error);
    res.status(500).json({
      success: false,
      message: 'Haberler getirilirken hata oluştu'
    });
  }
};

// Tek haber getir (public)
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const news = await News.findOne({ _id: id, isActive: true })
      .populate('author', 'name email');
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }
    
    // Görüntüleme sayısını artır
    await news.incrementViews();
    
    res.json({
      success: true,
      data: { news }
    });
    
  } catch (error) {
    console.error('Get News By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Haber getirilirken hata oluştu'
    });
  }
};

// Slug ile haber getir (public)
const getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const news = await News.findOne({ slug, isActive: true })
      .populate('author', 'name email');
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }
    
    // Görüntüleme sayısını artır
    await news.incrementViews();
    
    res.json({
      success: true,
      data: { news }
    });
    
  } catch (error) {
    console.error('Get News By Slug Error:', error);
    res.status(500).json({
      success: false,
      message: 'Haber getirilirken hata oluştu'
    });
  }
};

// Öne çıkan haberleri getir (public)
const getFeaturedNews = async (req, res) => {
  try {
    const news = await News.findFeaturedNews();
    
    res.json({
      success: true,
      data: { news }
    });
    
  } catch (error) {
    console.error('Get Featured News Error:', error);
    res.status(500).json({
      success: false,
      message: 'Öne çıkan haberler getirilirken hata oluştu'
    });
  }
};

// Kategoriye göre haberler (public)
const getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const news = await News.findByCategory(category)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await News.countDocuments({ 
      isActive: true, 
      category 
    });
    
    res.json({
      success: true,
      data: {
        news,
        category,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Get News By Category Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori haberleri getirilirken hata oluştu'
    });
  }
};

// Haber arama (public)
const searchNews = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi gereklidir'
      });
    }
    
    const news = await News.find({
      isActive: true,
      $text: { $search: q }
    })
    .populate('author', 'name')
    .sort({ score: { $meta: 'textScore' }, publishDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const total = await News.countDocuments({
      isActive: true,
      $text: { $search: q }
    });
    
    res.json({
      success: true,
      data: {
        news,
        searchTerm: q,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Search News Error:', error);
    res.status(500).json({
      success: false,
      message: 'Haber arama sırasında hata oluştu'
    });
  }
};

// ===== ADMIN İŞLEMLERİ =====

// Haber oluştur (Admin only)
const createNews = async (req, res) => {
  try {
    const {
      title,
      content,
      summary,
      category,
      tags,
      isFeatured,
      metaDescription
    } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Başlık ve içerik gereklidir'
      });
    }
    
    const newsData = {
      title: title.trim(),
      content: content.trim(),
      author: req.user._id,
      category: category || 'genel',
      isFeatured: Boolean(isFeatured)
    };
    
    if (summary) newsData.summary = summary.trim();
    if (metaDescription) newsData.metaDescription = metaDescription.trim();
    if (tags && Array.isArray(tags)) {
      newsData.tags = tags.filter(tag => tag.trim().length > 0);
    }
    
    const news = new News(newsData);
    await news.save();
    
    // Populate author bilgisi
    await news.populate('author', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Haber başarıyla oluşturuldu',
      data: { news }
    });
    
  } catch (error) {
    console.error('Create News Error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Haber oluşturulurken hata oluştu'
    });
  }
};

// Haber güncelle (Admin only)
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Author'u değiştirmeye izin verme
    delete updateData.author;
    delete updateData.views;
    delete updateData.publishDate;
    
    const news = await News.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email');
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Haber başarıyla güncellendi',
      data: { news }
    });
    
  } catch (error) {
    console.error('Update News Error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Haber güncellenirken hata oluştu'
    });
  }
};

// Haber sil (Admin only)
// Haber sil (Admin only) - KALICI SİLME
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ DB'den tamamen sil (Hard Delete)
    const news = await News.findByIdAndDelete(id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Haber kalıcı olarak silindi'
    });
    
  } catch (error) {
    console.error('Delete News Error:', error);
    res.status(500).json({
      success: false,
      message: 'Haber silinirken hata oluştu'
    });
  }
};

// Tüm haberleri getir (Admin only - draft dahil)
const getAllNewsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    
    let query = {};
    
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (category) query.category = category;
    
    const news = await News.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await News.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        news,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Get All News Admin Error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin haberler getirilirken hata oluştu'
    });
  }
};

module.exports = {
  // Public endpoints
  getAllNews,
  getNewsById,
  getNewsBySlug,
  getFeaturedNews,
  getNewsByCategory,
  searchNews,
  
  // Admin endpoints
  createNews,
  updateNews,
  deleteNews,
  getAllNewsAdmin
};