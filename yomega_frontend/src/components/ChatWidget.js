'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Merhaba! YÖMEGA hakkında sorularınızı sorabilirsiniz. Size haberler, programlar, kaynaklar ve yönetim kurulu hakkında yardımcı olabilirim.',
      suggestions: []
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSend = async () => {
    const message = inputValue.trim()
    if (!message || isLoading) return

    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      suggestions: []
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

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

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const botMessage = {
            role: 'bot',
            content: data.reply,
            suggestions: data.suggestions || []
          }
          setMessages(prev => [...prev, botMessage])
        } else {
          const errorMessage = {
            role: 'bot',
            content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
            suggestions: []
          }
          setMessages(prev => [...prev, errorMessage])
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = {
          role: 'bot',
          content: errorData.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
          suggestions: []
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        role: 'bot',
        content: 'Bağlantı hatası. Lütfen tekrar deneyin.',
        suggestions: []
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    // Navigate to the URL
    if (suggestion.url) {
      router.push(suggestion.url)
      setIsOpen(false)
    }
  }

  const getTypeIcon = (type) => {
    const icons = {
      'news': 'bx-news',
      'program': 'bx-calendar-event',
      'resource': 'bx-file',
      'board-member': 'bx-user'
    }
    return icons[type] || 'bx-link'
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

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--main-color, #4a90e2)',
          border: 'none',
          color: '#fff',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        aria-label="Chat"
      >
        <i className='bx bx-message-rounded-dots'></i>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '380px',
            maxWidth: 'calc(100vw - 40px)',
            height: '600px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1001,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid #eee',
              backgroundColor: 'var(--main-color, #4a90e2)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                YÖMEGA Asistanı
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                Size nasıl yardımcı olabilirim?
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <i className='bx bx-x'></i>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: '8px'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: msg.role === 'user'
                      ? 'var(--main-color, #4a90e2)'
                      : '#f0f0f0',
                    color: msg.role === 'user' ? '#fff' : '#333',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.content}
                </div>

                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div
                    style={{
                      width: '100%',  // ✅ Full width
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      marginTop: '12px'  // ✅ Boşluk ekle
                    }}
                  >
                    {/* ✅ Başlık Ekle */}
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#666',
                      paddingLeft: '4px',
                      borderLeft: '3px solid var(--main-color)',
                      paddingLeft: '12px'
                    }}>
                      📌 İlgili İçerikler:
                    </div>
                    
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          textAlign: 'left',
                          padding: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--main-color, #4a90e2)'
                          e.currentTarget.style.backgroundColor = '#f0f7ff'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#ddd'
                          e.currentTarget.style.backgroundColor = '#fff'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <i className={`bx ${getTypeIcon(suggestion.type)}`} style={{ fontSize: '18px', color: 'var(--main-color, #4a90e2)' }}></i>
                          <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                            {getTypeLabel(suggestion.type)}
                          </span>
                          {suggestion.groupLabel && (
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              backgroundColor: '#e3f2fd',
                              borderRadius: '4px',
                              color: '#1976d2',
                              fontWeight: '500'
                            }}>
                              {suggestion.groupLabel}
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                          {suggestion.title}
                        </div>
                        {suggestion.snippet && (
                          <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                            {suggestion.snippet}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '20px' }}></i>
                <span style={{ fontSize: '14px' }}>Yazıyor...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Mesajınızı yazın..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: inputValue.trim() && !isLoading
                  ? 'var(--main-color, #4a90e2)'
                  : '#ccc',
                border: 'none',
                color: '#fff',
                fontSize: '20px',
                cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
            >
              <i className='bx bx-send'></i>
            </button>
          </div>
        </div>
      )}
    </>
  )
}