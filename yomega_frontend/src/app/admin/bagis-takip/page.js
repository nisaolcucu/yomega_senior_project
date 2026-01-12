'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
//import AdminHeader from '@/components/AdminHeader'
import DonationManagementSystem from '@/components/DonationManagementSystem'

export default function BagisTakipPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (!token || !user) {
      router.push('/admin')
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== 'admin') {
      router.push('/admin')
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
      <AdminHeader />
      <main style={{
        marginLeft: '280px',
        padding: '40px',
        minHeight: '100vh',
        background: '#f5f7fa'
      }}>
        <DonationManagementSystem />
      </main>
    </>
  )
}