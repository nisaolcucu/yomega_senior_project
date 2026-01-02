'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DynamicMembersManagement from '@/components/DynamicMembersManagement';
import NewsManagementSystem from '@/components/NewsManagementSystem';
import ResourceManagementSystem from '@/components/ResourceManagementSystem';
import BoardManagementSystem from '@/components/BoardManagementSystem';
import DynamicProgramManagement from '@/components/DynamicProgramManagement';
import SystemSettingsManagement from '@/components/SystemSettingsManagement';
import AdminMessagesManagement from '@/components/AdminMessagesManagement';
import DuesManagementSystem from '@/components/DuesManagementSystem';
import DonationManagementSystem from '@/components/DonationManagementSystem';
import SignedFormsManagement from '@/components/SignedFormsManagement'; // ✅ YENİ

if (typeof window !== 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.async = true;
  document.head.appendChild(script);
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalNews: 0,
      totalPrograms: 0,
      totalResources: 0
    },
    recentMembers: [],
    recentNews: [],
    pendingActions: []
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const router = useRouter();
  const [unreadMessages, setUnreadMessages] = useState(0)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const checkAuth = () => {
      const adminDataStored = localStorage.getItem('admin');

      if (adminDataStored) {
        try {
          const admin = JSON.parse(adminDataStored);
          if (admin.isAdmin && admin.isLoggedIn) {
            setIsAuthenticated(true);
            setAdminData(admin);
            // Admin doğrulandıktan sonra dashboard verilerini çek
            fetchDashboardData();
          } else {
            router.push('/uyelik-giris');
          }
        } catch (error) {
          router.push('/uyelik-giris');
        }
      } else {
        router.push('/uyelik-giris');
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);


  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (isAuthenticated && adminData?.isAdmin) {
        inactivityTimer = setTimeout(() => {
          alert('Güvenlik nedeniyle oturumunuz sonlandırıldı.');
          handleLogout();
        }, 30 * 60 * 1000); // 30 dakika
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    if (isAuthenticated && adminData?.isAdmin) {
      events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
      });
      resetTimer();
    }

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [isAuthenticated, adminData]);


  // Dashboard verilerini API'den çek
  const fetchDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('Token bulunamadı');
        return;
      }

      const [statsResponse, membersResponse, newsResponse, programsResponse, messagesResponse] = await Promise.all([
        fetch(`${API_URL}/dashboard/admin/stats`, {
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
        }),
        fetch(`${API_URL}/news/admin/all?limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/programs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        // YENİ: Mesajlar
        fetch(`${API_URL}/messages/admin/all?status=pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);



      let stats = { totalUsers: 0, totalNews: 0, totalPrograms: 0, totalResources: 0 };
      let recentMembers = [];
      let recentNews = [];
      let recentPrograms = [];
      let monthlyUserStats = [];
      let eventCategoryStats = [];

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          stats = statsData.data.stats;

          const monthlyUserStats = statsData.data.monthlyUserStats || [];
          const eventCategoryStats = statsData.data.eventCategoryStats || [];
        }
      }

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        if (membersData.success) {
          recentMembers = membersData.data.members.slice(0, 5);
        }
      }

      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        if (newsData.success) {
          recentNews = newsData.data.news.slice(0, 5);
        }
      }

      if (programsResponse.ok) {
        const programsData = await programsResponse.json();
        if (programsData.success) {
          recentPrograms = programsData.data.programs
            .filter(p => new Date(p.dateTime) > new Date())
            .slice(0, 5);
        }
      }

      // YENİ: Mesaj sayısını ayarla
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json()
        setUnreadMessages(messagesData.data.stats?.pending || 0)
      }

      const recentActivities = generateActivities(recentMembers, recentNews, recentPrograms);
      const pendingActions = generatePendingActions(recentMembers, recentNews);

      setDashboardData({
        stats,
        recentMembers,
        recentNews,
        recentPrograms,
        recentActivities,
        pendingActions,
        monthlyUserStats,
        eventCategoryStats
      });

      // Chart.js yüklendikten sonra grafikleri oluştur
      setTimeout(() => {
        createCharts(
          stats,
          monthlyUserStats,
          eventCategoryStats
        );
      }, 500);




    } catch (error) {
      console.error('Dashboard verilerini çekerken hata:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Bekleyen işlemleri dinamik olarak oluştur
  const generatePendingActions = (members, news) => {
    const actions = [];

    // Bekleyen üye sayısı
    const pendingMembersCount = members.length;
    if (pendingMembersCount > 0) {
      actions.push({
        id: 1,
        type: 'member',
        title: `${pendingMembersCount} yeni üyelik başvurusu onay bekliyor`,
        action: 'Üyelikleri İncele',
        urgent: pendingMembersCount > 3
      });
    }

    // Draft haberlerin sayısı
    const draftNewsCount = news.filter(n => !n.isActive).length;
    if (draftNewsCount > 0) {
      actions.push({
        id: 2,
        type: 'content',
        title: `${draftNewsCount} haber taslağı yayın onayı bekliyor`,
        action: 'Haberleri İncele',
        urgent: draftNewsCount > 5
      });
    }

    // Genel sistem bildirimi
    actions.push({
      id: 3,
      type: 'system',
      title: 'Sistem performans raporu hazır',
      action: 'Raporu Görüntüle',
      urgent: false
    });

    return actions;
  };

  // generatePendingActions fonksiyonundan sonra, fetchDashboardData'dan önce

  const generateActivities = (members, news, programs) => {
    const activities = [];

    // Son üye kayıtları
    members.slice(0, 3).forEach(member => {
      activities.push({
        type: 'member',
        message: `${member.name} sisteme üye oldu`,
        timeAgo: getTimeAgo(member.createdAt)
      });
    });

    // Son haberler
    news.slice(0, 2).forEach(n => {
      activities.push({
        type: 'news',
        message: `"${n.title}" haberi ${n.isActive ? 'yayınlandı' : 'taslak olarak kaydedildi'}`,
        timeAgo: getTimeAgo(n.createdAt)
      });
    });

    // Son etkinlikler
    programs.slice(0, 2).forEach(program => {
      activities.push({
        type: 'event',
        message: `"${program.title}" etkinliği oluşturuldu`,
        timeAgo: getTimeAgo(program.createdAt)
      });
    });

    // Tarihe göre sırala (en yeni en üstte)
    return activities.sort((a, b) => {
      // Bu basit bir sıralama, gerçek implementasyonda timestamp kullanılmalı
      return 0;
    }).slice(0, 8);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return 'Az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const createCharts = (stats, monthlyData, eventData) => {
    // Sayfa yüklenir yüklenmez Chart.js hazır olmayabilir
    if (typeof window === 'undefined' || !window.Chart) {
      console.log('Chart.js henüz yüklenmedi');
      return;
    }

    // Aylık veri formatla
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    const memberLabels = monthlyData?.map(d =>
      monthNames[d._id.month - 1]
    ) || ['Eylül', 'Ekim', 'Kasım', 'Aralık', 'Ocak', 'Şubat'];

    const memberData = monthlyData?.map(d => d.count) || [12, 19, 15, 25, 22, 30];

    // ✅ MEVCUT GRAFİĞİ TEMİZLE
    const existingMemberChart = window.Chart.getChart('memberChart');
    if (existingMemberChart) {
      existingMemberChart.destroy();
    }

    // Üye Artış Grafiği
    const memberCtx = document.getElementById('memberChart');
    if (memberCtx) {
      new window.Chart(memberCtx, {
        type: 'line',
        data: {
          labels: memberLabels,
          datasets: [{
            label: 'Yeni Üyeler',
            data: memberData,
            borderColor: '#f66962',
            backgroundColor: 'rgba(246, 105, 98, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    }
  };

  // Manuel refresh fonksiyonu
  const refreshDashboard = () => {
    fetchDashboardData();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('token');
    router.push('/');
  };

  // Dinamik stats oluştur
  // Dinamik stats oluştur
  const getFormattedStats = () => {
    const { stats } = dashboardData;

    console.log('🎨 Frontend rendering stats:', stats); // ✅ DEBUG

    return [
      {
        title: 'Toplam Üye',
        value: (stats.totalMembers || stats.totalUsers || 0).toString(),
        icon: 'bx-user',
        color: '#f66962',
        change: '+12% bu ay'
      },
      {
        title: 'Aktif Etkinlikler',
        value: (stats.totalPrograms || 0).toString(),
        icon: 'bx-calendar',
        color: '#685f78',
        change: '+5% bu ay'
      },
      {
        title: 'Yayınlanan Haber',
        value: (stats.totalNews || 0).toString(),
        icon: 'bx-news',
        color: '#28a745',
        change: '+23% bu ay'
      },
      {
        title: 'Toplam Kaynak',
        value: formatNumber(stats.totalResources),
        icon: 'bx-book',
        color: '#17a2b8',
        change: '+8% bu ay'
      }
    ];
  };

  // Sayı formatlamak için helper
  const formatNumber = (num) => {
    // Eğer sayı yoksa veya undefined ise 0 döndür
    if (!num && num !== 0) return '0';

    // 1000'den büyükse K ile göster
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }

    // Yoksa olduğu gibi göster
    return num.toString();
  };

  // Gelir formatlamak için helper
  const formatRevenue = (amount) => {
    if (!amount) return '0₺';
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K₺';
    }
    return amount.toLocaleString('tr-TR') + '₺';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Yetkilendirme kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = getFormattedStats();

  return (
    <>
      <Header />
      <div className="admin-dashboard-wrapper">
        <div className="admin-dashboard-container">
          {/* Admin Sidebar */}
          <div className="admin-sidebar-integrated">
            <div className="admin-profile-card">
              <div className="admin-avatar">

                {adminData?.name?.charAt(0).toUpperCase() || 'A'}

              </div>
              <div className="admin-info">
                <h3>Sistem Yöneticisi</h3>
                <p>@{adminData?.username || 'admin'}</p>
                <span>YÖMEGA Admin</span>
              </div>
            </div>

            <nav className="admin-nav">
              <ul>
                <li className={activeTab === 'dashboard' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
                    <i className='bx bx-home'></i>
                    <span>Dashboard</span>
                  </a>
                </li>
                <li className={activeTab === 'members' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('members'); }}>
                    <i className='bx bx-group'></i>
                    <span>Üye Yönetimi</span>
                    {dashboardData.recentMembers.length > 0 && (
                      <span className="notification-count">{dashboardData.recentMembers.length}</span>
                    )}
                  </a>
                </li>
                <li className={activeTab === 'news' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('news'); }}>
                    <i className='bx bx-news'></i>
                    <span>Haber Yönetimi</span>
                  </a>
                </li>
                <li className={activeTab === 'programs' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('programs'); }}>
                    <i className='bx bx-calendar-event'></i>
                    <span>Etkinlik Yönetimi</span>
                  </a>
                </li>
                <li className={activeTab === 'resources' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('resources'); }}>
                    <i className='bx bx-book'></i>
                    <span>Kaynak Yönetimi</span>
                  </a>
                </li>
                <li className={activeTab === 'board' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('board'); }}>
                    <i className='bx bx-crown'></i>
                    <span>Yönetim Kurulu</span>
                  </a>
                </li>

                <li className={activeTab === 'messages' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('messages'); }}>
                    <i className='bx bx-message-dots'></i>
                    <span>Mesajlar</span>
                    {unreadMessages > 0 && (
                      <span className="notification-count">{unreadMessages}</span>
                    )}
                  </a>
                </li>



                <li className={activeTab === 'dues' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('dues'); }}>
                    <i className='bx bx-money'></i>
                    <span>Aidat Takibi</span>
                  </a>
                </li>

                <li className={activeTab === 'donations' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('donations'); }}>
                    <i className='bx bx-heart'></i>
                    <span>Bağış Takibi</span>
                  </a>
                </li>

                {/* ✅ YENİ: İmzalı Formlar Sekmesi */}
                <li className={activeTab === 'signed-forms' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('signed-forms'); }}>
                    <i className='bx bx-file-blank'></i>
                    <span>İmzalı Formlar</span>
                  </a>
                </li>


                <li className={activeTab === 'settings' ? 'active' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}>
                    <i className='bx bx-cog'></i>
                    <span>Sistem Ayarları</span>
                  </a>
                </li>
              </ul>
            </nav>

            <div className="admin-sidebar-footer">
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
          <div className="admin-main-content">
            {/* Dashboard Tab */}
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="admin-content-section">
                <div className="section-header">
                  <div>
                    <h2>Yönetim Paneli</h2>
                    <p>YÖMEGA sistem durumu ve güncel istatistikler</p>
                  </div>
                  <div className="header-actions">
                    <button className="btn btn-outline" onClick={refreshDashboard}>
                      <i className='bx bx-refresh'></i>
                      Yenile
                    </button>
                  </div>
                </div>

                {loadingDashboard ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Dashboard verileri yükleniyor...</p>
                  </div>
                ) : (
                  <>
                    {/* Stats Cards */}
                    <div className="stats-grid">
                      {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                          <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                            <i className={`bx ${stat.icon}`}></i>
                          </div>
                          <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.title}</p>
                            <span className="stat-change">{stat.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Aidat Özet Kartı */}
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '20px',
                      padding: '30px',
                      color: 'white',
                      marginTop: '30px',
                      marginBottom: '30px',
                      boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '25px',
                        flexWrap: 'wrap',
                        gap: '15px'
                      }}>
                        <h3 style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <i className='bx bx-money' style={{ fontSize: '32px' }}></i>
                          Aidat Durumu
                        </h3>
                        <button
                          onClick={() => setActiveTab('dues')}
                          style={{
                            padding: '10px 20px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          Detaylı Görüntüle →
                        </button>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '20px'
                      }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          borderRadius: '15px',
                          padding: '20px',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          <div style={{
                            fontSize: '36px',
                            fontWeight: '700',
                            marginBottom: '8px'
                          }}>
                            {dashboardData.stats.paidMembers || 0}
                          </div>
                          <div style={{
                            opacity: 0.9,
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            Ödeme Yapan
                          </div>
                        </div>

                        <div style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          borderRadius: '15px',
                          padding: '20px',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          <div style={{
                            fontSize: '36px',
                            fontWeight: '700',
                            marginBottom: '8px'
                          }}>
                            {dashboardData.stats.unpaidMembers || 0}
                          </div>
                          <div style={{
                            opacity: 0.9,
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            Ödeme Bekleyen
                          </div>
                        </div>

                        <div style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          borderRadius: '15px',
                          padding: '20px',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          <div style={{
                            fontSize: '36px',
                            fontWeight: '700',
                            marginBottom: '8px'
                          }}>
                            {formatRevenue(dashboardData.stats.totalRevenue || 0)}
                          </div>
                          <div style={{
                            opacity: 0.9,
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            Toplam Gelir
                          </div>
                        </div>

                        <div style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          borderRadius: '15px',
                          padding: '20px',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          <div style={{
                            fontSize: '36px',
                            fontWeight: '700',
                            marginBottom: '8px'
                          }}>
                            %{dashboardData.stats.paymentRate || 0}
                          </div>
                          <div style={{
                            opacity: 0.9,
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            Ödeme Oranı
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ marginTop: '20px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          opacity: 0.9,
                          marginBottom: '8px'
                        }}>
                          <span>Aidat Toplama İlerlemesi</span>
                          <span>{dashboardData.stats.paidMembers || 0} / {dashboardData.stats.totalMembers || 0} üye</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '10px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '10px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${dashboardData.stats.paymentRate || 0}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                            borderRadius: '10px',
                            transition: 'width 0.5s ease'
                          }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Sadece Üye Artış Grafiği */}
                    <div className="dashboard-charts">
                      <div className="chart-container" style={{ maxWidth: '100%' }}>
                        <div className="chart-header">
                          <h3>Üye Artış Trendi (Son 6 Ay)</h3>
                          <select className="chart-filter">
                            <option>Son 6 Ay</option>
                            <option>Son Yıl</option>
                          </select>
                        </div>
                        <canvas id="memberChart" height="80"></canvas>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Dinamik Üye Yönetimi */}
            <DynamicMembersManagement activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Dinamik Haber Yönetimi */}
            <NewsManagementSystem activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Dinamik Kaynak Yönetimi */}
            <ResourceManagementSystem activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Other sections placeholder */}
            {/* Board Management System */}
            <BoardManagementSystem activeTab={activeTab} setActiveTab={setActiveTab} />

            <DynamicProgramManagement activeTab={activeTab} setActiveTab={setActiveTab} />

            <SystemSettingsManagement activeTab={activeTab} setActiveTab={setActiveTab} />

            <AdminMessagesManagement activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Other sections placeholder - events ve settings için */}

            {/* ✅ YENİ: Aidat Takibi */}
            <DuesManagementSystem activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* ✅ YENİ: Bağış Takibi */}
            <DonationManagementSystem activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* ✅ YENİ: İmzalı Formlar Yönetimi */}
            <SignedFormsManagement activeTab={activeTab} setActiveTab={setActiveTab} />

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;