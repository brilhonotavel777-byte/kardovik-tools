import Link from 'next/link'
import { IconArrowLeft, IconArrowRight, IconPieChart } from '@/components/icons'

export default function RentabilidadePage() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-24">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.07] blur-[130px]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#020617] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020617] to-transparent" />
      </div>

      <div className="relative text-center">
        {/* Back link */}
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-1.5 rounded text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
        >
          <IconArrowLeft size={12} />
          Todas as ferramentas
        </Link>

        {/* Icon */}
        <div className="mb-6 inline-flex rounded-2xl bg-emerald-500/10 p-5">
          <IconPieChart className="text-emerald-400" size={36} />
        </div>

        {/* Status badge */}
        <div className="mb-4 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            Em desenvolvimento
          </span>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Kardovik Tools
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Rentabilidade
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-slate-400">
          O Kardovik Tools evolui continuamente. Novas ferramentas e recursos
          especializados serão disponibilizados regularmente para apoiar
          profissionais e estudantes de odontologia.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-slate-50 focus-visible:outline-none"
          >
            Ver outras ferramentas
            <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
