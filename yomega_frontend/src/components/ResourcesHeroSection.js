'use client'
export default function ResourcesHeroSection() {
  return (
    <section className="resources-section section" id="resources" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      padding: '120px 13% 80px'
    }}>
      {/* Decorative Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      <div className="center-text" style={{ position: 'relative', zIndex: 1 }}>
        <h5 style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '14px',
          fontWeight: '700',
          letterSpacing: '2px',
          marginBottom: '15px'
        }}>
          EĞİTİM KAYNAKLARI
        </h5>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '800',
          marginBottom: '20px',
          color: 'white'
        }}>
          Kapsamlı Kaynak Koleksiyonumuz
        </h2>
        <p style={{
          fontSize: '18px',
          maxWidth: '700px',
          margin: '0 auto 60px',
          color: 'rgba(255,255,255,0.95)',
          lineHeight: '1.6'
        }}>
          Yükseköğretimde eğitim gelişimi için ihtiyacınız olan tüm kaynaklar burada
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '25px',
        position: 'relative',
        zIndex: 1
      }}>
        {[
          {
            icon: 'bx-book-open',
            title: 'Online Kurslar',
            description: 'Eğitim Teknolojileri, Dijital Öğrenme, Öğretim Tasarımı konularında hazırlanmış kapsamlı online kurslar',
            count: '5.200+',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          },
          {
            icon: 'bx-certification',
            title: 'Sertifika Programları',
            description: 'YÖMEGA ve ICED işbirliği ile hazırlanmış profesyonel gelişim sertifika programları',
            count: '3.800+',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
          },
          {
            icon: 'bx-file-doc',
            title: 'Araştırma & Yayınlar',
            description: 'YÖMEGA Dergi Arşivi, akademik makaleler ve araştırma raporları',
            count: '2.100+',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
          },
          {
            icon: 'bx-video',
            title: 'Video Eğitim Serileri',
            description: 'Uzman söyleşileri, pratik uygulamalar ve webinar kayıtları',
            count: '1.900+',
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
          }
        ].map((item, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '35px 25px',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.03)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
          >
            {/* Icon with Gradient Background */}
            <div style={{
              width: '70px',
              height: '70px',
              background: item.gradient,
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
            }}>
              <i className={`bx ${item.icon}`} style={{ fontSize: '36px', color: 'white' }}></i>
            </div>

            <h3 style={{
              fontSize: '22px',
              fontWeight: '700',
              marginBottom: '12px',
              color: 'white'
            }}>
              {item.title}
            </h3>

            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              minHeight: '60px'
            }}>
              {item.description}
            </p>

            <div style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '700',
              color: 'white'
            }}>
              {item.count} Kaynak
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}