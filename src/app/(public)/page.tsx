import Link from 'next/link'
import type { Metadata } from 'next'
import {
  IconArrowRight,
  IconClock,
  IconCreditCard,
  IconPieChart,
  IconScale,
  IconShield,
  IconStar,
  IconTag,
  IconZap,
} from '@/components/icons'
import { COMPANY_URL, DECISION_URL, TOOLS } from '@/lib/constants'

// Visual mapping for each tool — icon component + color theme
const TOOLS_VISUAL = [
  {
    icon: IconTag,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(59,130,246,0.12)]',
  },
  {
    icon: IconClock,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(139,92,246,0.12)]',
  },
  {
    icon: IconCreditCard,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(6,182,212,0.12)]',
  },
  {
    icon: IconScale,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(245,158,11,0.12)]',
  },
  {
    icon: IconPieChart,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(52,211,153,0.12)]',
  },
] as const

const BENEFITS = [
  {
    icon: IconStar,
    title: '100% Gratuito',
    description:
      'Todas as ferramentas são gratuitas, sem planos, sem freemium, sem surpresas de cobrança.',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
  },
  {
    icon: IconShield,
    title: 'Sem cadastro',
    description:
      'Nenhum dado pessoal solicitado. Funciona diretamente no navegador, sem criação de conta.',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
  },
  {
    icon: IconZap,
    title: 'Feito para odontologia',
    description:
      'Construído para as realidades específicas de clínicas, dentistas e estudantes. Não é uma calculadora genérica.',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
  },
] as const

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="bg-grid absolute inset-0" />
          <div className="bg-dots absolute inset-0 opacity-40" />
          <div className="animate-glow-breathe absolute left-1/2 top-[38%] h-[640px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.09] blur-[140px]" />
          <div className="absolute left-[62%] top-[62%] h-[340px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.05] blur-[100px]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#020617] to-transparent" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pb-32 pt-28 text-center sm:px-6 lg:px-8">
          <div
            className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.07] px-4 py-1.5"
            style={{ animationDelay: '0ms' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-xs font-medium text-blue-300">
              5 ferramentas gratuitas · sem cadastro · para odontologia
            </span>
          </div>

          <h1
            className="animate-fade-up text-4xl font-bold leading-[1.1] tracking-tight text-slate-50 sm:text-5xl md:text-6xl lg:text-[68px]"
            style={{ animationDelay: '80ms' }}
          >
            Decisões financeiras
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">
              mais claras na odontologia
            </span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-7 max-w-xl text-base leading-relaxed text-slate-400 sm:text-[17px]"
            style={{ animationDelay: '160ms' }}
          >
            5 calculadoras financeiras especializadas para dentistas, gestores e estudantes.
            Calcule, interprete e decida com dados reais.
          </p>

          <div
            className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: '240ms' }}
          >
            <a
              href="#ferramentas"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(59,130,246,0)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(59,130,246,0.38)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
            >
              Ver ferramentas
              <IconArrowRight size={15} />
            </a>
            <a
              href={DECISION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-6 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Conhecer Kisten Decision
            </a>
          </div>
        </div>
      </section>

      {/* ── Ferramentas ──────────────────────────────────── */}
      <section id="ferramentas" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Fase 1 · 5 ferramentas
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Tudo que você precisa para decidir com clareza
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] text-slate-400">
              Cada ferramenta responde não apenas o quanto — mas o que o resultado
              significa e qual ação prática o dentista pode considerar.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool, i) => {
              const visual = TOOLS_VISUAL[i]
              const Icon = visual.icon
              const num = String(i + 1).padStart(2, '0')
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={`group relative rounded-2xl border border-white/[0.08] bg-slate-900/50 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${visual.hoverGlow}`}
                >
                  {/* Card number */}
                  <span className="absolute right-6 top-6 font-mono text-xs text-slate-700">
                    {num}
                  </span>

                  {/* Icon */}
                  <div
                    className={`mb-5 inline-flex rounded-xl p-3 transition-transform duration-300 group-hover:scale-110 ${visual.iconBg}`}
                  >
                    <Icon className={visual.iconColor} size={22} />
                  </div>

                  {/* Status badge */}
                  <div className="mb-3">
                    <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                      {tool.status}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mb-1.5 text-base font-semibold text-slate-50">
                    {tool.title}
                  </h3>
                  <p className={`mb-2 text-xs font-medium ${visual.iconColor}`}>
                    {tool.question}
                  </p>
                  <p className="mb-7 text-sm leading-relaxed text-slate-400">
                    {tool.description}
                  </p>

                  {/* Link indicator */}
                  <div className="flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-all duration-200 group-hover:gap-3 group-hover:text-blue-300">
                    Acessar ferramenta
                    <IconArrowRight size={13} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Benefícios ───────────────────────────────────── */}
      <section className="border-t border-white/[0.05] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Por que usar
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Simples. Direto. Confiável.
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="flex flex-col items-start">
                  <div className={`mb-4 rounded-xl p-3 ${benefit.iconBg}`}>
                    <Icon className={benefit.iconColor} size={20} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-slate-50">
                    {benefit.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Ecossistema Kisten ─────────────────────────── */}
      <section className="border-t border-white/[0.05] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm leading-relaxed text-slate-500">
              Desenvolvido pela{' '}
              <span className="font-medium text-slate-400">Kardovik</span>
              {', '}criadora do sistema de condução estratégica da decisão
              para clínicas odontológicas.
            </p>
            <a
              href={COMPANY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-slate-300"
            >
              Conheça o Kardovik Software
              <IconArrowRight size={11} />
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────── */}
      <section className="border-t border-white/[0.05] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-blue-950/25 via-slate-900/70 to-slate-900/70 px-8 py-20 text-center backdrop-blur-sm">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.10] blur-[90px]"
            />
            <p className="relative mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Comece agora
            </p>
            <h2 className="relative text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Tome decisões com mais clareza
              <br className="hidden sm:block" /> a partir de hoje.
            </h2>
            <p className="relative mx-auto mt-4 max-w-sm text-[15px] text-slate-400">
              5 ferramentas especializadas, gratuitas e disponíveis agora.
              Sem cadastro, sem espera.
            </p>
            <div className="relative mt-8">
              <a
                href="#ferramentas"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(59,130,246,0)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(59,130,246,0.38)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
              >
                Explorar ferramentas
                <IconArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
