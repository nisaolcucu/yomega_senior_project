import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BoardMembersContent from '@/components/BoardMembersContent'
import BoardAboutContent from '@/components/BoardAboutContent'
import CommitteesContent from '@/components/CommitteesContent'

export const metadata = {
  title: 'YÖMEGA - Yönetim Kurulu',
  description: 'YÖMEGA Yönetim Kurulu üyeleri, görevleri ve çalışma komiteleri hakkında bilgiler.',
  keywords: 'YÖMEGA yönetim kurulu, başkan, sekreter, sayman, komiteler',
}

export default function YonetimKuruluPage() {
  return (
    <>
      <Header />
      <main>
        <BoardMembersContent />
        <BoardAboutContent />
        <CommitteesContent />
      </main>
      <Footer />
    </>
  )
}