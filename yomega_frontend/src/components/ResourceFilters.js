'use client'
import { useState } from 'react'

export default function ResourceFilters() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filterButtons = [
    { id: 'all', label: 'Tümü' },
    { id: 'courses', label: 'Online Kurslar' },
    { id: 'certificates', label: 'Sertifikalar' },
    { id: 'research', label: 'Araştırmalar' },
    { id: 'videos', label: 'Videolar' }
  ]

  const resources = [
    {
      id: 1,
      category: 'courses',
      icon: 'bx bx-play-circle',
      title: 'Yapay Zeka ve Eğitim',
      description: 'Modern eğitimde yapay zeka uygulamaları',
      type: 'Online Kurs',
      duration: '6 Saat',
      link: 'Erişim Sağla'
    },
    {
      id: 2,
      category: 'courses',
      icon: 'bx bx-play-circle',
      title: 'Uzaktan Eğitim Yönetimi',
      description: 'Etkili uzaktan eğitim stratejileri',
      type: 'Online Kurs',
      duration: '10 Saat',
      link: 'Erişim Sağla'
    },
    {
      id: 3,
      category: 'certificates',
      icon: 'bx bx-certification',
      title: 'Eğitim Geliştirme Uzmanı',
      description: 'ICED onaylı sertifika programı',
      type: 'Sertifika',
      duration: '40 Saat',
      link: 'Başvuru Yap'
    },
    {
      id: 4,
      category: 'certificates',
      icon: 'bx bx-certification',
      title: 'Dijital Pedagoji',
      description: 'Dijital çağda öğretim yöntemleri',
      type: 'Sertifika',
      duration: '30 Saat',
      link: 'Başvuru Yap'
    },
    {
      id: 5,
      category: 'research',
      icon: 'bx bx-file-doc',
      title: 'Yükseköğretimde Kalite',
      description: '2024 Yılı Kalite Değerlendirme Raporu',
      type: 'Araştırma',
      duration: '45 Sayfa',
      link: 'PDF İndir'
    },
    {
      id: 6,
      category: 'research',
      icon: 'bx bx-file-doc',
      title: 'Öğretim Elemanı Gelişimi',
      description: 'Mesleki gelişim ihtiyaçları analizi',
      type: 'Araştırma',
      duration: '32 Sayfa',
      link: 'PDF İndir'
    },
    {
      id: 7,
      category: 'videos',
      icon: 'bx bx-video',
      title: 'Eğitimde İnovasyon',
      description: 'Prof. Dr. Can Özkan ile söyleşi',
      type: 'Video',
      duration: '45 Dakika',
      link: 'İzle'
    },
    {
      id: 8,
      category: 'videos',
      icon: 'bx bx-video',
      title: 'Hibrit Öğrenme Modelleri',
      description: 'Pratik uygulama örnekleri',
      type: 'Video',
      duration: '60 Dakika',
      link: 'İzle'
    }
  ]

  const filteredResources = activeFilter === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === activeFilter)

  return (
    <section className="resource-filters">
      <div className="center-text">
        <h5>KAYNAKLARI KEŞFET</h5>
        <h2>Kategorilere Göre Filtrele</h2>
      </div>

      <div className="filter-tabs">
        {filterButtons.map((filter) => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="resource-grid">
        {filteredResources.map((resource) => (
          <div 
            key={resource.id} 
            className="resource-item"
            style={{
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="resource-card">
              <div className="resource-icon">
                <i className={resource.icon}></i>
              </div>
              <h4>{resource.title}</h4>
              <p>{resource.description}</p>
              <div className="resource-meta">
                <span className="resource-type">{resource.type}</span>
                <span className="resource-duration">{resource.duration}</span>
              </div>
              <a href="#" className="resource-link">{resource.link}</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}