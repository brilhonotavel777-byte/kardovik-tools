import Link from 'next/link'
import type { IconProps } from '@/components/icons'
import { IconArrowLeft } from '@/components/icons'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { KardovikInstitutional } from '@/components/layout/KardovikInstitutional'

interface ToolPageShellProps {
  title: string
  question: string
  description: string
  icon: React.ComponentType<IconProps>
  /** Full Tailwind class for the icon color, e.g. 'text-blue-400' */
  iconColor: string
  /** Full Tailwind class for the icon container bg, e.g. 'bg-blue-500/10' */
  iconBg: string
  /** Full Tailwind class for bullet points, e.g. 'bg-blue-400' */
  bulletBg: string
  /** Full Tailwind class for accent text, e.g. 'text-blue-400' */
  accentText: string
  /** Full Tailwind class for badge border, e.g. 'border-blue-500/20' */
  accentBorder: string
  /** Full Tailwind class for badge background, e.g. 'bg-blue-500/[0.07]' */
  accentBadgeBg: string
  /** Raw CSS rgba value for the glow orb, e.g. 'rgba(59,130,246,0.07)' */
  glowRgba: string
  answers: readonly string[]
  interpretation: string
  action: string
  /**
   * Optional calculator component. When provided, the shell injects it between
   * the description and the informational blocks, and suppresses the "coming
   * soon" evolution message and the Kardovik footer (the calculator handles
   * both after the first result is shown).
   */
  calculatorSlot?: React.ReactNode
  /**
   * Optional override for the content container's padding/spacing classes.
   * Defaults to 'py-20' — use for page-specific vertical rhythm adjustments.
   */
  contentClassName?: string
}

export function ToolPageShell({
  title,
  question,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  bulletBg,
  accentText,
  accentBorder,
  accentBadgeBg,
  glowRgba,
  answers,
  interpretation,
  action,
  calculatorSlot,
  contentClassName = 'py-20',
}: ToolPageShellProps) {
  return (
    <div className="relative">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-grid absolute inset-0" />
        <div
          className="absolute left-1/2 top-[30%] h-[480px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
          style={{ background: glowRgba }}
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#020617] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#020617] to-transparent" />
      </div>

      {/* Content */}
      <div className={`relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 ${contentClassName}`}>
        {/* Back navigation */}
        <Link
          href="/#ferramentas"
          className="mb-12 inline-flex items-center gap-1.5 rounded text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
        >
          <IconArrowLeft size={12} />
          Todas as ferramentas
        </Link>

        {/* Icon + Badges */}
        <div className="mb-7 flex flex-col items-start gap-4">
          <div className={`inline-flex rounded-2xl p-4 ${iconBg}`}>
            <Icon className={iconColor} size={36} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${accentBorder} ${accentBadgeBg} ${accentText}`}
            >
              <span className={`h-1 w-1 rounded-full ${bulletBg}`} />
              Ferramenta gratuita
            </span>
            <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-500">
              Sem cadastro
            </span>
          </div>
        </div>

        {/* Title + Question */}
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          {title}
        </h1>
        <p className={`mt-3 text-lg font-medium sm:text-xl ${accentText}`}>
          {question}
        </p>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
          {description}
        </p>

        {/* Calculator slot — injected by tool pages that have live calculators */}
        {calculatorSlot}

        {/* Divider */}
        <div className="my-12 border-t border-white/[0.06]" />

        {/* Block 1 — O que esta ferramenta vai responder */}
        <div className="mb-10">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            O que esta ferramenta vai responder
          </h2>
          <ul className="space-y-3">
            {answers.map((answer) => (
              <li key={answer} className="flex items-start gap-3">
                <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${bulletBg}`} />
                <span className="text-sm leading-relaxed text-slate-300">{answer}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Block 2 — Como interpretar o resultado */}
        <div className="mb-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Como interpretar o resultado
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">{interpretation}</p>
        </div>

        {/* Block 3 — Ação prática sugerida */}
        <div className="mb-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Ação prática sugerida
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">{action}</p>
        </div>

        {/* Disclaimer — skipped when calculator handles it after first result */}
        {!calculatorSlot && <ToolDisclaimer />}

        {/* Evolution message — only when no live calculator */}
        {!calculatorSlot && (
          <p className="mb-10 mt-8 border-l-2 border-white/[0.08] pl-4 text-xs leading-relaxed text-slate-600">
            O Kardovik Tools evolui continuamente. Esta ferramenta está sendo preparada para entregar
            cálculo, interpretação e orientação prática em uma experiência simples e gratuita.
          </p>
        )}

        {/* Navigation CTA */}
        <Link
          href="/#ferramentas"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
        >
          <IconArrowLeft size={14} />
          Ver todas as ferramentas
        </Link>

        {/* Kardovik institutional — skipped when calculator handles it after first result */}
        {!calculatorSlot && (
          <div className="mt-14 border-t border-white/[0.05] pt-10">
            <KardovikInstitutional />
          </div>
        )}
      </div>
    </div>
  )
}
