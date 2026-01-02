'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NewsPageContent() {
  const [newsData, setNewsData] = useState([])
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
        setNewsData(data.data.news || [])
      }
    } catch (error) {
      console.error('Haber fetch hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="news-section section" style={{ padding: '80px 20px' }}>
        <div className="center-text">
          <h5 style={{ color: 'var(--main-color)', fontSize: '16px', fontWeight: '600', letterSpacing: '2px' }}>
            GÜNCEL DUYURULAR/HABERLER
          </h5>
          <h2 style={{ fontSize: '42px', fontWeight: '700', marginTop: '10px' }}>
            Tüm Haberler
          </h2>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="loading-spinner"></div>
          <p>Haberler yükleniyor...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="news-section section" id="news" style={{ padding: '80px 20px' }}>
      <div className="center-text" style={{ marginBottom: '60px' }}>
        <h5 style={{ color: 'var(--main-color)', fontSize: '16px', fontWeight: '600', letterSpacing: '2px' }}>
          GÜNCEL DUYURULAR/HABERLER
        </h5>
        <h2 style={{ fontSize: '42px', fontWeight: '700', marginTop: '10px' }}>
          Tüm Haberler
        </h2>
      </div>

      {newsData.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '30px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {newsData.map((news, index) => (
            <Link 
              key={news._id} 
              href={`/haberler/${news.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'
                e.currentTarget.style.borderColor = 'var(--main-color)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'
                e.currentTarget.style.borderColor = 'transparent'
              }}
              >
                {/* Görsel Alan - Gradient */}
                <div style={{
                  width: '100%',
                  height: '220px',
                  background: index % 4 === 0 ? 'linear-gradient(135deg, #667eea, #764ba2)' :
                              index % 4 === 1 ? 'linear-gradient(135deg, #f093fb, #f5576c)' :
                              index % 4 === 2 ? 'linear-gradient(135deg, #4facfe, #00f2fe)' :
                              'linear-gradient(135deg, #43e97b, #38f9d7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Dekoratif şekiller */}
                  <div style={{
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    top: '-50px',
                    right: '-50px'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    bottom: '-30px',
                    left: '-30px'
                  }}></div>
                  
                  <i className='bx bx-news' style={{ 
                    fontSize: '80px', 
                    opacity: 0.9,
                    zIndex: 1
                  }}></i>
                </div>

                {/* İçerik */}
                <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Tarih Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#f0f0f0',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '15px',
                    fontWeight: '500',
                    alignSelf: 'flex-start'
                  }}>
                    <i className='bx bx-calendar'></i>
                    {new Date(news.publishDate).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>

                  {/* Başlık */}
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#333',
                    marginBottom: '15px',
                    lineHeight: '1.4',
                    minHeight: '60px'
                  }}>
                    {news.title}
                  </h3>

                  {/* Özet */}
                  <p style={{
                    fontSize: '15px',
                    color: '#666',
                    lineHeight: '1.7',
                    marginBottom: '20px',
                    flex: 1
                  }}>
                    {news.summary?.substring(0, 120) || news.content?.substring(0, 120)}...
                  </p>

                  {/* Devamını Oku */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--main-color)',
                    fontSize: '15px',
                    fontWeight: '600',
                    marginTop: 'auto'
                  }}>
                    Devamını Oku
                    <i className='bx bx-right-arrow-alt' style={{ 
                      fontSize: '22px',
                      transition: 'transform 0.3s'
                    }}></i>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <i className='bx bx-news' style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>Henüz haber eklenmemiş</h3>
          <p style={{ color: '#999' }}>Güncel haberler için takipte kalın!</p>
        </div>
      )}
    </section>
  )
}