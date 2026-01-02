'use client'
import { useState, useEffect } from 'react'

export default function SpeakersContent() {
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchSpeakers()
  }, [])

  const fetchSpeakers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/programs`)

      if (response.ok) {
        const data = await response.json()
        // Yaklaşan etkinliklerden konuşmacıları al
        const upcomingPrograms = data.data.programs.filter(
          p => new Date(p.dateTime) > new Date()
        )
        
        // Benzersiz konuşmacıları çıkar
        const uniqueSpeakers = []
        const speakerNames = new Set()
        
        upcomingPrograms.forEach(program => {
          if (program.speaker && program.speaker.name && !speakerNames.has(program.speaker.name)) {
            speakerNames.add(program.speaker.name)
            uniqueSpeakers.push({
              id: program._id,
              name: program.speaker.name,
              bio: program.speaker.bio || 'Konuşmacı hakkında bilgi yakında eklenecek.',
              expertise: program.speaker.expertise || [],
              social: program.speaker.social || {}
            })
          }
        })
        
        setSpeakers(uniqueSpeakers)
      }
    } catch (error) {
      console.error('Konuşmacılar getirilirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="board-section section" id="board">
        <div className="center-text">
          <h5>Uzmanlar</h5>
          <h2>Konuşmacılarımız</h2>
        </div>
        <div className="loading-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="loading-spinner"></div>
          <p>Konuşmacılar yükleniyor...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="board-section section" id="board">
      <div className="center-text">
        <h5>Uzmanlar</h5>
        <h2>Konuşmacılarımız</h2>
      </div>

      {speakers.length > 0 ? (
        <div className="board-members">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="board-member">
              <div className="konusmaci-img">
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 15px',
                    color: '#666'
                  }}
                >
                  <i className='bx bx-user' style={{ fontSize: '48px' }}></i>
                </div>
              </div>
              <div className="konusmaci-info">
                <h3>{speaker.name}</h3>
                {speaker.expertise && speaker.expertise.length > 0 && (
                  <p className="unvan">{speaker.expertise.slice(0, 2).join(', ')}</p>
                )}
                <p>{speaker.bio.substring(0, 100)}...</p>
                <div className="konusmaci-sosyal">
                  {speaker.social?.linkedin && (
                    <a href={speaker.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <i className='bx bxl-linkedin'></i>
                    </a>
                  )}
                  {speaker.social?.twitter && (
                    <a href={speaker.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                      <i className='bx bxl-twitter'></i>
                    </a>
                  )}
                  {speaker.social?.website && (
                    <a href={speaker.social.website} target="_blank" rel="noopener noreferrer" aria-label="Website">
                      <i className='bx bx-globe'></i>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <i className='bx bx-user-x' style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
          <p style={{ color: '#666' }}>Şu anda yaklaşan etkinlik konuşmacısı bulunmuyor</p>
        </div>
      )}
    </section>
  )
}