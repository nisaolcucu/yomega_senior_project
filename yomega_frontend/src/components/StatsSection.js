'use client'
import { useState, useEffect } from 'react'

export default function StatsSection() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalPrograms: 0,
    totalResources: 0,
    completedPrograms: 0
  })
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats/home`)

      if (response.ok) {
        const result = await response.json()
        setStats(result.data)
      }
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsDisplay = [
    {
      icon: 'bx bxs-user-circle',
      count: loading ? '...' : stats.totalMembers,
      label: 'Aktif Üye',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea'
    },
    {
      icon: 'bx bx-calendar-event',
      count: loading ? '...' : stats.totalPrograms,
      label: 'Toplam Etkinlik',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#f093fb'
    },
    {
      icon: 'bx bx-book-bookmark',
      count: loading ? '...' : stats.totalResources,
      label: 'Eğitim Kaynağı',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#4facfe'
    },
    {
      icon: 'bx bx-check-circle',
      count: loading ? '...' : stats.completedPrograms,
      label: 'Tamamlanan Etkinlik',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      color: '#43e97b'
    }
  ]

  return (
    <section style={{
      padding: '80px 5%',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Başlıklar */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <h5 style={{ 
            color: 'var(--main-color)', 
            fontSize: 'clamp(14px, 2vw, 16px)',
            fontWeight: '600', 
            letterSpacing: '2px',
            marginBottom: '10px'
          }}>
            YÖMEGA İSTATİSTİKLERİ
          </h5>
          <h2 style={{ 
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: '700',
            margin: '0'
          }}>
            Rakamlarla Biz
          </h2>
        </div>

        {/* İstatistik Kartları */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'clamp(15px, 3vw, 25px)',
          width: '100%'
        }}>
          {statsDisplay.map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '15px',
                padding: 'clamp(20px, 4vw, 30px) clamp(15px, 3vw, 20px)',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid #f0f0f0',
                minWidth: '0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'
              }}
            >
              {/* İkon */}
              <div style={{
                width: 'clamp(60px, 15vw, 80px)',
                height: 'clamp(60px, 15vw, 80px)',
                background: stat.gradient,
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto clamp(15px, 3vw, 25px)',
                boxShadow: `0 10px 25px ${stat.color}40`
              }}>
                <i className={stat.icon} style={{ 
                  fontSize: 'clamp(28px, 7vw, 40px)', 
                  color: 'white' 
                }}></i>
              </div>

              {/* Sayı */}
              <h3 style={{
                fontSize: 'clamp(32px, 8vw, 48px)',
                fontWeight: '700',
                background: stat.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                lineHeight: '1'
              }}>
                {stat.count}
              </h3>

              {/* Label */}
              <p style={{
                fontSize: 'clamp(13px, 2.5vw, 16px)',
                color: '#666',
                fontWeight: '500',
                margin: '0',
                lineHeight: '1.3'
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}