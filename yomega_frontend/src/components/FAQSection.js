'use client'
import { useState } from 'react'

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null)

  const faqData = [
    {
      question: "YÖMEGA'ya nasıl üye olabilirim?",
      answer: "YÖMEGA'ya üye olmak için web sitemizden üyelik formunu doldurabilir veya doğrudan iletişim bilgilerimiz üzerinden bize ulaşabilirsiniz. Üyelik başvuruları yönetim kurulu tarafından değerlendirilir ve onaylanır."
    },
    {
      question: "Etkinliklerinize nasıl katılabilirim?",
      answer: "Etkinliklerimize katılmak için web sitemiz üzerinden güncel etkinlik takvimini takip edebilir ve etkinlik sayfalarından kayıt olabilirsiniz. Bazı etkinliklerimiz üyelerimize özel olabilir, bu durumda öncelikle üyelik işlemlerinizi tamamlamanız gerekecektir."
    },
    {
      question: "YÖMEGA'nın uluslararası bağlantıları var mı?",
      answer: "Evet, YÖMEGA Haziran 2023'te ICED (International Consortium for Educational Development/ Uluslararası Eğitimsel Gelişim Konsorsiyumu) üyesi olarak kabul edilmiştir. Bu sayede uluslararası düzeyde eğitim geliştirme çalışmalarında aktif rol almaktadır."
    },
    {
      question: "Üyelik ücretleri ne kadardır?",
      answer: "Üyelik ücretleri her yıl yönetim kurulu tarafından belirlenmektedir. Güncel üyelik ücretleri hakkında bilgi almak için lütfen iletişim bilgilerimiz üzerinden bize ulaşınız veya üyelik sayfamızı ziyaret ediniz."
    },
    {
      question: "YÖMEGA ile nasıl iş birliği yapabiliriz?",
      answer: "Kurumsal iş birlikleri için iletişim formumuz üzerinden veya doğrudan e-posta adresimiz üzerinden bizimle iletişime geçebilirsiniz. İş birliği önerilerinizi detaylı bir şekilde paylaşmanız, sürecin hızlanmasına yardımcı olacaktır."
    }
  ]

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section className="faq-section">
      <div className="center-text">
        <h5>Sıkça Sorulan Sorular</h5>
        <h2>Sizden Gelen Sorular</h2>
      </div>

      <div className="faq-container">
        {faqData.map((faq, index) => (
          <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFAQ(index)}>
              <h4>{faq.question}</h4>
              <i className={activeIndex === index ? 'bx bx-minus' : 'bx bx-plus'}></i>
            </div>
            <div 
              className="faq-answer"
              style={{
                maxHeight: activeIndex === index ? '200px' : '0px',
                transition: 'max-height 0.4s ease'
              }}
            >
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}