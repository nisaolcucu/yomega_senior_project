import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsPageContent from '@/components/NewsPageContent'

export const metadata = {
  title: 'YÖMEGA - Haberler',
  description: 'YÖMEGA derneğinin güncel haberleri, duyuruları ve etkinlik bilgileri.',
  keywords: 'YÖMEGA haberler, duyurular, etkinlikler, eğitim',
}

export default function HaberlerPage() {
  return (
    <>
      <Header />
      <main>
        <NewsPageContent />
      </main>
      <Footer />
    </>
  )
}