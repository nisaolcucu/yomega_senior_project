'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section
      className="home"
      id="home"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        paddingTop: '100px',
      }}
    >
      {/* Animated Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`,
        pointerEvents: 'none'
      }} />

      {/* Floating Icons */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        fontSize: '80px',
        color: 'rgba(255,255,255,0.1)',
        animation: 'float 6s ease-in-out infinite'
      }}>
        <i className='bx bxs-graduation'></i>
      </div>

      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        fontSize: '60px',
        color: 'rgba(255,255,255,0.1)',
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '2s'
      }}>
        <i className='bx bxs-book-open'></i>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        fontSize: '70px',
        color: 'rgba(255,255,255,0.1)',
        animation: 'float 7s ease-in-out infinite',
        animationDelay: '1s'
      }}>
        <i className='bx bxs-bulb'></i>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 5%',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Sol Taraf - Text */}
        <div>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '30px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              background: '#43e97b',
              borderRadius: '50%',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            YÖMEGA
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            lineHeight: '1.2',
            marginBottom: '20px',
            color: 'white',
            fontWeight: '800',
            textShadow: '0 2px 20px rgba(0,0,0,0.1)'
          }}>
            Yükseköğretim<br />
            <span style={{
              background: 'linear-gradient(90deg, #43e97b, #38f9d7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Mesleki Gelişim
            </span><br />
            Ağı Derneği
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '40px',
            lineHeight: '1.8',
            maxWidth: '600px'
          }}>
            Aralık 2020'de yükseköğretim kurumlarında eğitim gelişimi ve öğretim elemanlarının
            öğrenme ve öğretme konularında mesleki gelişimlerine destek olmayı amaçlayarak kurulan YÖMEGA
            Türkiye'de yükseköğretim kurumlarında eğitimi geliştirme hedefini temsil etmektedir.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <Link
              href="/uyelik-giris"
              style={{
                padding: '16px 32px',
                background: 'white',
                color: '#667eea',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'
              }}
            >
              <i className='bx bx-user-plus' style={{ fontSize: '20px' }}></i>
              Üye Ol
            </Link>

            <Link
              href="/program-konusmacilar"
              style={{
                padding: '16px 32px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <i className='bx bx-calendar' style={{ fontSize: '20px' }}></i>
              Etkinlikleri Keşfet
            </Link>
          </div>
        </div>

        {/* Sağ Taraf - Interactive Cards */}
        <div
          style={{
            position: 'relative',
            height: '600px',
            display: 'flex',
            alignItems: 'center', // ✅ Dikey ortalama
            justifyContent: 'center' // ✅ Yatay ortalama
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 3D Card Stack */}
          {[
            {
              icon: 'bxs-graduation',
              color: '#43e97b',
              rotate: '-10deg',
              normalTop: '50px', // ✅ ORTALANDI
              hoverTop: '50px',
              title: 'Eğitim Gelişim',
              subtitle: 'Profesyonel programlar',
              type: 'text'
            },
            {
              icon: 'bxs-book-open',
              color: '#38f9d7',
              rotate: '5deg',
              normalTop: '130px', // ✅ ORTALANDI
              hoverTop: '220px',
              title: 'Kaynak Merkezi',
              subtitle: 'Zengin içerik kütüphanesi',
              type: 'text'
            },
            {
              type: 'image',
              rotate: '-5deg',
              normalTop: '210px', // ✅ ORTALANDI
              hoverTop: '390px',
              image: '/images/yomega_etkinlik.jpeg',
              title: 'Akademik İşbirliği'
            }
          ].map((card, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: '50%',
              transform: isHovered
                ? `translateX(-50%) rotate(0deg)`
                : `translateX(-50%) rotate(${card.rotate})`,
              top: isHovered ? card.hoverTop : card.normalTop,
              width: '320px',
              height: '150px',
              background: card.type === 'image'
                ? 'none'
                : 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '2px solid rgba(255,255,255,0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              cursor: 'pointer',
              zIndex: isHovered ? (10 - i) : i
            }}>
              {card.type === 'text' ? (
                // Text Card
                <>
                  <i className={`bx ${card.icon}`} style={{
                    fontSize: '50px',
                    color: card.color,
                    filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.3))',
                    transition: 'all 0.3s ease'
                  }}></i>

                  <div style={{ textAlign: 'center', color: 'white', padding: '0 20px' }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      margin: '0 0 5px 0',
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}>
                      {card.title}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      margin: 0,
                      opacity: 0.9,
                      fontWeight: '500'
                    }}>
                      {card.subtitle}
                    </p>
                  </div>
                </>
              ) : (
                // Image Card
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    style={{
                      objectFit: 'cover',
                      borderRadius: '18px'
                    }}
                  />
                  {/* Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '15px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    borderRadius: '0 0 18px 18px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      margin: 0,
                      color: 'white',
                      textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                      {card.title}
                    </h3>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        color: 'rgba(255,255,255,0.7)',
        animation: 'bounce 2s ease-in-out infinite'
      }}>
        <span style={{ fontSize: '14px', fontWeight: '600' }}>Aşağı Kaydır</span>
        <i className='bx bx-chevron-down' style={{ fontSize: '24px' }}></i>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          section > div { 
            grid-template-columns: 1fr !important; 
            gap: 30px !important;
          }
          section {
            padding-top: 120px !important;
          }
        }
      `}</style>
    </section>
  )
}