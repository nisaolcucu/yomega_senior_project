'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const router = useRouter()

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setQuery('')
      setResults([])
      setSuggestions([])
      setAiSuggestion(null)
    }
  }, [isOpen])

  // Fetch suggestions for autocomplete
  useEffect(() => {
    if (query.length >= 2) {
      const debounceTimer = setTimeout(() => {
        fetchSuggestions(query)
      }, 300)

      return () => clearTimeout(debounceTimer)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  const fetchSuggestions = async (searchTerm) => {
    try {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || sessionStorage.getItem('token')
        : null

      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(
        `${API_URL}/search/suggestions?q=${encodeURIComponent(searchTerm)}`,
        { headers }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSuggestions(data.data.suggestions || [])
          setShowSuggestions(true)
        }
      }
    } catch (error) {
      console.error('Suggestions error:', error)
    }
  }

  const performSearch = async (searchQuery = query) => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) {
      setResults([])
      return
    }

    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || sessionStorage.getItem('token')
        : null

      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const searchUrl = `${API_URL}/search?q=${encodeURIComponent(trimmedQuery)}&limit=20`
      console.log('🔍 Searching:', searchUrl)
      
      const response = await fetch(searchUrl, { headers })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Search response:', {
          success: data.success,
          resultsCount: data.data?.results?.length || 0,
          total: data.data?.total || 0
        })
        
        if (data.success) {
          const results = data.data.results || []
          console.log('📊 Results:', results.map(r => ({ type: r.type, title: r.title })))
          setResults(results)
          setAiSuggestion(data.data.aiSuggestion)
        } else {
          setResults([])
          console.error('❌ Search failed:', data.message)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Search error:', response.status, errorData.message || 'Unknown error')
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    performSearch()
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text)
    setShowSuggestions(false)
    router.push(suggestion.url)
    onClose()
  }

  const handleResultClick = () => {
    onClose()
  }

  const getTypeLabel = (type) => {
    const labels = {
      'news': 'Haber',
      'program': 'Program',
      'resource': 'Kaynak',
      'board-member': 'Yönetim Kurulu'
    }
    return labels[type] || type
  }

  const getTypeIcon = (type) => {
    const icons = {
      'news': 'bx-news',
      'program': 'bx-calendar-event',
      'resource': 'bx-file',
      'board-member': 'bx-user'
    }
    return icons[type] || 'bx-search'
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="search-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          backdropFilter: 'blur(4px)'
        }}
      />

      {/* Search Modal */}
      <div 
        className="search-modal"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '700px',
          maxHeight: '80vh',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Search Input */}
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className='bx bx-search' style={{ fontSize: '24px', color: '#666' }}></i>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder="Ara... (haberler, programlar, kaynaklar, yönetim kurulu)"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '18px',
                  padding: '8px 0'
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setResults([])
                    setSuggestions([])
                    inputRef.current?.focus()
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <i className='bx bx-x' style={{ fontSize: '24px', color: '#999' }}></i>
                </button>
              )}
              {query.trim() && (
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault()
                    handleSubmit(e)
                  }}
                  style={{
                    background: 'var(--main-color, #4a90e2)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#fff',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                  aria-label="Ara"
                >
                  <i className='bx bx-search' style={{ fontSize: '20px' }}></i>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <i className='bx bx-x' style={{ fontSize: '28px', color: '#999' }}></i>
              </button>
            </div>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              marginTop: '10px',
              border: '1px solid #eee',
              borderRadius: '8px',
              backgroundColor: '#fff',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: idx < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <i className={`bx ${getTypeIcon(suggestion.type)}`} style={{ fontSize: '20px', color: '#666' }}></i>
                  <span>{suggestion.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px',
          paddingTop: results.length > 0 || isLoading ? '20px' : '0'
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '32px', marginBottom: '10px' }}></i>
              <p>Aranıyor...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              {/* AI Suggestion */}
              {aiSuggestion && (
                <div style={{
                  backgroundColor: '#f0f7ff',
                  borderLeft: '4px solid #4a90e2',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: '1.6'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <i className='bx bx-bot' style={{ fontSize: '18px', color: '#4a90e2' }}></i>
                    <strong style={{ color: '#4a90e2' }}>AI Önerisi</strong>
                  </div>
                  <div>{aiSuggestion}</div>
                </div>
              )}

              {/* Results List */}
              <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
                {results.length} sonuç bulundu
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {results.map((result, idx) => (
                  <Link
                    key={idx}
                    href={result.url}
                    onClick={handleResultClick}
                    style={{
                      display: 'block',
                      padding: '16px',
                      border: '1px solid #eee',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#4a90e2'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(74, 144, 226, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#eee'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#f0f7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className={`bx ${getTypeIcon(result.type)}`} style={{ fontSize: '24px', color: '#4a90e2' }}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: '16px', 
                            fontWeight: '600',
                            color: '#333',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {result.title}
                          </h3>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '4px',
                            color: '#666',
                            textTransform: 'uppercase'
                          }}>
                            {getTypeLabel(result.type)}
                          </span>
                          {result.groupLabel && (
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              backgroundColor: '#e3f2fd',
                              borderRadius: '4px',
                              color: '#1976d2',
                              fontWeight: '500'
                            }}>
                              {result.groupLabel}
                            </span>
                          )}
                        </div>
                        {result.snippet && (
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#666',
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {result.snippet}
                          </p>
                        )}
                        {result.date && (
                          <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                            {new Date(result.date).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : query && !isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <i className='bx bx-search' style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
              <p>Sonuç bulunamadı</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Farklı terimler deneyin veya daha genel bir arama yapın
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <i className='bx bx-search' style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
              <p>Arama yapmak için yukarıya bir terim yazın</p>
              <p style={{ fontSize: '14px', marginTop: '8px', color: '#bbb' }}>
                Haberler, programlar, kaynaklar ve yönetim kurulu üyelerinde arama yapabilirsiniz
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}