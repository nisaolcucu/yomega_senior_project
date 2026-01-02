'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function EventDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [program, setProgram] = useState(null)
    const [loading, setLoading] = useState(true)
    const [registering, setRegistering] = useState(false)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

    useEffect(() => {
        if (params.id) {
            fetchProgram()
        }
    }, [params.id])

    const fetchProgram = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')

            console.log('🔑 Token:', token ? 'Var' : 'Yok') // ← EKLE

            const headers = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const response = await fetch(`${API_URL}/programs/${params.id}`, { headers })

            console.log('📡 Response status:', response.status) // ← EKLE

            if (response.ok) {
                const data = await response.json()
                console.log('📦 Program data:', data) // ← EKLE
                console.log('✅ isUserRegistered:', data.data.program.isUserRegistered) // ← EKLE

                setProgram(data.data.program)
            } else {
                alert('Etkinlik bulunamadı')
                router.push('/program-konusmacilar')
            }
        } catch (error) {
            console.error('Etkinlik yüklenirken hata:', error)
            alert('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')

        if (!token) {
            if (confirm('Bu etkinliğe kayıt olmak için giriş yapmalısınız. Giriş sayfasına gitmek ister misiniz?')) {
                router.push('/uyelik-giris')
            }
            return
        }

        if (!confirm('Bu etkinliğe kayıt olmak istediğinize emin misiniz?')) return

        try {
            setRegistering(true)

            const response = await fetch(`${API_URL}/programs/${params.id}/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const result = await response.json()

            if (response.ok) {
                alert('✅ Etkinliğe başarıyla kaydoldunuz!')

                // ⬇️⬇️⬇️ ÖNEMLİ: Sayfayı yenile ⬇️⬇️⬇️
                await fetchProgram()
                // ⬆️⬆️⬆️ EKLENEN SATIRLAR ⬆️⬆️⬆️

            } else if (response.status === 400) {
                alert(`ℹ️ ${result.message}`)
            } else {
                alert(`❌ ${result.message}`)
            }
        } catch (error) {
            console.error('Kayıt hatası:', error)
            alert('❌ Bir hata oluştu!')
        } finally {
            setRegistering(false)
        }
    }
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <div className="loading-spinner"></div>
                    <p>Etkinlik yükleniyor...</p>
                </div>
                <Footer />
            </>
        )
    }

    if (!program) {
        return null
    }

    const eventDate = new Date(program.dateTime)
    const endTime = new Date(eventDate.getTime() + program.duration * 60000)
    const isPastEvent = eventDate < new Date()

    return (
        <>
            <Header />
            <main className="event-detail-page">
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px 60px' }}>
                    <div style={{ marginBottom: '30px' }}>
                        <Link href="/program-konusmacilar" style={{ color: 'var(--main-color)' }}>
                            ← Etkinliklere Dön
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                        <div>
                            <h1 style={{ fontSize: '36px', marginBottom: '20px' }}>{program.title}</h1>
                            {/* YENİ: Etkinlik Görseli */}
                            {program.image && (
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
                                            program.image.startsWith('http')
                                                ? program.image
                                                : `http://localhost:5001${program.image.startsWith('/') ? program.image : '/' + program.image}`
                                        }
                                        alt={program.title}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '500px',
                                            objectFit: 'contain',
                                            display: 'block'
                                        }}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className='bx bx-calendar' style={{ fontSize: '20px', color: 'var(--main-color)' }}></i>
                                    <span>{formatDate(program.dateTime)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className='bx bx-time' style={{ fontSize: '20px', color: 'var(--main-color)' }}></i>
                                    <span>{formatTime(program.dateTime)} - {formatTime(endTime)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className='bx bx-location-plus' style={{ fontSize: '20px', color: 'var(--main-color)' }}></i>
                                    <span>
                                        {program.location?.type === 'online' ? 'Online' :
                                            program.location?.type === 'physical' ? program.location.address : 'Hibrit'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                                <span style={{
                                    padding: '8px 16px',
                                    background: '#f0f0f0',
                                    borderRadius: '20px',
                                    fontSize: '14px'
                                }}>
                                    <i className='bx bx-category'></i> {program.category}
                                </span>
                                <span style={{
                                    padding: '8px 16px',
                                    background: '#f0f0f0',
                                    borderRadius: '20px',
                                    fontSize: '14px'
                                }}>
                                    <i className='bx bx-time-five'></i> {program.duration} dakika
                                </span>
                            </div>

                            <div style={{
                                padding: '30px',
                                background: '#f9f9f9',
                                borderRadius: '12px',
                                marginBottom: '30px'
                            }}>
                                <h3 style={{ marginBottom: '15px' }}>Etkinlik Hakkında</h3>
                                <p style={{ lineHeight: '1.8', color: '#555' }}>{program.description}</p>
                            </div>

                            {program.speaker && (
                                <div style={{
                                    padding: '30px',
                                    background: 'white',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '12px',
                                    marginBottom: '30px'
                                }}>
                                    <h3 style={{ marginBottom: '20px' }}>Konuşmacı</h3>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            background: '#f0f0f0',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <i className='bx bx-user' style={{ fontSize: '32px', color: '#999' }}></i>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>{program.speaker.name}</h4>
                                            {program.speaker.bio && (
                                                <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '10px' }}>
                                                    {program.speaker.bio}
                                                </p>
                                            )}
                                            {program.speaker.expertise && program.speaker.expertise.length > 0 && (
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {program.speaker.expertise.map((exp, index) => (
                                                        <span key={index} style={{
                                                            padding: '4px 10px',
                                                            background: '#e8f5e9',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            color: '#2e7d32'
                                                        }}>
                                                            {exp}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
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
                                    background: 'linear-gradient(135deg, var(--main-color) 0%, #ff6b6b 100%)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '20px',
                                    color: 'white'
                                }}>
                                    <i className='bx bx-calendar-event' style={{ fontSize: '64px' }}></i>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '10px 0',
                                        borderBottom: '1px solid #eee'
                                    }}>
                                        <span style={{ color: '#666' }}>Katılımcı</span>
                                        <span style={{ fontWeight: '600' }}>
                                            {program.registration?.currentParticipants || 0} / {program.registration?.maxParticipants || '∞'}
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '10px 0',
                                        borderBottom: '1px solid #eee'
                                    }}>
                                        <span style={{ color: '#666' }}>Durum</span>
                                        <span style={{ fontWeight: '600', color: isPastEvent ? '#999' : '#28a745' }}>
                                            {isPastEvent ? 'Tamamlandı' : 'Kayıt Açık'}
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '10px 0'
                                    }}>
                                        <span style={{ color: '#666' }}>Organizatör</span>
                                        <span style={{ fontWeight: '600' }}>{program.organizer?.name || 'YÖMEGA'}</span>
                                    </div>
                                </div>

                                {program.isUserRegistered ? (
                                    <div>
                                        <div style={{
                                            padding: '15px',
                                            background: '#d4edda',
                                            color: '#155724',
                                            borderRadius: '8px',
                                            marginBottom: '10px',
                                            textAlign: 'center',
                                            fontWeight: '600'
                                        }}>
                                            ✓ Bu Etkinliğe Kayıtlısınız
                                        </div>
                                        {program.location?.onlineLink && (
                                            <a
                                                href={program.location.onlineLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn"
                                                style={{
                                                    width: '100%',
                                                    display: 'block',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <i className='bx bx-video'></i> Etkinliğe Katıl
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleRegister}
                                        disabled={registering || isPastEvent}
                                        className="btn"
                                        style={{
                                            width: '100%',
                                            cursor: (registering || isPastEvent) ? 'not-allowed' : 'pointer',
                                            opacity: (registering || isPastEvent) ? 0.6 : 1
                                        }}
                                    >
                                        {registering ? 'Kaydediliyor...' : isPastEvent ? 'Etkinlik Sona Erdi' : 'Etkinliğe Kayıt Ol'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}