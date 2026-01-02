'use client'
import { useState } from 'react'

export default function ContactContent() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api' // ← BURAYA TAŞI
  
  const [sending, setSending] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Lütfen tüm alanları doldurunuz')
      return
    }
  
    try {
      setSending(true)
  
      // Doğrudan messages endpoint'ine gönder
      const response = await fetch(`${API_URL}/messages/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        })
      })
  
      if (response.ok) {
        alert('✅ Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.')
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      } else {
        const error = await response.json()
        alert(`❌ ${error.message || 'Mesaj gönderilemedi'}`)
      }
    } catch (error) {
      console.error('İletişim formu hatası:', error)
      alert('❌ Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.')
    } finally {
      setSending(false)
    }
  }

  const contactInfo = [
    {
      icon: 'bx bxs-map',
      title: 'Adres',
      details: [
        'Yüksek Öğretim Merkezi, Üniversite Cd. No:123, 34000 İstanbul, Türkiye'
      ]
    },
    {
      icon: 'bx bxs-phone',
      title: 'Telefon',
      details: [
        '+90 212 123 45 67',
        '+90 532 987 65 43'
      ]
    },
    {
      icon: 'bx bxs-envelope',
      title: 'E-posta',
      details: [
        'info@yomega.org.tr',
        'iletisim@yomega.org.tr'
      ]
    },
    {
      icon: 'bx bxs-time',
      title: 'Çalışma Saatleri',
      details: [
        'Pazartesi - Cuma: 09:00 - 17:00',
        'Hafta Sonu: Kapalı'
      ]
    }
  ]

  const socialMedia = [
    { icon: 'bx bxl-facebook', url: '#' },
    { icon: 'bx bxl-twitter', url: '#' },
    { icon: 'bx bxl-instagram', url: '#' },
    { icon: 'bx bxl-linkedin', url: '#' },
    { icon: 'bx bxl-youtube', url: '#' }
  ]

  return (
    <section className="contact-section section">
      <div className="center-text">
        <h5>Bize Ulaşın</h5>
        <h2>İletişim Bilgileri</h2>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          {contactInfo.map((info, index) => (
            <div key={index} className="info-item">
              <i className={info.icon}></i>
              <div>
                <h4>{info.title}</h4>
                {info.details.map((detail, detailIndex) => (
                  <p key={detailIndex}>{detail}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="social-media">
            <h4>Sosyal Medya</h4>
            <div className="social-icons">
              {socialMedia.map((social, index) => (
                <a key={index} href={social.url}>
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          <h3>Mesaj Gönder</h3>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Ad Soyad</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Adınız ve soyadınız"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-posta</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="E-posta adresiniz"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Konu</label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Mesajınızın konusu"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Mesaj</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder="Mesajınızı buraya yazınız"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <button type="submit" className="btn" disabled={sending}>
                {sending ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}