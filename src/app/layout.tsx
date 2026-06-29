import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Kardovik Tools — Ferramentas Financeiras para Odontologia',
  description:
    'Calculadoras gratuitas de precificação, hora clínica, parcelamento, ponto de equilíbrio e rentabilidade para dentistas, clínicas e estudantes de odontologia.',
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
