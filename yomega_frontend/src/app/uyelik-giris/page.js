// Mevcut page.js içeriğinizi bu şekilde güncelleyin
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthContent from '@/components/AuthContent'

export const metadata = {
  title: 'YÖMEGA - Üyelik ve Giriş',
  description: 'YÖMEGA derneğine üye olun veya giriş yapın.',
}

export default function UyelikGirisPage() {
  return (
    <>
      <Header />
      <AuthContent />
      <Footer />
    </>
  )
}