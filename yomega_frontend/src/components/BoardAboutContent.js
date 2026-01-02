'use client'

export default function BoardAboutContent() {
  const responsibilities = [
    {
      icon: 'bx-target-lock',
      title: 'Derneğin amaçlarını gerçekleştirmek için gerekli çalışmaları yürütmek'
    },
    {
      icon: 'bx-calendar-event',
      title: 'Üyelerin gelişimi için etkinlikler ve programlar düzenlemek'
    },
    {
      icon: 'bx-world',
      title: 'Ulusal ve uluslararası işbirlikleri geliştirmek'
    },
    {
      icon: 'bx-trending-up',
      title: 'Yükseköğretimde kalite ve gelişim çalışmalarına katkı sağlamak'
    },
    {
      icon: 'bx-wallet',
      title: 'Derneğin bütçe ve mali işlerini takip etmek'
    },
    {
      icon: 'bx-user-check',
      title: 'Üyelik başvurularını değerlendirmek ve karara bağlamak'
    }
  ]

  return (
    <section style={{ 
      padding: '80px 13%', 
      background: 'white',
      position: 'relative'
    }}>
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>

      <div className="center-text" style={{ marginBottom: '60px' }}>
        <h5 style={{
          color: 'var(--main-color)',
          fontSize: '14px',
          fontWeight: '700',
          letterSpacing: '3px',
          marginBottom: '15px',
          textTransform: 'uppercase'
        }}>
          Görev ve Sorumluluklar
        </h5>
        <h2 style={{
          fontSize: '42px',
          fontWeight: '800',
          color: '#2d3748',
          marginBottom: '20px'
        }}>
          Yönetim Kurulunun Çalışmaları
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '40px',
        marginBottom: '60px'
      }}>
        {/* Left Column - Responsibilities */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '25px',
          padding: '40px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)'
        }}>
          {/* Decorative background */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-30%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
            pointerEvents: 'none'
          }}></div>

          <h3 style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '30px',
            position: 'relative',
            zIndex: 1
          }}>
            Yönetim Kurulu Görevleri
          </h3>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            {responsibilities.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '15px',
                  marginBottom: index < responsibilities.length - 1 ? '25px' : '0',
                  padding: '15px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '15px',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.transform = 'translateX(5px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className={`bx ${item.icon}`} style={{ fontSize: '24px' }}></i>
                </div>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Meetings */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '25px',
          padding: '40px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(245, 87, 108, 0.2)'
        }}>
          {/* Decorative background */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-30%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
            pointerEvents: 'none'
          }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '25px'
            }}>
              <i className='bx bx-calendar-check' style={{ fontSize: '32px' }}></i>
            </div>

            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '25px'
            }}>
              Yönetim Kurulu Toplantıları
            </h3>
            
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <i className='bx bx-time-five' style={{ fontSize: '24px' }}></i>
                <strong style={{ fontSize: '16px' }}>Düzenli Toplantılar</strong>
              </div>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                margin: 0,
                opacity: 0.95
              }}>
                Yönetim Kurulu ayda bir kez düzenli olarak toplanmaktadır. Toplantılarda derneğin 
                güncel faaliyetleri, gelecek planlamaları ve projeleri değerlendirilmektedir.
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '15px',
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <i className='bx bx-show' style={{ fontSize: '24px' }}></i>
                <strong style={{ fontSize: '16px' }}>Şeffaflık</strong>
              </div>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                margin: 0,
                opacity: 0.95
              }}>
                Toplantı notları üyelerle şeffaf bir şekilde paylaşılmaktadır. Yönetim Kurulu, 
                her yıl düzenlenen genel kurulda dernek üyelerine bir önceki yılın faaliyetleri 
                ve gelecek planları hakkında bilgi vermektedir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}