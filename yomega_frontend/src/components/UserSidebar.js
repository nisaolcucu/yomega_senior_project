'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function UserSidebar() {
  const [user, setUser] = useState(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // LocalStorage'dan kullanıcı bilgilerini al
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('User data parse error:', error)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const menuItems = [
    {
      icon: 'bx-home',
      label: 'Ana Sayfa',
      href: '/',
    },
    {
      icon: 'bx-user',
      label: 'Profilim',
      href: '/kullanici/profil',
    },
    {
      icon: 'bx-bell',
      label: 'Bildirimler',
      href: '/kullanici/bildirimler',
      badge: 3 // İsteğe bağlı bildirim sayısı
    },
    {
      icon: 'bx-calendar',
      label: 'Etkinliklerim',
      href: '/kullanici/etkinlikler',
    },
    {
      icon: 'bx-book',
      label: 'Kaynaklarım',
      href: '/kullanici/kaynaklar',
    },
    {
      icon: 'bx-money',
      label: 'Aidat Durumum',
      href: '/kullanici/aidat',
    },
    {
      icon: 'bx-cog',
      label: 'Ayarlar',
      href: '/kullanici/ayarlar',
    }
  ]

  return (
    <aside style={{
      width: '280px',
      background: 'white',
      borderRight: '1px solid #e2e8f0',
      padding: '30px 20px',
      position: 'sticky',
      top: '80px',
      height: 'calc(100vh - 80px)',
      overflowY: 'auto'
    }}>
      {/* Kullanıcı Profil Kartı */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '15px',
        padding: '20px',
        color: 'white',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          margin: '0 auto 15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          fontWeight: '700',
          border: '3px solid rgba(255, 255, 255, 0.3)'
        }}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          marginBottom: '5px'
        }}>
          {user?.name || 'Kullanıcı'}
        </h3>
        <p style={{
          fontSize: '14px',
          opacity: 0.9,
          marginBottom: '10px'
        }}>
          {user?.email || 'email@example.com'}
        </p>
        <div style={{
          display: 'inline-block',
          padding: '5px 15px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {user?.hasPaid ? '✅ Aidat Ödendi' : '⏳ Aidat Bekliyor'}
        </div>
      </div>

      {/* Menü */}
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href
            
            return (
              <li key={index} style={{ marginBottom: '8px' }}>
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: isActive ? '#667eea' : '#4a5568',
                    background: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#f7fafc'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <i 
                    className={`bx ${item.icon}`}
                    style={{
                      fontSize: '22px',
                      marginRight: '12px'
                    }}
                  ></i>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  
                  {/* Badge (bildirim sayısı) */}
                  {item.badge && (
                    <span style={{
                      background: '#f66962',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Çıkış Butonu */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          marginTop: '30px',
          padding: '12px',
          background: '#fff',
          border: '2px solid #e2e8f0',
          borderRadius: '10px',
          color: '#e53e3e',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#fff5f5'
          e.currentTarget.style.borderColor = '#e53e3e'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#fff'
          e.currentTarget.style.borderColor = '#e2e8f0'
        }}
      >
        <i className='bx bx-log-out' style={{ fontSize: '20px' }}></i>
        <span>Çıkış Yap</span>
      </button>

      {/* Yardım Kartı */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: '15px',
        color: 'white',
        textAlign: 'center'
      }}>
        <i className='bx bx-help-circle' style={{ fontSize: '36px', marginBottom: '10px' }}></i>
        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
          Yardıma mı ihtiyacınız var?
        </h4>
        <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '15px' }}>
          Destek ekibimize ulaşın
        </p>
        <Link
          href="/iletisim"
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: 'white',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          İletişime Geç
        </Link>
      </div>
    </aside>
  )
}