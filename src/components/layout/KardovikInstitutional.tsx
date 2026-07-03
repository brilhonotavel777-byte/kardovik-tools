import { DECISION_URL } from '@/lib/constants'
import { IconArrowRight, IconExternalLink } from '@/components/icons'

export function KardovikInstitutional() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-slate-900/30 p-7">
      {/* Header — logo mark + title */}
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-gradient-to-br from-blue-500 to-cyan-400">
          <span className="text-[10px] font-bold text-white">K</span>
        </div>
        <span className="text-sm font-semibold text-slate-300">
          Desenvolvido pela Kisten
        </span>
      </div>

      {/* Body */}
      <p className="mb-3 text-sm leading-relaxed text-slate-500">
        A Kisten desenvolve soluções para apoiar a condução estratégica de decisões
        em clínicas odontológicas.
      </p>
      <p className="mb-7 text-sm leading-relaxed text-slate-500">
        Enquanto o Kisten Tools ajuda você a tomar decisões financeiras com mais
        clareza, a plataforma Kisten foi criada para apoiar decisões estratégicas ao
        longo da jornada do paciente, transformando informação em direcionamento e
        reduzindo oportunidades perdidas.
      </p>

      {/* Access points */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={DECISION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-500 transition-colors duration-200 hover:text-slate-300"
        >
          decision.kisten.app
          <IconExternalLink size={10} />
        </a>

        <span aria-hidden="true" className="hidden text-slate-700 sm:inline">
          ·
        </span>

        <a
          href={DECISION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] px-4 py-2 text-xs font-medium text-slate-400 transition-all duration-200 hover:border-white/[0.18] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
        >
          Conhecer Kisten Decision
          <IconArrowRight size={12} />
        </a>
      </div>
    </div>
  )
}
