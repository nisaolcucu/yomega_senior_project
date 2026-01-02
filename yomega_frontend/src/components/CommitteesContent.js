'use client'

export default function CommitteesContent() {
  const committees = [
    {
      id: 1,
      icon: 'bx bxs-school',
      name: 'Eğitim Geliştirme Komitesi',
      description: 'Yükseköğretim kurumlarında eğitim kalitesini artırmaya yönelik çalışmalar yürütür.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea'
    },
    {
      id: 2,
      icon: 'bx bx-globe',
      name: 'Uluslararası İlişkiler Komitesi',
      description: 'Uluslararası işbirlikleri ve projeler geliştirmek için çalışır.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#f5576c'
    },
    {
      id: 3,
      icon: 'bx bx-research',
      name: 'Araştırma Komitesi',
      description: 'Yükseköğretimde kalite ve gelişim konularında araştırmalar yapar ve yayınlar üretir.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#00f2fe'
    },
    {
      id: 4,
      icon: 'bx bxs-megaphone',
      name: 'İletişim ve Tanıtım Komitesi',
      description: 'Derneğin iletişim stratejilerini geliştirir ve tanıtım faaliyetlerini yürütür.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      color: '#38f9d7'
    }
  ]

  return (
    <section style={{
      padding: '80px 13%',
      background: '#f8f9fa',
      position: 'relative'
    }}>
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '5%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '8%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(245, 87, 108, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>

      <div className="center-text" style={{ marginBottom: '70px', position: 'relative', zIndex: 1 }}>
        <h5 style={{
          color: 'var(--main-color)',
          fontSize: '14px',
          fontWeight: '700',
          letterSpacing: '3px',
          marginBottom: '15px',
          textTransform: 'uppercase'
        }}>
          Komiteler
        </h5>
        <h2 style={{
          fontSize: '42px',
          fontWeight: '800',
          color: '#2d3748',
          marginBottom: '20px'
        }}>
          YÖMEGA Çalışma Komiteleri
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#718096',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          Derneğimizin farklı alanlardaki çalışmalarını yürüten uzman komiteler
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        position: 'relative',
        zIndex: 1
      }}>
        {committees.map((committee, index) => (
          <div
            key={committee.id}
            style={{
              background: 'white',
              borderRadius: '25px',
              padding: '40px 30px',
              textAlign: 'center',
              transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15)'
              e.currentTarget.style.borderColor = committee.color
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            {/* Top Gradient Line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: committee.gradient
            }}></div>

            {/* Decorative Circle Background */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '150px',
              height: '150px',
              background: `${committee.color}10`,
              borderRadius: '50%',
              pointerEvents: 'none'
            }}></div>

            {/* Icon */}
            <div style={{
              width: '90px',
              height: '90px',
              background: committee.gradient,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 25px',
              position: 'relative',
              boxShadow: `0 10px 25px ${committee.color}40`,
              transform: 'rotate(-5deg)',
              transition: 'all 0.3s ease'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotate(0deg) scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotate(-5deg) scale(1)'
              }}
            >
              {/* Icon glow effect */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%)',
                pointerEvents: 'none'
              }}></div>
              <i className={committee.icon} style={{
                fontSize: '45px',
                color: 'white',
                position: 'relative',
                zIndex: 1
              }}></i>
            </div>

            {/* Committee Number Badge */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '35px',
              height: '35px',
              background: `${committee.color}15`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '700',
              color: committee.color
            }}>
              {index + 1}
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '22px',
              fontWeight: '700',
              marginBottom: '15px',
              color: '#2d3748',
              lineHeight: '1.4',
              position: 'relative',
              zIndex: 1
            }}>
              {committee.name}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#718096',
              marginBottom: '25px',
              position: 'relative',
              zIndex: 1
            }}>
              {committee.description}
            </p>

            {/* Learn More Link */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: committee.color,
              fontSize: '15px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.gap = '12px'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.gap = '8px'
              }}
            >
              Detaylı Bilgi
              <i className='bx bx-right-arrow-alt' style={{ fontSize: '20px' }}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA - Üye Ol */}
      <div style={{
        marginTop: '70px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '25px',
        padding: '60px 50px',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
      }}>
        {/* Decorative background */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}></div>

        {/* Decorative background */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{
            fontSize: '42px',
            fontWeight: '800',
            marginBottom: '25px',
            lineHeight: '1.2'
          }}>
            YÖMEGA'ya Katılın!
          </h3>

          <div style={{
            fontSize: '16px',
            lineHeight: '1.8',
            marginBottom: '35px',
            opacity: 0.95
          }}>
            <p style={{ marginBottom: '20px' }}>
              Dernek, Yükseköğretim kurumlarında eğitim ve öğretimin gelişimini desteklemek
              amacıyla öğretim elemanlarının ve üniversitelerde çalışan diğer araştırmacıların
              ve yöneticilerin öğretme ve öğrenme amaçlı becerilerini geliştirmek;
              mesleki gelişimlerini desteklemek için hizmet sunmayı amaçlamaktadır.
            </p>

            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              background: 'rgba(255,255,255,0.15)',
              padding: '20px 25px',
              borderRadius: '15px',
              borderLeft: '5px solid white'
            }}>
              💙 Öğrencilerimiz, asistanlarımız ve hocalarımız... <br />
              Hepinize kucak açıyoruz!
            </p>
          </div>

          {/* Üye Ol Butonu */}

          <a href="/uyelik-giris?tab=register"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '15px',
            padding: '20px 50px',
            background: 'white',
            color: '#667eea',
            borderRadius: '18px',
            fontSize: '20px',
            fontWeight: '700',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'
            e.currentTarget.style.boxShadow = '0 18px 40px rgba(0,0,0,0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)'
          }}
          >
            <i className='bx bx-user-plus' style={{ fontSize: '28px' }}></i>
            Hemen Üye Ol
          </a>

          {/* Bilgi Notu */}
          <p style={{
            marginTop: '30px',
            fontSize: '14px',
            opacity: 0.8
          }}>
            Kayıt sonrası üyelik aidat bilgileri tarafınıza iletilecektir
          </p>
        </div>
      </div>
    </section>
  )
}