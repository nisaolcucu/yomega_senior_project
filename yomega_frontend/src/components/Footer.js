'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {

  return (
    <footer className="footer" id="footer" style={{ backgroundColor: '#2d2d2d', minHeight: '200px' }}>
      <div className="footer-top">
        <div className="footer-row">
          <div className="footer-col">
            {/* ✅ YENİ LOGO - İkon + Yazı */}
            <Link
              href="/"
              className="logo"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none',
                marginBottom: '15px'
              }}
            >
              {/* Logo İkonu */}
              <div style={{
                position: 'relative',
                width: '45px',
                height: '45px',
                flexShrink: 0
              }}>
                <Image 
                  src="/images/yomega-icon.png" // ✅ İlk görseli buraya koy
                  alt="YÖMEGA Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>

              {/* Logo Yazısı */}
              <div style={{
                position: 'relative',
                width: '140px',
                height: '35px',
                flexShrink: 0
              }}>
                <Image 
                  src="/images/yomega-text.png" // ✅ İkinci görseli buraya koy
                  alt="YÖMEGA"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </Link>

            <p>
              Türkiye'de yükseköğretim kurumlarında eğitim geliştirme hedefini temsil eden
              YüksekÖğretim Mesleki Gelişim Ağı Derneği.
            </p>
            <div className="social-links">
              <a href="https://www.youtube.com/@yomegaorg" aria-label="Youtube">
                <i className='bx bxl-youtube'></i>
              </a>
              <a href="https://www.instagram.com/yomega2020/" aria-label="Instagram">
                <i className='bx bxl-instagram'></i>
              </a>
              <a href="https://www.linkedin.com/groups/4787111/" aria-label="LinkedIn">
                <i className='bx bxl-linkedin'></i>
              </a>
              <a href="https://x.com/YMEGA8" aria-label="Twitter">
                <i className='bx bxl-twitter'></i>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Hızlı Erişim</h4>
            <ul>
              <li>
                <Link href="/">
                  <i className='bx bx-chevron-right'></i> Anasayfa
                </Link>
              </li>
              <li>
                <Link href="/haberler">
                  <i className='bx bx-chevron-right'></i> Haberler
                </Link>
              </li>
              <li>
                <Link href="/program-konusmacilar">
                  <i className='bx bx-chevron-right'></i> Program
                </Link>
              </li>
              <li>
                <Link href="/yonetim-kurulu">
                  <i className='bx bx-chevron-right'></i> Yönetim Kurulu
                </Link>
              </li>
              <li>
                <Link href="/iletisim">
                  <i className='bx bx-chevron-right'></i> İletişim
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Üyelik</h4>
            <ul>
              <li>
                <Link href="/uyelik-giris">
                  <i className='bx bx-chevron-right'></i> Profil
                </Link>
              </li>
              <li>
                <Link href="/uyelik-giris">
                  <i className='bx bx-chevron-right'></i> Giriş Yap
                </Link>
              </li>
              <li>
                <Link href="/uyelik-giris">
                  <i className='bx bx-chevron-right'></i> Üye Ol
                </Link>
              </li>
              <li>
                <Link href="/iletisim">
                  <i className='bx bx-chevron-right'></i> SSS
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>İletişim Bilgileri</h4>
            <p>
              <i className='bx bx-map'></i> Ankara, Türkiye
            </p>
            <p>
              <i className='bx bx-envelope'></i>
              <a href="mailto:info@yomega.org.tr" style={{ color: 'white' }}>info@yomega.org.tr</a>
            </p>
            <p>
              <i className='bx bx-phone'></i>
              <a href="tel:+903121234567" style={{ color: 'white' }}>+90 312 123 45 67</a>
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="copyright">
            <p>&copy; 2025 YÖMEGA. Tüm hakları saklıdır.</p>
          </div>
          <div className="footer-bottom-links">
            <a href="#">Gizlilik Politikası</a>
            <a href="#">Kullanım Koşulları</a>
            <a href="#">Çerez Politikası</a>
          </div>
        </div>
        <div className="footer-bottom-content">
          <div className="footer-bottom-links">
            Designed by
            
              <a href="https://www.linkedin.com/in/elif-nisa-ölçücü-08984023b/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Elif Nisa Ölçücü
            </a>
            &amp;
            
             <a href="https://www.linkedin.com/in/fatma-betül-avcı-926b39254/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fatma Betül Avcı
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}