'use client'
import { useState, useEffect } from 'react'

export default function BoardMembersContent() {
  const [boardMembers, setBoardMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchBoardMembers()
  }, [])

  const fetchBoardMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/board-members/current`)

      if (response.ok) {
        const data = await response.json()
        setBoardMembers(data.data.boardMembers || [])
      } else {
        console.error('Board members fetch failed:', response.status)
      }
    } catch (error) {
      console.error('Fetch board members error:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupByPosition = () => {
    const groups = {
      yonetim: [],
      denetim: [],
      kurucu: []
    }

    boardMembers.forEach(member => {
      const pos = member.position.toLowerCase()

      if (['başkan', 'başkan yardımcısı', 'genel sekreter', 'sayman', 'üye', 'yedek üye'].includes(pos)) {
        groups.yonetim.push(member)
      }
      else if (['denetim kurulu başkanı', 'denetim kurulu üyesi', 'denetim kurulu yedek üyesi'].includes(pos)) {
        groups.denetim.push(member)
      }
      else if (pos === 'kurucu üye') {
        groups.kurucu.push(member)
      }
    })

    return groups
  }

  const groups = groupByPosition()

  const positionHierarchy = {
    'başkan': 1,
    'başkan yardımcısı': 2,
    'genel sekreter': 3,
    'sayman': 4,
    'üye': 5,
    'yedek üye': 6,
    'denetim kurulu başkanı': 10,
    'denetim kurulu üyesi': 11,
    'denetim kurulu yedek üyesi': 12,
    'kurucu üye': 20
  }

  const sortByPosition = (members) => {
    return [...members].sort((a, b) => {
      const posA = positionHierarchy[a.position.toLowerCase()] || 99
      const posB = positionHierarchy[b.position.toLowerCase()] || 99
      return posA - posB
    })
  }

  const formatPosition = (position) => {
    const positions = {
      'başkan': 'Başkan',
      'başkan yardımcısı': 'Başkan Yardımcısı',
      'genel sekreter': 'Genel Sekreter',
      'sayman': 'Sayman',
      'üye': 'Üye',
      'yedek üye': 'Yedek Üye',
      'denetim kurulu başkanı': 'Denetim Kurulu Başkanı',
      'denetim kurulu üyesi': 'Denetim Kurulu Üyesi',
      'denetim kurulu yedek üyesi': 'Denetim Kurulu Yedek Üyesi',
      'kurucu üye': 'Kurucu Üye'
    }
    return positions[position.toLowerCase()] || position
  }

  const renderMemberCard = (member) => (
    <div
      key={member._id}
      onClick={() => setSelectedMember(member)}
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        textAlign: 'center',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
        border: '2px solid transparent',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'
        e.currentTarget.style.borderColor = 'var(--main-color)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'
        e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '5px',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
      }}></div>

      <div style={{
        width: '100px',
        height: '100px',
        margin: '0 auto 20px',
        position: 'relative'
      }}>
        {member.image ? (
          <img
            src={(() => {
              if (!member.image) return '';
              let imgPath = member.image;
              if (imgPath.startsWith('http')) {
                return imgPath;
              }
              const filename = imgPath.split('/').pop();
              return `${API_URL.replace('/api', '')}/uploads/board-members/${filename}`;
            })()}
            alt={member.name}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid var(--main-color)',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.nextSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}

        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: member.image ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '36px',
          fontWeight: '700',
          border: '4px solid var(--main-color)',
          boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
        }}>
          {member.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <h3 style={{
        fontSize: '22px',
        fontWeight: '700',
        marginBottom: '8px',
        color: '#2d3748'
      }}>
        {member.name}
      </h3>

      <div style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '15px'
      }}>
        {formatPosition(member.position)}
      </div>

      {member.contact?.office && (
        <p style={{
          fontSize: '14px',
          color: '#718096',
          marginBottom: '15px'
        }}>
          <i className='bx bx-buildings' style={{ marginRight: '5px' }}></i>
          {member.contact.office}
        </p>
      )}

      {member.bio && (
        <p style={{
          fontSize: '14px',
          color: '#4a5568',
          lineHeight: '1.6',
          marginBottom: '20px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {member.bio}
        </p>
      )}

      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginTop: '20px'
      }}>
        {member.contact?.email && (

          <a href={`mailto:${member.contact.email}`}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(102, 126, 234, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--main-color)',
              fontSize: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--main-color)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
              e.currentTarget.style.color = 'var(--main-color)'
            }}
          >
            <i className='bx bxs-envelope'></i>
          </a>
        )}
        {member.social?.linkedin && (

          <a href={member.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(102, 126, 234, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--main-color)',
              fontSize: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0077b5'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
              e.currentTarget.style.color = 'var(--main-color)'
            }}
          >
            <i className='bx bxl-linkedin'></i>
          </a>
        )
        }
        {member.social?.twitter && (
          <a
            href={member.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(102, 126, 234, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--main-color)',
              fontSize: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1da1f2'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
              e.currentTarget.style.color = 'var(--main-color)'
            }}
          >
            <i className='bx bxl-twitter'></i>
          </a>
        )}
        {member.social?.website && (
          <a
            href={member.social.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(102, 126, 234, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--main-color)',
              fontSize: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--main-color)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
              e.currentTarget.style.color = 'var(--main-color)'
            }}
          >
            <i className='bx bx-globe'></i>
          </a>
        )}
      </div >
    </div >
  )

  if (loading) {
    return (
      <section style={{ padding: '100px 13% 80px', background: '#f8f9fa' }}>
        <div className="center-text">
          <h5 style={{
            color: 'var(--main-color)',
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '3px',
            marginBottom: '15px'
          }}>
            YÖNETİM KURULU
          </h5>
          <h2 style={{ fontSize: '42px', fontWeight: '800', color: '#2d3748' }}>
            YÖMEGA Yönetim Kurulu Üyeleri
          </h2>
        </div>
        <div className="loading-container" style={{ marginTop: '60px' }}>
          <div className="loading-spinner"></div>
          <p>Yönetim kurulu yükleniyor...</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section style={{ padding: '100px 13% 80px', background: '#f8f9fa' }}>
        <div className="center-text" style={{ marginBottom: '80px' }}>
          <h5 style={{
            color: 'var(--main-color)',
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '3px',
            marginBottom: '15px',
            textTransform: 'uppercase'
          }}>
            Yönetim Kurulu
          </h5>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '800',
            color: '#2d3748',
            marginBottom: '20px'
          }}>
            YÖMEGA Yönetim Kurulu
          </h2>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            fontSize: '17px',
            color: '#4a5568',
            lineHeight: '2',
            textAlign: 'justify'
          }}>
            <p style={{ marginBottom: '20px' }}>
              Bildiğiniz gibi YÖMEGA bir Google grubu olarak <strong>16 Aralık 2020</strong> tarihinde oluşturuldu.
              Daha sonra <strong>31 Ocak 2021</strong> günü ilk kez Linda L. Beith'in
              <em> "Strategies for Engaging Remote Students During a Pandemic"</em> çevrimiçi etkinliği ile
              başlayarak YÖMEGA Bahar ve Güz Serisi konuşmaları olarak devam etti.
            </p>

            <p style={{ marginBottom: '20px' }}>
              <strong>18 Nisan 2024</strong> tarihinde ise Ankara İl Sivil Toplumla İlişkiler Genel Müdürlüğü
              tarafından <strong>Yükseköğretim Mesleki Gelişim Ağı Derneği</strong> olarak tescil edildi.
            </p>

            <p style={{ margin: 0 }}>
              Derneğimiz <strong>19 Kasım 2024</strong> tarihinde ilk genel kurulunu yaparak
              daha etkili çalışmalar ve etkinlikler yapmak için ciddi bir adım atmıştır.
            </p>
          </div>
        </div>

        {groups.yonetim.length > 0 && (
          <div style={{ marginBottom: '80px' }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '50px'
            }}>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '10px',
                position: 'relative',
                display: 'inline-block'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Yönetim Kurulu
                </span>
                <div style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '2px'
                }}></div>
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px'
            }}>
              {sortByPosition(groups.yonetim).map(renderMemberCard)}
            </div>
          </div>
        )}

        {groups.denetim.length > 0 && (
          <div style={{ marginBottom: '80px' }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '50px'
            }}>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '10px',
                position: 'relative',
                display: 'inline-block'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Denetim Kurulu
                </span>
                <div style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: '2px'
                }}></div>
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {sortByPosition(groups.denetim).map(renderMemberCard)}
            </div>
          </div>
        )}

        {groups.kurucu.length > 0 && (
          <div>
            <div style={{
              textAlign: 'center',
              marginBottom: '50px'
            }}>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '10px',
                position: 'relative',
                display: 'inline-block'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Kurucu Heyet
                </span>
                <div style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                  borderRadius: '2px'
                }}></div>
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px'
            }}>
              {sortByPosition(groups.kurucu).map(renderMemberCard)}
            </div>
          </div>
        )}
      </section>

      {selectedMember && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setSelectedMember(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '30px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              animation: 'slideUp 0.3s ease',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMember(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0,0,0,0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: '#666',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--main-color)'
                e.target.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0,0,0,0.1)'
                e.target.style.color = '#666'
              }}
            >
              ×
            </button>

            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '50px 40px 30px',
              borderRadius: '30px 30px 0 0',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '150px',
                height: '150px',
                margin: '0 auto 20px',
                position: 'relative'
              }}>
                {selectedMember.image ? (
                  <img
                    src={(() => {
                      if (!selectedMember.image) return '';
                      let imgPath = selectedMember.image;
                      if (imgPath.startsWith('http')) {
                        return imgPath;
                      }
                      const filename = imgPath.split('/').pop();
                      return `${API_URL.replace('/api', '')}/uploads/board-members/${filename}`;
                    })()}
                    alt={selectedMember.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '5px solid white',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--main-color)',
                    fontSize: '48px',
                    fontWeight: '700',
                    border: '5px solid white',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    {selectedMember.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h2 style={{
                fontSize: '32px',
                fontWeight: '800',
                color: 'white',
                marginBottom: '10px'
              }}>
                {selectedMember.name}
              </h2>

              <div style={{
                display: 'inline-block',
                background: 'white',
                color: 'var(--main-color)',
                padding: '8px 20px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '700'
              }}>
                {formatPosition(selectedMember.position)}
              </div>
            </div>

            <div style={{ padding: '40px' }}>
              {selectedMember.bio && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#2d3748',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <i className='bx bx-user-circle' style={{ fontSize: '24px', color: 'var(--main-color)' }}></i>
                    Hakkında
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#4a5568'
                  }}>
                    {selectedMember.bio}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#2d3748',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <i className='bx bx-envelope' style={{ fontSize: '24px', color: 'var(--main-color)' }}></i>
                  İletişim
                </h3>

                {selectedMember.contact?.email && (

                  <a href={`mailto:${selectedMember.contact.email}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px',
                      background: '#f7fafc',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      textDecoration: 'none',
                      color: '#4a5568',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#edf2f7'
                      e.currentTarget.style.color = 'var(--main-color)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f7fafc'
                      e.currentTarget.style.color = '#4a5568'
                    }}
                  >
                    <i className='bx bxs-envelope' style={{ fontSize: '20px' }}></i>
                    <span>{selectedMember.contact.email}</span>
                  </a>
                )}

                {selectedMember.contact?.phone && (

                  <a href={`tel:${selectedMember.contact.phone}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px',
                      background: '#f7fafc',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      textDecoration: 'none',
                      color: '#4a5568',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#edf2f7'
                      e.currentTarget.style.color = 'var(--main-color)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f7fafc'
                      e.currentTarget.style.color = '#4a5568'
                    }}
                  >
                    <i className='bx bxs-phone' style={{ fontSize: '20px' }}></i>
                    <span>{selectedMember.contact.phone}</span>
                  </a>
                )}

                {selectedMember.contact?.office && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    background: '#f7fafc',
                    borderRadius: '10px',
                    color: '#4a5568'
                  }}>
                    <i className='bx bx-buildings' style={{ fontSize: '20px' }}></i>
                    <span>{selectedMember.contact.office}</span>
                  </div>
                )}
              </div>

              {(selectedMember.social?.linkedin || selectedMember.social?.twitter || selectedMember.social?.website) && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#2d3748',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <i className='bx bx-share-alt' style={{ fontSize: '24px', color: 'var(--main-color)' }}></i>
                    Sosyal Medya
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {selectedMember.social?.linkedin && (
                      <a href={selectedMember.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '10px 20px',
                          background: '#0077b5',
                          color: 'white',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <i className='bx bxl-linkedin-square' style={{ fontSize: '20px' }}></i>
                        LinkedIn
                      </a>
                    )}
                    {selectedMember.social?.twitter && (

                      <a href={selectedMember.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '10px 20px',
                          background: '#1da1f2',
                          color: 'white',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <i className='bx bxl-twitter' style={{ fontSize: '20px' }}></i>
                        Twitter
                      </a>
                    )}
                    {selectedMember.social?.website && (

                      <a href={selectedMember.social.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '10px 20px',
                          background: 'var(--main-color)',
                          color: 'white',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <i className='bx bx-globe' style={{ fontSize: '20px' }}></i>
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {(selectedMember.startDate || selectedMember.endDate) && (
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  borderRadius: '15px',
                  marginTop: '20px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#2d3748',
                    marginBottom: '10px'
                  }}>
                    Görev Süresi
                  </h4>
                  <p style={{ fontSize: '14px', color: '#4a5568' }}>
                    {selectedMember.startDate && (
                      <>Başlangıç: {new Date(selectedMember.startDate).toLocaleDateString('tr-TR')}</>
                    )}
                    {selectedMember.endDate && (
                      <> • Bitiş: {new Date(selectedMember.endDate).toLocaleDateString('tr-TR')}</>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div >
        </div >
      )}

      <style>{`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(30px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `}</style>
    </>
  )
}