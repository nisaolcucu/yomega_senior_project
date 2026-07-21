'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('login')
  const [isLoading, setIsLoading] = useState(false)

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false) // ← YENİ
  const [registerData, setRegisterData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    fatherName: '',
    motherName: '',
    birthPlace: '',
    birthDate: '',
    tcNo: '',
    profession: '',
    bloodType: '',
    homePhone: '',
    workPhone: '',
    phone: '',
    educationLevel: '',
    registeredCity: '',
    registeredDistrict: '',
    registeredNeighborhood: '',
    residenceAddress: '',
    workAddress: ''
  })
  const [adminData, setAdminData] = useState({ username: '', password: '' })

  // API Base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
  }

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    })
  }

  const handleAdminChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value
    })
  }

  // BACKEND'E BAĞLI LOGIN FONKSİYONU
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!loginData.email || !loginData.password) {
      alert('Lütfen e-posta ve şifrenizi giriniz.')
      setIsLoading(false)
      return
    }

    try {
      console.log('🔐 Login isteği gönderiliyor:', loginData.email)

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      })

      console.log('📡 Response status:', response.status)
      const result = await response.json()
      console.log('📦 Response data:', result)

      if (result.success) {
        console.log('✅ Login başarılı:', result.data.user);
        console.log('💳 hasPaid:', result.data.user.hasPaid);

        if (typeof window !== 'undefined') {
          const storage = rememberMe ? localStorage : sessionStorage;

          if (result.data.user.role === 'admin') {
            // Admin her zaman sessionStorage
            sessionStorage.setItem('token', result.data.token);
            sessionStorage.setItem('user', JSON.stringify(result.data.user));
            console.log('💾 Admin sessionStorage\'a kaydedildi');
          } else {
            // Normal üye: kullanıcı seçimine göre
            storage.setItem('token', result.data.token);
            storage.setItem('user', JSON.stringify(result.data.user));
            console.log('💾 User', rememberMe ? 'localStorage' : 'sessionStorage', 'a kaydedildi');
            console.log('👤 Kaydedilen user:', JSON.parse(storage.getItem('user')));
          }
        }

        alert('Giriş başarılı!');
        if (result.data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/uye-panel');
        }
      } else {
        alert(result.message || 'Giriş başarısız!');
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      alert('Sunucuya bağlanırken hata oluştu. Backend çalışıyor mu kontrol edin.')
    } finally {
      setIsLoading(false)
    }
  }

  // BACKEND'E BAĞLI REGISTER FONKSİYONU
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!registerData.name || !registerData.surname || !registerData.email ||
      !registerData.password || !registerData.confirmPassword) {
      alert('Lütfen zorunlu alanları doldurunuz (Ad, Soyad, E-posta, Şifre).')
      setIsLoading(false)
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      alert('Şifreler eşleşmiyor.')
      setIsLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır.')
      setIsLoading(false)
      return
    }

    try {
      console.log('🔐 Register isteği gönderiliyor:', registerData.email)

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.name,
          surname: registerData.surname,
          email: registerData.email,
          password: registerData.password,
          fatherName: registerData.fatherName || '',
          motherName: registerData.motherName || '',
          birthPlace: registerData.birthPlace || '',
          birthDate: registerData.birthDate || '',
          tcNo: registerData.tcNo || '',
          profession: registerData.profession || '',
          bloodType: registerData.bloodType || '',
          homePhone: registerData.homePhone || '',
          workPhone: registerData.workPhone || '',
          phone: registerData.phone || '',
          educationLevel: registerData.educationLevel || '',
          registeredCity: registerData.registeredCity || '',
          registeredDistrict: registerData.registeredDistrict || '',
          registeredNeighborhood: registerData.registeredNeighborhood || '',
          residenceAddress: registerData.residenceAddress || '',
          workAddress: registerData.workAddress || '',
          university: registerData.educationLevel || '',
          department: registerData.profession || '',
          expertise: registerData.profession ? [registerData.profession] : []
        })
      })

      console.log('📡 Register response status:', response.status)
      const result = await response.json()
      console.log('📦 Register response data:', result)

      if (result.success) {
        // ✅ YENİ: PDF varsa indir
        if (result.data.pdfUrl) {
          console.log('📄 PDF indiriliyor:', result.data.pdfUrl)

          // PDF'i otomatik indir
          // ✅ DÜZELTME: /api prefix'i kaldır
          const pdfDownloadUrl = `${API_URL.replace('/api', '')}${result.data.pdfUrl}`

          // Yeni sekmede aç (tarayıcı otomatik indirecek)
          const link = document.createElement('a')
          link.href = pdfDownloadUrl
          link.download = `uyelik-formu-${registerData.name.replace(/\s/g, '-')}.pdf`
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          console.log('✅ PDF indirme başlatıldı')
        }

        // ✅ YENİ: Başarı mesajı ve yönlendirme
        alert('✅ Kayıt başarılı!\n\n📄 Üyelik formunuz indiriliyor.\n⏳ Admin onayından sonra giriş yapabilirsiniz.\n✍️ Formu imzalayıp üye panelinizden yükleyiniz.')

        // Formu temizle
        setRegisterData({
          name: '',
          surname: '',
          email: '',
          password: '',
          confirmPassword: '',
          fatherName: '',
          motherName: '',
          birthPlace: '',
          birthDate: '',
          tcNo: '',
          profession: '',
          bloodType: '',
          homePhone: '',
          workPhone: '',
          phone: '',
          educationLevel: '',
          registeredCity: '',
          registeredDistrict: '',
          registeredNeighborhood: '',
          residenceAddress: '',
          workAddress: ''
        })

        // Login sekmesine geç
        setActiveTab('login')

      } else {
        alert(result.message || 'Kayıt sırasında hata oluştu')
      }
    } catch (error) {
      console.error('❌ Register error:', error)
      alert('Sunucuya bağlanırken hata oluştu. Backend çalışıyor mu kontrol edin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminData.username,
          password: adminData.password
        })
      })

      const result = await response.json()

      if (result.success && result.data.user.role === 'admin') {
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('admin', JSON.stringify({
          ...result.data.user,
          isAdmin: true,
          isLoggedIn: true,
          username: 'admin'
        }))

        router.push('/admin/dashboard')
      } else {
        alert('Admin yetkisi yok veya giriş başarısız')
      }
    } catch (error) {
      console.error('Admin login error:', error)
      alert('Giriş sırasında hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    const email = prompt('Şifre sıfırlama bağlantısı göndermek için e-posta adresinizi giriniz:')
    if (email) {
      alert(`${email} adresine şifre sıfırlama bağlantısı gönderildi.`)
    }
  }

  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-image"></div>
        <div className="auth-form-container">
          {/* Tab başlıkları */}
          <div className="auth-tabs">
            <button
              className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('login')}
            >
              Giriş Yap
            </button>
            <button
              className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('register')}
            >
              Üye Ol
            </button>
            <button
              className={`auth-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('admin')}
            >
              Yönetici Girişi
            </button>
          </div>

          {/* Giriş yap formu */}
          <div className={`auth-form ${activeTab === 'login' ? 'active' : ''}`}>
            <h2>Giriş Yap</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="email">E-posta</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Şifre</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  disabled={isLoading}
                  required
                />
                <a href="#" className="forgot-password" onClick={handleForgotPassword}>
                  Şifremi Unuttum
                </a>
              </div>
              {/* YENİ: Beni Hatırla Checkbox */}
              {/* Beni Hatırla Checkbox */}
              <div className="form-group" style={{ marginTop: '10px', marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#666'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--main-color)'
                    }}
                  />
                  Beni Hatırla
                </label>
              </div>
              <div className="form-group">
                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>
              </div>
            </form>
            <div className="auth-switch">
              Henüz üye değil misiniz?
              <a href="#" onClick={(e) => { e.preventDefault(); handleTabSwitch('register') }}>
                Hemen üye olun
              </a>
            </div>
          </div>

          {/* Üye ol formu */}
          <div className={`auth-form ${activeTab === 'register' ? 'active' : ''}`}>
            <h2>Üye Ol</h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', textAlign: 'center' }}>
              Lütfen tüm alanları eksiksiz doldurunuz. (*) işaretli alanlar zorunludur.
            </p>

            <form onSubmit={handleRegisterSubmit} style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>

              {/* Kişisel Bilgiler */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--main-color)', marginBottom: '15px', borderBottom: '2px solid var(--main-color)', paddingBottom: '8px' }}>
                  📋 Kişisel Bilgiler
                </h3>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="reg-name">Adı *</label>
                    <input
                      type="text"
                      id="reg-name"
                      name="name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-surname">Soyadı *</label>
                    <input
                      type="text"
                      id="reg-surname"
                      name="surname"
                      value={registerData.surname}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="reg-fatherName">Baba Adı</label>
                    <input
                      type="text"
                      id="reg-fatherName"
                      name="fatherName"
                      value={registerData.fatherName}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-motherName">Anne Adı</label>
                    <input
                      type="text"
                      id="reg-motherName"
                      name="motherName"
                      value={registerData.motherName}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="reg-birthPlace">Doğum Yeri</label>
                    <input
                      type="text"
                      id="reg-birthPlace"
                      name="birthPlace"
                      value={registerData.birthPlace}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-birthDate">Doğum Tarihi</label>
                    <input
                      type="date"
                      id="reg-birthDate"
                      name="birthDate"
                      value={registerData.birthDate}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="reg-tcNo">T.C. Kimlik No</label>
                    <input
                      type="text"
                      id="reg-tcNo"
                      name="tcNo"
                      maxLength="11"
                      value={registerData.tcNo}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-bloodType">Kan Grubu</label>
                    <select
                      id="reg-bloodType"
                      name="bloodType"
                      value={registerData.bloodType}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid #ddd',
                        fontSize: '15px'
                      }}
                    >
                      <option value="">Seçiniz</option>
                      <option value="A+">A Rh+</option>
                      <option value="A-">A Rh-</option>
                      <option value="B+">B Rh+</option>
                      <option value="B-">B Rh-</option>
                      <option value="AB+">AB Rh+</option>
                      <option value="AB-">AB Rh-</option>
                      <option value="0+">0 Rh+</option>
                      <option value="0-">0 Rh-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--main-color)', marginBottom: '15px', borderBottom: '2px solid var(--main-color)', paddingBottom: '8px' }}>
                  📞 İletişim Bilgileri
                </h3>

                <div className="form-group">
                  <label htmlFor="reg-email">E-posta *</label>
                  <input
                    type="email"
                    id="reg-email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="reg-homePhone">Ev Telefonu</label>
                    <input
                      type="tel"
                      id="reg-homePhone"
                      name="homePhone"
                      value={registerData.homePhone}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-workPhone">İş Telefonu</label>
                    <input
                      type="tel"
                      id="reg-workPhone"
                      name="workPhone"
                      value={registerData.workPhone}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-phone">Cep Telefonu</label>
                    <input
                      type="tel"
                      id="reg-phone"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Meslek ve Eğitim */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--main-color)', marginBottom: '15px', borderBottom: '2px solid var(--main-color)', paddingBottom: '8px' }}>
                  🎓 Meslek ve Eğitim
                </h3>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="reg-profession">Mesleği</label>
                    <input
                      type="text"
                      id="reg-profession"
                      name="profession"
                      value={registerData.profession}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      placeholder="Örn: Öğretim Görevlisi"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-educationLevel">Öğrenim Durumu</label>
                    <input
                      type="text"
                      id="reg-educationLevel"
                      name="educationLevel"
                      value={registerData.educationLevel}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      placeholder="Örn: Yüksek Lisans"
                    />
                  </div>
                </div>
              </div>

              {/* Adres Bilgileri */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--main-color)', marginBottom: '15px', borderBottom: '2px solid var(--main-color)', paddingBottom: '8px' }}>
                  📍 Adres Bilgileri
                </h3>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="reg-registeredCity">Nüfusa Kayıtlı İl</label>
                    <input
                      type="text"
                      id="reg-registeredCity"
                      name="registeredCity"
                      value={registerData.registeredCity}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-registeredDistrict">İlçe</label>
                    <input
                      type="text"
                      id="reg-registeredDistrict"
                      name="registeredDistrict"
                      value={registerData.registeredDistrict}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-registeredNeighborhood">Mahalle</label>
                    <input
                      type="text"
                      id="reg-registeredNeighborhood"
                      name="registeredNeighborhood"
                      value={registerData.registeredNeighborhood}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-residenceAddress">İkamet Adresi</label>
                  <textarea
                    id="reg-residenceAddress"
                    name="residenceAddress"
                    value={registerData.residenceAddress}
                    onChange={handleRegisterChange}
                    disabled={isLoading}
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #ddd',
                      fontSize: '15px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-workAddress">İş Adresi</label>
                  <textarea
                    id="reg-workAddress"
                    name="workAddress"
                    value={registerData.workAddress}
                    onChange={handleRegisterChange}
                    disabled={isLoading}
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #ddd',
                      fontSize: '15px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {/* Şifre */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--main-color)', marginBottom: '15px', borderBottom: '2px solid var(--main-color)', paddingBottom: '8px' }}>
                  🔒 Güvenlik
                </h3>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="reg-password">Şifre * (En az 6 karakter)</label>
                    <input
                      type="password"
                      id="reg-password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-confirm-password">Şifre Tekrar *</label>
                    <input
                      type="password"
                      id="reg-confirm-password"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? 'Kayıt yapılıyor...' : '✅ Kayıt Ol ve Formu İndir'}
                </button>
              </div>
            </form>

            <div className="auth-switch">
              Zaten üye misiniz?
              <a href="#" onClick={(e) => { e.preventDefault(); handleTabSwitch('login') }}>
                Giriş yapın
              </a>
            </div>
          </div>

          {/* Yönetici girişi formu */}
          <div className={`auth-form ${activeTab === 'admin' ? 'active' : ''}`}>
            <h2>Yönetici Girişi</h2>
            <form onSubmit={handleAdminSubmit}>
              <div className="form-group">
                <label htmlFor="admin-username">E-posta</label>
                <input
                  type="email"
                  id="admin-username"
                  name="username"
                  value={adminData.username}
                  onChange={handleAdminChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="admin-password">Şifre</label>
                <input
                  type="password"
                  id="admin-password"
                  name="password"
                  value={adminData.password}
                  onChange={handleAdminChange}
                  required
                />
              </div>
              <div className="form-group">
                <button type="submit" className="auth-button">Giriş Yap</button>
              </div>
            </form>
            <div className="auth-switch">
              <small style={{ color: '#999', fontSize: '13px' }}>
                {/* Demo Giriş Bilgileri: admin / admin123 */}
              </small>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
