'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotificationsContent from '@/components/NotificationsContent'
import MessagesTab from '@/components/MessagesTab'
import MemberFormUpload from '@/components/MemberFormUpload' // ✅ YENİ

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userPrograms, setUserPrograms] = useState({
    upcoming: [],
    past: [],
    completed: [],
    total: 0
  });
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [cancelingEvent, setCancelingEvent] = useState(null);

  const [userResources, setUserResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [formStatus, setFormStatus] = useState(null) // ✅ YENİ

  // API Base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userDataStored = localStorage.getItem('user') || sessionStorage.getItem('user');

      console.log('🔄 Auth kontrolü yapılıyor...');
      console.log('Token var mı:', !!token);
      console.log('User data var mı:', !!userDataStored);

      if (!token || !userDataStored) {
        console.log('❌ Token veya user data yok, giriş sayfasına yönlendiriliyor');
        router.push('/uyelik-giris');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Backend\'den profil bilgileri alınıyor...');
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        console.log('📡 Profile response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('📦 Profile data:', result);

          if (result.success) {
            setIsAuthenticated(true);
            setUserData(result.data.user);
            console.log('✅ Kullanıcı doğrulandı:', result.data.user.name);
          } else {
            console.log('❌ Profile response başarısız:', result.message);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/uyelik-giris');
          }
        } else {
          console.log('❌ Profile request başarısız, status:', response.status);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/uyelik-giris');
        }
      } catch (error) {
        console.error('❌ Auth kontrolü hatası:', error);
        try {
          const user = JSON.parse(userDataStored);
          setIsAuthenticated(true);
          setUserData(user);
          console.log('⚠️ Offline mode: localStorage verisi kullanılıyor');
        } catch (parseError) {
          console.error('❌ LocalStorage parse hatası:', parseError);
          router.push('/uyelik-giris');
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (userData) {
      setEditFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
      });

      fetchUserPrograms();
      fetchUserResources();
      fetchUnreadCounts(); // ← YENİ
      fetchFormStatus(); // ✅ YENİ EKLE
    }
  }, [userData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        const result = await response.json();
        setUserData(result.data.user);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        alert('Profil başarıyla güncellendi!');
        setIsEditingProfile(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Güncelleme başarısız!');
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      alert('Bir hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor!');
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        alert('Şifre başarıyla değiştirildi!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        alert(error.message || 'Şifre değiştirme başarısız!');
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      alert('Bir hata oluştu!');
    }
  };

  const fetchUserPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(`${API_URL}/programs/my-programs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUserPrograms(result.data);
      }
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata:', error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchUserResources = async () => {
    try {
      setLoadingResources(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(`${API_URL}/resources/my-resources`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.resources) {
          setUserResources(result.data.resources);
        } else {
          setUserResources([]);
        }
      }
    } catch (error) {
      console.error('Kaynaklar yüklenirken hata:', error);
    } finally {
      setLoadingResources(false);
    }
  };

  // ✅ YENİ: Form durumunu getir
  const fetchFormStatus = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await fetch(`${API_URL}/membership-forms/my-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setFormStatus(data.data.formInfo)
      }
    } catch (error) {
      console.error('Form durumu yüklenirken hata:', error)
    }
  }

  const fetchUnreadCounts = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      // Mesajlar
      const messagesResponse = await fetch(`${API_URL}/messages/my-messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json()
        setUnreadMessages(messagesData.data.unreadCount || 0)
      }

      // Bildirimler
      const notificationsResponse = await fetch(`${API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setUnreadNotifications(notificationsData.data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Okunmamış sayılar yüklenirken hata:', error)
    }
  };

  const handleCancelRegistration = async (programId, programTitle) => {
    if (!confirm(`"${programTitle}" etkinliğinden kaydınızı iptal etmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setCancelingEvent(programId);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(`${API_URL}/programs/${programId}/unregister`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('✅ Etkinlik kaydınız başarıyla iptal edildi');
        fetchUserPrograms();
      } else {
        const error = await response.json();
        alert(`❌ ${error.message}`);
      }
    } catch (error) {
      console.error('Kayıt iptal hatası:', error);
      alert('❌ Bir hata oluştu');
    } finally {
      setCancelingEvent(null);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error('Logout hatası:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    router.push('/');
  };

  const userEvents = [
    { id: 1, title: 'Yapay Zeka ve Eğitim Sempozyumu', date: '15 Mayıs 2025', status: 'Katılacak', location: 'Online' },
    { id: 2, title: 'YÖMEGA Yıllık Kongresi', date: '20 Haziran 2025', status: 'Beklemede', location: 'Ankara' },
    { id: 3, title: 'Eğitimde Dijital Dönüşüm Çalıştayı', date: '5 Nisan 2025', status: 'Tamamlandı', location: 'İstanbul' }
  ];

  const notifications = [
    { id: 1, message: 'Yeni etkinlik: Yapay Zeka Semineri kayıtları açıldı', date: '2 gün önce', type: 'event' },
    { id: 2, message: 'Kursunuz "Eğitim Teknolojileri" için yeni modül eklendi', date: '5 gün önce', type: 'course' },
    { id: 3, message: 'Dijital Öğrenme sertifikanız hazır!', date: '1 hafta önce', type: 'certificate' }
  ];

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Profil bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="user-dashboard-wrapper">
        <div className="user-dashboard-container">
          {/* User Sidebar */}
          <div className="user-sidebar">
            <div className="user-profile-card">
              <div className="user-avatar">
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '32px'
                }}>
                  <i className='bx bx-user'></i>
                </div>
              </div>
              <div className="user-info">
                <h3>{userData?.name || 'Kullanıcı'}</h3>
                <p>{userData?.role === 'admin' ? 'Yönetici' : 'Üye'}</p>
                <span>YÖMEGA Üyesi</span>
              </div>
            </div>

            <nav className="user-nav">
              <ul>
                <li className={activeTab === 'profile' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}>
                    <i className='bx bx-user'></i>
                    <span>Profilim</span>
                  </a>
                </li>
                <li className={activeTab === 'events' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('events'); }}>
                    <i className='bx bx-calendar'></i>
                    <span>Etkinliklerim</span>
                  </a>
                </li>
                <li className={activeTab === 'resources' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('resources'); }}>
                    <i className='bx bx-book'></i>
                    <span>Kaynaklarım</span>
                  </a>
                </li>

                {/* ✅ YENİ: İmzalı Form Sekmesi */}
                <li className={activeTab === 'form' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('form'); }}>
                    <i className='bx bx-file-blank'></i>
                    <span>İmzalı Form</span>
                    {!formStatus?.signedPdfUrl && (
                      <span className="notification-count">!</span>
                    )}
                  </a>
                </li>

                <li className={activeTab === 'dues' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('dues'); }}>
                    <i className='bx bx-credit-card'></i>
                    <span>Aidat Bilgileri</span>
                    {!userData?.hasPaid && (
                      <span className="notification-count">!</span>
                    )}
                  </a>
                </li>

                <li className={activeTab === 'messages' ? 'active' : ''}>
                  <a
                    href="#"
                    data-tab="messages"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('messages');
                    }}
                  >
                    <i className='bx bx-message-dots'></i>
                    <span>Mesajlar</span>
                    {unreadMessages > 0 && (
                      <span className="notification-count">{unreadMessages}</span>
                    )}
                  </a>
                </li>

                <li className={activeTab === 'notifications' ? 'active' : ''}>
                  <a
                    href="#"
                    data-tab="notifications"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('notifications');
                    }}
                  >
                    <i className='bx bx-bell'></i>
                    <span>Bildirimler</span>
                    {unreadNotifications > 0 && (
                      <span className="notification-count">{unreadNotifications}</span>
                    )}
                  </a>
                </li>

                <li className={activeTab === 'settings' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}>
                    <i className='bx bx-cog'></i>
                    <span>Ayarlar</span>
                  </a>
                </li>
              </ul>
            </nav>

            <div className="user-sidebar-footer">
              <Link href="/" className="back-to-site">
                <i className='bx bx-arrow-back'></i>
                <span>Anasayfaya Dön</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <i className='bx bx-log-out'></i>
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="user-main-content">
            {/* Ödeme Uyarı Banner */}
            {userData && !userData.hasPaid && (
              <div style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                padding: '20px 30px',
                borderRadius: '15px',
                marginBottom: '25px',
                border: '2px solid #f0c000',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#f0c000',
                    flexShrink: 0
                  }}>
                    ⚠️
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#8b6914',
                      marginBottom: '5px'
                    }}>
                      Üyelik Aidatı Bekleniyor
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#8b6914',
                      margin: 0
                    }}>
                      Üyeliğinizi aktifleştirmek için lütfen aidat ödemesi yapınız
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('dues')}
                  style={{
                    padding: '12px 30px',
                    background: 'white',
                    color: '#f0c000',
                    border: '2px solid #f0c000',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0c000'
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.color = '#f0c000'
                  }}
                >
                  <i className='bx bx-credit-card' style={{ fontSize: '20px' }}></i>
                  Ödeme Bilgilerini Gör
                </button>
              </div>
            )}
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="user-content-section">
                <div className="section-header">
                  <h2>Profil Bilgileri</h2>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? 'İptal' : 'Düzenle'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                    <div className="form-group">
                      <label>Ad Soyad</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>E-posta</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Telefon</label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        İptal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-cards">
                    <div className="profile-card">
                      <h3>Kişisel Bilgiler</h3>
                      <div className="profile-info-grid">
                        <div className="info-item">
                          <label>Ad Soyad:</label>
                          <span>{userData?.name || 'Belirtilmemiş'}</span>
                        </div>
                        <div className="info-item">
                          <label>E-posta:</label>
                          <span>{userData?.email || 'Belirtilmemiş'}</span>
                        </div>
                        <div className="info-item">
                          <label>Telefon:</label>
                          <span>{userData?.phone || 'Belirtilmemiş'}</span>
                        </div>
                        <div className="info-item">
                          <label>Rol:</label>
                          <span>{userData?.role === 'admin' ? 'Yönetici' : 'Üye'}</span>
                        </div>
                        <div className="info-item">
                          <label>Üyelik Tarihi:</label>
                          <span>{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</span>
                        </div>
                        <div className="info-item">
                          <label>Üyelik Durumu:</label>
                          <span className={`status ${userData?.isApproved ? 'approved' : 'pending'}`}>
                            {userData?.isApproved ? 'Onaylı' : 'Onay Bekliyor'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="profile-card">
                      <h3>İstatistikler</h3>
                      <div className="stats-overview">
                        <div className="stat-item">
                          <i className='bx bx-calendar'></i>
                          <div>
                            <span className="stat-number">8</span>
                            <span className="stat-label">Katıldığım Etkinlik</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="user-content-section">
                <div className="section-header">
                  <h2>Etkinliklerim</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-outline" onClick={fetchUserPrograms}>
                      <i className='bx bx-refresh'></i> Yenile
                    </button>
                    <Link href="/program" className="btn btn-primary">
                      Yeni Etkinlik Bul
                    </Link>
                  </div>
                </div>

                {loadingPrograms ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-spinner"></div>
                    <p>Etkinlikler yükleniyor...</p>
                  </div>
                ) : (
                  <>
                    {/* Yaklaşan Etkinlikler */}
                    {userPrograms.upcoming.length > 0 && (
                      <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--dark-gray)' }}>
                          Yaklaşan Etkinlikler ({userPrograms.upcoming.length})
                        </h3>
                        <div className="events-list">
                          {userPrograms.upcoming.map((event) => (
                            <div key={event._id} className="event-card">
                              <div className="event-info">
                                <h3>{event.title}</h3>
                                <p>
                                  <i className='bx bx-calendar'></i>
                                  {new Date(event.dateTime).toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <p>
                                  <i className='bx bx-location-plus'></i>
                                  {event.location?.type === 'online' ? 'Online' :
                                    event.location?.type === 'physical' ? event.location.address : 'Hibrit'}
                                </p>
                                <p>
                                  <i className='bx bx-time'></i>
                                  {event.duration} dakika
                                </p>
                              </div>
                              <div className="event-status">
                                <span className="status approved">
                                  Katılacaksınız
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {event.location?.onlineLink && (
                                    <a
                                      href={event.location.onlineLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-primary btn-small"
                                    >
                                      <i className='bx bx-video'></i> Katıl
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleCancelRegistration(event._id, event.title)}
                                    disabled={cancelingEvent === event._id}
                                    className="btn btn-outline btn-small"
                                    style={{
                                      cursor: cancelingEvent === event._id ? 'not-allowed' : 'pointer',
                                      opacity: cancelingEvent === event._id ? 0.6 : 1
                                    }}
                                  >
                                    {cancelingEvent === event._id ? (
                                      'İptal Ediliyor...'
                                    ) : (
                                      <>
                                        <i className='bx bx-x'></i> Kaydı İptal Et
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tamamlanan Etkinlikler */}
                    {userPrograms.completed.length > 0 && (
                      <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--dark-gray)' }}>
                          Tamamlanan Etkinlikler ({userPrograms.completed.length})
                        </h3>
                        <div className="events-list">
                          {userPrograms.completed.map((event) => (
                            <div key={event._id} className="event-card">
                              <div className="event-info">
                                <h3>{event.title}</h3>
                                <p>
                                  <i className='bx bx-calendar'></i>
                                  {new Date(event.dateTime).toLocaleDateString('tr-TR')}
                                </p>
                                <p>
                                  <i className='bx bx-check-circle' style={{ color: '#28a745' }}></i>
                                  Tamamlandı
                                </p>
                              </div>
                              <div className="event-status">
                                <span className="status published">
                                  Tamamlandı
                                </span>
                                <button className="btn-small btn-outline">
                                  <i className='bx bx-download'></i> Sertifika İndir
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Geçmiş Etkinlikler */}
                    {userPrograms.past.length > 0 && (
                      <div>
                        <h3 style={{ marginBottom: '20px', color: 'var(--dark-gray)' }}>
                          Geçmiş Etkinlikler ({userPrograms.past.length})
                        </h3>
                        <div className="events-list">
                          {userPrograms.past.map((event) => (
                            <div key={event._id} className="event-card" style={{ opacity: 0.7 }}>
                              <div className="event-info">
                                <h3>{event.title}</h3>
                                <p>
                                  <i className='bx bx-calendar'></i>
                                  {new Date(event.dateTime).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                              <div className="event-status">
                                <span className="status pending">
                                  Geçti
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hiç Etkinlik Yoksa */}
                    {userPrograms.total === 0 && (
                      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <i className='bx bx-calendar-x' style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
                        <h3 style={{ color: '#666', marginBottom: '10px' }}>Henüz etkinliğe katılmadınız</h3>
                        <p style={{ color: '#999', marginBottom: '30px' }}>
                          İlginizi çeken etkinlikleri keşfedin ve kaydolun
                        </p>
                        <Link href="/program" className="btn btn-primary">
                          Etkinlikleri Keşfet
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="user-content-section">
                <div className="section-header">
                  <h2>Kaynaklarım</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-outline" onClick={fetchUserResources}>
                      <i className='bx bx-refresh'></i> Yenile
                    </button>
                    <Link href="/kaynaklar" className="btn btn-primary">
                      Kaynakları Keşfet
                    </Link>
                  </div>
                </div>

                {loadingResources ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-spinner"></div>
                    <p>Kaynaklar yükleniyor...</p>
                  </div>
                ) : userResources.length > 0 ? (
                  <div className="courses-grid">
                    {userResources.map((resource) => (
                      <div key={resource._id} className="course-card">
                        <div className="course-header">
                          <h3>{resource.title}</h3>
                          <span className={`status published`}>
                            {resource.type}
                          </span>
                        </div>
                        <p className="instructor">{resource.description?.substring(0, 100)}...</p>
                        <div className="course-actions" style={{ marginTop: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>
                              <i className='bx bx-calendar'></i> {new Date(resource.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                            {resource.fileUrl && (
                              <a
                                href={resource.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                                style={{ padding: '6px 12px', fontSize: '13px' }}
                              >
                                <i className='bx bx-download'></i> İndir
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <i className='bx bx-book-open' style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
                    <h3 style={{ color: '#666', marginBottom: '10px' }}>Henüz favori kaynağınız yok</h3>
                    <p style={{ color: '#999', marginBottom: '30px' }}>
                      İlginizi çeken kaynakları keşfedin ve favorilerinize ekleyin
                    </p>
                    <Link href="/kaynaklar" className="btn btn-primary">
                      Kaynakları Keşfet
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <MessagesTab />
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <NotificationsContent />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <>
                <div className="user-content-section">
                  <div className="section-header">
                    <h2>Hesap Ayarları</h2>
                  </div>

                  <div className="settings-sections">
                    <div className="settings-card">
                      <h3>Profil Ayarları</h3>
                      <div className="setting-item">
                        <label>E-posta Bildirimleri</label>
                        <input type="checkbox" defaultChecked />
                      </div>
                      <div className="setting-item">
                        <label>SMS Bildirimleri</label>
                        <input type="checkbox" />
                      </div>
                      <div className="setting-item">
                        <label>Etkinlik Hatırlatmaları</label>
                        <input type="checkbox" defaultChecked />
                      </div>
                    </div>

                    <div className="settings-card">
                      <h3>Güvenlik</h3>
                      <button
                        className="btn btn-outline"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        Şifre Değiştir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Şifre Değiştirme Modal */}
                {showPasswordModal && (
                  <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <h3>Şifre Değiştir</h3>
                        <button
                          className="close-btn"
                          onClick={() => setShowPasswordModal(false)}
                        >
                          <i className='bx bx-x'></i>
                        </button>
                      </div>

                      <form onSubmit={handleChangePassword} style={{ padding: '20px' }}>
                        <div className="form-group">
                          <label>Mevcut Şifre</label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                          />
                        </div>

                        <div className="form-group">
                          <label>Yeni Şifre</label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            required
                            minLength="6"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                          />
                          <small>En az 6 karakter olmalıdır</small>
                        </div>

                        <div className="form-group">
                          <label>Yeni Şifre (Tekrar)</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            required
                            minLength="6"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                          />
                        </div>

                        <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                          <button type="submit" className="btn btn-primary">
                            Şifreyi Değiştir
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setShowPasswordModal(false)}
                          >
                            İptal
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
            {/* ✅ YENİ: Form Tab */}
            {activeTab === 'form' && <MemberFormUpload />}
            
            {/* Dues Tab */}
            {activeTab === 'dues' && (
              <div className="user-content-section">
                <div className="section-header">
                  <h2>💳 Üyelik Aidat Bilgileri</h2>
                  {userData?.hasPaid && (
                    <span style={{
                      padding: '8px 16px',
                      background: '#d4edda',
                      color: '#155724',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      ✓ Ödeme Yapıldı
                    </span>
                  )}
                </div>

                {/* IBAN Kartı */}
                <div style={{
                  background: 'white',
                  borderRadius: '25px',
                  padding: '40px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                  border: '2px solid #f0f0f0',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '30px'
                }}>
                  {/* Decorative corner */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '200px',
                    height: '200px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, transparent 100%)',
                    borderRadius: '0 25px 0 100%'
                  }}></div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Başlık */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      marginBottom: '30px'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
                      }}>
                        <i className='bx bx-credit-card' style={{ fontSize: '30px', color: 'white' }}></i>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#2d3748', marginBottom: '5px' }}>
                          Aidat Ödeme Bilgileri
                        </h3>
                        <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
                          Aşağıdaki bilgileri kullanarak aidat ödemesi yapabilirsiniz
                        </p>
                      </div>
                    </div>

                    {/* Bilgi Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '20px',
                      marginBottom: '30px'
                    }}>
                      {/* Hesap Adı */}
                      <div style={{
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '600' }}>
                          HESAP ADI
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#2d3748' }}>
                          Yükseköğretim Mesleki Gelişim Ağı Derneği
                        </div>
                      </div>

                      {/* Banka */}
                      <div style={{
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '600' }}>
                          BANKA
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#2d3748' }}>
                          Ziraat Bankası
                        </div>
                      </div>

                      {/* Tutar */}
                      <div style={{
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '600' }}>
                          TUTAR
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#667eea' }}>
                          500 ₺
                        </div>
                      </div>
                    </div>

                    {/* IBAN Kutusu */}
                    <div style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      padding: '25px',
                      borderRadius: '15px',
                      border: '2px dashed #cbd5e0',
                      marginBottom: '25px'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#999',
                        marginBottom: '10px',
                        letterSpacing: '1px',
                        fontWeight: '600'
                      }}>
                        IBAN NUMARASI
                      </div>
                      <div style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        fontFamily: 'monospace',
                        letterSpacing: '2px',
                        color: '#2d3748',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '15px'
                      }}>
                        <span>TR44 0001 0008 3097 9454 9450 01</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('TR44 0001 0008 3097 9454 9450 01')
                            alert('✅ IBAN numarası kopyalandı!')
                          }}
                          style={{
                            padding: '10px 20px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#764ba2'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
                        >
                          <i className='bx bx-copy' style={{ fontSize: '18px' }}></i>
                          IBAN'ı Kopyala
                        </button>
                      </div>
                    </div>

                    {/* Açıklama */}
                    <div style={{
                      padding: '20px',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      marginBottom: '25px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '600' }}>
                        ÖDEME AÇIKLAMASI (Önemli!)
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#2d3748',
                        fontFamily: 'monospace'
                      }}>
                        {userData?.name} - Üyelik Aidatı
                      </div>
                      <p style={{ fontSize: '13px', color: '#718096', marginTop: '8px', marginBottom: 0 }}>
                        Ödeme yaparken açıklama kısmına mutlaka yukarıdaki metni yazınız
                      </p>
                    </div>

                    {/* Uyarı Kartları */}
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {/* Bilgilendirme */}
                      <div style={{
                        padding: '15px 20px',
                        background: '#e8f4fd',
                        border: '1px solid #90cdf4',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#2c5282',
                        display: 'flex',
                        alignItems: 'start',
                        gap: '12px'
                      }}>
                        <i className='bx bx-info-circle' style={{ fontSize: '22px', marginTop: '2px', flexShrink: 0 }}></i>
                        <div>
                          <strong style={{ display: 'block', marginBottom: '5px' }}>Ödeme Sonrası:</strong>
                          Ödeme yaptıktan sonra dekont/makbuzunuzu <strong>info@yomega.org</strong> adresine
                          e-posta ile gönderiniz. Ödemeniz onaylandıktan sonra üyeliğiniz aktif hale gelecektir.
                        </div>
                      </div>

                      {/* Uyarı */}
                      <div style={{
                        padding: '15px 20px',
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#9a3412',
                        display: 'flex',
                        alignItems: 'start',
                        gap: '12px'
                      }}>
                        <i className='bx bx-error' style={{ fontSize: '22px', marginTop: '2px', flexShrink: 0 }}></i>
                        <div>
                          <strong style={{ display: 'block', marginBottom: '5px' }}>Önemli Not:</strong>
                          Aidat ödemesi yapmadan dernek etkinliklerine katılım ve kaynakları kullanım hakkınız
                          sınırlı olacaktır.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* İletişim Kartı */}
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  border: '2px solid #f0f0f0',
                  textAlign: 'center'
                }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>
                    Yardıma mı ihtiyacınız var?
                  </h4>
                  <p style={{ fontSize: '14px', color: '#718096', marginBottom: '20px' }}>
                    Ödeme ile ilgili sorularınız için bizimle iletişime geçebilirsiniz
                  </p>

                  <a href="mailto:info@yomega.org"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 25px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <i className='bx bx-envelope' style={{ fontSize: '20px' }}></i>
                    info@yomega.org
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;