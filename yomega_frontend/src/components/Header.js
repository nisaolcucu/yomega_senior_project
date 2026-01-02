'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import GlobalSearch from './GlobalSearch'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Authentication durumunu kontrol et
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        // Hem localStorage hem sessionStorage'ı kontrol et
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        const userDataStored = localStorage.getItem('user') || sessionStorage.getItem('user')
        const adminDataStored = localStorage.getItem('admin') || sessionStorage.getItem('admin')

        if (adminDataStored) {
          try {
            const admin = JSON.parse(adminDataStored)
            if (admin.isAdmin && admin.isLoggedIn) {
              setIsAuthenticated(true)
              setIsAdmin(true)
              setUserData(admin)
              return
            }
          } catch (error) {
            console.error('Admin data parse error:', error)
          }
        }

        if (token && userDataStored) {
          try {
            const user = JSON.parse(userDataStored)
            setIsAuthenticated(true)
            setIsAdmin(user.role === 'admin')
            setUserData(user)
            return
          } catch (error) {
            console.error('User data parse error:', error)
          }
        }

        setIsAuthenticated(false)
        setIsAdmin(false)
        setUserData(null)
      }
    }

    checkAuth()

    // Storage değişikliklerini dinle (diğer tab'lardan çıkış yapıldığında)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user' || e.key === 'admin') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Hem localStorage hem sessionStorage'ı temizle
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('admin')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('admin')

      setIsAuthenticated(false)
      setIsAdmin(false)
      setUserData(null)
      router.push('/')
    }
  }

  const isActive = (path) => {
    if (path === '/uyelik-giris' && pathname === '/uyelik-giris') {
      return true
    }
    return pathname === path
  }

  const navigationItems = [
    { href: '/haberler', label: 'Haberler' },
    { href: '/program-konusmacilar', label: 'Program' },
    { href: '/yonetim-kurulu', label: 'Yönetim Kurulu' },
    { href: '/iletisim', label: 'İletişim' },
    { href: '/kaynaklar', label: 'Kaynaklar' }
  ]

  return (
    <header className={`header ${isSticky ? 'sticky' : ''}`}>
      <Link href="/" onClick={closeMenu} className="logo" style={{
        fontSize: '28px',
        fontWeight: '800',
        color: 'var(--main-color)',
        textDecoration: 'none',
        letterSpacing: '-0.5px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          background: 'linear-gradient(135deg, #f66962 0%, #f5576c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          YÖMEGA
        </span>
      </Link>

      <nav className={`navbar ${isMenuOpen ? 'open' : ''}`}>
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? 'active' : ''}
            onClick={closeMenu}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="header-icons">
        {/* Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'inherit',
            fontSize: '24px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--main-color)'}
          onMouseLeave={(e) => e.target.style.color = 'inherit'}
          aria-label="Ara"
        >
          <i className='bx bx-search'></i>
        </button>

        {/* User Menu - HER ZAMAN AYNI YER */}
        {isAuthenticated ? (
          <div className="user-menu">
            <div className="user-info">
              <i className='bx bxs-user'></i>
            </div>
            <div className="user-dropdown">
              <div className="dropdown-header">
                <i className='bx bxs-user'></i>
                <span>{isAdmin ? 'Admin' : userData?.name || 'Kullanıcı'}</span>
              </div>
              <Link
                href={isAdmin ? '/admin/dashboard' : '/uye-panel'}
                onClick={closeMenu}
                className="dropdown-item"
              >
                <i className='bx bx-user'></i>
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="dropdown-item logout-btn"
              >
                <i className='bx bx-log-out'></i>
                Çıkış Yap
              </button>
            </div>
          </div>
        ) : (
          <div className="user-menu">
            <div className="user-info">
              <Link
                href="/uyelik-giris"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  color: 'inherit'
                }}
              >
                <i className='bx bxs-user'></i>
              </Link>
            </div>
          </div>
        )}

        {/* Hamburger menu - sadece mobile'da görünür */}
        <div
          className="bx bx-menu menu-icon"
          onClick={toggleMenu}
          style={{ cursor: 'pointer' }}
        ></div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  )
}