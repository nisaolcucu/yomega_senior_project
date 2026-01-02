import { Inter } from 'next/font/google'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'YÖMEGA - YüksekÖğretim Mesleki Gelişim Ağı',
  description: 'Türkiye\'de yükseköğretim kurumlarında eğitim geliştirme hedefini temsil eden YüksekÖğretim Mesleki Gelişim Ağı Derneği.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
      <meta charSet="UTF-8" />
        {/* Boxicons CDN */}
        <link 
          href="https://unpkg.com/boxicons@latest/css/boxicons.min.css" 
          rel="stylesheet" 
        />
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={inter.className}>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}