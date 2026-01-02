'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function DonationManagementSystem({ activeTab }) {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterPurpose, setFilterPurpose] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: { amount: 0, count: 0 },
    thisYear: { amount: 0, count: 0 },
    thisMonth: { amount: 0, count: 0 }
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDonation, setEditingDonation] = useState(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    if (activeTab === 'donations') {
      fetchDonations()
      fetchStats()
    }
  }, [activeTab])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/donations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDonations(data.data.donations || [])
      } else {
        toast.error('Bağış kayıtları yüklenemedi')
      }
    } catch (error) {
      console.error('Fetch donations error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/donations/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu bağış kaydını silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/donations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Bağış kaydı silindi')
        fetchDonations()
        fetchStats()
      } else {
        toast.error('Silme başarısız')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Bir hata oluştu')
    }
  }

  const handleEdit = (donation) => {
    setEditingDonation(donation)
    setShowAddModal(true)
  }

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token')

      if (editingDonation) {
        // Güncelle
        const response = await fetch(`${API_URL}/donations/${editingDonation._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          toast.success('Bağış kaydı güncellendi')
          setShowAddModal(false)
          setEditingDonation(null)
          fetchDonations()
          fetchStats()
        } else {
          toast.error('Güncelleme başarısız')
        }
      } else {
        // Yeni oluştur
        const response = await fetch(`${API_URL}/donations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          toast.success('Bağış kaydı oluşturuldu')
          setShowAddModal(false)
          fetchDonations()
          fetchStats()
        } else {
          const error = await response.json()
          toast.error(error.message || 'Kayıt oluşturulamadı')
        }
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Bir hata oluştu')
    }
  }

  // Filtreleme
  const filteredDonations = donations.filter(donation => {
    // Amaç filtresi
    if (filterPurpose !== 'all' && donation.purpose !== filterPurpose) return false

    // Arama filtresi
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        donation.donorName?.toLowerCase().includes(searchLower) ||
        donation.donorEmail?.toLowerCase().includes(searchLower) ||
        donation.purposeDetail?.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  const purposeMap = {
    'genel': 'Genel Bağış',
    'proje': 'Proje Desteği',
    'etkinlik': 'Etkinlik Sponsorluğu',
    'eğitim': 'Eğitim Desteği',
    'diğer': 'Diğer'
  }

  if (activeTab !== 'donations') return null

  return (
    <div className="admin-content-section">
      <div className="section-header">
        <div>
          <h2>❤️ Bağış Takip Sistemi</h2>
          <p>Derneğe yapılan bağışları kaydedin ve takip edin</p>
        </div>
        <button
          onClick={() => {
            setEditingDonation(null)
            setShowAddModal(true)
          }}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className='bx bx-plus'></i>
          Yeni Bağış Kaydı
        </button>
      </div>

      {/* İstatistikler */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#667eea20', color: '#667eea' }}>
            <i className='bx bx-heart'></i>
          </div>
          <div className="stat-info">
            <h3>{stats.total?.amount?.toLocaleString('tr-TR')}₺</h3>
            <p>Toplam Bağış</p>
            <span className="stat-change">{stats.total?.count} bağış</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#28a74520', color: '#28a745' }}>
            <i className='bx bx-calendar'></i>
          </div>
          <div className="stat-info">
            <h3>{stats.thisYear?.amount?.toLocaleString('tr-TR')}₺</h3>
            <p>Bu Yıl</p>
            <span className="stat-change">{stats.thisYear?.count} bağış</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffc10720', color: '#ffc107' }}>
            <i className='bx bx-time'></i>
          </div>
          <div className="stat-info">
            <h3>{stats.thisMonth?.amount?.toLocaleString('tr-TR')}₺</h3>
            <p>Bu Ay</p>
            <span className="stat-change">{stats.thisMonth?.count} bağış</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#17a2b820', color: '#17a2b8' }}>
            <i className='bx bx-trending-up'></i>
          </div>
          <div className="stat-info">
            <h3>
              {stats.thisYear?.count > 0 
                ? Math.round(stats.thisYear.amount / stats.thisYear.count).toLocaleString('tr-TR')
                : 0
              }₺
            </h3>
            <p>Ortalama Bağış</p>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="filter-bar" style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '25px',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
            Bağış Amacı
          </label>
          <select
            value={filterPurpose}
            onChange={(e) => setFilterPurpose(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="all">Tümü</option>
            <option value="genel">Genel Bağış</option>
            <option value="proje">Proje Desteği</option>
            <option value="etkinlik">Etkinlik Sponsorluğu</option>
            <option value="eğitim">Eğitim Desteği</option>
            <option value="diğer">Diğer</option>
          </select>
        </div>

        <div style={{ flex: 2 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
            Ara
          </label>
          <input
            type="text"
            placeholder="Bağışçı adı, email veya açıklama ile ara..."
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

      {/* Tablo */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Bağış kayıtları yükleniyor...</p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Bağışçı</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>İletişim</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Tutar</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Tarih</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Amaç</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Ödeme</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.length > 0 ? (
                filteredDonations.map((donation) => (
                  <tr key={donation._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: donation.isAnonymous 
                            ? 'linear-gradient(135deg, #999 0%, #666 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '16px'
                        }}>
                          {donation.isAnonymous ? '?' : donation.donorName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600' }}>
                            {donation.isAnonymous ? 'Anonim Bağışçı' : donation.donorName}
                          </div>
                          {donation.isAnonymous && (
                            <span style={{ 
                              fontSize: '11px', 
                              color: '#999',
                              fontStyle: 'italic'
                            }}>
                              Gizli
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px', color: '#666', fontSize: '14px' }}>
                      {donation.isAnonymous ? (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>-</span>
                      ) : (
                        <>
                          {donation.donorEmail && <div>{donation.donorEmail}</div>}
                          {donation.donorPhone && <div>{donation.donorPhone}</div>}
                        </>
                      )}
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center', 
                      fontWeight: '700',
                      fontSize: '16px',
                      color: '#28a745'
                    }}>
                      {donation.amount.toLocaleString('tr-TR')}₺
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                      {new Date(donation.donationDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: '#667eea20',
                        color: '#667eea'
                      }}>
                        {purposeMap[donation.purpose]}
                      </span>
                      {donation.purposeDetail && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#999', 
                          marginTop: '4px',
                          maxWidth: '150px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {donation.purposeDetail}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
                      {donation.paymentMethod === 'nakit' && '💵 Nakit'}
                      {donation.paymentMethod === 'havale' && '🏦 Havale/EFT'}
                      {donation.paymentMethod === 'kredi kartı' && '💳 Kredi Kartı'}
                      {donation.paymentMethod === 'diğer' && '📝 Diğer'}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(donation)}
                          style={{
                            padding: '6px 12px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          <i className='bx bx-edit-alt'></i>
                        </button>
                        <button
                          onClick={() => handleDelete(donation._id)}
                          style={{
                            padding: '6px 12px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          <i className='bx bx-trash'></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    {searchTerm || filterPurpose !== 'all' 
                      ? 'Filtreye uygun kayıt bulunamadı'
                      : 'Henüz bağış kaydı yok'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Ekleme/Düzenleme Modalı */}
      {showAddModal && (
        <DonationModal
          donation={editingDonation}
          onClose={() => {
            setShowAddModal(false)
            setEditingDonation(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

// Bağış Modal Component
function DonationModal({ donation, onClose, onSave }) {
  const [formData, setFormData] = useState({
    donorName: donation?.donorName || '',
    donorEmail: donation?.donorEmail || '',
    donorPhone: donation?.donorPhone || '',
    amount: donation?.amount || '',
    donationDate: donation?.donationDate 
      ? new Date(donation.donationDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    purpose: donation?.purpose || 'genel',
    purposeDetail: donation?.purposeDetail || '',
    paymentMethod: donation?.paymentMethod || 'havale',
    isAnonymous: donation?.isAnonymous || false,
    notes: donation?.notes || '',
    receiptIssued: donation?.receiptIssued || false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Geçerli bir tutar girin')
      return
    }

    if (!formData.isAnonymous && !formData.donorName) {
      toast.error('Bağışçı adı gereklidir')
      return
    }

    onSave(formData)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '700' }}>
          {donation ? 'Bağış Kaydı Düzenle' : 'Yeni Bağış Kaydı'}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Anonim Bağış */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  isAnonymous: e.target.checked,
                  donorName: e.target.checked ? 'Anonim' : '',
                  donorEmail: e.target.checked ? '' : formData.donorEmail,
                  donorPhone: e.target.checked ? '' : formData.donorPhone
                })}
                style={{ width: '20px', height: '20px' }}
              />
              <span style={{ fontWeight: '600' }}>Anonim Bağış</span>
            </label>
          </div>

          {!formData.isAnonymous && (
            <>
              {/* Bağışçı Adı */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Bağışçı Adı *
                </label>
                <input
                  type="text"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 15px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  required={!formData.isAnonymous}
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.donorEmail}
                  onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 15px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  placeholder="ahmet@example.com"
                />
              </div>

              {/* Telefon */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.donorPhone}
                  onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 15px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  placeholder="0555 123 4567"
                />
              </div>
            </>
          )}

          {/* Tutar */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Bağış Tutarı (₺) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}
              required
              min="1"
              placeholder="500"
            />
          </div>

          {/* Tarih */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Bağış Tarihi *
            </label>
            <input
              type="date"
              value={formData.donationDate}
              onChange={(e) => setFormData({ ...formData, donationDate: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}
              required
            />
          </div>

          {/* Amaç */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Bağış Amacı
            </label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}
            >
              <option value="genel">Genel Bağış</option>
              <option value="proje">Proje Desteği</option>
              <option value="etkinlik">Etkinlik Sponsorluğu</option>
              <option value="eğitim">Eğitim Desteği</option>
              <option value="diğer">Diğer</option>
            </select>
          </div>

          {/* Amaç Detayı */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Amaç Detayı
            </label>
            <input
              type="text"
              value={formData.purposeDetail}
              onChange={(e) => setFormData({ ...formData, purposeDetail: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}
              placeholder="Ör: AI Workshop için bağış"
            />
          </div>

          {/* Ödeme Yöntemi */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Ödeme Yöntemi
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}
            >
              <option value="nakit">Nakit</option>
              <option value="havale">Havale/EFT</option>
              <option value="kredi kartı">Kredi Kartı</option>
              <option value="diğer">Diğer</option>
            </select>
          </div>

          {/* Makbuz */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.receiptIssued}
                onChange={(e) => setFormData({ ...formData, receiptIssued: e.target.checked })}
                style={{ width: '20px', height: '20px' }}
              />
              <span style={{ fontWeight: '600' }}>Makbuz Düzenlendi</span>
            </label>
          </div>

          {/* Notlar */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                resize: 'vertical'
              }}
              placeholder="Ek notlar..."
            />
          </div>

          {/* Butonlar */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              İptal
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {donation ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}