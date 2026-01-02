import Header from '@/components/Header'
import Footer from '@/components/Footer'
import UserSidebar from '@/components/UserSidebar'
import NotificationsContent from '@/components/NotificationsContent'

export const metadata = {
  title: 'YÖMEGA - Bildirimler',
  description: 'Bildirimlerinizi görüntüleyin ve yönetin.',
}

export default function NotificationsPage() {
  return (
    <>
      <Header />
      <main style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', paddingTop: '80px' }}>
        <UserSidebar />
        <div style={{ flex: 1, padding: '40px' }}>
          <NotificationsContent />
        </div>
      </main>
      <Footer />
    </>
  )
}