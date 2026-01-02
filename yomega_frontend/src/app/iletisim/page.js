import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactContent from '@/components/ContactContent'
import MapSection from '@/components/MapSection'
import FAQSection from '@/components/FAQSection'

export const metadata = {
  title: 'YÖMEGA - İletişim',
  description: 'YÖMEGA ile iletişime geçin. Adres, telefon, e-posta bilgileri ve sıkça sorulan sorular.',
  keywords: 'YÖMEGA iletişim, adres, telefon, e-posta, SSS',
}

export default function IletisimPage() {
  return (
    <>
      <Header />
      <main>
        <ContactContent />
        <MapSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}