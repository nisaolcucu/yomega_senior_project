'use client'
import Image from 'next/image'

export default function PartnersSection() {
  const partners = [
    { 
      name: 'ICED',
      logo: '/images/partners/partner1.svg',
      fullName: 'International Consortium for Educational Development'
    },
    { 
      name: 'ICESSC',
      logo: '/images/partners/partner2.jpg',
      fullName: 'ICESSC'
    },
    { 
      name: 'ICRE-ICRAL 2023',
      logo: '/images/partners/partner3.jpg',
      fullName: 'ICRE-ICRAL 2023'
    }
  ]

  return (
    <section className="cta section">
      <div className="center-text">
        <h5>Bize destek olanlara çok teşekkür ediyoruz.</h5>
        <h2>Birlikte Çalıştığımız Kurumlar</h2>
      </div>

      <div className="cta-content">
        {partners.map((partner, index) => (
          <div 
            key={index} 
            className="cta-img"
            title={partner.fullName}
            style={{ position: 'relative' }}
          >
            <Image 
              src={partner.logo}
              alt={partner.name}
              width={160}
              height={80}
              style={{ 
                filter: 'grayscale(1)', 
                opacity: '0.7', 
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                objectFit: 'contain'
              }}
              onMouseEnter={(e) => {
                e.target.style.filter = 'grayscale(0)'
                e.target.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                e.target.style.filter = 'grayscale(1)'
                e.target.style.opacity = '0.7'
              }}
            />
          </div>
        ))}
      </div>
    </section>
  )
}