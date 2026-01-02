'use client'
import { useState, useEffect } from 'react'

export default function DynamicProgramManagement({ activeTab, setActiveTab }) {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    dateTime: '',
    duration: 60,
    category: 'seminer',
    level: 'tüm seviyeler',
    status: 'yayınlandı',
    location: {
      type: 'online',
      address: '',
      room: '',
      onlineLink: '',
      capacity: 50
    },
    speaker: {
      name: '',
      bio: '',
      expertise: '',
      social: {
        linkedin: '',
        twitter: '',
        website: ''
      }
    },
    registration: {
      required: true,
      deadline: '',
      fee: 0,
      maxParticipants: 50
    },
    tags: '',
    prerequisites: '',
    image: null  // ← EKLE
  })
  // YENİ STATE'LER EKLE (diğer useState'lerden sonra) ↓
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Filtreleme state'leri
const [selectedYear, setSelectedYear] = useState('all')
const [filterStatus, setFilterStatus] = useState('all')
const [filterCategory, setFilterCategory] = useState('all')
const [searchTerm, setSearchTerm] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    if (activeTab === 'programs') {
      fetchPrograms()
    }
  }, [activeTab])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      const response = await fetch(`${API_URL}/programs/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPrograms(data.data.programs || [])
      }
    } catch (error) {
      console.error('Programlar getirilirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  // Yıl seçeneklerini oluştur
const getYearOptions = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 2021; i <= currentYear + 5; i++) { 
    years.push(i)
  }
  return years
}

// Filtrelenmiş etkinlikler
const filteredPrograms = programs.filter(program => {
  const programDate = new Date(program.dateTime)
  const programYear = programDate.getFullYear()
  const now = new Date()

  // Yıl filtresi
  if (selectedYear !== 'all' && programYear !== parseInt(selectedYear)) {
    return false
  }

  // Durum filtresi
  if (filterStatus === 'upcoming' && programDate < now) {
    return false
  }
  if (filterStatus === 'past' && programDate >= now) {
    return false
  }
  if (filterStatus === 'cancelled' && program.status !== 'iptal') {
    return false
  }
  if (filterStatus === 'draft' && program.status !== 'taslak') {
    return false
  }

  // Kategori filtresi
  if (filterCategory !== 'all' && program.category !== filterCategory) {
    return false
  }

  // Arama filtresi
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase()
    return (
      program.title?.toLowerCase().includes(searchLower) ||
      program.description?.toLowerCase().includes(searchLower) ||
      program.speaker?.name?.toLowerCase().includes(searchLower)
    )
  }

  return true
})

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      // ⬇️ ADMIN BİLGİSİNİ AL ⬇️
      const adminData = JSON.parse(localStorage.getItem('admin') || '{}')

      // YENİ: Görsel varsa önce yükle
      let imageUrl = formData.image
      if (imageFile) {
        imageUrl = await uploadImage()
        if (!imageUrl && imageFile) {
          return
        }
      }

      const programData = {
        ...formData,
        organizer: adminData._id || adminData.id, // ← BUNU EKLEYİN
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        prerequisites: formData.prerequisites.split(',').map(p => p.trim()).filter(p => p),
        speaker: {
          ...formData.speaker,
          expertise: formData.speaker.expertise.split(',').map(e => e.trim()).filter(e => e)
        },
        image: imageUrl  // ← EKLE
      }

      const url = editingProgram
        ? `${API_URL}/programs/${editingProgram._id}`
        : `${API_URL}/programs`

      const method = editingProgram ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(programData)
      })

      if (response.ok) {
        alert(editingProgram ? 'Etkinlik güncellendi!' : 'Etkinlik oluşturuldu!')
        setShowForm(false)
        setEditingProgram(null)
        resetForm()
        fetchPrograms()
      } else {
        const error = await response.json()
        alert(error.message || 'İşlem başarısız!')
      }
    } catch (error) {
      console.error('Etkinlik kaydetme hatası:', error)
      alert('Bir hata oluştu!')
    }
  }

  const handleEdit = (program) => {
    setEditingProgram(program)
    setFormData({
      title: program.title,
      description: program.description,
      shortDescription: program.shortDescription || '',
      dateTime: program.dateTime ? new Date(program.dateTime).toISOString().slice(0, 16) : '',
      duration: program.duration,
      category: program.category,
      level: program.level,
      status: program.status || 'yayınlandı',
      location: {
        type: program.location?.type || 'online',
        address: program.location?.address || '',
        room: program.location?.room || '',
        onlineLink: program.location?.onlineLink || '',
        capacity: program.location?.capacity || 50
      },
      speaker: {
        name: program.speaker?.name || '',
        bio: program.speaker?.bio || '',
        expertise: program.speaker?.expertise ? program.speaker.expertise.join(', ') : '',
        social: {
          linkedin: program.speaker?.social?.linkedin || '',
          twitter: program.speaker?.social?.twitter || '',
          website: program.speaker?.social?.website || ''
        }
      },
      registration: {
        required: program.registration?.required !== false,
        deadline: program.registration?.deadline ? new Date(program.registration.deadline).toISOString().slice(0, 16) : '',
        fee: program.registration?.fee || 0,
        maxParticipants: program.registration?.maxParticipants || 50
      },
      tags: program.tags ? program.tags.join(', ') : '',
      prerequisites: program.prerequisites ? program.prerequisites.join(', ') : '',
      image: program.image || null  // ← EKLE
    })
    setImagePreview(program.image)  // ← EKLE
    setImageFile(null)  // ← EKLE
    setShowForm(true)
  }

  const handleDelete = async (programId) => {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await fetch(`${API_URL}/programs/${programId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Etkinlik silindi!')
        fetchPrograms()
      } else {
        alert('Silme işlemi başarısız!')
      }
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('Bir hata oluştu!')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      dateTime: '',
      duration: 60,
      category: 'seminer',
      level: 'tüm seviyeler',
      status: 'yayınlandı',
      location: {
        type: 'online',
        address: '',
        room: '',
        onlineLink: '',
        capacity: 50
      },
      speaker: {
        name: '',
        bio: '',
        expertise: '',
        social: {
          linkedin: '',
          twitter: '',
          website: ''
        }
      },
      registration: {
        required: true,
        deadline: '',
        fee: 0,
        maxParticipants: 50
      },
      tags: '',
      prerequisites: '',
      image: null  // ← EKLE
    })
    setImageFile(null)  // ← EKLE
    setImagePreview(null)  // ← EKLE
  }

  // YENİ: Image handler fonksiyonları ↓

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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      const formDataUpload = new FormData()
      formDataUpload.append('image', imageFile)

      const response = await fetch(`${API_URL}/upload/image?folder=programs`, {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (program) => {
    const now = new Date()
    const programDate = new Date(program.dateTime)

    if (program.status === 'iptal') return { text: 'İptal', class: 'cancelled' }
    if (program.status === 'tamamlandı') return { text: 'Tamamlandı', class: 'completed' }
    if (program.status === 'taslak') return { text: 'Taslak', class: 'draft' }
    if (programDate < now) return { text: 'Geçmiş', class: 'past' }

    return { text: 'Yaklaşan', class: 'upcoming' }
  }

  if (activeTab !== 'programs') return null

  return (
    <div className="admin-content-section">
      <div className="section-header">
        <div>
          <h2>Etkinlik Yönetimi</h2>
          <p>Etkinlikleri oluşturun, düzenleyin ve yönetin</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true)
              setEditingProgram(null)
              resetForm()
            }}
          >
            <i className='bx bx-plus'></i>
            Yeni Etkinlik
          </button>
          <button className="btn btn-outline" onClick={fetchPrograms}>
            <i className='bx bx-refresh'></i>
            Yenile
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProgram ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="program-form">
              {/* Temel Bilgiler */}
              <div className="form-section">
                <h4>Temel Bilgiler</h4>

                <div className="form-group">
                  <label>Etkinlik Başlığı *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength="200"
                    placeholder="Örn: Yapay Zeka ve Eğitim Semineri"
                  />
                </div>

                <div className="form-group">
                  <label>Kısa Açıklama</label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    maxLength="300"
                    placeholder="Liste görünümünde gösterilecek kısa açıklama"
                  />
                </div>

                <div className="form-group">
                  <label>Detaylı Açıklama *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="5"
                    placeholder="Etkinlik hakkında detaylı bilgi..."
                  />
                </div>

                {/* YENİ: Etkinlik Görseli - BURAYA EKLE ↓ */}
                <div className="form-group">
                  <label>Etkinlik Posteri/Görseli</label>

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
                        id="programImage"
                      />
                      <label
                        htmlFor="programImage"
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
                        <p style={{ color: '#666', margin: '0 0 5px 0' }}>Etkinlik posteri yüklemek için tıklayın</p>
                        <small style={{ color: '#999' }}>PNG, JPG, JPEG - Maksimum 5MB</small>
                      </label>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tarih ve Saat *</label>
                    <input
                      type="datetime-local"
                      value={formData.dateTime}
                      onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Süre (Dakika) *</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      required
                      min="15"
                      placeholder="60"
                    />
                  </div>

                  <div className="form-group">
                    <label>Kategori</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="workshop">Workshop</option>
                      <option value="seminer">Seminer</option>
                      <option value="panel">Panel</option>
                      <option value="konferans">Konferans</option>
                      <option value="kurs">Kurs</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Seviye</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    >
                      <option value="tüm seviyeler">Tüm Seviyeler</option>
                      <option value="başlangıç">Başlangıç</option>
                      <option value="orta">Orta</option>
                      <option value="ileri">İleri</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Durum *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="yayınlandı">Yayınlandı (Herkese Açık)</option>
                  <option value="taslak">Taslak (Sadece Admin)</option>
                  <option value="iptal">İptal Edildi</option>
                </select>
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                  Yayınlandı seçeneği etkinliği web sitesinde görünür yapar
                </small>
              </div>

              {/* Konum Bilgileri */}
              <div className="form-section">
                <h4>Konum Bilgileri</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label>Etkinlik Türü</label>
                    <select
                      value={formData.location.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, type: e.target.value }
                      })}
                    >
                      <option value="online">Online</option>
                      <option value="physical">Fiziksel</option>
                      <option value="hybrid">Hibrit</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Kapasite</label>
                    <input
                      type="number"
                      value={formData.location.capacity}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, capacity: parseInt(e.target.value) }
                      })}
                      min="1"
                    />
                  </div>
                </div>

                {(formData.location.type === 'online' || formData.location.type === 'hybrid') && (
                  <div className="form-group">
                    <label>Online Link (Zoom, Teams, vb.)</label>
                    <input
                      type="url"
                      value={formData.location.onlineLink}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, onlineLink: e.target.value }
                      })}
                      placeholder="https://zoom.us/..."
                    />
                  </div>
                )}

                {(formData.location.type === 'physical' || formData.location.type === 'hybrid') && (
                  <>
                    <div className="form-group">
                      <label>Adres</label>
                      <input
                        type="text"
                        value={formData.location.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, address: e.target.value }
                        })}
                        placeholder="Etkinlik mekanının adresi"
                      />
                    </div>
                    <div className="form-group">
                      <label>Oda/Salon</label>
                      <input
                        type="text"
                        value={formData.location.room}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, room: e.target.value }
                        })}
                        placeholder="Örn: Konferans Salonu A"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Konuşmacı Bilgileri */}
              <div className="form-section">
                <h4>Konuşmacı Bilgileri</h4>

                <div className="form-group">
                  <label>Konuşmacı Adı *</label>
                  <input
                    type="text"
                    value={formData.speaker.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      speaker: { ...formData.speaker, name: e.target.value }
                    })}
                    required
                    placeholder="Örn: Prof. Dr. Ahmet Yılmaz"
                  />
                </div>

                <div className="form-group">
                  <label>Konuşmacı Hakkında</label>
                  <textarea
                    value={formData.speaker.bio}
                    onChange={(e) => setFormData({
                      ...formData,
                      speaker: { ...formData.speaker, bio: e.target.value }
                    })}
                    rows="3"
                    placeholder="Konuşmacının özgeçmişi..."
                  />
                </div>

                <div className="form-group">
                  <label>Uzmanlık Alanları</label>
                  <input
                    type="text"
                    value={formData.speaker.expertise}
                    onChange={(e) => setFormData({
                      ...formData,
                      speaker: { ...formData.speaker, expertise: e.target.value }
                    })}
                    placeholder="Yapay Zeka, Makine Öğrenmesi, vb. (virgülle ayırın)"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>LinkedIn</label>
                    <input
                      type="url"
                      value={formData.speaker.social.linkedin}
                      onChange={(e) => setFormData({
                        ...formData,
                        speaker: {
                          ...formData.speaker,
                          social: { ...formData.speaker.social, linkedin: e.target.value }
                        }
                      })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Twitter</label>
                    <input
                      type="url"
                      value={formData.speaker.social.twitter}
                      onChange={(e) => setFormData({
                        ...formData,
                        speaker: {
                          ...formData.speaker,
                          social: { ...formData.speaker.social, twitter: e.target.value }
                        }
                      })}
                      placeholder="https://twitter.com/..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={formData.speaker.social.website}
                      onChange={(e) => setFormData({
                        ...formData,
                        speaker: {
                          ...formData.speaker,
                          social: { ...formData.speaker.social, website: e.target.value }
                        }
                      })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Kayıt Bilgileri */}
              <div className="form-section">
                <h4>Kayıt Ayarları</h4>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.registration.required}
                      onChange={(e) => setFormData({
                        ...formData,
                        registration: { ...formData.registration, required: e.target.checked }
                      })}
                    />
                    Kayıt gerekli
                  </label>
                </div>

                {formData.registration.required && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Kayıt Son Tarihi</label>
                        <input
                          type="datetime-local"
                          value={formData.registration.deadline}
                          onChange={(e) => setFormData({
                            ...formData,
                            registration: { ...formData.registration, deadline: e.target.value }
                          })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Maksimum Katılımcı</label>
                        <input
                          type="number"
                          value={formData.registration.maxParticipants}
                          onChange={(e) => setFormData({
                            ...formData,
                            registration: { ...formData.registration, maxParticipants: parseInt(e.target.value) }
                          })}
                          min="1"
                        />
                      </div>

                      <div className="form-group">
                        <label>Ücret (₺)</label>
                        <input
                          type="number"
                          value={formData.registration.fee}
                          onChange={(e) => setFormData({
                            ...formData,
                            registration: { ...formData.registration, fee: parseInt(e.target.value) }
                          })}
                          min="0"
                          placeholder="0 (Ücretsiz)"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Diğer Bilgiler */}
              <div className="form-section">
                <h4>Diğer Bilgiler</h4>

                <div className="form-group">
                  <label>Etiketler</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="yapay zeka, eğitim, teknoloji (virgülle ayırın)"
                  />
                </div>

                <div className="form-group">
                  <label>Ön Koşullar</label>
                  <input
                    type="text"
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                    placeholder="Python bilgisi, Temel istatistik (virgülle ayırın)"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Görsel yükleniyor...' : (editingProgram ? 'Güncelle' : 'Oluştur')}
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

      {/* Filtreler */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '15px',
  marginBottom: '20px',
  padding: '20px',
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
}}>
  {/* Yıl Filtresi */}
  <div>
    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>
      Yıl
    </label>
    <select
      value={selectedYear}
      onChange={(e) => setSelectedYear(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 15px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer'
      }}
    >
      <option value="all">Tümü</option>
      {getYearOptions().map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  </div>

  {/* Durum Filtresi */}
  <div>
    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>
      Durum
    </label>
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 15px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer'
      }}
    >
      <option value="all">Tümü</option>
      <option value="upcoming">Yaklaşan</option>
      <option value="past">Geçmiş</option>
      <option value="draft">Taslak</option>
      <option value="cancelled">İptal</option>
    </select>
  </div>

  {/* Kategori Filtresi */}
  <div>
    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>
      Kategori
    </label>
    <select
      value={filterCategory}
      onChange={(e) => setFilterCategory(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 15px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer'
      }}
    >
      <option value="all">Tümü</option>
      <option value="workshop">Workshop</option>
      <option value="seminer">Seminer</option>
      <option value="panel">Panel</option>
      <option value="konferans">Konferans</option>
      <option value="kurs">Kurs</option>
    </select>
  </div>

  {/* Arama */}
  <div>
    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>
      Ara
    </label>
    <input
      type="text"
      placeholder="Başlık, konuşmacı..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 15px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px'
      }}
    />
  </div>
