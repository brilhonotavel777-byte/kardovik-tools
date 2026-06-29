'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_DESIRED_MONTHLY_PROFIT,
  DEFAULT_HOURS_PER_DAY,
  DEFAULT_OCCUPANCY_RATE_PERCENT,
  DEFAULT_WORKING_DAYS_PER_MONTH,
  generateHoraClinicaNarrative,
  runHoraClinicaSimulator,
} from '@/features/hora-clinica'
import type {
  HoraClinicaDiagnosticSeverity,
  HoraClinicaDiagnosticStatus,
  HoraClinicaNarrative,
  HoraClinicaOrchestratorResult,
  HoraClinicaPlaybook,
  HoraClinicaPlaybookPriority,
} from '@/features/hora-clinica'
import { KardovikInstitutional } from '@/components/layout/KardovikInstitutional'
import {
  ToolDisclaimer,
  ToolMetricCard,
  ToolSectionBlock,
  formatCurrency,
  formatPercent,
} from '@/components/tools'
import type { ToolTone } from '@/components/tools'

// ── Formatadores locais ────────────────────────────────────────────────

function formatHours(value: number): string {
  return (
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value) + 'h'
  )
}

// ── Estilização ────────────────────────────────────────────────────────

const INPUT_CLASS =
  'w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-600 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20'

const LABEL_CLASS = 'mb-1.5 block text-xs font-medium text-slate-400'

// ── Mapeamentos visuais ────────────────────────────────────────────────

const SEVERITY_TO_TONE: Record<HoraClinicaDiagnosticSeverity, ToolTone> = {
  success: 'positive',
  info: 'neutral',
  warning: 'attention',
  danger: 'critical',
}

const STATUS_STYLE: Record<
  HoraClinicaDiagnosticStatus,
  { badge: string; label: string }
