'use client'
import { useState, useEffect } from 'react'

export default function BoardManagementSystem({ activeTab, setActiveTab }) {
  const [boardMembers, setBoardMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    position: 'üye',
    bio: '',
    email: '',
    phone: '',
    office: '',
    linkedin: '',
    twitter: '',
    website: '',
    startDate: '',
    endDate: '',
    isActive: true,
    isPublic: true,
    displayOrder: 0,
    image: null
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  // ✅ GÜNCELLENMIŞ POSITIONS - YEDEK YAZILARI KALDIRILDI
  const positions = [
    'başkan',
    'başkan yardımcısı',
    'genel sekreter',
    'sayman',
    'üye',
    'yedek üye',
    'denetim kurulu başkanı',
    'denetim kurulu üyesi',
    'denetim kurulu yedek üyesi',
    'kurucu üye'
  ]

  useEffect(() => {
    if (activeTab === 'board') {
      fetchBoardMembers()
    }
  }, [activeTab])

  const fetchBoardMembers = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('🔑 Token:', token ? 'Var' : 'Yok');
      
      const url = `${API_URL}/board-members/admin/all`;
      console.log('📡 Fetching from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Response data:', data);
        console.log('📊 Members count:', data.data?.members?.length);
        console.log('📋 Members:', data.data?.members);
        
        setBoardMembers(data.data.members || []);
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan büyük olamaz!')
        return
      }

      if (!file.type.startsWith('image/')) {
        alert('Sadece resim dosyası yükleyebilirsiniz!')
        return
      }

      setSelectedFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imagePreview: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadPhoto = async () => {
    if (!selectedFile) return null

    try {
      setUploadingPhoto(true)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      const photoFormData = new FormData()
      photoFormData.append('image', selectedFile)

      const response = await fetch(`${API_URL}/upload/image?folder=board-members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: photoFormData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Upload response:', data)
        return data.data.image.url
      } else {
        const errorData = await response.text()
        console.error('Upload error response:', errorData)
        throw new Error('Fotoğraf yükleme başarısız')
      }
    } catch (error) {
      console.error('Photo upload error:', error)
      alert('Fotoğraf yüklenirken hata oluştu: ' + error.message)
      return null
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('Form submit - editing:', editingMember)
    console.log('Form data:', formData)
    console.log('Selected file:', selectedFile)

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      let imageUrl = formData.image

      if (selectedFile) {
        imageUrl = await uploadPhoto()
        if (!imageUrl) return
      }

      const url = editingMember
        ? `${API_URL}/board-members/${editingMember._id}`
        : `${API_URL}/board-members`

      const method = editingMember ? 'PUT' : 'POST'

      const submitData = {
        ...formData,
        contact: {
          email: formData.email,
          phone: formData.phone,
          office: formData.office
        },
        social: {
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          website: formData.website
        },
        image: imageUrl
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        alert(editingMember ? 'Yönetim kurulu üyesi güncellendi!' : 'Yönetim kurulu üyesi eklendi!')
        setShowForm(false)
        setEditingMember(null)
        setSelectedFile(null)
        resetForm()
        fetchBoardMembers()
      } else {
        const error = await response.json()
        alert(error.message || 'İşlem başarısız!')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Bir hata oluştu!')
    }
  }

  const handleEdit = (member) => {
    console.log('Editing member:', member)

    setEditingMember(member)
    setFormData({
      name: member.name || '',
      position: member.position || 'üye',
      bio: member.bio || '',
      email: member.contact?.email || '',
      phone: member.contact?.phone || '',
      office: member.contact?.office || '',
      linkedin: member.social?.linkedin || '',
      twitter: member.social?.twitter || '',
      website: member.social?.website || '',
      startDate: member.startDate ? new Date(member.startDate).toISOString().split('T')[0] : '',
      endDate: member.endDate ? new Date(member.endDate).toISOString().split('T')[0] : '',
      isActive: member.isActive !== undefined ? member.isActive : true,
      isPublic: member.isPublic !== undefined ? member.isPublic : true,
      displayOrder: member.displayOrder || 0,
      image: member.image || null
    })
    setSelectedFile(null)
    setShowForm(true)
  }

  const handleDelete = async (memberId) => {
    const confirmMessage = 'Bu yönetim kurulu üyesini kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!';

    if (!confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/board-members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Yönetim kurulu üyesi kalıcı olarak silindi!');
        fetchBoardMembers();
      } else {
        alert('Silme işlemi başarısız!');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Bir hata oluştu!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: 'üye',
      bio: '',
      email: '',
      phone: '',
      office: '',
      linkedin: '',
      twitter: '',
      website: '',
      startDate: '',
      endDate: '',
      isActive: true,
      isPublic: true,
      displayOrder: 0,
      image: null,
      imagePreview: null
    })
    setSelectedFile(null)
    setEditingMember(null)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (activeTab !== 'board') return null

  return (
    <div className="admin-content-section">
      <div className="section-header">
        <div>
          <h2>Yönetim Kurulu Yönetimi</h2>
          <p>Yönetim kurulu üyelerini ekleyin, düzenleyin ve yönetin</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true)
              setEditingMember(null)
              resetForm()
            }}
          >
            <i className='bx bx-plus'></i>
            Yeni Üye Ekle
          </button>
          <button className="btn btn-outline" onClick={fetchBoardMembers}>
            <i className='bx bx-refresh'></i>
            Yenile
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Yönetim kurulu yükleniyor...</p>
        </div>
      ) : (
        <div className="members-grid">
          {boardMembers.length > 0 ? boardMembers.map((member) => (
            <div key={member._id} className="member-card">
              <div className="member-header">
                <div className="member-avatar">
                  {member.image ? (
                    <img
                      src={member.image.startsWith('http') ? member.image : `${API_URL}${member.image}`}
                      alt={member.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <i className='bx bx-user'></i>
                  )}
                </div>
                <span className={`status ${member.isActive ? 'active' : 'inactive'}`}>
                  {member.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              <div className="member-info">
                <h3>{member.name}</h3>
                <p className="position">{member.position}</p>
                <p>{member.contact?.email || 'E-posta yok'}</p>
                <span className="join-date">
                  {new Date(member.startDate).toLocaleDateString('tr-TR')}
                </span>

                {(member.social?.linkedin || member.social?.twitter) && (
                  <div className="social-links" style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    {member.social?.linkedin && (
                      <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#0077b5', fontSize: '18px' }}>
                        <i className='bx bxl-linkedin'></i>
                      </a>
                    )}
                    {member.social?.twitter && (
                      <a href={member.social.twitter} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#1da1f2', fontSize: '18px' }}>
                        <i className='bx bxl-twitter'></i>
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="member-actions">
                <button
                  className="btn-action edit"
                  onClick={() => handleEdit(member)}
                  title="Düzenle"
                >
                  <i className='bx bx-edit'></i>
                </button>

                <button
                  className="btn-action delete"
                  onClick={() => handleDelete(member._id)}
                  title="Sil"
                >
                  <i className='bx bx-trash'></i>
                </button>
              </div>
            </div>
          )) : (
            <div className="empty-state">
              <i className='bx bx-crown' style={{ fontSize: '48px', color: '#ccc' }}></i>
              <p>Henüz yönetim kurulu üyesi eklenmemiş</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                İlk Üyeyi Ekle
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMember ? 'Üye Düzenle' : 'Yeni Üye Ekle'}</h3>
              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Profil Fotoğrafı</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ marginBottom: '10px' }}
                />
                {formData.imagePreview && (
                  <div style={{ marginBottom: '15px' }}>
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #ddd'
                      }}
                    />
                  </div>
                )}
                {formData.image && !formData.imagePreview && (
                  <div style={{ marginBottom: '15px' }}>
                    <img
                      src={formData.image.startsWith('http') ? formData.image : `${API_URL}${formData.image}`}
                      alt="Current"
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #ddd'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Mevcut fotoğraf</p>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ad Soyad *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pozisyon *</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    style={{ fontSize: '15px' }}
                  >
                    {/* ✅ GÜNCELLENMIŞ SELECT - ASIL/YEDEK YAZILARI KALDIRILDI */}
                    <optgroup label="🏛️ Başkanlık">
                      <option value="başkan">Başkan</option>
                      <option value="başkan yardımcısı">Başkan Yardımcısı</option>
                    </optgroup>

                    <optgroup label="👥 Yönetim Kurulu">
                      <option value="genel sekreter">Genel Sekreter</option>
                      <option value="sayman">Sayman</option>
                      <option value="üye">Üye</option>
                      <option value="yedek üye">Yedek Üye</option>
                    </optgroup>

                    <optgroup label="🔍 Denetim Kurulu">
                      <option value="denetim kurulu başkanı">Denetim Kurulu Başkanı</option>
                      <option value="denetim kurulu üyesi">Denetim Kurulu Üyesi</option>
                      <option value="denetim kurulu yedek üyesi">Denetim Kurulu Yedek Üyesi</option>
                    </optgroup>

                    <optgroup label="⭐ Kurucu">
                      <option value="kurucu üye">Kurucu Üye</option>
                    </optgroup>
                  </select>
                  <small style={{ color: '#666', marginTop: '8px', display: 'block' }}>
                    ℹ️ Pozisyon web sitesinde otomatik olarak gruplandırılacak
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label>Biyografi</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Üye hakkında bilgi..."
                />
              </div>

              <h4 style={{ marginBottom: '20px', color: 'var(--text-color)' }}>İletişim Bilgileri</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>E-posta</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ofis/Kurum</label>
                <input
                  type="text"
                  name="office"
                  value={formData.office}
                  onChange={handleInputChange}
                  placeholder="Çalıştığı kurum veya ofis bilgisi"
                />
              </div>

              <h4 style={{ marginBottom: '20px', color: 'var(--text-color)' }}>Sosyal Medya</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="form-group">
                  <label>Twitter</label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>

              <h4 style={{ marginBottom: '20px', color: 'var(--text-color)' }}>Görev Bilgileri</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Başlama Tarihi *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bitiş Tarihi</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                  <small>Boş bırakılırsa hala görevde sayılır</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Görüntüleme Sırası</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                  />
                  <small>0 = En üstte görünür</small>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Aktif
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                    />
                    Web sitesinde görünsün
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? 'Fotoğraf yükleniyor...' : (editingMember ? 'Güncelle' : 'Ekle')}
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
    </div>
  )
}