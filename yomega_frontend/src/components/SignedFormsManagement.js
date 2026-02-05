'use client'
import { useState, useEffect } from 'react'

export default function SignedFormsManagement({ activeTab, setActiveTab }) {
    const [forms, setForms] = useState([])
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedForm, setSelectedForm] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [note, setNote] = useState('')

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

    useEffect(() => {
        if (activeTab === 'signed-forms') {
            fetchForms()
        }
    }, [activeTab, filterStatus])

    const fetchForms = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')

            const statusParam = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
            const response = await fetch(`${API_URL}/membership-forms/admin/all${statusParam}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setForms(data.data.forms || [])
                setStats(data.data.stats || { pending: 0, approved: 0, rejected: 0 })
            }
        } catch (error) {
            console.error('Formlar yüklenirken hata:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (userId, status) => {
        if (!confirm(`Bu formu ${status === 'approved' ? 'onaylamak' : 'reddetmek'} istediğinize emin misiniz?`)) {
            return
        }

        try {
            setActionLoading(true)
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')

            const response = await fetch(`${API_URL}/membership-forms/admin/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, note })
            })

            if (response.ok) {
                alert(`✅ Form ${status === 'approved' ? 'onaylandı' : 'reddedildi'}!`)
                setShowModal(false)
                setNote('')
                setSelectedForm(null)
                fetchForms()
            } else {
                const error = await response.json()
                alert(`❌ ${error.message}`)
            }
        } catch (error) {
            console.error('İşlem hatası:', error)
            alert('❌ Bir hata oluştu')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (userId, userName) => {
        if (!confirm(`${userName} kullanıcısının imzalı formunu silmek istediğinize emin misiniz?`)) {
            return
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')

            const response = await fetch(`${API_URL}/membership-forms/admin/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                alert('✅ Form silindi!')
                fetchForms()
            } else {
                alert('❌ Silme başarısız')
            }
        } catch (error) {
            console.error('Silme hatası:', error)
            alert('❌ Bir hata oluştu')
        }
    }

    const openModal = (form) => {
        setSelectedForm(form)
        setNote(form.membershipForm?.signedPdfNote || '')
        setShowModal(true)
    }

    if (activeTab !== 'signed-forms') return null

    return (
        <div className="admin-content-section">
            <div className="section-header">
                <div>
                    <h2>İmzalı Üyelik Formları</h2>
                    <p>Üyelerin yüklediği imzalı formları görüntüleyin ve onaylayın</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline" onClick={fetchForms}>
                        <i className='bx bx-refresh'></i>
                        Yenile
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '25px',
                    borderRadius: '15px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    border: filterStatus === 'pending' ? '3px solid white' : 'none'
                }}
                    onClick={() => setFilterStatus('pending')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '5px' }}>
                        {stats.pending}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                        ⏳ İnceleme Bekliyor
                    </div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    padding: '25px',
                    borderRadius: '15px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    border: filterStatus === 'approved' ? '3px solid white' : 'none'
                }}
                    onClick={() => setFilterStatus('approved')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '5px' }}>
                        {stats.approved}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                        ✅ Onaylandı
                    </div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    padding: '25px',
                    borderRadius: '15px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    border: filterStatus === 'rejected' ? '3px solid white' : 'none'
                }}
                    onClick={() => setFilterStatus('rejected')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '5px' }}>
                        {stats.rejected}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                        ❌ Reddedildi
                    </div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    padding: '25px',
                    borderRadius: '15px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    border: filterStatus === 'all' ? '3px solid white' : 'none'
                }}
                    onClick={() => setFilterStatus('all')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '5px' }}>
                        {stats.pending + stats.approved + stats.rejected}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                        📋 Toplam
                    </div>
                </div>
            </div>

            {/* Forms List */}
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Formlar yükleniyor...</p>
                </div>
            ) : forms.length > 0 ? (
                <div style={{
                    display: 'grid',
                    gap: '20px'
                }}>
                    {forms.map((form) => (
                        <div key={form._id} style={{
                            background: 'white',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                            border: '2px solid #f0f0f0',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'
                                e.currentTarget.style.borderColor = 'var(--main-color)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'
                                e.currentTarget.style.borderColor = '#f0f0f0'
                            }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                gap: '20px',
                                flexWrap: 'wrap'
                            }}>
                                {/* Kullanıcı Bilgileri */}
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '15px',
                                        marginBottom: '15px'
                                    }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '20px',
                                            fontWeight: '700'
                                        }}>
                                            {form.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '3px' }}>
                                                {form.name}
                                            </h3>
                                            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                                                {form.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '10px',
                                        fontSize: '13px',
                                        color: '#666'
                                    }}>
                                        <div>
                                            <i className='bx bx-calendar' style={{ marginRight: '5px' }}></i>
                                            Yükleme: {new Date(form.membershipForm?.signedPdfUploadedAt).toLocaleDateString('tr-TR')}
                                        </div>
                                        <div>
                                            <i className='bx bx-user' style={{ marginRight: '5px' }}></i>
                                            Kayıt: {new Date(form.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                    </div>

                                    {form.membershipForm?.signedPdfNote && (
                                        <div style={{
                                            marginTop: '15px',
                                            padding: '12px',
                                            background: '#f8f9fa',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            color: '#4a5568'
                                        }}>
                                            <strong>Not:</strong> {form.membershipForm.signedPdfNote}
                                        </div>
                                    )}
                                </div>

                                {/* Durum ve İşlemler */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'end',
                                    gap: '15px'
                                }}>
                                    <span style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        background: form.membershipForm?.signedPdfStatus === 'approved'
                                            ? '#d4edda' : form.membershipForm?.signedPdfStatus === 'rejected'
                                                ? '#f8d7da' : '#fff3cd',
                                        color: form.membershipForm?.signedPdfStatus === 'approved'
                                            ? '#155724' : form.membershipForm?.signedPdfStatus === 'rejected'
                                                ? '#721c24' : '#856404'
                                    }}>
                                        {form.membershipForm?.signedPdfStatus === 'approved' ? '✅ Onaylandı' :
                                            form.membershipForm?.signedPdfStatus === 'rejected' ? '❌ Reddedildi' :
                                                '⏳ Bekliyor'}
                                    </span>

                                    <div style={{
                                        display: 'flex',
                                        gap: '10px',
                                        flexWrap: 'wrap',
                                        justifyContent: 'end'
                                    }}>

                                        <a href={form.membershipForm?.signedPdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                padding: '10px 20px',
                                                background: 'var(--main-color)',
                                                color: 'white',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                        >
                                            <i className='bx bx-file-blank'></i>
                                            PDF Görüntüle
                                        </a>

                                        {form.membershipForm?.signedPdfStatus === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => openModal(form)}
                                                    disabled={actionLoading}
                                                    style={{
                                                        padding: '10px 20px',
                                                        background: '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <i className='bx bx-check'></i>
                                                    Onayla
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedForm(form)
                                                        setShowModal(true)
                                                    }}
                                                    disabled={actionLoading}
                                                    style={{
                                                        padding: '10px 20px',
                                                        background: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <i className='bx bx-x'></i>
                                                    Reddet
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => handleDelete(form._id, form.name)}
                                            style={{
                                                padding: '10px 20px',
                                                background: '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <i className='bx bx-trash'></i>
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <i className='bx bx-file' style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
                    <h3 style={{ color: '#666' }}>
                        {filterStatus === 'all' ? 'Henüz form yüklenmemiş' :
                            filterStatus === 'pending' ? 'İnceleme bekleyen form yok' :
                                filterStatus === 'approved' ? 'Onaylanmış form yok' :
                                    'Reddedilmiş form yok'}
                    </h3>
                </div>
            )}

            {/* Action Modal */}
            {showModal && selectedForm && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Form İşlemi</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <i className='bx bx-x'></i>
                            </button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <p style={{ marginBottom: '20px', fontSize: '15px' }}>
                                <strong>{selectedForm.name}</strong> kullanıcısının formunu işleme alıyorsunuz.
                            </p>

                            <div className="form-group">
                                <label>Not (Opsiyonel)</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows="3"
                                    placeholder="Kullanıcıya gösterilecek not..."
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '2px solid #ddd',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button
                                    onClick={() => handleAction(selectedForm._id, 'approved')}
                                    disabled={actionLoading}
                                    className="btn btn-primary"
                                    style={{ flex: 1, background: '#28a745' }}
                                >
                                    {actionLoading ? 'İşleniyor...' : '✅ Onayla'}
                                </button>
                                <button
                                    onClick={() => handleAction(selectedForm._id, 'rejected')}
                                    disabled={actionLoading}
                                    className="btn btn-primary"
                                    style={{ flex: 1, background: '#dc3545' }}
                                >
                                    {actionLoading ? 'İşleniyor...' : '❌ Reddet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
