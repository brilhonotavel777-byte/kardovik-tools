'use client'

import { useRef, useState } from 'react'
import {
  DEFAULT_DESIRED_PROFIT_MARGIN_PERCENT,
  DEFAULT_FIXED_COST_ALLOCATION,
  generateRentabilidadeNarrative,
  runRentabilidadeProcedimentoSimulator,
} from '@/features/rentabilidade-procedimento'
import type {
  RentabilidadeProcedimentoDiagnosticSeverity,
  RentabilidadeProcedimentoDiagnosticStatus,
  RentabilidadeProcedimentoNarrative,
  RentabilidadeProcedimentoOrchestratorResult,
  RentabilidadeProcedimentoPlaybook,
  RentabilidadeProcedimentoPlaybookPriority,
} from '@/features/rentabilidade-procedimento'
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

function formatMinutes(value: number): string {
  return `${value} min`
}

// ── Estilização ────────────────────────────────────────────────────────

const INPUT_CLASS =
  'w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-600 transition-all duration-200 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'

const LABEL_CLASS = 'mb-1.5 block text-xs font-medium text-slate-400'

// ── Mapeamentos visuais ────────────────────────────────────────────────

const SEVERITY_TO_TONE: Record<RentabilidadeProcedimentoDiagnosticSeverity, ToolTone> = {
  success: 'positive',
  info: 'neutral',
  warning: 'attention',
  danger: 'critical',
}

const STATUS_STYLE: Record<
  RentabilidadeProcedimentoDiagnosticStatus,
  { badge: string; label: string }
