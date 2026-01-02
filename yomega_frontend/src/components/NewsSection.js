'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NewsSection() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/news`)
      
      if (response.ok) {
        const data = await response.json()
        setNews((data.data.news || []).slice(0, 3))
      } else {
        setNews([])
      }
    } catch (error) {
      console.error('Haberler getirilirken hata:', error)
      setNews([])
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

  return (
    <section className="news section" id="news" style={{ background: '#f8f9fa' }}>
      <div className="center-text">
        <h5>HABERLER</h5>
        <h2>Son Haberler ve Duyurular</h2>
        <p style={{
          fontSize: '17px',
          color: '#666',
          maxWidth: '800px',
          margin: '20px auto 0',
          lineHeight: '1.7'
        }}>
          YÖMEGA'nın faaliyetleri, yükseköğretimde eğitim gelişimi alanındaki güncel gelişmeler 
          ve derneğimizin katıldığı ulusal ve uluslararası etkinlikler hakkında en son haberleri 
          buradan takip edebilirsiniz.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="loading-spinner"></div>
          <p>Haberler yükleniyor...</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            padding: '20px 0',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {news.length > 0 ? news.map((item) => (
              <div 
                key={item._id} 
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column'
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
                {/* Görsel */}
                <div style={{
                  width: '100%',
                  height: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: item.image 
                    ? `url(${item.image.startsWith('http') ? item.image : `http://localhost:5001${item.image}`})` 
                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  {!item.image && (
                    <i className='bx bx-news' style={{ fontSize: '48px', color: 'white' }}></i>
                  )}
                </div>
                
                {/* İçerik */}
                <div style={{ 
                  padding: '25px',
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1
                }}>
                  {/* Badges */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '15px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      padding: '5px 12px',
                      background: 'var(--main-color)',
                      color: 'white',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {item.category}
                    </span>
                    {item.isFeatured && (
                      <span style={{
                        padding: '5px 12px',
                        background: '#ffd700',
                        color: '#333',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        ⭐ Öne Çıkan
                      </span>
                    )}
                  </div>
                  
                  {/* Başlık */}
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '12px',
                    lineHeight: '1.4',
                    color: '#2d3748',
                    minHeight: '56px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.title}
                  </h3>
                  
                  {/* Özet */}
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#718096',
                    lineHeight: '1.6',
                    marginBottom: '15px',
                    minHeight: '66px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.summary || item.content}
                  </p>

                  {/* Meta */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: '#a0aec0',
                    marginBottom: '15px',
                    paddingTop: '10px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <i className='bx bx-calendar'></i> {formatDate(item.publishDate)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <i className='bx bx-show'></i> {item.views || 0}
                    </span>
                  </div>

                  {/* Buton */}
                  <Link 
                     href={`/haberler/${item.slug || item._id}`}
                    className="btn"
                    style={{ marginTop: 'auto' }}
                  >
                    Devamını Oku
                  </Link>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
                <i className='bx bx-news' style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
                <p style={{ color: '#666' }}>Henüz haber bulunmuyor</p>
              </div>
            )}
          </div>

          {news.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link 
                href="/haberler" 
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px'
                }}
              >
                Tüm Haberleri Gör
                <i className='bx bx-right-arrow-alt' style={{ fontSize: '20px' }}></i>
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  )
}