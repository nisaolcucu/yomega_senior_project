'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function BagisTakipPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const user = localStorage.getItem('user') || sessionStorage.getItem('user') || localStorage.getItem('admin') || sessionStorage.getItem('admin')

    if (!token || !user) {
      router.push('/uyelik-giris')
      return
    }

    try {
      const userData = JSON.parse(user)
      if (userData.role !== 'admin' && !userData.isAdmin) {
        router.push('/uyelik-giris')
        return
      }
    } catch (e) {
      router.push('/uyelik-giris')
      return
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f7fa'
      }}>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main style={{
        padding: '100px 40px 40px',
        minHeight: '100vh',
        background: '#f5f7fa'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            marginBottom: '30px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '10px',
              color: '#2d3748'
            }}>
              ❤️ Bağış Takip Sistemi
            </h1>
            <p style={{ color: '#718096', marginBottom: '20px' }}>
              Bağış işlemlerini buradan yönetebilirsiniz
            </p>
            
            <a  href="/admin/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <i className='bx bx-arrow-back'></i>
              Admin Dashboard'a Dön
            </a>
          </div>
          
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <i className='bx bx-info-circle' style={{
              fontSize: '64px',
              color: '#667eea',
              marginBottom: '20px'
            }}></i>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '15px',
              color: '#2d3748'
            }}>
              Bağış yönetimi Admin Dashboard'dan yapılmaktadır
            </h2>
            <p style={{
              color: '#718096',
              marginBottom: '30px',
              fontSize: '16px'
            }}>
              Lütfen bağış işlemleriniz için Admin Dashboard'u kullanın
            </p>
            
            <a  href="/admin/dashboard"
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                background: '#667eea',
                color: 'white',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Admin Dashboard'a Git →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}