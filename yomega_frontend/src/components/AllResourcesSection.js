'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AllResourcesSection() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [savingResource, setSavingResource] = useState(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchAllResources()
  }, [])

  const fetchAllResources = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json'
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/resources`, {
        headers
      })

      if (response.ok) {
        const data = await response.json()

        if (data.success && data.data && data.data.resources) {
          setResources(data.data.resources)
        } else {
          setResources([])
        }
      } else {
        setError('Kaynaklar yüklenemedi')
        setResources([])
      }
    } catch (error) {
      console.error('Kaynaklar getirilirken hata:', error)
      setError('Bağlantı hatası')
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSave = async (resourceId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')

    if (!token) {
      alert('Favorilere eklemek için giriş yapmalısınız')
      return
    }

    try {
      setSavingResource(resourceId)

      const response = await fetch(`${API_URL}/resources/${resourceId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        fetchAllResources()
      } else {
        alert(result.message || 'İşlem başarısız!')
      }
    } catch (error) {
      console.error('Kaynak kaydetme hatası:', error)
      alert('Bir hata oluştu!')
    } finally {
      setSavingResource(null)
    }
  }

  const getResourceIcon = (type) => {
    const iconMap = {
      'pdf': 'bx-file-doc',
      'video': 'bx-play-circle',
      'audio': 'bx-music',
      'presentation': 'bx-slideshow',
      'document': 'bx-file',
      'link': 'bx-link',
      'image': 'bx-image',
      'dataset': 'bx-data'
    }
    return iconMap[type] || 'bx-book'
  }

  const formatDifficulty = (difficulty) => {
    const difficultyMap = {
      'başlangıç': 'Başlangıç',
      'orta': 'Orta',
      'ileri': 'İleri',
      'tüm seviyeler': 'Tüm Seviyeler'
    }
    return difficultyMap[difficulty] || difficulty
  }

  const formatCategory = (category) => {
    const categoryMap = {
      'eğitim materyali': 'Eğitim Materyali',
      'araştırma': 'Araştırma',
      'makale': 'Makale',
      'video eğitim': 'Video Eğitim',
      'sunum': 'Sunum',
      'rapor': 'Rapor',
      'rehber': 'Rehber',
      'şablon': 'Şablon',
      'podcast': 'Podcast',
      'diğer': 'Diğer'
    }
    return categoryMap[category] || category
  }

  const filteredResources = resources.filter(resource => {
    if (selectedCategory !== 'all' && resource.category !== selectedCategory) return false
    if (selectedDifficulty !== 'all' && resource.difficulty !== selectedDifficulty) return false
    return true
  })

  if (loading) {
    return (
      <section className="all-resources section">
        <div className="center-text">
          <h5>TÜM KAYNAKLAR</h5>
          <h2>Kaynak Kütüphanesi</h2>
        </div>

        <div className="loading-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="loading-spinner"></div>
          <p>Kaynaklar yükleniyor...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="all-resources section">
        <div className="center-text">
          <h5>TÜM KAYNAKLAR</h5>
          <h2>Kaynak Kütüphanesi</h2>
        </div>

        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#999' }}>{error}</p>
          <button
            className="btn"
            onClick={fetchAllResources}
            style={{ marginTop: '20px' }}
          >
            Tekrar Dene
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="all-resources section">
      <div className="center-text">
        <h5>TÜM KAYNAKLAR</h5>
        <h2>Kaynak Kütüphanesi</h2>
        <p style={{ marginTop: '20px', marginBottom: '50px', color: '#666', fontSize: '16px' }}>
          {filteredResources.length} kaynak bulundu
        </p>
      </div>

      {/* Filtreler */}
      <div style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        marginBottom: '60px',
        marginTop: '30px',
        flexWrap: 'wrap'
      }}>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '2px solid #ddd',
            fontSize: '15px'
          }}
        >
          <option value="all">Tüm Kategoriler</option>
          <option value="eğitim materyali">Eğitim Materyali</option>
          <option value="araştırma">Araştırma</option>
          <option value="makale">Makale</option>
          <option value="video eğitim">Video Eğitim</option>
          <option value="sunum">Sunum</option>
          <option value="rapor">Rapor</option>
          <option value="rehber">Rehber</option>
          <option value="şablon">Şablon</option>
          <option value="podcast">Podcast</option>
          <option value="diğer">Diğer</option>
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '2px solid #ddd',
            fontSize: '15px'
          }}
        >
          <option value="all">Tüm Seviyeler</option>
          <option value="başlangıç">Başlangıç</option>
          <option value="orta">Orta</option>
          <option value="ileri">İleri</option>
          <option value="tüm seviyeler">Tüm Seviyeler</option>
        </select>
      </div>

      {/* Modern Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '30px',
        padding: '20px 0'
      }}>
        {filteredResources.length > 0 ? filteredResources.map((resource) => (
          <div
            key={resource._id}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              padding: '30px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}
          >
            {/* Decorative Background */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}></div>

            {/* Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 1
            }}>
              <i className={`bx ${getResourceIcon(resource.type)}`} style={{ fontSize: '40px', color: 'white' }}></i>
            </div>

            {/* Category Badge */}
            <div style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(10px)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '15px',
              position: 'relative',
              zIndex: 1
            }}>
              {formatCategory(resource.category)}
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '22px',
              fontWeight: '700',
              marginBottom: '12px',
              lineHeight: '1.4',
              position: 'relative',
              zIndex: 1,
              color: 'white'
            }}>
              {resource.title}
            </h3>

            {/* Author & Difficulty */}
            <p style={{
              fontSize: '14px',
              marginBottom: '20px',
              opacity: 0.9,
              position: 'relative',
              zIndex: 1,
              color: 'rgba(255,255,255,0.95)'
            }}>
              {resource.author?.name && `${resource.author.name} • `}
              {formatDifficulty(resource.difficulty)}
            </p>

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '20px',
              fontSize: '13px',
              position: 'relative',
              zIndex: 1,
              color: 'rgba(255,255,255,0.9)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className='bx bx-download'></i> {resource.downloadCount || 0}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className='bx bx-show'></i> {resource.viewCount || 0}
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleSave(resource._id)
                }}
                disabled={savingResource === resource._id}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: resource.isSaved ? 'white' : 'rgba(255,255,255,0.2)',
                  color: resource.isSaved ? '#667eea' : 'white',
                  border: resource.isSaved ? 'none' : '2px solid rgba(255,255,255,0.5)',
                  borderRadius: '12px',
                  cursor: savingResource === resource._id ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: savingResource === resource._id ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  if (!resource.isSaved && savingResource !== resource._id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!resource.isSaved) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                {savingResource === resource._id ? (
                  'İşleniyor...'
                ) : resource.isSaved ? (
                  <>
                    <i className='bx bxs-heart'></i> Favorilerimde
                  </>
                ) : (
                  <>
                    <i className='bx bx-heart'></i> Ekle
                  </>
                )}
              </button>

              <Link
                href={`/kaynaklar/${resource._id}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Görüntüle <i className='bx bx-right-arrow-alt'></i>
              </Link>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px' }}>
            <i className='bx bx-book' style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
            <h3 style={{ color: '#666', marginBottom: '10px' }}>Bu filtreye uygun kaynak bulunamadı</h3>
            <p style={{ color: '#999' }}>Farklı bir filtre kombinasyonu deneyin</p>
          </div>
        )}
      </div>
    </section>
  )
}