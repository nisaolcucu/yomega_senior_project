import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ResourcesHeroSection from '@/components/ResourcesHeroSection'
import FeaturedResourcesSection from '@/components/FeaturedResourcesSection'
import AllResourcesSection from '@/components/AllResourcesSection'  // ← EKLE
import ExternalLinksSection from '@/components/ExternalLinksSection'

export const metadata = {
  title: 'YÖMEGA - Kaynaklar',
  description: 'YÖMEGA üyelerine özel eğitim kaynakları, araştırmalar, yayınlar ve eğitim materyalleri.',
  keywords: 'YÖMEGA kaynaklar, eğitim materyalleri, araştırmalar, yayınlar, kurslar',
}

export default function KaynaklarPage() {
  return (
    <>
      <Header />
      <main>
        <ResourcesHeroSection />
        <FeaturedResourcesSection />
        <AllResourcesSection />  {/* ← EKLE */}
        <ExternalLinksSection />
      </main>
      <Footer />
      
      <div className="last-text">
        <p>&copy; 2025 YÖMEGA. Tüm hakları saklıdır.</p>
      </div>
    </>
  )
}