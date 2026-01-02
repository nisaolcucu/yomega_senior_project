'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

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
      <div className="user-content-section">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="loading-spinner"></div>
          <p>Bildirimler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-content-section">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2>Bildirimler</h2>
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
        </div>
        
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-outline">
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {/* Filtreler */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
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
              padding: '8px 16px',
              background: filter === btn.value ? 'var(--main-color)' : 'white',
              color: filter === btn.value ? 'white' : '#666',
              border: `2px solid ${filter === btn.value ? 'var(--main-color)' : '#e0e0e0'}`,
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            {btn.label} ({btn.count})
          </button>
        ))}
      </div>

      {/* Bildirimler Listesi */}
      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div 
              key={notif._id} 
              className="notification-item"
              style={{
                background: notif.isRead ? 'white' : '#fff9f9',
                border: `2px solid ${notif.isRead ? '#e0e0e0' : 'var(--main-color)'}`,
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '10px',
                display: 'flex',
                gap: '15px',
                alignItems: 'flex-start'
              }}
            >
              {/* İkon */}
              <div style={{
                width: '40px',
                height: '40px',
                background: `linear-gradient(135deg, ${notif.color}, ${notif.color}dd)`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className={notif.icon} style={{ fontSize: '20px', color: 'white' }}></i>
              </div>

              {/* İçerik */}
              <div className="notification-content" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '5px' }}>
                    {notif.title}
                  </h4>
                  {!notif.isRead && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      background: 'var(--main-color)',
                      borderRadius: '50%',
                      flexShrink: 0
                    }}></span>
                  )}
                </div>
                
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  {notif.message}
                </p>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span className="notification-date" style={{ fontSize: '12px', color: '#999' }}>
                    <i className='bx bx-time'></i> {getTimeAgo(notif.createdAt)}
                  </span>

                  <Link 
                    href={notif.link}
                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                    style={{
                      fontSize: '13px',
                      color: 'var(--main-color)',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    İncele →
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className='bx bx-bell-off' style={{ fontSize: '48px', color: '#ddd', marginBottom: '15px' }}></i>
            <p style={{ color: '#999' }}>
              {filter === 'all' ? 'Henüz bildirim yok' : 'Bu kategoride bildirim yok'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}