</div>

{/* Filtre Özeti */}
<div style={{
  padding: '15px 20px',
  background: '#f8f9fa',
  borderRadius: '8px',
  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px solid #e2e8f0'
}}>
  <div style={{ fontSize: '14px', color: '#666' }}>
    <strong style={{ color: '#2d3748' }}>{filteredPrograms.length}</strong> etkinlik bulundu
    {filteredPrograms.length !== programs.length && (
      <span style={{ marginLeft: '10px', color: '#999' }}>
        (Toplam: {programs.length})
      </span>
    )}
  </div>
  {(selectedYear !== 'all' || filterStatus !== 'all' || filterCategory !== 'all' || searchTerm) && (
    <button
      onClick={() => {
        setSelectedYear('all')
        setFilterStatus('all')
        setFilterCategory('all')
        setSearchTerm('')
      }}
      style={{
        padding: '8px 16px',
        background: '#e2e8f0',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        color: '#2d3748',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#cbd5e0'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#e2e8f0'
      }}
    >
      <i className='bx bx-x'></i> Filtreleri Temizle
    </button>
  )}
</div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Etkinlikler yükleniyor...</p>
        </div>
      ) : (
        <div className="programs-grid">
          {filteredPrograms.length > 0 ? filteredPrograms.map((program) => {
            const status = getStatusBadge(program)
            return (
              <div key={program._id} className="program-card">
                <div className="program-header">
                  <span className={`status-badge ${status.class}`}>
                    {status.text}
                  </span>
                  <span className="category-badge">{program.category}</span>
                </div>

                <div className="program-content">
                  <h3>{program.title}</h3>
                  <p className="program-date">
                    <i className='bx bx-calendar'></i>
                    {formatDate(program.dateTime)}
                  </p>
                  <p className="program-speaker">
                    <i className='bx bx-user'></i>
                    {program.speaker?.name}
                  </p>
                  <div className="program-meta">
                    <span>
                      <i className='bx bx-time'></i>
                      {program.duration} dakika
                    </span>
                    <span>
                      <i className='bx bx-map'></i>
                      {program.location?.type === 'online' ? 'Online' :
                        program.location?.type === 'physical' ? 'Fiziksel' : 'Hibrit'}
                    </span>
                    <span>
                      <i className='bx bx-group'></i>
                      {program.registration?.currentParticipants || 0}/{program.registration?.maxParticipants || 0}
                    </span>
                  </div>
                </div>

                <div className="program-actions">
                  <button
                    className="btn-action edit"
                    onClick={() => handleEdit(program)}
                    title="Düzenle"
                  >
                    <i className='bx bx-edit'></i>
                  </button>
                  <button
                    className="btn-action delete"
                    onClick={() => handleDelete(program._id)}
                    title="Sil"
                  >
                    <i className='bx bx-trash'></i>
                  </button>
                  <button className="btn-action view" title="Detay">
                    <i className='bx bx-show'></i>
                  </button>
                </div>
              </div>
            )
          }) : (
            <div className="empty-state">
              <i className='bx bx-calendar-event' style={{ fontSize: '48px', color: '#ccc' }}></i>
              <p>Henüz etkinlik eklenmemiş</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                İlk Etkinliği Ekle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}