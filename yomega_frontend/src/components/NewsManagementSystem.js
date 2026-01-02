'use client'
import { useState, useEffect } from 'react'

export default function NewsManagementSystem({ activeTab, setActiveTab }) {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'genel',
    tags: '',
    isFeatured: false,
    metaDescription: '',
    image: null  // ← EKLE
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    if (activeTab === 'news') {
      fetchNews()
    }
  }, [activeTab])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/news/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNews(data.data.news || [])
      }
    } catch (error) {
      console.error('Haberler getirilirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')

      // YENİ: Görsel varsa önce yükle
      let imageUrl = formData.image
      if (imageFile) {
        imageUrl = await uploadImage()
        if (!imageUrl && imageFile) {
          return
        }
      }
      const url = editingNews
        ? `${API_URL}/news/${editingNews._id}`
        : `${API_URL}/news`

      const method = editingNews ? 'PUT' : 'POST'

      const newsData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        image: imageUrl
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsData)
      })

      if (response.ok) {
        alert(editingNews ? 'Haber güncellendi!' : 'Haber oluşturuldu!')
        setShowForm(false)
        setEditingNews(null)
        resetForm()
        fetchNews()
      } else {
        const error = await response.json()
        alert(error.message || 'İşlem başarısız!')
      }
    } catch (error) {
      console.error('Haber kaydetme hatası:', error)
      alert('Bir hata oluştu!')
    }
  }

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      summary: newsItem.summary || '',
      category: newsItem.category,
      tags: newsItem.tags ? newsItem.tags.join(', ') : '',
      isFeatured: newsItem.isFeatured,
      metaDescription: newsItem.metaDescription || '',
      image: newsItem.image || null  // ← EKLE
    })
    setImagePreview(newsItem.image)  // ← EKLE
    setImageFile(null)  //
    setShowForm(true)
  }

  const handleDelete = async (newsId) => {
    // ✅ Daha güçlü uyarı
    const newsToDelete = news.find(n => n._id === newsId);
    const confirmMessage = `⚠️ DİKKAT! Bu işlem GERİ ALINAMAZ!\n\n"${newsToDelete?.title || 'Bu haber'}" kalıcı olarak silinecek.\n\nDevam etmek istediğinize emin misiniz?`;

    if (!confirm(confirmMessage)) return;

    // ✅ Çift onay
    if (!confirm('Son kez soruyoruz: Haber KALICI olarak silinecek. Emin misiniz?')) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(`${API_URL}/news/${newsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('✅ Haber kalıcı olarak silindi!');
        fetchNews();
      } else {
        const error = await response.json();
        alert('❌ Silme işlemi başarısız: ' + (error.message || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('❌ Bir hata oluştu! Lütfen tekrar deneyin.');
    }
  }
  
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      summary: '',
      category: 'genel',
      tags: '',
      isFeatured: false,
      metaDescription: '',
      image: null  // ← EKLE
    })
    setImageFile(null)  // ← EKLE
    setImagePreview(null)  // ← EKLE
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan küçük olmalıdır')
        return
      }

      if (!file.type.startsWith('image/')) {
        alert('Sadece resim dosyaları yüklenebilir')
        return
      }

      setImageFile(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    try {
      setUploadingImage(true)
      const token = localStorage.getItem('token')

      const formDataUpload = new FormData()
      formDataUpload.append('image', imageFile)

      const response = await fetch(`${API_URL}/upload/image?folder=news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      })

      if (response.ok) {
        const data = await response.json()
        return data.data.image.url
      } else {
        alert('Görsel yüklenemedi')
        return null
      }
    } catch (error) {
      console.error('Görsel yükleme hatası:', error)
      alert('Görsel yüklenirken hata oluştu')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData({ ...formData, image: null })
  }


  if (activeTab !== 'news') return null

  return (
    <div className="admin-content-section">
      <div className="section-header">
        <div>
          <h2>Haber Yönetimi</h2>
          <p>Haber oluşturun, düzenleyin ve yayınlayın</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true)
              setEditingNews(null)
              resetForm()
            }}
          >
            <i className='bx bx-plus'></i>
            Yeni Haber
          </button>
          <button className="btn btn-outline" onClick={fetchNews}>
            <i className='bx bx-refresh'></i>
            Yenile
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingNews ? 'Haber Düzenle' : 'Yeni Haber'}</h3>
              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Başlık *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength="200"
                />
              </div>

              <div className="form-group">
                <label>Kategori</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="genel">Genel</option>
                  <option value="egitim">Eğitim</option>
                  <option value="etkinlik">Etkinlik</option>
                  <option value="duyuru">Duyuru</option>
                </select>
              </div>

              <div className="form-group">
                <label>Özet</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength="500"
                  placeholder="Haberin kısa özeti..."
                />
              </div>

              <div className="form-group">
                <label>İçerik *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="8"
                  placeholder="Haber içeriğini yazın..."
                />
              </div>

              <div className="form-group">
                <label>Etiketler</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="etiket1, etiket2, etiket3"
                />
                <small>Virgülle ayırarak birden fazla etiket ekleyebilirsiniz</small>
              </div>

              {/* YENİ: Görsel Yükleme - BURAYA EKLE ↓ */}
              <div className="form-group">
                <label>Haber Görseli</label>

                {imagePreview || formData.image ? (
                  <div style={{ marginBottom: '15px' }}>
                    <img
                      src={imagePreview || formData.image}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        marginBottom: '10px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{
                        padding: '8px 16px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <i className='bx bx-trash'></i> Görseli Kaldır
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      id="newsImage"
                    />
                    <label
                      htmlFor="newsImage"
                      style={{
                        display: 'block',
                        padding: '40px',
                        border: '2px dashed #ddd',
                        borderRadius: '12px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: '#f9f9f9'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--main-color)'
                        e.currentTarget.style.background = '#f0f0f0'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#ddd'
                        e.currentTarget.style.background = '#f9f9f9'
                      }}
                    >
                      <i className='bx bx-image-add' style={{ fontSize: '48px', color: '#999', marginBottom: '10px', display: 'block' }}></i>
                      <p style={{ color: '#666', margin: '0 0 5px 0' }}>Görsel yüklemek için tıklayın</p>
                      <small style={{ color: '#999' }}>PNG, JPG, JPEG - Maksimum 5MB</small>
                    </label>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Meta Açıklama</label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  rows="2"
                  maxLength="160"
                  placeholder="SEO için meta açıklama..."
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  Öne çıkan haber
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingNews ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForm(false)}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Haberler yükleniyor...</p>
        </div>
      ) : (
        <div className="news-management-grid">
          {news.map((item) => (
            <div key={item._id} className="news-management-card">
              <div className="news-header">
                <h3>{item.title}</h3>
                <div className="news-meta">
                  <span className={`category ${item.category}`}>{item.category}</span>
                  {item.isFeatured && <span className="featured">Öne Çıkan</span>}
                  <span className={`status ${item.isActive ? 'active' : 'inactive'}`}>
                    {item.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              <div className="news-content">
                <p>{item.summary || item.content.substring(0, 150) + '...'}</p>
                <div className="news-stats">
                  <span><i className='bx bx-show'></i> {item.views} görüntüleme</span>
                  <span><i className='bx bx-calendar'></i> {new Date(item.publishDate).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              <div className="news-actions">
                <button
                  className="btn-action edit"
                  onClick={() => handleEdit(item)}
                  title="Düzenle"
                >
                  <i className='bx bx-edit'></i>
                </button>
                <button
                  className="btn-action delete"
                  onClick={() => handleDelete(item._id)}
                  title="Sil"
                >
                  <i className='bx bx-trash'></i>
                </button>
                <button className="btn-action view" title="Görüntüle">
                  <i className='bx bx-show'></i>
                </button>
              </div>
            </div>
          ))}

          {news.length === 0 && (
            <div className="empty-state">
              <i className='bx bx-news' style={{ fontSize: '48px', color: '#ccc' }}></i>
              <p>Henüz haber eklenmemiş</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                İlk Haberi Ekle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}