import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSection from '@/components/HeroSection'
import StatsSection from '@/components/StatsSection'
//import ResourcesSection from '@/components/ResourcesSection'
import NewsSection from '@/components/NewsSection'
import CalendarSection from '@/components/CalendarSection'
import PartnersSection from '@/components/PartnersSection'
import AboutSection from '@/components/AboutSection'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <NewsSection />
        <CalendarSection />
        <PartnersSection />
        <AboutSection />
      </main>
      <Footer />
      
      {/* Eski footer stili için geçici div */}
      <div className="last-text">
        <p>&copy; 2025 YÖMEGA. Tüm hakları saklıdır.</p>
      </div>
    </>
  )
}