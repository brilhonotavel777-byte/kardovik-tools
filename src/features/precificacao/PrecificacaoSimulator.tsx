'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_CARD_FEE_PERCENT,
  DEFAULT_LAB_COST,
  DEFAULT_MARGIN_PERCENT,
  DEFAULT_TAX_PERCENT,
  generatePrecificacaoNarrative,
  runPrecificacaoSimulator,
} from '@/features/precificacao'
import type {
  PrecificacaoDiagnosticSeverity,
  PrecificacaoDiagnosticStatus,
  PrecificacaoNarrative,
  PrecificacaoOrchestratorResult,
  PrecificacaoPlaybook,
  PrecificacaoPlaybookPriority,
} from '@/features/precificacao'
import { KardovikInstitutional } from '@/components/layout/KardovikInstitutional'
import {
  ToolDisclaimer,
  ToolMetricCard,
  ToolSectionBlock,
  formatCurrency,
  formatPercent,
} from '@/components/tools'
import type { ToolTone } from '@/components/tools'

// ── Estilização de inputs ──────────────────────────────────────────────

const INPUT_CLASS =
  'w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-600 transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const LABEL_CLASS = 'mb-1.5 block text-xs font-medium text-slate-400'

// ── Mapeamentos visuais ────────────────────────────────────────────────

const SEVERITY_TO_TONE: Record<PrecificacaoDiagnosticSeverity, ToolTone> = {
  success: 'positive',
  info: 'neutral',
  warning: 'attention',
  danger: 'critical',
}

const STATUS_STYLE: Record<
  PrecificacaoDiagnosticStatus,
  { badge: string; label: string }
