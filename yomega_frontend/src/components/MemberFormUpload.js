'use client'
import { useState, useEffect } from 'react'

export default function MemberFormUpload() {
    const [formStatus, setFormStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

    useEffect(() => {
        fetchFormStatus()
    }, [])

    const fetchFormStatus = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')
            const response = await fetch(`${API_URL}/membership-forms/my-status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setFormStatus(data.data.formInfo)
            }
        } catch (error) {
            console.error('Form durumu alınamadı:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Sadece PDF dosyaları kabul edilir')
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Dosya boyutu 5MB\'dan küçük olmalıdır')
                return
            }
            setSelectedFile(file)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Lütfen bir dosya seçin')
            return
        }

        try {
            setUploading(true)
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')

            const formData = new FormData()
            formData.append('signedForm', selectedFile)

            const response = await fetch(`${API_URL}/membership-forms/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (response.ok) {
                alert('✅ İmzalı form başarıyla yüklendi!')
                setSelectedFile(null)
                fetchFormStatus()
            } else {
                const error = await response.json()
                alert('❌ ' + (error.message || 'Yükleme başarısız'))
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('❌ Bir hata oluştu')
        } finally {
            setUploading(false)
        }
    }

    const removeSelectedFile = () => {
        setSelectedFile(null)
        const fileInput = document.getElementById('signedFormInput')
        if (fileInput) fileInput.value = ''
    }

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
                <p>Yükleniyor...</p>
            </div>
        )
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}>
            <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '10px',
                color: '#2d3748'
            }}>
                İmzalı Üyelik Formu
            </h2>
            <p style={{ color: '#718096', marginBottom: '30px' }}>
                Üyelik formunuzu imzalayıp yükleyin
            </p>

            {/* Durum Göstergesi */}
            {formStatus?.signedPdfUrl ? (
                <div style={{
                    padding: '30px',
                    background: formStatus.signedPdfStatus === 'approved'
                        ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                        : formStatus.signedPdfStatus === 'rejected'
                            ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '15px',
                    color: 'white',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        marginBottom: '15px'
                    }}>
                        <i className={`bx ${formStatus.signedPdfStatus === 'approved' ? 'bx-check-circle' :
                            formStatus.signedPdfStatus === 'rejected' ? 'bx-x-circle' :
                                'bx-time'
                            }`} style={{ fontSize: '48px' }}></i>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>
                                {formStatus.signedPdfStatus === 'approved' ? '✅ Form Onaylandı' :
                                    formStatus.signedPdfStatus === 'rejected' ? '❌ Form Reddedildi' :
                                        '⏳ İnceleme Bekliyor'}
                            </h3>
                            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                                Yükleme: {new Date(formStatus.signedPdfUploadedAt).toLocaleDateString('tr-TR')}
                            </p>
                        </div>
                    </div>

                    {formStatus.signedPdfNote && (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '15px',
                            borderRadius: '10px',
                            marginTop: '15px'
                        }}>
                            <strong>Admin Notu:</strong><br />
                            {formStatus.signedPdfNote}
                        </div>
                    )}


                    <a href={formStatus.signedPdfUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '10px',
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    >
                        📄 Yüklediğim Formu Görüntüle
                    </a>
                </div>
            ) : (
                <div style={{
                    padding: '40px',
                    border: '2px dashed #e2e8f0',
                    borderRadius: '15px',
                    textAlign: 'center',
                    background: '#f8f9fa',
                    marginBottom: '30px'
                }}>
                    <i className='bx bx-error-circle' style={{
                        fontSize: '64px',
                        color: '#f66962',
                        marginBottom: '15px',
                        display: 'block'
                    }}></i>
                    <h3 style={{ color: '#2d3748', marginBottom: '10px' }}>
                        ⚠️ İmzalı Form Yüklenmedi
                    </h3>
                    <p style={{ color: '#718096' }}>
                        Üyelik formunuzu henüz yüklemediniz
                    </p>
                </div>
            )}

            {/* Talimatlar */}
            <div style={{
                background: '#f8f9fa',
                padding: '30px',
                borderRadius: '15px',
                marginBottom: '30px'
            }}>
                <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>
                    📝 Nasıl Yapılır?
                </h4>
                <ol style={{ paddingLeft: '20px', lineHeight: '2', color: '#4a5568' }}>
                    <li>Üye formunuzu indirin (kayıt sırasında indirildi)</li>
                    <li>Formu yazdırın</li>
                    <li>Formu imzalayın</li>
                    <li>İmzalı formu tarayın veya fotoğrafını çekin</li>
                    <li>PDF formatında aşağıdan yükleyin</li>
                </ol>

                <button
                    onClick={() => {
                        window.open('/documents/uyelik-formu-bos.pdf', '_blank')
                    }}
                    style={{
                        marginTop: '20px',
                        padding: '12px 24px',
                        background: 'white',
                        border: '2px solid var(--main-color)',
                        borderRadius: '10px',
                        color: 'var(--main-color)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--main-color)'
                        e.currentTarget.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.color = 'var(--main-color)'
                    }}
                >
                    📥 Boş Formu İndir
                </button>
            </div>

            {/* Dosya Yükleme */}
            <div>
                <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>
                    📤 İmzalı Formu Yükle
                </h4>

                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="signedFormInput"
                    disabled={uploading}
                />

                <label
                    htmlFor="signedFormInput"
                    style={{
                        display: 'block',
                        padding: '40px',
                        border: '2px dashed #cbd5e0',
                        borderRadius: '15px',
                        textAlign: 'center',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        background: '#fff',
                        transition: 'all 0.3s ease',
                        marginBottom: '20px'
                    }}
                    onMouseEnter={(e) => {
                        if (!uploading) e.currentTarget.style.borderColor = 'var(--main-color)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e0'
                    }}
                >
                    <i className='bx bx-cloud-upload' style={{
                        fontSize: '48px',
                        color: '#a0aec0',
                        marginBottom: '10px',
                        display: 'block'
                    }}></i>
                    {selectedFile ? (
                        <>
                            <p style={{ color: '#2d3748', marginBottom: '5px', fontWeight: '600' }}>
                                ✅ {selectedFile.name}
                            </p>
                            <p style={{ color: '#718096', fontSize: '14px' }}>
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </>
                    ) : (
                        <>
                            <p style={{ color: '#2d3748', marginBottom: '5px' }}>
                                PDF dosyanızı seçmek için tıklayın
                            </p>
                            <p style={{ color: '#a0aec0', fontSize: '14px' }}>
                                Maksimum 5MB
                            </p>
                        </>
                    )}
                </label>

                {selectedFile && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            style={{
                                flex: 1,
                                padding: '15px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                opacity: uploading ? 0.6 : 1
                            }}
                        >
                            {uploading ? '⏳ Yükleniyor...' : '📤 Yükle'}
                        </button>

                        <button
                            onClick={removeSelectedFile}
                            disabled={uploading}
                            style={{
                                padding: '15px 30px',
                                background: '#e2e8f0',
                                border: 'none',
                                borderRadius: '10px',
                                color: '#4a5568',
                                fontWeight: '600',
                                cursor: uploading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            İptal
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
