'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function DuesManagementSystem({ activeTab }) {
  const [dues, setDues] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalMembers: 0,
    paidDues: 0,
    unpaidDues: 0,
    totalAmount: 0,
    paymentRate: 0
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDue, setEditingDue] = useState(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    if (activeTab === 'dues') {
      fetchDues()
      fetchStats()
    }
  }, [activeTab, selectedYear])

  const fetchDues = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/dues/year/${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDues(data.data.duesStatus || [])
      } else {
        toast.error('Aidat kayıtları yüklenemedi')
      }
    } catch (error) {
      console.error('Fetch dues error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/dues/stats`, {
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

  const handleTogglePaid = async (due) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔄 Updating user hasPaid:', {
        userId: due.member._id,
        userName: due.member.name,
        currentStatus: due.isPaid,
        newStatus: !due.isPaid
      });
      
      const response = await fetch(`${API_URL}/users/${due.member._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hasPaid: !due.isPaid
        })
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Update successful:', result);
        toast.success(`✅ ${due.member.name} - Aidat durumu güncellendi`);
        fetchDues();
        fetchStats();
      } else {
        const error = await response.json();
        console.error('❌ Update failed:', error);
        toast.error(error.message || 'Güncelleme başarısız');
      }
    } catch (error) {
      console.error('❌ Toggle paid error:', error);
      toast.error('Bir hata oluştu');
    }
  };
  
  const handleEdit = (due) => {
    setEditingDue(due);
    setShowAddModal(true);
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('💾 Saving dues update:', {
        userId: editingDue.member._id,
        userName: editingDue.member.name,
        formData
      });
      
      const response = await fetch(`${API_URL}/users/${editingDue.member._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hasPaid: formData.isPaid
        })
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Save successful:', result);
        toast.success('✅ Aidat kaydı güncellendi');
        setShowAddModal(false);
        setEditingDue(null);
        fetchDues();
        fetchStats();
      } else {
        const error = await response.json();
        console.error('❌ Save failed:', error);
        toast.error(error.message || 'Güncelleme başarısız');
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const filteredDues = dues.filter(due => {
    if (filterStatus === 'paid' && !due.isPaid) return false
    if (filterStatus === 'unpaid' && due.isPaid) return false

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        due.member?.name?.toLowerCase().includes(searchLower) ||
        due.member?.email?.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  if (activeTab !== 'dues') return null

  return (
    <div className="admin-content-section">
      <div className="section-header">
        <div>
          <h2>💰 Aidat Takip Sistemi</h2>
          <p>Üye aidat ödemelerini takip edin ve yönetin</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#667eea20', color: '#667eea' }}>
            <i className='bx bx-user'></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalMembers}</h3>
            <p>Toplam Üye</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#28a74520', color: '#28a745' }}>
            <i className='bx bx-check-circle'></i>
          </div>
          <div className="stat-info">
            <h3>{stats.paidDues}</h3>
            <p>Ödeme Yapan</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dc354520', color: '#dc3545' }}>
            <i className='bx bx-x-circle'></i>
          </div>
          <div className="stat-info">
            <h3>{stats.unpaidDues}</h3>
            <p>Ödeme Yapmayan</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffc10720', color: '#ffc107' }}>
            <i className='bx bx-money'></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalAmount?.toLocaleString('tr-TR')}₺</h3>
            <p>Toplam Gelir</p>
            <span className="stat-change">%{stats.paymentRate} ödeme oranı</span>
          </div>
        </div>
      </div>

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
            Yıl
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
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
              fontSize: '14px'
            }}
          >
            <option value="all">Tümü</option>
            <option value="paid">Ödeyenler</option>
            <option value="unpaid">Ödemeyenler</option>
          </select>
        </div>

        <div style={{ flex: 2 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
            Ara
          </label>
          <input
            type="text"
            placeholder="İsim veya email ile ara..."
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

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Aidat kayıtları yükleniyor...</p>
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
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Üye Adı</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Yıl</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Tutar</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Durum</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Ödeme Tarihi</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredDues.length > 0 ? (
                filteredDues.map((due, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px' }}>{due.member?.name}</td>
                    <td style={{ padding: '15px', color: '#666' }}>{due.member?.email}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>{due.year}</td>
                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>
                      {due.amount}₺
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={due.isPaid}
                          onChange={() => handleTogglePaid(due)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: due.isPaid ? '#28a74520' : '#dc354520',
                          color: due.isPaid ? '#28a745' : '#dc3545'
                        }}>
                          {due.isPaid ? 'Ödendi' : 'Ödenmedi'}
                        </span>
                      </label>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                      {due.paidDate ? new Date(due.paidDate).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(due)}
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
                        <i className='bx bx-edit-alt'></i> Düzenle
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Filtreye uygun kayıt bulunamadı'
                      : 'Henüz aidat kaydı yok'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && editingDue && (
        <DuesEditModal
          due={editingDue}
          onClose={() => {
            setShowAddModal(false)
            setEditingDue(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

// ✅ GÜNCELLENMIŞ MODAL - 600₺
function DuesEditModal({ due, onClose, onSave }) {
  const [formData, setFormData] = useState({
    isPaid: due.isPaid || false,
    amount: due.amount || 600, // ✅ DEĞİŞTİ: 500 → 600
    paidDate: due.paidDate ? new Date(due.paidDate).toISOString().split('T')[0] : '',
    paymentMethod: due.paymentMethod || 'havale',
    notes: due.notes || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
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
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '700' }}>
          Aidat Kaydı Düzenle
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Üye: {due.member?.name}
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                style={{ width: '20px', height: '20px' }}
              />
              <span style={{ fontWeight: '600' }}>Ödendi olarak işaretle</span>
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Tutar (₺)
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
            />
          </div>

          {formData.isPaid && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Ödeme Tarihi
                </label>
                <input
                  type="date"
                  value={formData.paidDate}
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 15px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </div>

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
            </>
          )}

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
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}