'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CalendarSection() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/programs`)
      
      if (response.ok) {
        const result = await response.json()
        // Sadece ilk 3'ünü al
        setEvents(result.data.programs.slice(0, 3))
      }
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString, duration) => {
    const start = new Date(dateString)
    const end = new Date(start.getTime() + duration * 60000)
    
    const startTime = start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    const endTime = end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    
    return `${startTime} - ${endTime}`
  }

  if (loading) {
    return (
      <section className="course section" id="course" style={{ padding: '80px 20px' }}>
        <div className="center-text">
          <h5 style={{ color: 'var(--main-color)', fontSize: '16px', fontWeight: '600', letterSpacing: '2px' }}>
            ETKİNLİKLER
          </h5>
          <h2 style={{ fontSize: '42px', fontWeight: '700', marginTop: '10px' }}>
            Yaklaşan Etkinliklerimiz
          </h2>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="loading-spinner"></div>
          <p>Etkinlikler yükleniyor...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="course section" id="course" style={{ padding: '80px 20px' }}>
      {/* ✅ Başlıklar - Ortalanmış */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '60px',
        maxWidth: '900px',
        margin: '0 auto 60px'
      }}>
        <h5 style={{ 
          color: 'var(--main-color)', 
          fontSize: '16px', 
          fontWeight: '600', 
          letterSpacing: '2px',
          marginBottom: '15px'
        }}>
          ETKİNLİKLER
        </h5>
        
        <h2 style={{ 
          fontSize: '42px', 
          fontWeight: '700', 
          margin: '0 0 20px 0',
          lineHeight: '1.2'
        }}>
          Yaklaşan Etkinliklerimiz
        </h2>
        
        <p style={{
          fontSize: '17px',
          color: '#666',
          lineHeight: '1.8',
          marginBottom: '15px'
        }}>
          Yurtiçinden ve yurtdışından alanında uzman, araştırmalar yapan değerli davetli 
          konuşmacıları Zoom üzerinden konuşma yapmaları için ve YÖMEGA üyeleri ile 
          bilgi alışverişinde buluşturuyoruz.
        </p>
        
        <p style={{
          fontSize: '16px',
          color: '#888',
          lineHeight: '1.7',
          fontStyle: 'italic',
          margin: 0
        }}>
          Konuşmacılar; eğitim gelişimi, öğretim elemanı mükemmeliyeti, öğrenme ve 
          öğretme merkezleri ve eğitim geliştiricilerine ilişkin güncel ve yenilikçi konularda 
          engin bilgi ve deneyimlerini üyelerimizle paylaşmaktadır.
        </p>
      </div>

      {events.length > 0 ? (
        <>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {events.map((event, index) => (
              <Link 
                key={event._id}
                href={`/etkinlikler/${event._id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  marginBottom: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto auto',
                  gap: '30px',
                  alignItems: 'center',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(10px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'
                  e.currentTarget.style.borderColor = 'var(--main-color)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
                >
                  {/* Tarih Kutusu */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: index % 3 === 0 ? 'linear-gradient(135deg, #667eea, #764ba2)' :
                                index % 3 === 1 ? 'linear-gradient(135deg, #f093fb, #f5576c)' :
                                'linear-gradient(135deg, #4facfe, #00f2fe)',
                    borderRadius: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', lineHeight: '1' }}>
                      {new Date(event.dateTime).getDate()}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '5px' }}>
                      {new Date(event.dateTime).toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase()}
                    </div>
                  </div>

                  {/* Etkinlik Bilgisi */}
                  <div>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#333',
                      marginBottom: '10px'
                    }}>
                      {event.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                        <i className='bx bx-user' style={{ fontSize: '18px', color: 'var(--main-color)' }}></i>
                        <span style={{ fontSize: '14px' }}>{event.speaker?.name || '-'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                        <i className='bx bx-map' style={{ fontSize: '18px', color: 'var(--main-color)' }}></i>
                        <span style={{ fontSize: '14px' }}>
                          {event.location?.type === 'online' ? 'Online' :
                            event.location?.type === 'physical' ? event.location.city || 'Fiziksel' : 'Hibrit'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Saat */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: '#f0f0f0',
                    borderRadius: '12px',
                    flexShrink: 0
                  }}>
                    <i className='bx bx-time' style={{ fontSize: '20px', color: 'var(--main-color)' }}></i>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                      {formatTime(event.dateTime, event.duration)}
                    </span>
                  </div>

                  {/* Ok İkonu */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--main-color)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    <i className='bx bx-right-arrow-alt' style={{ fontSize: '24px' }}></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Link 
              href="/etkinlikler" 
              className="btn" 
              style={{ 
                padding: '14px 30px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              Tüm Etkinlikleri Gör
              <i className='bx bx-right-arrow-alt' style={{ fontSize: '20px' }}></i>
            </Link>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <i className='bx bx-calendar-x' style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>Yaklaşan etkinlik bulunmuyor</h3>
          <p style={{ color: '#999' }}>Yeni etkinlikler için takipte kalın!</p>
        </div>
      )}
    </section>
  )
}