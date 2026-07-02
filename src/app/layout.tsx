import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { TOOLS_URL } from '@/lib/constants'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const TITLE = 'Kisten Tools — Ferramentas Financeiras para Odontologia'
const DESCRIPTION =
  'Calculadoras financeiras gratuitas para odontologia: precificação, parcelamento, hora clínica, ponto de equilíbrio e rentabilidade por procedimento.'

export const metadata: Metadata = {
  metadataBase: new URL(TOOLS_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: TOOLS_URL,
    siteName: 'Kisten Tools',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#020617] text-slate-50">
        {children}
      </body>
    </html>
  )
}
