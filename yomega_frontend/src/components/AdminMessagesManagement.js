'use client'
import { useState, useEffect } from 'react'

export default function AdminMessagesManagement({ activeTab }) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, support, direct, announcement
    const [stats, setStats] = useState({
        pending: 0,
        answered: 0,
        closed: 0
    })
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
    const [showDirectMessageModal, setShowDirectMessageModal] = useState(false)
    const [showReplyModal, setShowReplyModal] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState(null)
    const [sending, setSending] = useState(false)

    const [announcementData, setAnnouncementData] = useState({
        subject: '',
        message: '',
        priority: 'normal'
    })

    const [directMessageData, setDirectMessageData] = useState({
        userId: '',
        subject: '',
        message: '',
        priority: 'normal'
    })

    const [replyText, setReplyText] = useState('')
    const [users, setUsers] = useState([])

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

    useEffect(() => {
        if (activeTab === 'messages') {
            fetchMessages()
            fetchUsers()
        }
    }, [activeTab, filter])

    const fetchMessages = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            let url = `${API_URL}/messages/admin/all`
            if (filter !== 'all') {
                url += `?type=${filter}`
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const result = await response.json()
                setMessages(result.data.messages)
                setStats(result.data.stats)
            }
        } catch (error) {
            console.error('Mesajlar yüklenirken hata:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const result = await response.json()
                setUsers(result.data.users || [])
            }
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata:', error)
        }
    }

    const handleSendAnnouncement = async (e) => {
        e.preventDefault()

        if (!announcementData.subject || !announcementData.message) {
            alert('Lütfen konu ve mesaj giriniz')
            return
        }

        try {
            setSending(true)
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/messages/announcement`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(announcementData)
            })

            if (response.ok) {
                alert('✅ Duyuru tüm üyelere gönderildi!')
                setShowAnnouncementModal(false)
                setAnnouncementData({ subject: '', message: '', priority: 'normal' })
                fetchMessages()
            } else {
                const error = await response.json()
                alert(`❌ ${error.message}`)
            }
        } catch (error) {
            console.error('Duyuru gönderilirken hata:', error)
            alert('❌ Bir hata oluştu')
        } finally {
            setSending(false)
        }
    }

    const handleSendDirectMessage = async (e) => {
        e.preventDefault()

        if (!directMessageData.userId || !directMessageData.subject || !directMessageData.message) {
            alert('Lütfen tüm alanları doldurunuz')
            return
        }

        try {
            setSending(true)
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/messages/direct`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(directMessageData)
            })

            if (response.ok) {
                alert('✅ Mesaj gönderildi!')
                setShowDirectMessageModal(false)
                setDirectMessageData({ userId: '', subject: '', message: '', priority: 'normal' })
                fetchMessages()
            } else {
                const error = await response.json()
                alert(`❌ ${error.message}`)
            }
        } catch (error) {
            console.error('Mesaj gönderilirken hata:', error)
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
            const token = localStorage.getItem('token')

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

    const handleUpdateStatus = async (messageId, newStatus) => {
        try {
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/messages/${messageId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                alert('✅ Durum güncellendi!')
                fetchMessages()
            } else {
                const error = await response.json()
                alert(`❌ ${error.message}`)
            }
        } catch (error) {
            console.error('Durum güncellenirken hata:', error)
            alert('❌ Bir hata oluştu')
        }
    }

    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return

        try {
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                alert('✅ Mesaj silindi!')
                fetchMessages()
            } else {
                const error = await response.json()
                alert(`❌ ${error.message}`)
            }
        } catch (error) {
            console.error('Mesaj silinirken hata:', error)
            alert('❌ Bir hata oluştu')
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

    const getTypeIcon = (type) => {
        switch (type) {
            case 'announcement': return 'bx-bullhorn'
            case 'direct': return 'bx-envelope'
            case 'support': return 'bx-help-circle'
            default: return 'bx-message-dots'
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

    const getPriorityBadge = (priority) => {
        const styles = {
            low: { bg: '#e7f3ff', color: '#0066cc', text: 'Düşük' },
            normal: { bg: '#f0f0f0', color: '#666', text: 'Normal' },
            high: { bg: '#ffe7e7', color: '#cc0000', text: 'Yüksek' }
        }
        const style = styles[priority] || styles.normal

        return (
            <span style={{
                padding: '4px 10px',
                background: style.bg,
                color: style.color,
                borderRadius: '12px',
                fontSize: '11px',
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

    if (activeTab !== 'messages') return null

    if (loading) {
        return (
            <div className="admin-content-section">
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div className="loading-spinner"></div>
                    <p>Mesajlar yükleniyor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-content-section">
            <div className="section-header">
                <div>
                    <h2>Mesaj Yönetimi</h2>
                    <p>Kullanıcı mesajlarını yönetin ve toplu duyuru gönderin</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setShowAnnouncementModal(true)}
                        className="btn btn-primary"
                    >
                        <i className='bx bx-bullhorn'></i> Toplu Duyuru
                    </button>
                    <button
                        onClick={() => setShowDirectMessageModal(true)}
                        className="btn btn-outline"
                    >
                        <i className='bx bx-envelope'></i> Mesaj Gönder
                    </button>
                </div>
            </div>

            {/* İstatistikler */}
            <div className="stats-grid" style={{ marginBottom: '30px' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#fff3cd20', color: '#856404' }}>
                        <i className='bx bx-time'></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.pending}</h3>
                        <p>Bekleyen</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#d4edda20', color: '#155724' }}>
                        <i className='bx bx-check-circle'></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.answered}</h3>
                        <p>Yanıtlanan</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#d1ecf120', color: '#0c5460' }}>
                        <i className='bx bx-lock'></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.closed}</h3>
                        <p>Kapanan</p>
                    </div>
                </div>
            </div>

            {/* Filtreler */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[
                    { value: 'all', label: 'Tümü', count: messages.length },
                    { value: 'support', label: 'Destek Talepleri', count: messages.filter(m => m.type === 'support').length },
                    { value: 'direct', label: 'Doğrudan Mesajlar', count: messages.filter(m => m.type === 'direct').length },
                    { value: 'announcement', label: 'Duyurular', count: messages.filter(m => m.type === 'announcement').length }
                ].map(btn => (
                    <button
                        key={btn.value}
                        onClick={() => setFilter(btn.value)}
                        className={`btn ${filter === btn.value ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '13px', padding: '8px 16px' }}
                    >
                        {btn.label} ({btn.count})
                    </button>
                ))}
            </div>

            {/* Mesajlar Listesi - Kart Tasarımı */}
            {messages.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            style={{
                                background: 'white',
                                border: `2px solid ${msg.status === 'pending' ? '#856404' : '#e0e0e0'}`,
                                borderRadius: '12px',
                                padding: '20px',
                                transition: 'all 0.3s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                {/* Sol Taraf - Tip ve Konu */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
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
                                                {getPriorityBadge(msg.priority)}
                                            </div>
                                            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0', color: '#333' }}>
                                                {msg.subject}
                                            </h3>
                                        </div>
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

                                    {/* Gönderen ve Alıcı Bilgileri */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '20px',
                                        fontSize: '13px',
                                        color: '#999',
                                        paddingLeft: '52px'
                                    }}>
                                        <span>
                                            <i className='bx bx-user'></i> <strong>Gönderen:</strong> {
                                                msg.from
                                                    ? msg.from.name
                                                    : msg.metadata?.contactName
                                                        ? `${msg.metadata.contactName} (${msg.metadata.contactEmail})`
                                                        : 'Anonim Kullanıcı'
                                            }
                                        </span>
                                        <span>
                                            <i className='bx bx-user-check'></i> <strong>Alıcı:</strong> {msg.to?.name || 'Tüm Üyeler'}
                                        </span>
                                        <span>
                                            <i className='bx bx-time'></i> {getTimeAgo(msg.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Sağ Taraf - İşlem Butonları */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '20px' }}>
                                    {msg.type !== 'announcement' && msg.status !== 'closed' && msg.from && (
                                        <button
                                            onClick={() => {
                                                setSelectedMessage(msg)
                                                setShowReplyModal(true)
                                            }}
                                            className="btn btn-primary"
                                            style={{ fontSize: '13px', padding: '8px 16px', whiteSpace: 'nowrap' }}
                                        >
                                            <i className='bx bx-reply'></i> Yanıtla
                                        </button>
                                    )}

                                    {/* YENİ: Anonim mesaj uyarısı */}
                                    {!msg.from && msg.metadata?.contactEmail && (
                                        <div style={{
                                            background: '#fff3cd',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            color: '#856404',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginTop: '10px'
                                        }}>
                                            <i className='bx bx-info-circle' style={{ fontSize: '18px' }}></i>
                                            <div>
                                                <strong>Üye olmayan kullanıcı</strong>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                                                    Yanıt göndermek için: <strong>{msg.metadata.contactEmail}</strong> adresine manuel e-posta gönderin.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {msg.status === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(msg._id, 'answered')}
                                            className="btn btn-outline"
                                            style={{ fontSize: '13px', padding: '8px 16px', whiteSpace: 'nowrap' }}
                                        >
                                            <i className='bx bx-check'></i> Yanıtlandı
                                        </button>
                                    )}

                                    {msg.status !== 'closed' && (
                                        <button
                                            onClick={() => handleUpdateStatus(msg._id, 'closed')}
                                            className="btn btn-outline"
                                            style={{ fontSize: '13px', padding: '8px 16px', whiteSpace: 'nowrap' }}
                                        >
                                            <i className='bx bx-lock'></i> Kapat
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDeleteMessage(msg._id)}
                                        className="btn btn-danger"
                                        style={{ fontSize: '13px', padding: '8px 16px', whiteSpace: 'nowrap' }}
                                    >
                                        <i className='bx bx-trash'></i> Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <i className='bx bx-inbox' style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
                    <h3 style={{ color: '#666' }}>
                        {filter === 'all' ? 'Henüz mesaj yok' : 'Bu kategoride mesaj yok'}
                    </h3>
                </div>
            )}


            {/* Toplu Duyuru Modal */}
            {
                showAnnouncementModal && (
                    <div className="modal-overlay" onClick={() => setShowAnnouncementModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                            <div className="modal-header">
                                <h3>Toplu Duyuru Gönder</h3>
                                <button className="close-btn" onClick={() => setShowAnnouncementModal(false)}>
                                    <i className='bx bx-x'></i>
                                </button>
                            </div>

                            <form onSubmit={handleSendAnnouncement} style={{ padding: '20px' }}>
                                <div className="form-group">
                                    <label>Konu *</label>
                                    <input
                                        type="text"
                                        value={announcementData.subject}
                                        onChange={(e) => setAnnouncementData({ ...announcementData, subject: e.target.value })}
                                        placeholder="Duyuru başlığı"
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Mesaj *</label>
                                    <textarea
                                        value={announcementData.message}
                                        onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })}
                                        placeholder="Duyuru içeriği..."
                                        required
                                        rows="6"
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd', resize: 'vertical' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Öncelik</label>
                                    <select
                                        value={announcementData.priority}
                                        onChange={(e) => setAnnouncementData({ ...announcementData, priority: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                                    >
                                        <option value="low">Düşük</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">Yüksek</option>
                                    </select>
                                </div>

                                <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
                                    <small style={{ color: '#856404' }}>
                                        <i className='bx bx-info-circle'></i> Bu duyuru tüm aktif üyelere gönderilecektir.
                                    </small>
                                </div>

                                <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="btn btn-primary" disabled={sending}>
                                        {sending ? 'Gönderiliyor...' : 'Duyuruyu Gönder'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => setShowAnnouncementModal(false)}
                                        disabled={sending}
                                    >
                                        İptal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Doğrudan Mesaj Modal */}
            {
                showDirectMessageModal && (
                    <div className="modal-overlay" onClick={() => setShowDirectMessageModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                            <div className="modal-header">
                                <h3>Doğrudan Mesaj Gönder</h3>
                                <button className="close-btn" onClick={() => setShowDirectMessageModal(false)}>
                                    <i className='bx bx-x'></i>
                                </button>
                            </div>

                            <form onSubmit={handleSendDirectMessage} style={{ padding: '20px' }}>
                                <div className="form-group">
                                    <label>Alıcı *</label>
                                    <select
                                        value={directMessageData.userId}
                                        onChange={(e) => setDirectMessageData({ ...directMessageData, userId: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                                    >
                                        <option value="">Kullanıcı seçin...</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Konu *</label>
                                    <input
                                        type="text"
                                        value={directMessageData.subject}
                                        onChange={(e) => setDirectMessageData({ ...directMessageData, subject: e.target.value })}
                                        placeholder="Mesaj konusu"
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Mesaj *</label>
                                    <textarea
                                        value={directMessageData.message}
                                        onChange={(e) => setDirectMessageData({ ...directMessageData, message: e.target.value })}
                                        placeholder="Mesajınız..."
                                        required
                                        rows="6"
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd', resize: 'vertical' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Öncelik</label>
                                    <select
                                        value={directMessageData.priority}
                                        onChange={(e) => setDirectMessageData({ ...directMessageData, priority: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                                    >
                                        <option value="low">Düşük</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">Yüksek</option>
                                    </select>
                                </div>

                                <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button type="submit" className="btn btn-primary" disabled={sending}>
                                        {sending ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => setShowDirectMessageModal(false)}
                                        disabled={sending}
                                    >
                                        İptal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Yanıtla Modal */}
            {
                showReplyModal && selectedMessage && (
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
                                <p style={{ fontSize: '13px', color: '#999', marginTop: '10px' }}>
                                    <strong>Gönderen:</strong> {selectedMessage.from?.name}
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
                )
            }
        </div >
    )
}