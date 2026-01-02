'use client'

export default function ExternalLinksSection() {
  const linkCategories = [
    {
      title: "Ulusal Kaynaklar",
      icon: "bx-map",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      links: [
        { name: "YÖK - Yükseköğretim Kurulu", url: "https://www.yok.gov.tr" },
        { name: "TÜBİTAK Eğitim Programları", url: "https://www.tubitak.gov.tr" },
        { name: "Türkiye Üniversiteler Birliği", url: "#" },
        { name: "MEB Dijital Eğitim", url: "https://www.meb.gov.tr" }
      ]
    },
    {
      title: "Uluslararası Kaynaklar",
      icon: "bx-globe",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      links: [
        { name: "ICED - Educational Development", url: "https://www.iced.int" },
        { name: "EDUCAUSE", url: "https://www.educause.edu" },
        { name: "European University Association", url: "https://eua.eu" },
        { name: "UNESCO Yükseköğretim", url: "https://www.unesco.org" }
      ]
    },
    {
      title: "Araştırma Veritabanları",
      icon: "bx-data",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      links: [
        { name: "Web of Science", url: "https://www.webofscience.com" },
        { name: "Scopus", url: "https://www.scopus.com" },
        { name: "ERIC - Eğitim Araştırmaları", url: "https://eric.ed.gov" },
        { name: "ResearchGate", url: "https://www.researchgate.net" }
      ]
    },
    {
      title: "İstatistikler",
      icon: "bx-bar-chart-alt-2",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      stats: [
        { label: "Toplam Kaynak", value: "13.000+", icon: "bx-book" },
        { label: "Aktif Üye", value: "280+", icon: "bx-user" },
        { label: "Üniversite Ortağı", value: "50+", icon: "bx-buildings" },
        { label: "Kuruluş Yılı", value: "2020", icon: "bx-calendar" }
      ]
    }
  ];

  return (
    <section style={{ 
      marginTop: '0', 
      padding: '100px 13% 80px', 
      background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
      position: 'relative'
    }}>
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(245, 87, 108, 0.1) 0%, transparent 70%)',
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
          Faydalı Bağlantılar
        </h5>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '800',
          color: '#2d3748',
          marginBottom: '20px'
        }}>
          Ulusal ve Uluslararası Kaynaklar
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#718096',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Eğitim ve araştırma için güvenilir kaynaklara hızlı erişim
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        position: 'relative',
        zIndex: 1
      }}>
        {linkCategories.map((category, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: '25px',
              padding: '40px 35px',
              boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
              transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.08)'
            }}
          >
            {/* Gradient Top Border */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: category.gradient
            }}></div>

            {/* Icon with Gradient */}
            <div style={{
              width: '80px',
              height: '80px',
              background: category.gradient,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '25px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Shine Effect */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%)',
                pointerEvents: 'none'
              }}></div>
              <i className={`bx ${category.icon}`} style={{
                fontSize: '40px',
                color: 'white',
                position: 'relative',
                zIndex: 1
              }}></i>
            </div>

            <h3 style={{
              fontSize: '24px',
              fontWeight: '800',
              marginBottom: '25px',
              color: '#2d3748',
              letterSpacing: '-0.5px'
            }}>
              {category.title}
            </h3>

            <div style={{ textAlign: 'left' }}>
              {/* LİNKLER */}
              {category.links && category.links.map((link, linkIndex) => {
                // category.links.map kısmı için gerçek <a> etiketi
                return (
                  <a
                    key={linkIndex}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 0',
                      color: '#4a5568',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      borderBottom: linkIndex < category.links.length - 1 ? '1px solid #e2e8f0' : 'none',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#f5576c'
                      e.currentTarget.style.paddingLeft = '15px'
                      const icon = e.currentTarget.querySelector('i')
                      if (icon) { icon.style.transform = 'scale(1.2) rotate(45deg)' }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#4a5568'
                      e.currentTarget.style.paddingLeft = '0'
                      const icon = e.currentTarget.querySelector('i')
                      if (icon) { icon.style.transform = 'scale(1) rotate(0deg)' }
                    }}
                  >
                    <i className='bx bx-link-external' style={{ 
                      fontSize: '20px',
                      transition: 'all 0.3s ease',
                      flexShrink: 0
                    }}></i>
                    <span>{link.name}</span>
                  </a>
                )
              })}
              {/* STAT KARTLARI (color için gradient içinde hex yakala/yoksa default kullan) */}
              {category.stats && category.stats.map((stat, statIndex) => {
                // Güvenli renk yakalama
                let fallback = '#667eea';
                let mainColor = fallback;
                try {
                  const found = category.gradient && category.gradient.match(/#[0-9a-fA-F]{6}/);
                  if (found) mainColor = found[0];
                } catch { mainColor = fallback; }
                return (
                  <div
                    key={statIndex}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 0',
                      borderBottom: statIndex < category.stats.length - 1 ? '1px solid #e2e8f0' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '35px',
                        height: '35px',
                        background: mainColor + '15',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className={`bx ${stat.icon}`} style={{
                          fontSize: '18px',
                          color: mainColor
                        }}></i>
                      </div>
                      <span style={{
                        fontSize: '15px',
                        color: '#718096',
                        fontWeight: '500'
                      }}>
                        {stat.label}
                      </span>
                    </div>
                    <strong style={{
                      fontSize: '24px',
                      fontWeight: '800',
                      background: category.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {stat.value}
                    </strong>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}