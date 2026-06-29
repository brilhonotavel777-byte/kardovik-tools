import Link from 'next/link'
import { IconArrowLeft } from '@/components/icons'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.06] blur-[130px]" />
      </div>

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
          404
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
          Página não encontrada
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
        >
          <IconArrowLeft size={14} />
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
