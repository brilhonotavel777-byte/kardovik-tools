import Link from 'next/link'
import {
  IconArrowRight,
  IconCreditCard,
  IconPieChart,
  IconShield,
  IconStar,
  IconTrendingUp,
  IconZap,
} from '@/components/icons'

const TOOLS_CONTENT = [
  {
    icon: IconTrendingUp,
    title: 'Calculadora de ROI',
    description:
      'Simule o retorno financeiro de campanhas e tratamentos com precisão.',
    href: '/roi',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
  },
  {
    icon: IconCreditCard,
    title: 'Parcelamento',
    description:
      'Calcule parcelas de tratamentos com clareza para o paciente.',
    href: '/parcelamento',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
  },
  {
    icon: IconPieChart,
    title: 'Rentabilidade',
    description:
      'Entenda margem, custo e lucro por procedimento com dados reais.',
    href: '/rentabilidade',
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10',
  },
] as const

const BENEFITS = [
  {
    icon: IconStar,
    title: '100% Gratuito',
    description:
      'Todas as ferramentas são gratuitas e sem necessidade de cadastro.',
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10',
  },
  {
    icon: IconShield,
    title: 'Sem cadastro',
    description:
      'Acesse diretamente, sem criar conta ou fornecer dados pessoais.',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
  },
  {
    icon: IconZap,
    title: 'Especializado',
    description:
      'Desenvolvido para a realidade financeira das clínicas odontológicas.',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
  },
] as const

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="bg-grid absolute inset-0" />
          <div className="absolute left-1/2 top-1/3 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.10] blur-[130px]" />
          <div className="absolute left-2/3 top-2/3 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.06] blur-[90px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020617] to-transparent" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pb-32 pt-28 text-center sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.08] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-xs font-medium text-blue-300">
              100% gratuito · sem cadastro · sem complicação
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-50 sm:text-5xl md:text-6xl lg:text-7xl">
            Ferramentas de gestão
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">
              para odontologia
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Calculadoras inteligentes para ROI, parcelamento e rentabilidade.
            Tome decisões clínicas e financeiras com dados reais.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#ferramentas"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
            >
              Ver ferramentas
              <IconArrowRight size={15} />
            </a>
            <a
              href="https://kardovik.com"
              className="inline-flex h-11 items-center rounded-xl border border-white/[0.1] bg-white/[0.04] px-6 text-sm font-semibold text-slate-50 transition-all hover:border-white/[0.18] hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Conhecer Kardovik
            </a>
          </div>

          {/* Social proof line */}
          <p className="mt-14 text-xs text-slate-700">
            Desenvolvido pela equipe Kardovik · Odontologia com inteligência
          </p>
        </div>
      </section>

      {/* ── Ferramentas ──────────────────────────────────────────── */}
      <section id="ferramentas" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Ferramentas
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Tudo que você precisa para decidir com clareza
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-400">
              Calculadoras especializadas para os principais desafios financeiros
              da sua clínica.
            </p>
          </div>

          {/* Tool cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {TOOLS_CONTENT.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group relative rounded-2xl border border-white/[0.08] bg-slate-900/60 p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.14] hover:bg-slate-900 hover:shadow-[0_0_48px_rgba(37,99,235,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {/* Icon */}
                  <div className={`mb-5 inline-flex rounded-xl p-3 ${tool.iconBg}`}>
                    <Icon className={tool.iconColor} size={22} />
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-base font-semibold text-slate-50">
                    {tool.title}
                  </h3>
                  <p className="mb-7 text-sm leading-relaxed text-slate-400">
                    {tool.description}
                  </p>

                  {/* Link indicator */}
                  <div className="flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-all duration-200 group-hover:gap-2.5">
                    Acessar
                    <IconArrowRight size={13} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Benefícios ───────────────────────────────────────────── */}
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

      {/* ── CTA Final ────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-blue-950/30 via-slate-900 to-slate-900 px-8 py-20 text-center">
            {/* Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.12] blur-[80px]"
            />

            <h2 className="relative text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Pronto para tomar melhores decisões?
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-slate-400">
              Acesse as ferramentas agora. Gratuito, sem cadastro, sem
              complicação.
            </p>
            <div className="relative mt-8">
              <a
                href="#ferramentas"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
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
