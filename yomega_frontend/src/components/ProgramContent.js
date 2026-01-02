'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProgramContent() {
  const [upcomingPrograms, setUpcomingPrograms] = useState([])
  const [pastPrograms, setPastPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(null)
  const router = useRouter()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      // Hem yaklaşan hem geçmiş etkinlikleri paralel çek
      const [upcomingRes, pastRes] = await Promise.all([
        fetch(`${API_URL}/programs`, { headers }),
        fetch(`${API_URL}/programs/past`, { headers })
      ])

      if (upcomingRes.ok) {
        const data = await upcomingRes.json()
        const sortedPrograms = (data.data.programs || [])
          .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
        setUpcomingPrograms(sortedPrograms)
      }

      if (pastRes.ok) {
        const data = await pastRes.json()
        setPastPrograms(data.data.programs || [])
      }

    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (programId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')

    if (!token) {
      if (confirm('Bu etkinliğe kayıt olmak için giriş yapmalısınız. Giriş sayfasına gitmek ister misiniz?')) {
        router.push('/uyelik-giris')
      }
      return
    }

    if (!confirm('Bu etkinliğe kayıt olmak istediğinize emin misiniz?')) return

    try {
      setRegistering(programId)

      const response = await fetch(`${API_URL}/programs/${programId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        alert('✅ Etkinliğe başarıyla kaydoldunuz!')
        fetchPrograms()
      } else {
        alert(`❌ ${result.message || 'Kayıt başarısız!'}`)
      }
    } catch (error) {
      console.error('Kayıt hatası:', error)
      alert('❌ Bir hata oluştu!')
    } finally {
      setRegistering(null)
    }
  }

  const formatTime = (dateString, duration) => {
    const start = new Date(dateString)
    const end = new Date(start.getTime() + duration * 60000)
    
    const startTime = start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    const endTime = end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    
    return `${startTime} - ${endTime}`
  }

  const renderProgramCard = (program, isPast = false) => {
    const cardIndex = upcomingPrograms.findIndex(p => p._id === program._id)
    
    return (
      <div 
        key={program._id}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: '30px',
          alignItems: 'center',
          border: '2px solid transparent',
          opacity: isPast ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(10px)'
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'
          e.currentTarget.style.borderColor = isPast ? '#999' : 'var(--main-color)'
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
          background: isPast ? 'linear-gradient(135deg, #999, #666)' :
                      cardIndex % 4 === 0 ? 'linear-gradient(135deg, #667eea, #764ba2)' :
                      cardIndex % 4 === 1 ? 'linear-gradient(135deg, #f093fb, #f5576c)' :
                      cardIndex % 4 === 2 ? 'linear-gradient(135deg, #4facfe, #00f2fe)' :
                      'linear-gradient(135deg, #43e97b, #38f9d7)',
          borderRadius: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', lineHeight: '1' }}>
            {new Date(program.dateTime).getDate()}
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '5px' }}>
            {new Date(program.dateTime).toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase()}
          </div>
        </div>

        {/* Etkinlik Bilgisi */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
            <Link 
              href={`/program-konusmacilar/${program._id}`}
              style={{ textDecoration: 'none' }}
            >
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#333',
                cursor: 'pointer',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--main-color)'}
              onMouseLeave={(e) => e.target.style.color = '#333'}
              >
                {program.title}
              </h3>
            </Link>
            {isPast && (
              <span style={{
                padding: '4px 12px',
                background: '#f0f0f0',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#666',
                fontWeight: '600'
              }}>
                Tamamlandı
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
              <i className='bx bx-user' style={{ fontSize: '18px', color: 'var(--main-color)' }}></i>
              <span style={{ fontSize: '14px' }}>{program.speaker?.name || '-'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
              <i className='bx bx-time' style={{ fontSize: '18px', color: 'var(--main-color)' }}></i>
              <span style={{ fontSize: '14px' }}>{formatTime(program.dateTime, program.duration)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
              <i className='bx bx-map' style={{ fontSize: '18px', color: 'var(--main-color)' }}></i>
              <span style={{ fontSize: '14px' }}>
                {program.location?.type === 'online' ? 'Online' :
                  program.location?.type === 'physical' ? program.location.city || 'Fiziksel' : 'Hibrit'}
              </span>
            </div>
          </div>

          {program.description && (
            <p style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.6',
              marginTop: '10px'
            }}>
              {program.description.substring(0, 150)}...
            </p>
          )}
        </div>

        {/* Butonlar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <Link
            href={`/program-konusmacilar/${program._id}`}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: 'var(--main-color)',
              border: '2px solid var(--main-color)',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--main-color)'
              e.target.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white'
              e.target.style.color = 'var(--main-color)'
            }}
          >
            <i className='bx bx-info-circle'></i> Detay
          </Link>

          {!isPast && (
            program.isUserRegistered ? (
              <div style={{
                padding: '10px 20px',
                background: '#d4edda',
                color: '#155724',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                ✓ Kayıtlı
              </div>
            ) : (
              <button
                onClick={() => handleRegister(program._id)}
                disabled={registering === program._id}
                style={{
                  padding: '10px 20px',
                  background: 'var(--main-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: registering === program._id ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: registering === program._id ? 0.6 : 1,
                  transition: 'all 0.3s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (registering !== program._id) {
                    e.target.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)'
                }}
              >
                {registering === program._id ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </button>
            )
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <section className="program section" id="program" style={{ padding: '80px 20px' }}>
        <div className="center-text">
          <h5 style={{ color: 'var(--main-color)', fontSize: '16px', fontWeight: '600', letterSpacing: '2px' }}>
            PROGRAM
          </h5>
          <h2 style={{ fontSize: '42px', fontWeight: '700', marginTop: '10px' }}>
            Etkinlik Takvimi
          </h2>
        </div>
        <div className="loading-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="loading-spinner"></div>
          <p>Program yükleniyor...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="program section" id="program" style={{ padding: '80px 20px' }}>
      <div className="center-text" style={{ marginBottom: '60px' }}>
        <h5 style={{ color: 'var(--main-color)', fontSize: '16px', fontWeight: '600', letterSpacing: '2px' }}>
          PROGRAM
        </h5>
        <h2 style={{ fontSize: '42px', fontWeight: '700', marginTop: '10px' }}>
          Etkinlik Takvimi
        </h2>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Yaklaşan Etkinlikler */}
        {upcomingPrograms.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '30px',
              paddingBottom: '15px',
              borderBottom: '3px solid var(--main-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🎯 Yaklaşan Etkinlikler
              <span style={{
                fontSize: '14px',
                padding: '4px 12px',
                background: 'var(--main-color)',
                color: 'white',
                borderRadius: '20px'
              }}>
                {upcomingPrograms.length}
              </span>
            </h3>
            {upcomingPrograms.map(program => renderProgramCard(program, false))}
          </div>
        )}

        {/* Geçmiş Etkinlikler */}
        {pastPrograms.length > 0 && (
          <div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '30px',
              paddingBottom: '15px',
              borderBottom: '3px solid #999',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📚 Geçmiş Etkinlikler
              <span style={{
                fontSize: '14px',
                padding: '4px 12px',
                background: '#999',
                color: 'white',
                borderRadius: '20px'
              }}>
                {pastPrograms.length}
              </span>
            </h3>
            {pastPrograms.map(program => renderProgramCard(program, true))}
          </div>
        )}

        {/* Hiç etkinlik yoksa */}
        {upcomingPrograms.length === 0 && pastPrograms.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <i className='bx bx-calendar-x' style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
            <h3 style={{ color: '#666', marginBottom: '10px' }}>Şu anda etkinlik bulunmuyor</h3>
            <p style={{ color: '#999' }}>Yeni etkinlikler için takipte kalın!</p>
          </div>
        )}
      </div>
    </section>
  )
}
