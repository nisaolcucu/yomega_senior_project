import Link from 'next/link'
import Image from 'next/image'

export default function AboutSection() {
  const features = [
    {
      icon: 'bx bx-check-circle',
      title: '280+ Üye',
      description: 'Türkiye ve yurtdışındaki çeşitli üniversitelerden 280\'i aşkın öğretim üyesi ve araştırmacı'
    },
    {
      icon: 'bx bx-check-circle',
      title: 'Uluslararası İşbirliği',
      description: 'YÖMEGA, Haziran 2023\'te ICED (International Consortium for Educational Development) üyesi olarak kabul edilmiştir'
    },
    {
      icon: 'bx bx-check-circle',
      title: 'Kapsamlı Ağ',
      description: 'Öğretim üyesi eğitim geliştiricileri, öğretme ve öğrenme merkezleri ve uzaktan eğitim merkezleri yöneticileri'
    }
  ]

  return (
    <section className="about" id="about">
      <div className="about-container">
        <div className="about-images">
          <div className="about-img">
            <Image 
              src="/images/about.jpg" 
              alt="YÖMEGA Hakkında"
              width={500}
              height={300}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          
          <div className="about-img">
            <Image 
              src="/images/yomega_etkinlik.jpeg" 
              alt="YÖMEGA Etkinlik"
              width={500}
              height={300}
              style={{ width: '100%', height: 'auto' }}
            />
            <div className="image-caption">
              <p>Son etkinliğimizden bir kare</p>
            </div>
          </div>
        </div>
        
        <div className="about-text">
          <div className="section-title">
            <span>Biz Kimiz?</span>
            <h2>Hakkımızda</h2>
          </div>
          
          <div className="about-content">
            <p className="about-intro">
              Aralık 2020'de yükseköğretim kurumlarında eğitim gelişimi ve öğretim elemanlarının 
              öğrenme ve öğretme konularında mesleki gelişimlerine destek olmayı amaçlayarak kurulan:
            </p>
            
            <h3 className="association-name">
              YüksekÖğretim Mesleki Gelişim Ağı Derneği (YÖMEGA)
            </h3>
            
            <p>Türkiye'de yükseköğretim kurumlarında eğitim geliştirme hedefini temsil etmektedir.</p>
            
            <ul className="about-features">
              {features.map((feature, index) => (
                <li key={index}>
                  <i className={feature.icon}></i>
                  <div>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="about-buttons">
              <Link href="/yonetim-kurulu" className="btn">Daha Fazla Bilgi</Link>
              <Link href="/uyelik-giris" className="btn btn-outline">Üye Olun</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}