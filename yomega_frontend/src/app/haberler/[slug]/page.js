'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NewsDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [news, setNews] = useState(null)
    const [loading, setLoading] = useState(true)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

    useEffect(() => {
        if (params.slug) {
            fetchNews()
        }
    }, [params.slug])

    const fetchNews = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/news/${params.slug}`)

            if (response.ok) {
                const data = await response.json()
                setNews(data.data.news)
            } else {
                alert('Haber bulunamadı')
                router.push('/haberler')
            }
        } catch (error) {
            console.error('Haber yüklenirken hata:', error)
            alert('Bir hata oluştu')
            router.push('/haberler')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', padding: '150px 20px' }}>
                    <div className="loading-spinner"></div>
                    <p>Haber yükleniyor...</p>
                </div>
                <Footer />
            </>
        )
    }

    if (!news) {
        return null
    }

    return (
        <>
            <Header />
            <main style={{ padding: '120px 20px 60px', maxWidth: '900px', margin: '0 auto' }}>
                {/* Breadcrumb */}
                <div style={{ marginBottom: '30px' }}>
                    <Link href="/haberler" style={{ color: 'var(--main-color)', fontSize: '14px' }}>
                        ← Haberlere Dön
                    </Link>
                </div>

                {/* Görsel Banner */}
                <div style={{
                    width: '100%',
                    height: '400px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '40px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        top: '-100px',
                        right: '-100px'
                    }}></div>
                    <i className='bx bx-news' style={{
                        fontSize: '120px',
                        color: 'white',
                        opacity: 0.9,
                        zIndex: 1
                    }}></i>
                </div>

                {/* Tarih ve Kategori */}
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: '#f0f0f0',
                        borderRadius: '20px',
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        <i className='bx bx-calendar'></i>
                        {new Date(news.publishDate).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </div>
                    {news.category && (
                        <div style={{
                            padding: '8px 16px',
                            background: 'var(--main-color)',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            {news.category}
                        </div>
                    )}
                </div>

                {/* Başlık */}
                <h1 style={{
                    fontSize: '42px',
                    fontWeight: '700',
                    lineHeight: '1.3',
                    marginBottom: '20px',
                    color: '#333'
                }}>
                    {news.title}
                </h1>

                {/* YENİ: Haber Görseli */}
                {news.image && (
                    <div style={{
                        width: '100%',
                        maxHeight: '500px',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        marginBottom: '30px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f5f5f5'
                    }}>
                        <img
                            src={
                                news.image.startsWith('http')
                                    ? news.image
                                    : `http://localhost:5001${news.image.startsWith('/') ? news.image : '/' + news.image}`
                            }
                            alt={news.title}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '500px',
                                objectFit: 'contain', // Kırpmadan tamamını göster
                                display: 'block'
                            }}
                        />
                    </div>
                )}

                {/* Özet */}
                {news.summary && (
                    <p style={{
                        fontSize: '18px',
                        color: '#666',
                        lineHeight: '1.8',
                        marginBottom: '40px',
                        padding: '20px',
                        background: '#f9f9f9',
                        borderLeft: '4px solid var(--main-color)',
                        borderRadius: '8px'
                    }}>
                        {news.summary}
                    </p>
                )}

                {/* İçerik */}
                <div style={{
                    fontSize: '16px',
                    lineHeight: '1.9',
                    color: '#444',
                    marginBottom: '60px'
                }}
                    dangerouslySetInnerHTML={{ __html: news.content.replace(/\n/g, '<br/>') }}
                />

                {/* Paylaş Butonları */}
                {/* Link Kopyala */}
                <div style={{
                    padding: '30px',
                    background: '#f9f9f9',
                    borderRadius: '15px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#333' }}>
                        Bu haberi paylaş
                    </h3>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            alert('✅ Link kopyalandı! Artık istediğiniz yerde paylaşabilirsiniz.')
                        }}
                        style={{
                            padding: '14px 30px',
                            background: 'var(--main-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '16px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)'
                            e.target.style.boxShadow = '0 10px 25px rgba(255, 107, 107, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)'
                            e.target.style.boxShadow = 'none'
                        }}
                    >
                        <i className='bx bx-link-alt' style={{ fontSize: '22px' }}></i>
                        Linki Kopyala
                    </button>
                </div>

                {/* Geri Dön Butonu */}
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Link href="/haberler" className="btn">
                        Tüm Haberlere Dön
                    </Link>
                </div>
            </main>
            <Footer />
        </>
    )
}