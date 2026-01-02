'use client'
import { useState, useEffect } from 'react'

export default function DynamicMembersManagement({ activeTab, setActiveTab }) {
  const [members, setMembers] = useState([])
  const [pendingMembers, setPendingMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member',
    hasPaid: false
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers()
    }
  }, [activeTab])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      const [allResponse, pendingResponse] = await Promise.all([
        fetch(`${API_URL}/dashboard/admin/members`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/dashboard/admin/members/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ])

      if (allResponse.ok && pendingResponse.ok) {
        const allData = await allResponse.json()
        const pendingData = await pendingResponse.json()

        setMembers(allData.data.members || [])
        setPendingMembers(pendingData.data.members || [])
      }
    } catch (error) {
      console.error('Üyeler getirilirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveMember = async (userId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await fetch(`${API_URL}/dashboard/admin/members/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Üye başarıyla onaylandı!')
        fetchMembers()
      } else {
        const error = await response.json()
        alert(error.message || 'Onay işlemi başarısız!')
      }
    } catch (error) {
      console.error('Onay hatası:', error)
      alert('Bir hata oluştu!')
    }
  }

  const handleRejectMember = async (userId) => {
    if (!confirm('Bu üyeyi reddetmek istediğinize emin misiniz?')) return

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await fetch(`${API_URL}/dashboard/admin/members/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Üye başarıyla reddedildi!')
        fetchMembers()
      } else {
        const error = await response.json()
        alert(error.message || 'Red işlemi başarısız!')
      }
    } catch (error) {
      console.error('Red hatası:', error)
      alert('Bir hata oluştu!')
    }
  }

  const handleEditMember = (member) => {
    setEditingMember(member)
    setEditFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      hasPaid: member.hasPaid || false
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await fetch(`${API_URL}/users/${editingMember._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      })

      if (response.ok) {
        alert('Üye başarıyla güncellendi!')
        setShowEditModal(false)
        fetchMembers()
      } else {
        const error = await response.json()
        alert(error.message || 'Güncelleme başarısız!')
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Bir hata oluştu!')
    }
  }

  const handleDeleteMember = async (userId) => {
    if (!confirm('Bu üyeyi kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!')) return

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Üye başarıyla silindi!')
        fetchMembers()
      } else {
        const error = await response.json()
        alert(error.message || 'Silme işlemi başarısız!')
      }
    } catch (error) {
      console.error('Delete member error:', error)
      alert('Bir hata oluştu!')
    }
  }

  const handleTogglePaid = async (userId, currentStatus) => {
    if (!confirm(`Bu üyenin ödeme durumunu ${currentStatus ? 'ÖDENMEDİ' : 'ÖDENDİ'} olarak güncellemek istiyor musunuz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      console.log('🔄 Güncelleniyor:', { userId, currentStatus, newStatus: !currentStatus }); // ✅ DEBUG

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hasPaid: !currentStatus
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Güncelleme başarılı:', result); // ✅ DEBUG
        alert('✅ Ödeme durumu güncellendi!');
        fetchMembers(); // Listeyi yenile
      } else {
        const error = await response.json();
        console.error('❌ Güncelleme hatası:', error); // ✅ DEBUG
        alert(error.message || '❌ Güncelleme başarısız!');
      }
    } catch (error) {
      console.error('❌ Ödeme güncelleme hatası:', error);
      alert('❌ Bir hata oluştu!');
    }
  };

  const filteredMembers = () => {
    let data = selectedTab === 'pending' ? pendingMembers : members

    if (searchTerm) {
      data = data.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      data = data.filter(member => {
        if (statusFilter === 'approved') return member.isApproved
        if (statusFilter === 'pending') return !member.isApproved
        return true
      })
    }

    return data
  }

  if (activeTab !== 'members') return null

  return (
    <div className="admin-content-section">
      <div className="section-header">
        <div>
          <h2>Üye Yönetimi</h2>
          <p>Sistem üyelerini yönetin ve başvuruları değerlendirin</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={fetchMembers}>
            <i className='bx bx-refresh'></i>
            Yenile
          </button>
        </div>
      </div>

      <div className="management-tabs">
        <button
          className={`tab-btn ${selectedTab === 'pending' ? 'active' : ''}`}
          onClick={() => setSelectedTab('pending')}
        >
          Bekleyen Başvurular ({pendingMembers.length})
        </button>
        <button
          className={`tab-btn ${selectedTab === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedTab('all')}
        >
          Tüm Üyeler ({members.length})
        </button>
      </div>

      <div className="table-filters">
        <input
          type="text"
          placeholder="Üye ara..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="approved">Onaylı</option>
          <option value="pending">Beklemede</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Üyeler yükleniyor...</p>
        </div>
      ) : (
        <div className="members-grid">
          {filteredMembers().map((member) => (
            <div key={member._id} className="member-card">
              <div className="member-header">
                <div className="member-avatar">
                  <i className='bx bx-user'></i>
                </div>
                <span className={`status ${member.isApproved ? 'approved' : 'pending'}`}>
                  {member.isApproved ? 'Onaylı' : 'Beklemede'}
                </span>
              </div>
              <div className="member-info">
                <h3>{member.name}</h3>
                <p>{member.email}</p>
                <p>{member.phone || 'Telefon belirtilmemiş'}</p>
                <span className="join-date">
                  {new Date(member.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              {/* ✅ YENİ: Ödeme Durumu */}
              <div className="member-payment" style={{
                padding: '12px',
                background: member.hasPaid ? '#d4edda' : '#fff3cd',
                borderRadius: '8px',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: `2px solid ${member.hasPaid ? '#c3e6cb' : '#ffeaa7'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className={`bx ${member.hasPaid ? 'bx-check-circle' : 'bx-error-circle'}`}
                    style={{
                      fontSize: '20px',
                      color: member.hasPaid ? '#28a745' : '#ffc107'
                    }}></i>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: member.hasPaid ? '#155724' : '#856404'
                  }}>
                    {member.hasPaid ? 'Aidat Ödendi' : 'Ödeme Bekliyor'}
                  </span>
                </div>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <input
                    type="checkbox"
                    checked={member.hasPaid || false}
                    onChange={() => handleTogglePaid(member._id, member.hasPaid)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  İşaretle
                </label>
              </div>
              <div className="member-actions">
                {!member.isApproved ? (
                  <>
                    <button
                      className="btn-action approve"
                      onClick={() => handleApproveMember(member._id)}
                      title="Onayla"
                    >
                      <i className='bx bx-check'></i>
                    </button>
                    <button
                      className="btn-action reject"
                      onClick={() => handleRejectMember(member._id)}
                      title="Reddet"
                    >
                      <i className='bx bx-x'></i>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-action edit"
                      onClick={() => handleEditMember(member)}
                      title="Düzenle"
                    >
                      <i className='bx bx-edit'></i>
                    </button>
                    <button
                      className="btn-action reject"
                      onClick={() => handleDeleteMember(member._id)}
                      title="Sil"
                    >
                      <i className='bx bx-trash'></i>
                    </button>
                  </>
                )}
                <button className="btn-action view" title="Detay">
                  <i className='bx bx-show'></i>
                </button>
              </div>
            </div>
          ))}

          {filteredMembers().length === 0 && (
            <div className="empty-state">
              <i className='bx bx-user-x' style={{ fontSize: '48px', color: '#ccc' }}></i>
              <p>Üye bulunamadı</p>
            </div>
          )}
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Üye Düzenle</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label>Ad Soyad *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  placeholder="Ad Soyad"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="0555 555 55 55"
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                >
                  <option value="member">Üye</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* ✅ YENİ: Ödeme Durumu */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editFormData.hasPaid || false}
                    onChange={(e) => setEditFormData({ ...editFormData, hasPaid: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span>Üyelik aidatı ödendi</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  <i className='bx bx-save'></i> Kaydet
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  <i className='bx bx-x'></i> İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}