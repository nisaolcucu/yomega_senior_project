'use client'
import { useState, useEffect } from 'react'

export default function MessagesTab() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, announcement, direct, support
    const [unreadCount, setUnreadCount] = useState(0)
    const [showNewMessageModal, setShowNewMessageModal] = useState(false)
    const [showReplyModal, setShowReplyModal] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [sending, setSending] = useState(false)

    const [newSupportRequest, setNewSupportRequest] = useState({
        subject: '',
        message: '',
        priority: 'normal'
    })

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')

            const response = await fetch(`${API_URL}/messages/my-messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const result = await response.json()
                setMessages(result.data.messages)
                setUnreadCount(result.data.unreadCount)
            }
        } catch (error) {
            console.error('Mesajlar yüklenirken hata:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')

            const response = await fetch(`${API_URL}/messages/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setMessages(prev => prev.map(msg =>
                    msg._id === id ? { ...msg, isRead: true } : msg
                ))
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error('Mesaj okundu işaretlenirken hata:', error)
        }
    }

    // YENİ: Mesaj Silme Fonksiyonu
    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')

            const response = await fetch(`${API_URL}/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                alert('✅ Mesaj silindi!')
                // Mesajı listeden kaldır
                setMessages(prev => prev.filter(m => m._id !== messageId)) 
            } else {
                const error = await response.json()
                alert(`❌ ${error.message}`)
            }
        } catch (error) {
            console.error('Mesaj silinirken hata:', error)
            alert('❌ Bir hata oluştu')
        }
    }

    const handleCreateSupportRequest = async (e) => {
        e.preventDefault()

        if (!newSupportRequest.subject || !newSupportRequest.message) {
            alert('Lütfen konu ve mesaj giriniz')
            return
        }

        try {
            setSending(true)
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')

            const response = await fetch(`${API_URL}/messages/support`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSupportRequest)
            })

            if (response.ok) {
                alert('✅ Destek talebiniz gönderildi!')
                setShowNewMessageModal(false)
                setNewSupportRequest({ subject: '', message: '', priority: 'normal' })
                fetchMessages()
            } else {
                const error = await response.json()
                alert(`❌ ${error.message}`)
            }
        } catch (error) {
            console.error('Destek talebi oluşturulurken hata:', error)
            alert('❌ Bir hata oluştu')
        } finally {
            setSending(false)
        }
    }

    const handleReply = async (e) => {
        e.preventDefault()

        if (!replyText.trim()) {
            alert('Lütfen mesaj yazınız')
            return
        }

        try {
            setSending(true)
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')

            const response = await fetch(`${API_URL}/messages/${selectedMessage._id}/reply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: replyText })
            })

            if (response.ok) {
                alert('✅ Yanıt gönderildi!')
                setShowReplyModal(false)
                setReplyText('')
                setSelectedMessage(null)
                fetchMessages()
            } else {
                const error = await response.json()
                alert(`❌ ${error.message}`)
            }
        } catch (error) {
            console.error('Yanıt gönderilirken hata:', error)
            alert('❌ Bir hata oluştu')
        } finally {
            setSending(false)
        }
    }

    const getTypeIcon = (type) => {
        switch (type) {
            case 'announcement': return 'bx-bullhorn'
            case 'direct': return 'bx-envelope'
            case 'support': return 'bx-help-circle'
            default: return 'bx-message-dots'
        }
    }

    const getTypeLabel = (type) => {
        switch (type) {
            case 'announcement': return 'Duyuru'
            case 'direct': return 'Doğrudan Mesaj'
            case 'support': return 'Destek Talebi'
            default: return 'Mesaj'
        }
    }

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#fff3cd', color: '#856404', text: 'Bekliyor' },
            answered: { bg: '#d4edda', color: '#155724', text: 'Yanıtlandı' },
            closed: { bg: '#d1ecf1', color: '#0c5460', text: 'Kapandı' }
        }
        const style = styles[status] || styles.pending

        return (
            <span style={{
                padding: '4px 10px',
                background: style.bg,
                color: style.color,
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
            }}>
                {style.text}
            </span>
        )
    }

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000)

        if (seconds < 60) return 'Az önce'
        if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`
        return new Date(date).toLocaleDateString('tr-TR')
    }

    const filteredMessages = filter === 'all'
        ? messages
        : messages.filter(m => m.type === filter)

    if (loading) {
        return (
            <div className="user-content-section">
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div className="loading-spinner"></div>
                    <p>Mesajlar yükleniyor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="user-content-section">
            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2>Mesajlar</h2>
                    {unreadCount > 0 && (
                        <span style={{
                            background: 'var(--main-color)',
                            color: 'white',
                            borderRadius: '20px',
                            padding: '4px 12px',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            {unreadCount} Okunmamış
                        </span>
                    )}
                </div>

                <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="btn btn-primary"
                >
                    <i className='bx bx-plus'></i> Destek Talebi Oluştur
                </button>
            </div>

            {/* Filtreler */}
            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                {[
                    { value: 'all', label: 'Tümü', count: messages.length },
                    { value: 'announcement', label: 'Duyurular', count: messages.filter(m => m.type === 'announcement').length },
                    { value: 'direct', label: 'Doğrudan Mesajlar', count: messages.filter(m => m.type === 'direct').length },
                    { value: 'support', label: 'Destek Taleplerim', count: messages.filter(m => m.type === 'support').length }
                ].map(btn => (
                    <button
                        key={btn.value}
                        onClick={() => setFilter(btn.value)}
                        style={{
                            padding: '8px 16px',
                            background: filter === btn.value ? 'var(--main-color)' : 'white',
                            color: filter === btn.value ? 'white' : '#666',
                            border: `2px solid ${filter === btn.value ? 'var(--main-color)' : '#e0e0e0'}`,
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            transition: 'all 0.3s'
                        }}
                    >
                        {btn.label} ({btn.count})
                    </button>
                ))}
            </div>

            {/* Mesajlar Listesi */}
            {filteredMessages.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {filteredMessages.map((msg) => (
                        <div
                            key={msg._id}
                            style={{
                                background: msg.isRead ? 'white' : '#fff9f9',
                                border: `2px solid ${msg.isRead ? '#e0e0e0' : 'var(--main-color)'}`,
                                borderRadius: '12px',
                                padding: '20px',
                                transition: 'all 0.3s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <i className={`bx ${getTypeIcon(msg.type)}`} style={{ fontSize: '20px', color: 'white' }}></i>
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', color: '#999', fontWeight: '600' }}>
                                                {getTypeLabel(msg.type)}
                                            </span>
                                            {getStatusBadge(msg.status)}
                                        </div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0' }}>
                                            {msg.subject}
                                        </h3>
                                    </div>
                                </div>

                                {!msg.isRead && (
                                    <span style={{
                                        width: '10px',
                                        height: '10px',
                                        background: 'var(--main-color)',
                                        borderRadius: '50%'
                                    }}></span>
                                )}
                            </div>

                            <p style={{
                                fontSize: '14px',
                                color: '#666',
                                lineHeight: '1.6',
                                marginBottom: '12px',
                                paddingLeft: '52px'
                            }}>
                                {msg.message.substring(0, 150)}{msg.message.length > 150 ? '...' : ''}
                            </p>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingLeft: '52px'
                            }}>
                                <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#999' }}>
                                    <span>
                                        <i className='bx bx-user'></i> {msg.from?.name || 'Admin'}
                                    </span>
                                    <span>
                                        <i className='bx bx-time'></i> {getTimeAgo(msg.createdAt)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {!msg.isRead && (
                                        <button
                                            onClick={() => markAsRead(msg._id)}
                                            className="btn-small btn-outline"
                                            style={{ fontSize: '13px' }}
                                        >
                                            <i className='bx bx-check'></i> Okundu İşaretle
                                        </button>
                                    )}

                                    {msg.type !== 'announcement' && msg.status !== 'closed' && (
                                        <button
                                            onClick={() => {
                                                setSelectedMessage(msg)
                                                setShowReplyModal(true)
                                            }}
                                            className="btn-small btn-primary"
                                            style={{ fontSize: '13px' }}
                                        >
                                            <i className='bx bx-reply'></i> Yanıtla
                                        </button>
                                    )}

                                    {/* YENİ: Sil Butonu */}
                                    <button
                                        onClick={() => handleDeleteMessage(msg._id)}
                                        className="btn-small btn-danger"
                                        style={{ fontSize: '13px' }}
                                        title="Mesajı Sil"
                                    >
                                        <i className='bx bx-trash'></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <i className='bx bx-inbox' style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
                    <h3 style={{ color: '#666', marginBottom: '10px' }}>
                        {filter === 'all' ? 'Henüz mesaj yok' : 'Bu kategoride mesaj yok'}
                    </h3>
                    <p style={{ color: '#999' }}>Yeni mesajlar burada görünecek</p>
                </div>
            )}

            {/* Destek Talebi Modal */}
            {showNewMessageModal && (
                <div className="modal-overlay" onClick={() => setShowNewMessageModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>Destek Talebi Oluştur</h3>
                            <button className="close-btn" onClick={() => setShowNewMessageModal(false)}>
                                <i className='bx bx-x'></i>
                            </button>
                        </div>

                        <form onSubmit={handleCreateSupportRequest} style={{ padding: '20px' }}>
                            <div className="form-group">
                                <label>Konu *</label>
                                <input
                                    type="text"
                                    value={newSupportRequest.subject}
                                    onChange={(e) => setNewSupportRequest({ ...newSupportRequest, subject: e.target.value })}
                                    placeholder="Örn: Etkinlik kayıt sorunu"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Mesajınız *</label>
                                <textarea
                                    value={newSupportRequest.message}
                                    onChange={(e) => setNewSupportRequest({ ...newSupportRequest, message: e.target.value })}
                                    placeholder="Sorununuzu detaylı bir şekilde açıklayın..."
                                    required
                                    rows="6"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd', resize: 'vertical' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Öncelik</label>
                                <select
                                    value={newSupportRequest.priority}
                                    onChange={(e) => setNewSupportRequest({ ...newSupportRequest, priority: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                                >
                                    <option value="low">Düşük</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">Yüksek</option>
                                </select>
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-primary" disabled={sending}>
                                    {sending ? 'Gönderiliyor...' : 'Gönder'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowNewMessageModal(false)}
                                    disabled={sending}
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Yanıtla Modal */}
            {showReplyModal && selectedMessage && (
                <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>Mesaja Yanıt Ver</h3>
                            <button className="close-btn" onClick={() => setShowReplyModal(false)}>
                                <i className='bx bx-x'></i>
                            </button>
                        </div>

                        <div style={{ padding: '20px', background: '#f9f9f9', borderBottom: '2px solid #e0e0e0' }}>
                            <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Orijinal Mesaj:</h4>
                            <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>{selectedMessage.subject}</p>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                                {selectedMessage.message.substring(0, 200)}...
                            </p>
                        </div>

                        <form onSubmit={handleReply} style={{ padding: '20px' }}>
                            <div className="form-group">
                                <label>Yanıtınız *</label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Yanıtınızı yazın..."
                                    required
                                    rows="6"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd', resize: 'vertical' }}
                                />
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-primary" disabled={sending}>
                                    {sending ? 'Gönderiliyor...' : 'Yanıt Gönder'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowReplyModal(false)}
                                    disabled={sending}
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}