'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NotificationsContent() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, new_program, new_resource, new_news
  const [unreadCount, setUnreadCount] = useState(0)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      if (!token) {
        alert('Lütfen giriş yapınız')
        return
      }

      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setNotifications(result.data.notifications)
        setUnreadCount(result.data.unreadCount)
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // UI'yi güncelle
        setNotifications(prev => prev.map(notif => 
          notif._id === id ? { ...notif, isRead: true } : notif
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Tümü okundu işaretlenirken hata:', error)
    }
  }

  const getTypeLabel = (type) => {
    switch(type) {
      case 'new_program': return 'Etkinlikler'
      case 'new_resource': return 'Kaynaklar'
      case 'new_news': return 'Haberler'
      default: return 'Diğer'
    }
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter)

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    
    if (seconds < 60) return 'Az önce'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`
    return new Date(date).toLocaleDateString('tr-TR')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="loading-spinner"></div>
        <p>Bildirimler yükleniyor...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Başlık */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className='bx bx-bell' style={{ color: 'var(--main-color)' }}></i>
          Bildirimler
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--main-color)',
              color: 'white',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {unreadCount}
            </span>
          )}
        </h1>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            style={{
              padding: '10px 20px',
              background: 'var(--main-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {/* Filtreler */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: 'all', label: 'Tümü', count: notifications.length },
          { value: 'new_program', label: 'Etkinlikler', count: notifications.filter(n => n.type === 'new_program').length },
          { value: 'new_resource', label: 'Kaynaklar', count: notifications.filter(n => n.type === 'new_resource').length },
          { value: 'new_news', label: 'Haberler', count: notifications.filter(n => n.type === 'new_news').length }
        ].map(btn => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            style={{
              padding: '10px 20px',
              background: filter === btn.value ? 'var(--main-color)' : 'white',
              color: filter === btn.value ? 'white' : '#666',
              border: `2px solid ${filter === btn.value ? 'var(--main-color)' : '#e0e0e0'}`,
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            {btn.label} ({btn.count})
          </button>
        ))}
      </div>

      {/* Bildirimler Listesi */}
      {filteredNotifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              style={{
                background: notif.isRead ? 'white' : '#fff9f9',
                border: `2px solid ${notif.isRead ? '#e0e0e0' : 'var(--main-color)'}`,
                borderRadius: '15px',
                padding: '20px',
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                transition: 'all 0.3s',
                position: 'relative'
              }}
            >
              {/* İkon */}
              <div style={{
                width: '50px',
                height: '50px',
                background: `linear-gradient(135deg, ${notif.color}, ${notif.color}dd)`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className={notif.icon} style={{ fontSize: '24px', color: 'white' }}></i>
              </div>

              {/* İçerik */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>
                    {notif.title}
                  </h3>
                  {!notif.isRead && (
                    <span style={{
                      width: '10px',
                      height: '10px',
                      background: 'var(--main-color)',
                      borderRadius: '50%',
                      flexShrink: 0
                    }}></span>
                  )}
                </div>

                <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '12px' }}>
                  {notif.message}
                </p>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#999' }}>
                    <i className='bx bx-time'></i> {getTimeAgo(notif.createdAt)}
                  </span>

                  <Link 
                    href={notif.link}
                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                    style={{
                      fontSize: '14px',
                      color: 'var(--main-color)',
                      fontWeight: '600',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    İncele <i className='bx bx-right-arrow-alt'></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <i className='bx bx-bell-off' style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>
            {filter === 'all' ? 'Henüz bildirim yok' : 'Bu kategoride bildirim yok'}
          </h3>
          <p style={{ color: '#999' }}>Yeni bildirimler burada görünecek</p>
        </div>
      )}
    </div>
  )
}