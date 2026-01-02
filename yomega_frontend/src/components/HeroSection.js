'use client'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="home" id="home">
      <div className="home-text">
        <span style={{ 
          color: 'var(--main-color)', 
          fontSize: '16px', 
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          YÖMEGA
        </span>
        
        <h1 style={{ 
          fontSize: '48px', 
          lineHeight: '1.2',
          marginTop: '10px',
          marginBottom: '15px'
        }}>
         YüksekÖğretim Mesleki <br />
         Gelişim Ağı Derneği
        </h1>
        
        <p style={{ 
          fontSize: '18px', 
          color: '#666',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          Aralık 2020'de yükseköğretim kurumlarında eğitim gelişimi ve öğretim elemanlarının 
          öğrenme ve öğretme konularında mesleki gelişimlerine destek olmayı ve bu konulara 
          ilişkin sorunlarını tartışarak ve bilgi paylaşımında bulunmayı amaçlayarak kurulan <span> YÖMEGA </span> <br/>
          Türkiye’de yükseköğretim kurumlarında eğitim geliştirme hedefini temsil etmektedir.
        </p>

        {/* CTA Butonları */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          flexWrap: 'wrap'
        }}>
          <Link href="/uyelik-giris" className="btn" style={{ padding: '14px 30px' }}>
            <i className='bx bx-user-plus'></i> Üye Ol
          </Link>
          <Link 
            href="/program-konusmacilar" 
            className="btn" 
            style={{ 
              padding: '14px 30px',
              background: 'transparent',
              color: 'var(--main-color)',
              border: '2px solid var(--main-color)'
            }}
          >
            <i className='bx bx-calendar'></i> Etkinlikleri Keşfet
          </Link>
        </div>
      </div>

      {/* Sağ Taraf - Görsel/İllüstrasyon */}
      <div className="home-img">
        <div style={{
          width: '70%',
          height: '70%',
          background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(102, 126, 234, 0.1))',
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* SVG İllüstrasyon */}
          <div style={{
            fontSize: '200px',
            color: 'rgba(255, 107, 107, 0.2)',
            transform: 'rotate(-15deg)'
          }}>
            <i className='bx bxs-graduation'></i>
          </div>
        </div>
      </div>
    </section>
  )
}