'use client'
import { useState, useEffect } from 'react'

export default function SystemSettingsManagement({ activeTab, setActiveTab }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('general')
  const [systemStatus, setSystemStatus] = useState(null)
  const [testEmailAddress, setTestEmailAddress] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings()
      fetchSystemStatus()
    }
  }, [activeTab])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.data.settings)
      }
    } catch (error) {
      console.error('Ayarlar getirilirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemStatus = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/settings/system-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data.data)
      }
    } catch (error) {
      console.error('Sistem durumu getirilirken hata:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('Ayarlar başarıyla kaydedildi!')
      } else {
        alert('Kaydetme başarısız!')
      }
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error)
      alert('Bir hata oluştu!')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      alert('Lütfen bir email adresi girin')
      return
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/settings/test-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testEmail: testEmailAddress })
      })

      if (response.ok) {
        alert('Test email gönderildi!')
      } else {
        alert('Email gönderilemedi!')
      }
    } catch (error) {
      console.error('Test email hatası:', error)
      alert('Bir hata oluştu!')
    }
  }

  const handleBackup = async () => {
    if (!confirm('Yedekleme işlemini başlatmak istediğinize emin misiniz?')) return

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/settings/backup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Yedekleme başarıyla tamamlandı!')
        fetchSettings()
      } else {
        alert('Yedekleme başarısız!')
      }
    } catch (error) {
      console.error('Yedekleme hatası:', error)
      alert('Bir hata oluştu!')
    }
  }

  const updateSetting = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}g ${hours}s ${minutes}d`
  }

  const formatBytes = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  if (activeTab !== 'settings') return null

  if (loading) {
    return (
      <div className="admin-content-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Ayarlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-content-section">
      <div className="section-header">
        <div>
          <h2>Sistem Ayarları</h2>
          <p>Genel sistem yapılandırması ve yönetimi</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={fetchSettings}
          >
            <i className='bx bx-refresh'></i>
            Yenile
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <i className='bx bx-save'></i>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      <div className="settings-layout">
        {/* Settings Sidebar */}
        <div className="settings-sidebar">
          <button
            className={`settings-tab ${activeSection === 'general' ? 'active' : ''}`}
            onClick={() => setActiveSection('general')}
          >
            <i className='bx bx-cog'></i>
            <span>Genel Ayarlar</span>
          </button>
          <button
            className={`settings-tab ${activeSection === 'email' ? 'active' : ''}`}
            onClick={() => setActiveSection('email')}
          >
            <i className='bx bx-envelope'></i>
            <span>Email Ayarları</span>
          </button>
          <button
            className={`settings-tab ${activeSection === 'membership' ? 'active' : ''}`}
            onClick={() => setActiveSection('membership')}
          >
            <i className='bx bx-user-check'></i>
            <span>Üyelik Ayarları</span>
          </button>
          <button
            className={`settings-tab ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            <i className='bx bx-shield'></i>
            <span>Güvenlik</span>
          </button>
          <button
            className={`settings-tab ${activeSection === 'seo' ? 'active' : ''}`}
            onClick={() => setActiveSection('seo')}
          >
            <i className='bx bx-search'></i>
            <span>SEO Ayarları</span>
          </button>
          <button
            className={`settings-tab ${activeSection === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveSection('maintenance')}
          >
            <i className='bx bx-wrench'></i>
            <span>Bakım Modu</span>
          </button>
          <button
            className={`settings-tab ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <i className='bx bx-bell'></i>
            <span>Bildirimler</span>
          </button>
          <button
            className={`settings-tab ${activeSection === 'system' ? 'active' : ''}`}
            onClick={() => setActiveSection('system')}
          >
            <i className='bx bx-server'></i>
            <span>Sistem Durumu</span>
          </button>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          
          {/* Genel Ayarlar */}
          {activeSection === 'general' && settings?.general && (
            <div className="settings-section-content">
              <h3>Genel Bilgiler</h3>
              
              <div className="form-group">
                <label>Site Adı</label>
                <input
                  type="text"
                  value={settings.general.siteName || ''}
                  onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  placeholder="YÖMEGA"
                />
              </div>

              <div className="form-group">
                <label>Site Açıklaması</label>
                <textarea
                  value={settings.general.siteDescription || ''}
                  onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                  rows="3"
                  placeholder="Yükseköğretim Mesleki Gelişim Ağı"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>İletişim Email *</label>
                  <input
                    type="email"
                    value={settings.general.contactEmail || ''}
                    onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>İletişim Telefon</label>
                  <input
                    type="tel"
                    value={settings.general.contactPhone || ''}
                    onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Adres</label>
                <textarea
                  value={settings.general.address || ''}
                  onChange={(e) => updateSetting('general', 'address', e.target.value)}
                  rows="2"
                />
              </div>

              <h4 style={{ marginTop: '30px', marginBottom: '20px' }}>Sosyal Medya</h4>
              
              <div className="form-group">
                <label>
                  <i className='bx bxl-facebook-circle'></i> Facebook
                </label>
                <input
                  type="url"
                  value={settings.socialMedia?.facebook || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                  }))}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="form-group">
                <label>
                  <i className='bx bxl-twitter'></i> Twitter
                </label>
                <input
                  type="url"
                  value={settings.socialMedia?.twitter || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                  }))}
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div className="form-group">
                <label>
                  <i className='bx bxl-linkedin-square'></i> LinkedIn
                </label>
                <input
                  type="url"
                  value={settings.socialMedia?.linkedin || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                  }))}
                  placeholder="https://linkedin.com/..."
                />
              </div>

              <div className="form-group">
                <label>
                  <i className='bx bxl-instagram'></i> Instagram
                </label>
                <input
                  type="url"
                  value={settings.socialMedia?.instagram || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                  }))}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          )}

          {/* Email Ayarları */}
          {activeSection === 'email' && settings?.email && (
            <div className="settings-section-content">
              <h3>Email Yapılandırması</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>SMTP Sunucu</label>
                  <input
                    type="text"
                    value={settings.email.smtpHost || ''}
                    onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="form-group">
                  <label>SMTP Port</label>
                  <input
                    type="number"
                    value={settings.email.smtpPort || ''}
                    onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>SMTP Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={settings.email.smtpUser || ''}
                    onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>SMTP Şifre</label>
                  <input
                    type="password"
                    value={settings.email.smtpPassword || ''}
                    onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gönderici Email</label>
                  <input
                    type="email"
                    value={settings.email.senderEmail || ''}
                    onChange={(e) => updateSetting('email', 'senderEmail', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Gönderici Adı</label>
                  <input
                    type="text"
                    value={settings.email.senderName || ''}
                    onChange={(e) => updateSetting('email', 'senderName', e.target.value)}
                    placeholder="YÖMEGA"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.email.enableNotifications || false}
                    onChange={(e) => updateSetting('email', 'enableNotifications', e.target.checked)}
                  />
                  Email bildirimlerini aktif et
                </label>
              </div>

              <div className="test-email-section" style={{ 
                marginTop: '30px', 
                padding: '20px', 
                background: '#f8f9fa', 
                borderRadius: '8px' 
              }}>
                <h4>Test Email Gönder</h4>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="test@example.com"
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-outline" onClick={handleTestEmail}>
                    <i className='bx bx-send'></i> Gönder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Üyelik Ayarları */}
          {activeSection === 'membership' && settings?.membership && (
            <div className="settings-section-content">
              <h3>Üyelik Yapılandırması</h3>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.membership.autoApprove || false}
                    onChange={(e) => updateSetting('membership', 'autoApprove', e.target.checked)}
                  />
                  Yeni üyeleri otomatik onayla
                </label>
                <small>Kapalı ise yeni üyeler admin onayı bekleyecektir</small>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.membership.requireEmailVerification || false}
                    onChange={(e) => updateSetting('membership', 'requireEmailVerification', e.target.checked)}
                  />
                  Email doğrulama zorunlu olsun
                </label>
              </div>

              <h4 style={{ marginTop: '30px', marginBottom: '20px' }}>Şifre Politikası</h4>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Şifre Uzunluğu</label>
                  <input
                    type="number"
                    value={settings.membership.minPasswordLength || 6}
                    onChange={(e) => updateSetting('membership', 'minPasswordLength', parseInt(e.target.value))}
                    min="6"
                    max="20"
                  />
                </div>

                <div className="form-group">
                  <label>Session Timeout (dakika)</label>
                  <input
                    type="number"
                    value={settings.membership.sessionTimeout || 30}
                    onChange={(e) => updateSetting('membership', 'sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="120"
                  />
                  <small>Admin oturumu ne kadar süre sonra kapansın</small>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.membership.requireSpecialChar || false}
                    onChange={(e) => updateSetting('membership', 'requireSpecialChar', e.target.checked)}
                  />
                  Şifrede özel karakter zorunlu olsun
                </label>
              </div>
            </div>
          )}

          {/* Güvenlik Ayarları */}
          {activeSection === 'security' && settings?.security && (
            <div className="settings-section-content">
              <h3>Güvenlik Ayarları</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Maksimum Giriş Denemesi</label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts || 5}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                  />
                  <small>Bu sayıdan sonra hesap geçici olarak kilitlenir</small>
                </div>

                <div className="form-group">
                  <label>Kilitleme Süresi (dakika)</label>
                  <input
                    type="number"
                    value={settings.security.lockoutDuration || 15}
                    onChange={(e) => updateSetting('security', 'lockoutDuration', parseInt(e.target.value))}
                    min="5"
                    max="60"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.security.enableTwoFactor || false}
                    onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
                  />
                  İki faktörlü kimlik doğrulamayı aktif et (Yakında)
                </label>
              </div>

              <div className="form-group">
                <label>Engellenen IP Adresleri</label>
                <textarea
                  value={settings.security.blockedIPs?.join('\n') || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: {
                      ...prev.security,
                      blockedIPs: e.target.value.split('\n').filter(ip => ip.trim())
                    }
                  }))}
                  rows="5"
                  placeholder="Her satıra bir IP adresi&#10;192.168.1.1&#10;10.0.0.1"
                />
              </div>
            </div>
          )}

          {/* SEO Ayarları */}
          {activeSection === 'seo' && settings?.seo && (
            <div className="settings-section-content">
              <h3>SEO Yapılandırması</h3>
              
              <div className="form-group">
                <label>Meta Title</label>
                <input
                  type="text"
                  value={settings.seo.metaTitle || ''}
                  onChange={(e) => updateSetting('seo', 'metaTitle', e.target.value)}
                  maxLength="60"
                />
                <small>Tarayıcı sekmesinde ve arama sonuçlarında görünür (max 60 karakter)</small>
              </div>

              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  value={settings.seo.metaDescription || ''}
                  onChange={(e) => updateSetting('seo', 'metaDescription', e.target.value)}
                  rows="3"
                  maxLength="160"
                />
                <small>Arama sonuçlarında görünen açıklama (max 160 karakter)</small>
              </div>

              <div className="form-group">
                <label>Meta Keywords</label>
                <input
                  type="text"
                  value={settings.seo.metaKeywords?.join(', ') || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    seo: {
                      ...prev.seo,
                      metaKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    }
                  }))}
                  placeholder="anahtar kelime 1, anahtar kelime 2, anahtar kelime 3"
                />
                <small>Virgülle ayırın</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Google Analytics ID</label>
                  <input
                    type="text"
                    value={settings.seo.googleAnalyticsId || ''}
                    onChange={(e) => updateSetting('seo', 'googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div className="form-group">
                  <label>Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={settings.seo.facebookPixelId || ''}
                    onChange={(e) => updateSetting('seo', 'facebookPixelId', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.seo.enableSitemap || false}
                    onChange={(e) => updateSetting('seo', 'enableSitemap', e.target.checked)}
                  />
                  Sitemap otomatik oluşturulsun
                </label>
              </div>
            </div>
          )}

          {/* Bakım Modu */}
          {activeSection === 'maintenance' && settings?.maintenance && (
            <div className="settings-section-content">
              <h3>Bakım Modu</h3>
              
              <div className="alert-warning" style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <i className='bx bx-error' style={{ color: '#856404', marginRight: '10px' }}></i>
                <strong>Dikkat:</strong> Bakım modu aktif edildiğinde site normal kullanıcılara kapalı olacaktır!
              </div>

              <div className="form-group">
                <label className="checkbox-label" style={{ fontSize: '16px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={settings.maintenance.enabled || false}
                    onChange={(e) => updateSetting('maintenance', 'enabled', e.target.checked)}
                  />
                  Bakım modunu aktif et
                </label>
              </div>

              <div className="form-group">
                <label>Bakım Mesajı</label>
                <textarea
                  value={settings.maintenance.message || ''}
                  onChange={(e) => updateSetting('maintenance', 'message', e.target.value)}
                  rows="4"
                  placeholder="Sistemimiz şu anda bakımda. Lütfen daha sonra tekrar deneyin."
                />
              </div>

              <div className="form-group">
                <label>İzin Verilen IP Adresleri (Admin Erişimi)</label>
                <textarea
                  value={settings.maintenance.allowedIPs?.join('\n') || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    maintenance: {
                      ...prev.maintenance,
                      allowedIPs: e.target.value.split('\n').filter(ip => ip.trim())
                    }
                  }))}
                  rows="5"
                  placeholder="Her satıra bir IP adresi&#10;Bu IP'ler bakım modunda siteye erişebilir"
                />
              </div>
            </div>
          )}

          {/* Bildirimler */}
          {activeSection === 'notifications' && settings?.notifications && (
            <div className="settings-section-content">
              <h3>Bildirim Ayarları</h3>
              
              <div className="form-group">
                <label>Bildirim Email Adresi</label>
                <input
                  type="email"
                  value={settings.notifications.notificationEmail || ''}
                  onChange={(e) => updateSetting('notifications', 'notificationEmail', e.target.value)}
                  placeholder="admin@yomega.com"
                />
                <small>Tüm sistem bildirimleri bu adrese gönderilir</small>
              </div>

              <h4 style={{ marginTop: '30px', marginBottom: '20px' }}>Hangi durumlarda bildirim gönderilsin?</h4>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.newMemberNotify || false}
                    onChange={(e) => updateSetting('notifications', 'newMemberNotify', e.target.checked)}
                  />
                  Yeni üye kaydı olduğunda
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.newApplicationNotify || false}
                    onChange={(e) => updateSetting('notifications', 'newApplicationNotify', e.target.checked)}
                  />
                  Yeni başvuru geldiğinde
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.newNewsNotify || false}
                    onChange={(e) => updateSetting('notifications', 'newNewsNotify', e.target.checked)}
                  />
                  Yeni haber eklendiğinde
                </label>
              </div>
            </div>
          )}

          {/* Sistem Durumu */}
          {activeSection === 'system' && (
            <div className="settings-section-content">
              <h3>Sistem Durumu</h3>
              
              {systemStatus && (
                <>
                  <div className="system-status-grid">
                    <div className="status-card">
                      <i className='bx bx-server'></i>
                      <div>
                        <h4>Sunucu</h4>
                        <p className="status-value">{systemStatus.server.platform}</p>
                        <small>Node.js {systemStatus.server.nodeVersion}</small>
                      </div>
                    </div>

                    <div className="status-card">
                      <i className='bx bx-time'></i>
                      <div>
                        <h4>Çalışma Süresi</h4>
                        <p className="status-value">{formatUptime(systemStatus.server.uptime)}</p>
                      </div>
                    </div>

                    <div className="status-card">
                      <i className='bx bx-chip'></i>
                      <div>
                        <h4>Bellek Kullanımı</h4>
                        <p className="status-value">
                          {formatBytes(systemStatus.server.memory.heapUsed)}
                        </p>
                        <small>/ {formatBytes(systemStatus.server.memory.heapTotal)}</small>
                      </div>
                    </div>

                    <div className="status-card">
                      <i className='bx bx-data'></i>
                      <div>
                        <h4>Veritabanı</h4>
                        <p className="status-value">
                          {systemStatus.database.connected ? 'Bağlı' : 'Bağlı Değil'}
                        </p>
                        <span className={`status-indicator ${systemStatus.database.connected ? 'online' : 'offline'}`}>
                          {systemStatus.database.connected ? '● Online' : '● Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h4 style={{ marginTop: '40px', marginBottom: '20px' }}>Yedekleme</h4>

                  <div className="backup-section">
                    <div className="backup-info">
                      <div>
                        <p><strong>Son Yedekleme:</strong></p>
                        <p>
                          {settings?.system?.lastBackup 
                            ? new Date(settings.system.lastBackup).toLocaleString('tr-TR')
                            : 'Henüz yedek alınmamış'
                          }
                        </p>
                      </div>
                      <div>
                        <p><strong>Yedekleme Sıklığı:</strong></p>
                        <select
                          value={settings?.system?.backupFrequency || 'weekly'}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            system: {
                              ...prev.system,
                              backupFrequency: e.target.value
                            }
                          }))}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '2px solid #ddd' }}
                        >
                          <option value="daily">Günlük</option>
                          <option value="weekly">Haftalık</option>
                          <option value="monthly">Aylık</option>
                        </select>
                      </div>
                    </div>

                    <button className="btn btn-primary" onClick={handleBackup}>
                      <i className='bx bx-cloud-download'></i>
                      Manuel Yedek Al
                    </button>
                  </div>

                  <h4 style={{ marginTop: '40px', marginBottom: '20px' }}>Log Ayarları</h4>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings?.system?.enableLogs || false}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          system: {
                            ...prev.system,
                            enableLogs: e.target.checked
                          }
                        }))}
                      />
                      Sistem loglarını kaydet
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Log Saklama Süresi (gün)</label>
                    <input
                      type="number"
                      value={settings?.system?.logRetentionDays || 30}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        system: {
                          ...prev.system,
                          logRetentionDays: parseInt(e.target.value)
                        }
                      }))}
                      min="7"
                      max="365"
                    />
                    <small>Bu süreden eski loglar otomatik silinir</small>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}