import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProgramContent from '@/components/ProgramContent'
import SpeakersContent from '@/components/SpeakersContent'

export const metadata = {
  title: 'YÖMEGA - Program ve Konuşmacılar',
  description: 'YÖMEGA etkinlik programı ve konuşmacı bilgileri. Uzman akademisyenler ve eğitim teknolojileri.',
  keywords: 'YÖMEGA program, konuşmacılar, etkinlik, seminer, çalıştay',
}

export default function ProgramPage() {
  return (
    <>
      <Header />
      <main>
        <ProgramContent />
        <SpeakersContent />
      </main>
      <Footer />
    </>
  )
}