> = {
  excellent: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Excelente' },
  healthy:   { badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',   label: 'Saudável' },
  attention: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       label: 'Atenção' },
  critical:  { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',          label: 'Crítico' },
}

const PRIORITY_STYLE: Record<
  HoraClinicaPlaybookPriority,
  { badge: string; label: string }
> = {
  critical: { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',     label: 'Crítico' },
  high:     { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   label: 'Alto' },
  medium:   { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',      label: 'Médio' },
  low:      { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',   label: 'Baixo' },
}

// ── PlaybookCard local ─────────────────────────────────────────────────

function PlaybookCard({ playbook }: { playbook: HoraClinicaPlaybook }) {
  const pStyle = PRIORITY_STYLE[playbook.priority]
  return (
    <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 p-5 backdrop-blur-sm">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-100">{playbook.title}</h4>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${pStyle.badge}`}
        >
          {pStyle.label}
        </span>
      </div>
      {playbook.subtitle && (
        <p className="mb-3 text-xs text-slate-500">{playbook.subtitle}</p>
      )}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-600">
          {playbook.category}
        </span>
        <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-600">
          urgência: {playbook.urgency}
        </span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-slate-400">
        {playbook.recommendedAction}
      </p>
      {playbook.checklist.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {playbook.checklist.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-slate-500">
              <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-violet-400" />
              {item}
            </li>
          ))}
        </ul>
      )}
      <p className="border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-slate-600">
        {playbook.expectedImpact}
      </p>
    </div>
  )
}

// ── Estado do formulário ───────────────────────────────────────────────

interface FormState {
  workingDaysPerMonth: string
  hoursPerDay: string
  occupancyRatePercent: string
  monthlyFixedCosts: string
  monthlyVariableCosts: string
  desiredMonthlyProfit: string
}

// ── Componente principal ───────────────────────────────────────────────

export function HoraClinicaSimulator() {
  const [form, setForm] = useState<FormState>({
    workingDaysPerMonth: String(DEFAULT_WORKING_DAYS_PER_MONTH),
    hoursPerDay: String(DEFAULT_HOURS_PER_DAY),
    occupancyRatePercent: String(DEFAULT_OCCUPANCY_RATE_PERCENT),
    monthlyFixedCosts: '',
    monthlyVariableCosts: '',
    desiredMonthlyProfit: String(DEFAULT_DESIRED_MONTHLY_PROFIT),
  })
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<HoraClinicaOrchestratorResult | null>(null)
  const [narrative, setNarrative] = useState<HoraClinicaNarrative | null>(null)

  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const workingDays = parseFloat(form.workingDaysPerMonth)
    const hoursDay = parseFloat(form.hoursPerDay)
    const occupancy = parseFloat(form.occupancyRatePercent)
    const fixedCosts = parseFloat(form.monthlyFixedCosts)
    const variableCosts = parseFloat(form.monthlyVariableCosts)
    const profit = form.desiredMonthlyProfit.trim()
      ? parseFloat(form.desiredMonthlyProfit)
      : 0

    if (isNaN(workingDays) || workingDays < 1 || workingDays > 31) {
      setError('Os dias trabalhados por mês devem ser entre 1 e 31.')
      return
    }
    if (isNaN(hoursDay) || hoursDay < 1 || hoursDay > 24) {
      setError('As horas clínicas por dia devem ser entre 1 e 24.')
      return
    }
    if (isNaN(occupancy) || occupancy < 1 || occupancy > 100) {
      setError('A taxa de ocupação deve ser entre 1% e 100%.')
      return
    }
    if (isNaN(fixedCosts) || fixedCosts < 0) {
      setError('Informe um valor válido para os custos fixos mensais.')
      return
    }
    if (isNaN(variableCosts) || variableCosts < 0) {
      setError('Informe um valor válido para os custos variáveis mensais.')
      return
    }

    try {
      const simResult = runHoraClinicaSimulator({
        workingDaysPerMonth: workingDays,
        hoursPerDay: hoursDay,
        occupancyRatePercent: occupancy,
        monthlyFixedCosts: fixedCosts,
        monthlyVariableCosts: variableCosts,
        desiredMonthlyProfit: profit,
      })
      setResult(simResult)
      setNarrative(generateHoraClinicaNarrative(simResult))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao calcular. Verifique os dados informados.',
      )
    }
  }

  return (
    <div className="mt-6">
      {/* ── Formulário ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/50 p-6 backdrop-blur-sm sm:p-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Calculadora de Hora Clínica
        </p>
        <p className="mb-6 text-sm text-slate-400">
          Informe a jornada e os custos mensais para calcular o custo real de cada hora de atendimento.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Dias trabalhados */}
            <div>
              <label htmlFor="workingDaysPerMonth" className={LABEL_CLASS}>
                Dias trabalhados por mês
              </label>
              <input
                id="workingDaysPerMonth"
                type="number"
                inputMode="decimal"
                min="1"
                max="31"
                step="1"
                value={form.workingDaysPerMonth}
                onChange={field('workingDaysPerMonth')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Horas por dia */}
            <div>
              <label htmlFor="hoursPerDay" className={LABEL_CLASS}>
                Horas clínicas por dia
              </label>
              <input
                id="hoursPerDay"
                type="number"
                inputMode="decimal"
                min="1"
                max="24"
                step="0.5"
                value={form.hoursPerDay}
                onChange={field('hoursPerDay')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Taxa de ocupação */}
            <div className="sm:col-span-2">
              <label htmlFor="occupancyRatePercent" className={LABEL_CLASS}>
                Taxa de ocupação da agenda (%)
              </label>
              <input
                id="occupancyRatePercent"
                type="number"
                inputMode="decimal"
                min="1"
                max="100"
                step="1"
                value={form.occupancyRatePercent}
                onChange={field('occupancyRatePercent')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Custos fixos */}
            <div>
              <label htmlFor="monthlyFixedCosts" className={LABEL_CLASS}>
                Custos fixos mensais (R$)
              </label>
              <input
                id="monthlyFixedCosts"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Ex: 8000"
                value={form.monthlyFixedCosts}
                onChange={field('monthlyFixedCosts')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Custos variáveis */}
            <div>
              <label htmlFor="monthlyVariableCosts" className={LABEL_CLASS}>
                Custos variáveis mensais (R$)
              </label>
              <input
                id="monthlyVariableCosts"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Ex: 2000"
                value={form.monthlyVariableCosts}
                onChange={field('monthlyVariableCosts')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Meta de lucro */}
            <div className="sm:col-span-2">
              <label htmlFor="desiredMonthlyProfit" className={LABEL_CLASS}>
                Meta de lucro mensal (R$){' '}
                <span className="font-normal text-slate-600">— opcional</span>
              </label>
              <input
                id="desiredMonthlyProfit"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Ex: 5000"
                value={form.desiredMonthlyProfit}
                onChange={field('desiredMonthlyProfit')}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-rose-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(139,92,246,0)] transition-all duration-300 hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] sm:w-auto"
          >
            Calcular hora clínica
          </button>

          <p className="mt-3 text-xs text-slate-600">
            Resultado estimado com base nas informações informadas.
          </p>
        </form>
      </div>

      {/* ── Resultado ──────────────────────────────────────────────── */}
      {result && narrative && (
        <div ref={resultRef} aria-live="polite" className="mt-10 scroll-mt-24">
          {/* Headline + summary */}
          <h2 className="text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
            {narrative.headline}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-400">
            {narrative.summary}
          </p>

          {/* Status + Score */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLE[result.diagnostic.status].badge}`}
            >
              {STATUS_STYLE[result.diagnostic.status].label}
            </span>
            <span className="text-sm text-slate-500">
              Score:{' '}
              <span className="font-semibold text-slate-300">
                {result.diagnostic.score}/100
              </span>
            </span>
          </div>

          {/* MetricCards principais */}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <ToolMetricCard
              label="Custo da hora clínica"
              value={formatCurrency(result.calculation.clinicalHourCost)}
              accent
            />
            <ToolMetricCard
              label="Receita recomendada/hora"
              value={formatCurrency(result.calculation.recommendedHourlyRevenue)}
              warning={result.calculation.revenueGapPercent > 50}
            />
            <ToolMetricCard
              label="Horas produtivas/mês"
              value={formatHours(result.calculation.productiveHours)}
            />
            <ToolMetricCard
              label="Faturamento mínimo/mês"
              value={formatCurrency(result.calculation.minimumMonthlyRevenue)}
            />
          </div>

          {/* MetricCards secundários */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ToolMetricCard
              label="Horas disponíveis/mês"
              value={formatHours(result.calculation.totalAvailableHours)}
            />
            <ToolMetricCard
              label="Horas ociosas/mês"
              value={formatHours(result.calculation.idleHours)}
              warning={
                result.calculation.totalMonthlyCost > 0 &&
                result.calculation.idleHoursCost / result.calculation.totalMonthlyCost > 0.3
              }
            />
            <ToolMetricCard
              label="Custo da ociosidade"
              value={formatCurrency(result.calculation.idleHoursCost)}
              warning={
                result.calculation.totalMonthlyCost > 0 &&
                result.calculation.idleHoursCost / result.calculation.totalMonthlyCost > 0.3
              }
            />
            <ToolMetricCard
              label="Faturamento recomendado/mês"
              value={formatCurrency(result.calculation.recommendedMonthlyRevenue)}
            />
            <ToolMetricCard
              label="Gap por hora"
              value={formatCurrency(result.calculation.revenueGapAmount)}
            />
            <ToolMetricCard
              label="Gap percentual"
              value={formatPercent(result.calculation.revenueGapPercent)}
              warning={result.calculation.revenueGapPercent > 50}
            />
          </div>

          {/* Leitura do cenário */}
          <div className="mt-6">
            <ToolSectionBlock
              title="Leitura do cenário"
              body={narrative.scenarioReading}
              tone={
                result.diagnostic.status === 'excellent' ? 'positive'
                : result.diagnostic.status === 'healthy'  ? 'neutral'
                : result.diagnostic.status === 'attention' ? 'attention'
                : 'critical'
              }
            />
          </div>

          {/* Ação prática */}
          <div className="mt-4">
            <ToolSectionBlock
              title={result.recommendedAction.title}
              body={narrative.practicalAction}
              tone={
                result.diagnostic.status === 'critical' ? 'critical'
                : result.diagnostic.status === 'attention' ? 'attention'
                : result.diagnostic.status === 'healthy'  ? 'neutral'
                : 'positive'
              }
            />
          </div>

          {/* Positivos do diagnóstico */}
          {result.diagnostic.positives.length > 0 && (
            <div className="mt-4 space-y-3">
              {result.diagnostic.positives.map((item) => (
                <ToolSectionBlock
                  key={item.id}
                  title={item.title}
                  body={item.message}
                  tone={SEVERITY_TO_TONE[item.severity]}
                />
              ))}
            </div>
          )}

          {/* Alertas do diagnóstico */}
          {result.diagnostic.warnings.length > 0 && (
            <div className="mt-4 space-y-3">
              {result.diagnostic.warnings.map((item) => (
                <ToolSectionBlock
                  key={item.id}
                  title={item.title}
                  body={item.message}
                  tone={SEVERITY_TO_TONE[item.severity]}
                />
              ))}
            </div>
          )}

          {/* Alertas críticos da narrativa */}
          {narrative.keyAlerts.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Pontos de atenção
              </p>
              <ul className="space-y-2">
                {narrative.keyAlerts.map((alert) => (
                  <li key={alert} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    <span className="text-sm text-slate-300">{alert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Playbooks priorizados */}
          {result.prioritizedPlaybooks.length > 0 && (
            <div className="mt-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Recomendações priorizadas
              </p>
              <div className="space-y-4">
                {result.prioritizedPlaybooks.map((playbook) => (
                  <PlaybookCard key={playbook.id} playbook={playbook} />
                ))}
              </div>
            </div>
          )}

          {/* Oportunidades da narrativa */}
          {narrative.opportunities.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Oportunidades
              </p>
              <ul className="space-y-2">
                {narrative.opportunities.map((opp) => (
                  <li key={opp} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <span className="text-sm text-slate-300">{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nota final */}
          <p className="mt-6 border-l-2 border-white/[0.08] pl-4 text-xs leading-relaxed text-slate-500">
            {narrative.closingNote}
          </p>

          {/* Disclaimer */}
          <div className="mt-8">
            <ToolDisclaimer />
          </div>

          {/* Bloco Kardovik */}
          <div className="mt-8 border-t border-white/[0.05] pt-8">
            <KardovikInstitutional />
          </div>
        </div>
      )}
    </div>
  )
}