> = {
  excellent: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Excelente' },
  healthy: { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Saudável' },
  attention: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Atenção' },
  critical: { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Crítico' },
}

const PRIORITY_STYLE: Record<
  PrecificacaoPlaybookPriority,
  { badge: string; label: string }
> = {
  critical: { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Crítico' },
  high: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Alto' },
  medium: { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', label: 'Médio' },
  low: { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Baixo' },
}

// ── Sub-componentes locais ─────────────────────────────────────────────

function PlaybookCard({ playbook }: { playbook: PrecificacaoPlaybook }) {
  const pStyle = PRIORITY_STYLE[playbook.priority]
  return (
    <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-100">{playbook.title}</h4>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${pStyle.badge}`}
        >
          {pStyle.label}
        </span>
      </div>

      {/* Subtitle */}
      {playbook.subtitle && (
        <p className="mb-3 text-xs text-slate-500">{playbook.subtitle}</p>
      )}

      {/* Meta tags */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-600">
          {playbook.category}
        </span>
        <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-600">
          urgência: {playbook.urgency}
        </span>
      </div>

      {/* Ação recomendada */}
      <p className="mb-4 text-xs leading-relaxed text-slate-400">
        {playbook.recommendedAction}
      </p>

      {/* Checklist */}
      {playbook.checklist.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {playbook.checklist.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-slate-500">
              <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-blue-400" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* Impacto esperado */}
      <p className="border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-slate-600">
        {playbook.expectedImpact}
      </p>
    </div>
  )
}

// ── Estado do formulário ───────────────────────────────────────────────

interface FormState {
  procedureName: string
  materialCost: string
  labCost: string
  clinicalTimeMinutes: string
  hourlyClinicalCost: string
  cardFeePercent: string
  taxPercent: string
  desiredMarginPercent: string
  currentPrice: string
}

// ── Componente principal ───────────────────────────────────────────────

export function PrecificacaoSimulator() {
  const [form, setForm] = useState<FormState>({
    procedureName: '',
    materialCost: '',
    labCost: String(DEFAULT_LAB_COST),
    clinicalTimeMinutes: '',
    hourlyClinicalCost: '',
    cardFeePercent: String(DEFAULT_CARD_FEE_PERCENT),
    taxPercent: String(DEFAULT_TAX_PERCENT),
    desiredMarginPercent: String(DEFAULT_MARGIN_PERCENT),
    currentPrice: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PrecificacaoOrchestratorResult | null>(null)
  const [narrative, setNarrative] = useState<PrecificacaoNarrative | null>(null)

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

    const materialCost = parseFloat(form.materialCost)
    const labCost = form.labCost.trim() ? parseFloat(form.labCost) : 0
    const clinicalTimeMinutes = parseFloat(form.clinicalTimeMinutes)
    const hourlyClinicalCost = parseFloat(form.hourlyClinicalCost)
    const cardFeePercent = parseFloat(form.cardFeePercent)
    const taxPercent = parseFloat(form.taxPercent)
    const desiredMarginPercent = parseFloat(form.desiredMarginPercent)
    const currentPrice = form.currentPrice.trim()
      ? parseFloat(form.currentPrice)
      : undefined

    if (isNaN(materialCost) || materialCost < 0) {
      setError('O custo de materiais deve ser maior ou igual a zero.')
      return
    }
    if (isNaN(clinicalTimeMinutes) || clinicalTimeMinutes < 1) {
      setError('O tempo clínico deve ser maior que zero.')
      return
    }
    if (isNaN(hourlyClinicalCost) || hourlyClinicalCost <= 0) {
      setError('O custo da hora clínica deve ser maior que zero.')
      return
    }

    try {
      const simResult = runPrecificacaoSimulator({
        procedureName: form.procedureName.trim() || undefined,
        materialCost,
        labCost,
        clinicalTimeMinutes,
        hourlyClinicalCost,
        cardFeePercent,
        taxPercent,
        desiredMarginPercent,
        currentPrice,
      })
      setResult(simResult)
      setNarrative(generatePrecificacaoNarrative(simResult))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular. Verifique os dados informados.')
    }
  }

  return (
    <div className="mt-6">
      {/* ── Formulário ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/50 p-6 backdrop-blur-sm sm:p-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Calculadora de Precificação
        </p>
        <p className="mb-6 text-sm text-slate-400">
          Informe os custos e parâmetros do procedimento para calcular o preço mínimo e sugerido.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Nome do procedimento */}
            <div className="sm:col-span-2">
              <label htmlFor="procedureName" className={LABEL_CLASS}>
                Nome do procedimento{' '}
                <span className="font-normal text-slate-600">— opcional</span>
              </label>
              <input
                id="procedureName"
                type="text"
                placeholder="Ex: Restauração, Clareamento, Implante"
                value={form.procedureName}
                onChange={field('procedureName')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Custo de materiais */}
            <div>
              <label htmlFor="materialCost" className={LABEL_CLASS}>
                Custo de materiais (R$)
              </label>
              <input
                id="materialCost"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Ex: 45"
                value={form.materialCost}
                onChange={field('materialCost')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Custo de laboratório */}
            <div>
              <label htmlFor="labCost" className={LABEL_CLASS}>
                Custo de laboratório (R$){' '}
                <span className="font-normal text-slate-600">— opcional</span>
              </label>
              <input
                id="labCost"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Ex: 0"
                value={form.labCost}
                onChange={field('labCost')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Tempo clínico */}
            <div>
              <label htmlFor="clinicalTimeMinutes" className={LABEL_CLASS}>
                Tempo clínico (minutos)
              </label>
              <input
                id="clinicalTimeMinutes"
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                placeholder="Ex: 60"
                value={form.clinicalTimeMinutes}
                onChange={field('clinicalTimeMinutes')}
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
                placeholder="Ex: 200"
                value={form.hourlyClinicalCost}
                onChange={field('hourlyClinicalCost')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Taxa do cartão */}
            <div>
              <label htmlFor="cardFeePercent" className={LABEL_CLASS}>
                Taxa da maquininha (%)
              </label>
              <input
                id="cardFeePercent"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={form.cardFeePercent}
                onChange={field('cardFeePercent')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Impostos */}
            <div>
              <label htmlFor="taxPercent" className={LABEL_CLASS}>
                Impostos estimados (%)
              </label>
              <input
                id="taxPercent"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={form.taxPercent}
                onChange={field('taxPercent')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Margem desejada */}
            <div>
              <label htmlFor="desiredMarginPercent" className={LABEL_CLASS}>
                Margem desejada (%)
              </label>
              <input
                id="desiredMarginPercent"
                type="number"
                inputMode="decimal"
                min="0"
                max="94"
                step="1"
                value={form.desiredMarginPercent}
                onChange={field('desiredMarginPercent')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Preço atual */}
            <div>
              <label htmlFor="currentPrice" className={LABEL_CLASS}>
                Preço atual praticado (R$){' '}
                <span className="font-normal text-slate-600">— opcional</span>
              </label>
              <input
                id="currentPrice"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Ex: 250"
                value={form.currentPrice}
                onChange={field('currentPrice')}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Erro */}
          {error && (
            <p role="alert" className="mt-4 text-sm text-rose-400">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(59,130,246,0)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] sm:w-auto"
          >
            Calcular precificação
          </button>

          <p className="mt-3 text-xs text-slate-600">
            Resultado estimado com base nas informações informadas.
          </p>
        </form>
      </div>

      {/* ── Resultado ──────────────────────────────────────────────── */}
      {result && narrative && (
        <div
          ref={resultRef}
          aria-live="polite"
          className="mt-10 scroll-mt-24"
        >
          {/* Headline + summary */}
          <h2 className="text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
            {narrative.headline}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-400">
            {narrative.summary}
          </p>

          {/* Diagnóstico — status + score */}
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
            {result.calculation.procedureName && (
              <span className="text-xs text-slate-600">
                {result.calculation.procedureName}
              </span>
            )}
          </div>

          {/* Cards numéricos */}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <ToolMetricCard
              label="Preço mínimo"
              value={formatCurrency(result.calculation.minimumPrice)}
            />
            <ToolMetricCard
              label="Preço sugerido"
              value={formatCurrency(result.calculation.suggestedPrice)}
              accent
            />
            <ToolMetricCard
              label="Custo direto"
              value={formatCurrency(result.calculation.directCost)}
            />
            <ToolMetricCard
              label="Lucro estimado"
              value={formatCurrency(result.calculation.estimatedProfit)}
              warning={result.calculation.estimatedProfit < result.calculation.suggestedPrice * 0.1}
            />
          </div>

          {/* Detalhes de custo */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ToolMetricCard
              label="Margem estimada"
              value={formatPercent(result.calculation.estimatedMarginPercent)}
              warning={
                result.calculation.estimatedMarginPercent <
                result.calculation.desiredMarginPercent
              }
            />
            <ToolMetricCard
              label="Deduções (taxas + impostos)"
              value={formatPercent(result.calculation.deductionPercent)}
            />
            <ToolMetricCard
              label="Custo clínico"
              value={formatCurrency(result.calculation.clinicalTimeCost)}
            />
          </div>

          {/* Preço atual — quando informado */}
          {result.calculation.currentPrice !== undefined && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <ToolMetricCard
                label="Preço atual"
                value={formatCurrency(result.calculation.currentPrice)}
                warning={result.calculation.currentPriceStatus === 'belowMinimum'}
              />
              {result.calculation.priceGap !== undefined && (
                <ToolMetricCard
                  label="Diferença (atual − sugerido)"
                  value={formatCurrency(result.calculation.priceGap)}
                  warning={result.calculation.priceGap < 0}
                />
              )}
            </div>
          )}

          {/* Leitura do cenário */}
          <div className="mt-6">
            <ToolSectionBlock
              title="Leitura do cenário"
              body={narrative.scenarioReading}
              tone={
                result.diagnostic.status === 'excellent'
                  ? 'positive'
                  : result.diagnostic.status === 'healthy'
                    ? 'neutral'
                    : result.diagnostic.status === 'attention'
                      ? 'attention'
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
                result.diagnostic.status === 'critical'
                  ? 'critical'
                  : result.diagnostic.status === 'attention'
                    ? 'attention'
                    : result.diagnostic.status === 'healthy'
                      ? 'neutral'
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

          {/* Alertas principais da narrativa */}
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
