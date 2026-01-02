'use client'
import { useState } from 'react'

export default function SystemSettingsManagement({ activeTab }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    // Validasyon
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Tüm alanları doldurun!' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor!' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalı!' })
      return
    }

    try {
      setLoading(true)
      setMessage({ type: '', text: '' })

      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      const response = await fetch(`${API_URL}/admin/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi!' })
        // Formu temizle
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ type: 'error', text: data.message || 'Şifre değiştirilemedi!' })
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error)
      setMessage({ type: 'error', text: 'Bir hata oluştu!' })
    } finally {
      setLoading(false)
    }
  }

  if (activeTab !== 'settings') return null

  return (
    <div className="admin-content-section">
      <div className="section-header">
        <div>
          <h2>Sistem Ayarları</h2>
          <p>Admin şifrenizi buradan değiştirebilirsiniz</p>
        </div>
      </div>

      <div className="settings-content" style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        padding: '30px'
      }}>
        <div className="password-change-card" style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '30px' 
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '36px',
              color: '#fff'
            }}>
              <i className='bx bx-lock-alt'></i>
            </div>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#2d3748' }}>
              Şifre Değiştir
            </h3>
            <p style={{ color: '#718096', marginTop: '8px' }}>
              Hesabınızın güvenliği için güçlü bir şifre seçin
            </p>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`} style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              background: message.type === 'success' ? '#d4edda' : '#f8d7da',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              color: message.type === 'success' ? '#155724' : '#721c24',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <i className={`bx ${message.type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}`}></i>
              {message.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                Mevcut Şifre
              </label>
              <div style={{ position: 'relative' }}>
                <i className='bx bx-lock' style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a0aec0',
                  fontSize: '20px'
                }}></i>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mevcut şifrenizi girin"
                  style={{
                    width: '100%',
                    padding: '12px 15px 12px 45px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                Yeni Şifre
              </label>
              <div style={{ position: 'relative' }}>
                <i className='bx bx-key' style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a0aec0',
                  fontSize: '20px'
                }}></i>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yeni şifrenizi girin"
                  style={{
                    width: '100%',
                    padding: '12px 15px 12px 45px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>
              <small style={{ 
                display: 'block', 
                marginTop: '6px', 
                color: '#718096',
                fontSize: '13px'
              }}>
                En az 6 karakter olmalı
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                Yeni Şifre (Tekrar)
              </label>
              <div style={{ position: 'relative' }}>
                <i className='bx bx-check-shield' style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a0aec0',
                  fontSize: '20px'
                }}></i>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifrenizi tekrar girin"
                  style={{
                    width: '100%',
                    padding: '12px 15px 12px 45px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.transform = 'translateY(0)'
              }}
            >
              {loading ? (
                <>
                  <i className='bx bx-loader-alt bx-spin'></i>
                  Değiştiriliyor...
                </>
              ) : (
                <>
                  <i className='bx bx-save'></i>
                  Şifreyi Değiştir
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '30px',
            padding: '15px',
            background: '#edf2f7',
            borderRadius: '8px',
            borderLeft: '4px solid #4299e1'
          }}>
            <h4 style={{ 
              margin: '0 0 10px 0', 
              fontSize: '14px',
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className='bx bx-info-circle'></i>
              Güvenlik İpuçları
            </h4>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '20px',
              color: '#4a5568',
              fontSize: '13px',
              lineHeight: '1.8'
            }}>
              <li>Şifreniz en az 6 karakter uzunluğunda olmalı</li>
              <li>Büyük-küçük harf, rakam ve özel karakter kullanın</li>
              <li>Tahmin edilmesi kolay kelimelerden kaçının</li>
              <li>Şifrenizi düzenli olarak değiştirin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}