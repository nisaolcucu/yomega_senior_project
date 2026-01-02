'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ResourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    if (params.id) {
      fetchResource()
    }
  }, [params.id])

  const fetchResource = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_URL}/resources/${params.id}`, { headers })

      if (response.ok) {
        const data = await response.json()
        setResource(data.data.resource)
      } else {
        alert('Kaynak bulunamadı')
        router.push('/kaynaklar')
      }
    } catch (error) {
      console.error('Kaynak yüklenirken hata:', error)
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSave = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')

    if (!token) {
      alert('Favorilere eklemek için giriş yapmalısınız')
      router.push('/uyelik-giris')
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`${API_URL}/resources/${params.id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchResource()
      }
    } catch (error) {
      console.error('Favorilere ekleme hatası:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div className="loading-spinner"></div>
          <p>Kaynak yükleniyor...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (!resource) {
    return null
  }

  return (
    <>
      <Header />
      <main className="resource-detail-page">
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px 60px' }}>
          <div style={{ marginBottom: '30px' }}>
            <Link href="/kaynaklar" style={{ color: 'var(--main-color)' }}>
              ← Kaynaklara Dön
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
            <div>
              <h1 style={{ fontSize: '36px', marginBottom: '20px' }}>{resource.title}</h1>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '8px 16px',
                  background: '#f0f0f0',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  <i className='bx bx-category'></i> {resource.category}
                </span>
                <span style={{
                  padding: '8px 16px',
                  background: '#f0f0f0',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  <i className='bx bx-file'></i> {resource.type}
                </span>
                <span style={{
                  padding: '8px 16px',
                  background: '#f0f0f0',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  <i className='bx bx-bar-chart'></i> {resource.difficulty}
                </span>
              </div>

              <div style={{
                padding: '30px',
                background: '#f9f9f9',
                borderRadius: '12px',
                marginBottom: '30px'
              }}>
                <h3 style={{ marginBottom: '15px' }}>Açıklama</h3>
                <p style={{ lineHeight: '1.8', color: '#555' }}>{resource.description}</p>
              </div>

              {resource.author?.name && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ marginBottom: '15px' }}>Yazar</h3>
                  <p><strong>{resource.author.name}</strong></p>
                  {resource.author.organization && (
                    <p style={{ color: '#666' }}>{resource.author.organization}</p>
                  )}
                </div>
              )}

              {resource.tags && resource.tags.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '15px' }}>Etiketler</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {resource.tags.map((tag, index) => (
                      <span key={index} style={{
                        padding: '6px 12px',
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '16px',
                        fontSize: '13px'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div style={{
                position: 'sticky',
                top: '100px',
                padding: '30px',
                background: 'white',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: '#f0f0f0',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <i className='bx bx-book' style={{ fontSize: '64px', color: '#999' }}></i>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #eee'
                  }}>
                    <span style={{ color: '#666' }}>İndirme</span>
                    <span style={{ fontWeight: '600' }}>{resource.downloadCount || 0}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #eee'
                  }}>
                    <span style={{ color: '#666' }}>Görüntülenme</span>
                    <span style={{ fontWeight: '600' }}>{resource.viewCount || 0}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0'
                  }}>
                    <span style={{ color: '#666' }}>Yayın Tarihi</span>
                    <span style={{ fontWeight: '600' }}>
                      {new Date(resource.publishDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>

                {resource.isDownloadable && resource.file?.path && (
                  <a
                    href={`${API_URL.replace('/api', '')}/uploads/${resource.file.filename}`}
                    download
                    className="btn"
                    style={{
                      width: '100%',
                      display: 'block',
                      textAlign: 'center',
                      marginBottom: '10px'
                    }}
                  >
                    <i className='bx bx-download'></i> İndir
                  </a>
                )}

                {/* YENİ: Link Gösterme (url veya externalLink) */}
                {(resource.type === 'link' && (resource.url || resource.externalLink)) && (
                  <a
                    href={resource.url || resource.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      width: '100%',
                      display: 'block',
                      textAlign: 'center',
                      marginBottom: '10px',
                      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      border: 'none'
                    }}
                  >
                    <i className='bx bx-link-external'></i> Harici Bağlantıya Git
                  </a>
                )}

               

                <button
                  onClick={handleToggleSave}
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: resource.isSaved ? 'var(--main-color)' : 'white',
                    color: resource.isSaved ? 'white' : 'var(--main-color)',
                    border: '2px solid var(--main-color)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {saving ? 'İşleniyor...' : resource.isSaved ? (
                    <>
                      <i className='bx bxs-heart'></i> Favorilerimde
                    </>
                  ) : (
                    <>
                      <i className='bx bx-heart'></i> Favorilere Ekle
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main >
      <Footer />
    </>
  )
}