> = {
  excellent: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Excelente' },
  healthy:   { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',           label: 'Saudável' },
  attention: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',         label: 'Atenção' },
  critical:  { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',            label: 'Crítico' },
}

const PRIORITY_STYLE: Record<
  RentabilidadeProcedimentoPlaybookPriority,
  { badge: string; label: string }
> = {
  critical: { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',     label: 'Crítico' },
  high:     { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   label: 'Alto' },
  medium:   { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',      label: 'Médio' },
  low:      { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',   label: 'Baixo' },
}

// ── PlaybookCard local ─────────────────────────────────────────────────

function PlaybookCard({ playbook }: { playbook: RentabilidadeProcedimentoPlaybook }) {
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
              <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
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
  procedurePrice: string
  procedureVariableCost: string
  procedureDurationMinutes: string
  hourlyClinicalCost: string
  fixedCostAllocation: string
  desiredProfitMarginPercent: string
}

// ── Componente principal ───────────────────────────────────────────────

export function RentabilidadeProcedimentoSimulator() {
  const [form, setForm] = useState<FormState>({
    procedurePrice: '',
    procedureVariableCost: '',
    procedureDurationMinutes: '',
    hourlyClinicalCost: '',
    fixedCostAllocation: String(DEFAULT_FIXED_COST_ALLOCATION),
    desiredProfitMarginPercent: String(DEFAULT_DESIRED_PROFIT_MARGIN_PERCENT),
  })
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RentabilidadeProcedimentoOrchestratorResult | null>(null)
  const [narrative, setNarrative] = useState<RentabilidadeProcedimentoNarrative | null>(null)

  const resultRef = useRef<HTMLDivElement>(null)

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const price = parseFloat(form.procedurePrice)
    const variableCost = parseFloat(form.procedureVariableCost)
    const durationMin = parseFloat(form.procedureDurationMinutes)
    const hourlyCost = parseFloat(form.hourlyClinicalCost)
    const fixedAlloc = form.fixedCostAllocation.trim()
      ? parseFloat(form.fixedCostAllocation)
      : DEFAULT_FIXED_COST_ALLOCATION
    const desiredMargin = form.desiredProfitMarginPercent.trim()
      ? parseFloat(form.desiredProfitMarginPercent)
      : DEFAULT_DESIRED_PROFIT_MARGIN_PERCENT

    if (isNaN(price) || price <= 0) {
      setError('Informe um valor válido para o preço do procedimento.')
      return
    }
    if (isNaN(variableCost) || variableCost < 0) {
      setError('O custo variável deve ser maior ou igual a zero.')
      return
    }
    if (isNaN(durationMin) || durationMin <= 0) {
      setError('O tempo clínico deve ser maior que zero.')
      return
    }
    if (isNaN(hourlyCost) || hourlyCost <= 0) {
      setError('Informe um valor válido para o custo da hora clínica.')
      return
    }
    if (isNaN(fixedAlloc) || fixedAlloc < 0) {
      setError('A alocação de custo fixo deve ser maior ou igual a zero.')
      return
    }
    if (isNaN(desiredMargin) || desiredMargin < 0) {
      setError('A margem desejada deve ser maior ou igual a zero.')
      return
    }
    if (desiredMargin >= 95) {
      setError('A margem desejada deve ser menor que 95%.')
      return
    }

    try {
      const simResult = runRentabilidadeProcedimentoSimulator({
        procedurePrice: price,
        procedureVariableCost: variableCost,
        procedureDurationMinutes: durationMin,
        hourlyClinicalCost: hourlyCost,
        fixedCostAllocation: fixedAlloc,
        desiredProfitMarginPercent: desiredMargin,
      })
      setResult(simResult)
      setNarrative(generateRentabilidadeNarrative(simResult))
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
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
          Calculadora de Rentabilidade por Procedimento
        </p>
        <p className="mb-6 text-sm text-slate-400">
          Informe os dados do procedimento para calcular margem, ROI, custo total e preço sugerido.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Preço */}
            <div>
              <label htmlFor="procedurePrice" className={LABEL_CLASS}>
                Preço do procedimento (R$)
              </label>
              <input
                id="procedurePrice"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="any"
                placeholder="Ex: 800"
                value={form.procedurePrice}
                onChange={field('procedurePrice')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Custo variável */}
            <div>
              <label htmlFor="procedureVariableCost" className={LABEL_CLASS}>
                Custo variável do procedimento (R$)
              </label>
              <input
                id="procedureVariableCost"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Ex: 180"
                value={form.procedureVariableCost}
                onChange={field('procedureVariableCost')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Tempo clínico */}
            <div>
              <label htmlFor="procedureDurationMinutes" className={LABEL_CLASS}>
                Tempo clínico (minutos)
              </label>
              <input
                id="procedureDurationMinutes"
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                placeholder="Ex: 60"
                value={form.procedureDurationMinutes}
                onChange={field('procedureDurationMinutes')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Custo da hora clínica */}
            <div>
              <label htmlFor="hourlyClinicalCost" className={LABEL_CLASS}>
                Custo da hora clínica (R$/h)
              </label>
              <input
                id="hourlyClinicalCost"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="any"
                placeholder="Ex: 250"
                value={form.hourlyClinicalCost}
                onChange={field('hourlyClinicalCost')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Alocação fixa */}
            <div>
              <label htmlFor="fixedCostAllocation" className={LABEL_CLASS}>
                Alocação de custo fixo (R$){' '}
                <span className="font-normal text-slate-600">— opcional</span>
              </label>
              <input
                id="fixedCostAllocation"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Ex: 70"
                value={form.fixedCostAllocation}
                onChange={field('fixedCostAllocation')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Margem desejada */}
            <div>
              <label htmlFor="desiredProfitMarginPercent" className={LABEL_CLASS}>
                Margem desejada (%){' '}
                <span className="font-normal text-slate-600">— opcional</span>
              </label>
              <input
                id="desiredProfitMarginPercent"
                type="number"
                inputMode="decimal"
                min="0"
                max="94"
                step="0.1"
                placeholder="Ex: 30"
                value={form.desiredProfitMarginPercent}
                onChange={field('desiredProfitMarginPercent')}
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
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(52,211,153,0)] transition-all duration-300 hover:bg-emerald-600 hover:shadow-[0_0_20px_rgba(52,211,153,0.25)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] sm:w-auto"
          >
            Calcular rentabilidade
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
              label="Receita do procedimento"
              value={formatCurrency(result.calculation.procedurePrice)}
              accent
            />
            <ToolMetricCard
              label="Custo total"
              value={formatCurrency(result.calculation.totalCost)}
              warning={result.calculation.totalCost >= result.calculation.procedurePrice}
            />
            <ToolMetricCard
              label="Lucro líquido"
              value={formatCurrency(result.calculation.netProfit)}
              warning={result.calculation.netProfit < 0}
              accent={result.calculation.netProfit > 0}
            />
            <ToolMetricCard
              label="Margem líquida"
              value={formatPercent(result.calculation.profitMarginPercent)}
              warning={result.calculation.profitMarginPercent < 10}
            />
          </div>

          {/* MetricCards secundários */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ToolMetricCard
              label="Custo variável"
              value={formatCurrency(result.calculation.procedureVariableCost)}
            />
            <ToolMetricCard
              label="Custo do tempo clínico"
              value={formatCurrency(result.calculation.clinicalTimeCost)}
            />
            <ToolMetricCard
              label="Tempo clínico"
              value={formatMinutes(result.calculation.procedureDurationMinutes)}
            />
            <ToolMetricCard
              label="Rentabilidade por hora"
              value={formatCurrency(result.calculation.profitPerHour)}
              warning={result.calculation.profitPerHour < 0}
            />
            <ToolMetricCard
              label="ROI operacional"
              value={formatPercent(result.calculation.operationalRoiPercent)}
              warning={result.calculation.operationalRoiPercent < 0}
            />
            <ToolMetricCard
              label="Preço mínimo sustentável"
              value={formatCurrency(result.calculation.minimumSustainablePrice)}
            />
            <ToolMetricCard
              label="Preço sugerido"
              value={formatCurrency(result.calculation.suggestedPrice)}
            />
            <ToolMetricCard
              label="Ajuste necessário"
              value={formatCurrency(result.calculation.priceAdjustmentNeeded)}
              warning={result.calculation.priceAdjustmentNeeded > 0}
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
                result.diagnostic.status === 'critical'  ? 'critical'
                : result.diagnostic.status === 'attention' ? 'attention'
                : result.diagnostic.status === 'healthy'   ? 'neutral'
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
