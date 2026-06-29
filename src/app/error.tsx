'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { IconArrowLeft } from '@/components/icons'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/[0.05] blur-[130px]" />
      </div>

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
          Erro inesperado
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
          Algo deu errado
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
          Ocorreu um erro inesperado. Tente novamente ou volte ao início.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center rounded-xl border border-white/[0.1] bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-slate-50 transition-all duration-200 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            <IconArrowLeft size={14} />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
