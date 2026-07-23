'use client'
import { useState, useEffect } from 'react'

export default function ResourceManagementSystem({ activeTab, setActiveTab }) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    category: 'eğitim materyali',
    difficulty: 'tüm seviyeler',
    access: 'members',
    tags: '',
    isFeatured: false,
    url: '',
    author: {
      name: '',
      email: '',
      organization: ''
    }
  })
  const [selectedFile, setSelectedFile] = useState(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    if (activeTab === 'resources') {
      fetchResources()
    }
  }, [activeTab])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      console.log('🔄 Kaynaklar getiriliyor...')
      console.log('Token var mı:', !!token)
      console.log('API URL:', `${API_URL}/resources/admin/all`)
      
      const response = await fetch(`${API_URL}/resources/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Gelen data:', data)
        
        if (data.success && data.data && data.data.resources) {
          setResources(data.data.resources)
          console.log('✅ Kaynaklar yüklendi:', data.data.resources.length, 'adet')
        } else {
          console.log('⚠️ Data yapısı beklenenden farklı:', data)
          setResources([])
        }
      } else {
        console.error('❌ API hatası:', response.status, response.statusText)
        const errorData = await response.text()
        console.error('Hata detayı:', errorData)
        setResources([])
      }
    } catch (error) {
      console.error('❌ Kaynaklar getirilirken hata:', error)
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Dosya tipini otomatik belirle
      const extension = file.name.split('.').pop().toLowerCase()
      let type = 'document'
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        type = 'image'
      } else if (['mp4', 'avi', 'mov'].includes(extension)) {
        type = 'video'
      } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        type = 'audio'
      } else if (extension === 'pdf') {
        type = 'pdf'
      } else if (['ppt', 'pptx'].includes(extension)) {
        type = 'presentation'
      }
      
      setFormData(prev => ({ ...prev, type }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setUploadingFile(true)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      let resourceData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      let response
      
      if (selectedFile && !editingResource) {
        // Dosya ile birlikte yeni kaynak oluştur
        const formDataToSend = new FormData()
        formDataToSend.append('file', selectedFile)
        
        Object.keys(resourceData).forEach(key => {
          if (key === 'author') {
            Object.keys(resourceData.author).forEach(authorKey => {
              formDataToSend.append(`author.${authorKey}`, resourceData.author[authorKey])
            })
          } else if (key === 'tags') {
            resourceData.tags.forEach(tag => {
              formDataToSend.append('tags[]', tag)
            })
          } else {
            formDataToSend.append(key, resourceData[key])
          }
        })

        response = await fetch(`${API_URL}/resources/with-file`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        })
      } else {
        // Sadece metin bilgileri ile kaynak oluştur/güncelle
        const url = editingResource 
          ? `${API_URL}/resources/${editingResource._id}` 
          : `${API_URL}/resources`
        
        const method = editingResource ? 'PUT' : 'POST'

        response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resourceData)
        })
      }

      if (response.ok) {
        alert(editingResource ? 'Kaynak güncellendi!' : 'Kaynak oluşturuldu!')
        setShowForm(false)
        setEditingResource(null)
        setSelectedFile(null)
        resetForm()
        fetchResources()
      } else {
        const error = await response.json()
        alert(error.message || 'İşlem başarısız!')
      }
    } catch (error) {
      console.error('Kaynak kaydetme hatası:', error)
      alert('Bir hata oluştu!')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      difficulty: resource.difficulty,
      access: resource.access,
      tags: resource.tags ? resource.tags.join(', ') : '',
      isFeatured: resource.isFeatured,
      url: resource.url || '',
      author: {
        name: resource.author?.name || '',
        email: resource.author?.email || '',
        organization: resource.author?.organization || ''
      }
    })
    setShowForm(true)
  }

  const handleDelete = async (resourceId) => {
    if (!confirm('Bu kaynağı silmek istediğinize emin misiniz?')) return

    try {
      console.log('🗑️ Kaynak siliniyor:', resourceId)
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await fetch(`${API_URL}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Delete response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Delete response:', result)
        
        alert('Kaynak silindi!')
        fetchResources() // Listeyi yenile
      } else {
        const errorData = await response.text()
        console.error('❌ Delete hatası:', response.status, errorData)
        alert('Silme işlemi başarısız!')
      }
    } catch (error) {
      console.error('❌ Silme hatası:', error)
      alert('Bir hata oluştu!')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'pdf',
      category: 'eğitim materyali',
      difficulty: 'tüm seviyeler',
      access: 'members',
      tags: '',
      isFeatured: false,
      url: '',
      author: {
        name: '',
        email: '',
        organization: ''
      }
    })
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('author.')) {
      const authorField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        author: {
          ...prev.author,
          [authorField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (activeTab !== 'resources') return null

  return (
    <div className="admin-content-section">
      <div className="section-header">
        <div>
          <h2>Kaynak Yönetimi</h2>
          <p>Eğitim kaynaklarını ekleyin, düzenleyin ve yönetin</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true)
              setEditingResource(null)
              setSelectedFile(null)
              resetForm()
            }}
          >
            <i className='bx bx-plus'></i>
            Yeni Kaynak
          </button>
          <button className="btn btn-outline" onClick={fetchResources}>
            <i className='bx bx-refresh'></i>
            Yenile
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingResource ? 'Kaynak Düzenle' : 'Yeni Kaynak'}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
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
                    <option value="eğitim materyali">Eğitim Materyali</option>
                    <option value="araştırma">Araştırma</option>
                    <option value="makale">Makale</option>
                    <option value="sunum">Sunum</option>
                    <option value="rapor">Rapor</option>
                    <option value="rehber">Rehber</option>
                    <option value="şablon">Şablon</option>
                    <option value="video eğitim">Video Eğitim</option>
                    <option value="podcast">Podcast</option>
                    <option value="diğer">Diğer</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Açıklama *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  maxLength="1000"
                  placeholder="Kaynak hakkında detaylı açıklama..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tür</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="image">Resim</option>
                    <option value="document">Dokuman</option>
                    <option value="link">Link</option>
                    <option value="presentation">Sunum</option>
                    <option value="dataset">Veri Seti</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Seviye</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                  >
                    <option value="tüm seviyeler">Tüm Seviyeler</option>
                    <option value="başlangıç">Başlangıç</option>
                    <option value="orta">Orta</option>
                    <option value="ileri">İleri</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Erişim</label>
                  <select
                    name="access"
                    value={formData.access}
                    onChange={handleInputChange}
                  >
                    <option value="public">Herkese Açık</option>
                    <option value="members">Sadece Üyeler</option>
                    <option value="admin">Sadece Admin</option>
                  </select>
                </div>
              </div>

              {!editingResource && (
                <div className="form-group">
                  <label>Dosya Yükle</label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
                  />
                  {selectedFile && (
                    <div className="file-info">
                      <i className='bx bx-file'></i>
                      <span>{selectedFile.name} ({formatFileSize(selectedFile.size)})</span>
                    </div>
                  )}
                </div>
              )}

              {formData.type === 'link' && (
                <div className="form-group">
                  <label>URL</label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>
              )}

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

              <div className="form-group">
                <h4>Yazar Bilgileri</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Yazar Adı</label>
                    <input
                      type="text"
                      name="author.name"
                      value={formData.author.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="author.email"
                      value={formData.author.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Kurum</label>
                    <input
                      type="text"
                      name="author.organization"
                      value={formData.author.organization}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  Öne çıkan kaynak
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={uploadingFile}
                >
                  {uploadingFile ? 'Yükleniyor...' : (editingResource ? 'Güncelle' : 'Oluştur')}
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
          <p>Kaynaklar yükleniyor...</p>
        </div>
      ) : (
        <div className="resources-management-grid">
          {resources.length > 0 ? resources.map((resource) => (
            <div key={resource._id} className="resource-management-card">
              <div className="resource-header">
                <div className="resource-type-icon">
                  <i className={`bx ${
                    resource.type === 'pdf' ? 'bx-file-doc' :
                    resource.type === 'video' ? 'bx-video' :
                    resource.type === 'audio' ? 'bx-music' :
                    resource.type === 'image' ? 'bx-image' :
                    resource.type === 'link' ? 'bx-link' :
                    'bx-file'
                  }`}></i>
                </div>
                <div className="resource-meta">
                  <span className={`category ${resource.category}`}>{resource.category}</span>
                  <span className={`access ${resource.access}`}>{resource.access}</span>
                  {resource.isFeatured && <span className="featured">Öne Çıkan</span>}
                </div>
              </div>
              
              <div className="resource-content">
                <h3>{resource.title}</h3>
                <p>{resource.description.substring(0, 100)}...</p>
                <div className="resource-stats">
                  <span><i className='bx bx-download'></i> {resource.downloadCount || 0}</span>
                  <span><i className='bx bx-show'></i> {resource.viewCount || 0}</span>
                  {resource.file?.size && (
                    <span><i className='bx bx-file'></i> {formatFileSize(resource.file.size)}</span>
                  )}
                </div>
                <div className="resource-tags">
                  {resource.tags?.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className="resource-actions">
                <button 
                  className="btn-action edit"
                  onClick={() => handleEdit(resource)}
                  title="Düzenle"
                >
                  <i className='bx bx-edit'></i>
                </button>
                <button 
                  className="btn-action delete"
                  onClick={() => handleDelete(resource._id)}
                  title="Sil"
                >
                  <i className='bx bx-trash'></i>
                </button>
                <button className="btn-action view" title="Görüntüle">
                  <i className='bx bx-show'></i>
                </button>
              </div>
            </div>
          )) : (
            <div className="empty-state">
              <i className='bx bx-book' style={{ fontSize: '48px', color: '#ccc' }}></i>
              <p>Henüz kaynak eklenmemiş</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                İlk Kaynağı Ekle
              </button>
            </div>
          )}
        </div>
      )}
      
      
    </div>
  )
}