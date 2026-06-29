'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_ANTICIPATION_FEE_PERCENT,
  DEFAULT_CARD_FEE_PERCENT,
  generateParcelamentoNarrative,
  runParcelamentoSimulator,
} from '@/features/parcelamento'
import type {
  ParcelamentoNarrative,
  ParcelamentoOrchestratorResult,
} from '@/features/parcelamento'
import { KardovikInstitutional } from '@/components/layout/KardovikInstitutional'
import {
  ToolDisclaimer,
  ToolMetricCard,
  ToolSectionBlock,
  formatCurrency,
} from '@/components/tools'

// ── Constantes ─────────────────────────────────────────────────────────

const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 6, 8, 10, 12, 18, 24] as const

// ── Input styling ──────────────────────────────────────────────────────

const INPUT_CLASS =
  'w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-600 transition-all duration-200 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20'

const LABEL_CLASS = 'mb-1.5 block text-xs font-medium text-slate-400'

// ── Estado do formulário ───────────────────────────────────────────────

interface FormState {
  treatmentValue: string
  installments: string
  cardFeePercent: string
  anticipationFeePercent: string
}

// ── Componente principal ───────────────────────────────────────────────

export function ParcelamentoSimulator() {
  const [form, setForm] = useState<FormState>({
    treatmentValue: '',
    installments: '6',
    cardFeePercent: String(DEFAULT_CARD_FEE_PERCENT),
    anticipationFeePercent: String(DEFAULT_ANTICIPATION_FEE_PERCENT),
  })
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ParcelamentoOrchestratorResult | null>(null)
  const [narrative, setNarrative] = useState<ParcelamentoNarrative | null>(null)

  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const tv = parseFloat(form.treatmentValue)
    const inst = parseInt(form.installments, 10)
    const cardFee = parseFloat(form.cardFeePercent)
    const antFee = parseFloat(form.anticipationFeePercent)

    if (!tv || tv <= 0) {
      setError('Informe um valor de tratamento válido.')
      return
    }
    if (isNaN(cardFee) || cardFee < 0 || isNaN(antFee) || antFee < 0) {
      setError('As taxas não podem ser negativas.')
      return
    }
    if (!inst || inst < 1 || inst > 24) {
      setError('Escolha um número de parcelas válido.')
      return
    }

    const simResult = runParcelamentoSimulator({
      treatmentValue: tv,
      installments: inst,
      cardFeePercent: cardFee,
      anticipationFeePercent: antFee,
    })

    setResult(simResult)
    setNarrative(generateParcelamentoNarrative(simResult))
  }

  return (
    <div className="mt-10">
      {/* ── Formulário ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/50 p-6 backdrop-blur-sm sm:p-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Simulador de Parcelamento
        </p>
        <p className="mb-6 text-sm text-slate-400">
          Veja parcela, taxas, recebimento líquido e ação sugerida.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Valor do tratamento */}
            <div className="sm:col-span-2">
              <label htmlFor="treatmentValue" className={LABEL_CLASS}>
                Valor do tratamento
              </label>
              <input
                id="treatmentValue"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Ex: 5000"
                value={form.treatmentValue}
                onChange={field('treatmentValue')}
                className={INPUT_CLASS}
              />
            </div>

            {/* Número de parcelas */}
            <div>
              <label htmlFor="installments" className={LABEL_CLASS}>
                Número de parcelas
              </label>
              <div className="relative">
                <select
                  id="installments"
                  value={form.installments}
                  onChange={field('installments')}
                  className={`${INPUT_CLASS} appearance-none pr-10`}
                >
                  {INSTALLMENT_OPTIONS.map((n) => (
                    <option key={n} value={String(n)}>
                      {n}x
                    </option>
                  ))}
                </select>
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Espaço vazio para alinhar no grid */}
            <div className="hidden sm:block" />

            {/* Taxa da maquininha */}
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

            {/* Taxa de antecipação */}
            <div>
              <label htmlFor="anticipationFeePercent" className={LABEL_CLASS}>
                Taxa de antecipação mensal (%)
              </label>
              <input
                id="anticipationFeePercent"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={form.anticipationFeePercent}
                onChange={field('anticipationFeePercent')}
                className={INPUT_CLASS}
              />
            </div>

          </div>

          {/* Erro de validação */}
          {error && (
            <p role="alert" className="mt-4 text-sm text-rose-400">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-cyan-600 px-6 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(6,182,212,0)] transition-all duration-300 hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] sm:w-auto"
          >
            Calcular parcelamento
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

          {/* Cards numéricos */}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <ToolMetricCard
              label="Parcela estimada"
              value={formatCurrency(result.calculation.installmentValue)}
              accent
            />
            <ToolMetricCard
              label="Recebimento no fluxo"
              value={formatCurrency(result.calculation.netValueFlow)}
            />
            <ToolMetricCard
              label="Com antecipação"
              value={formatCurrency(result.calculation.netValueAnticipated)}
              warning={
                result.calculation.netValueAnticipated <
                result.calculation.netValueFlow
              }
            />
            <ToolMetricCard
              label="Ajuste sugerido"
              value={formatCurrency(result.calculation.suggestedAdjustmentAmount)}
              warning={
                result.calculation.suggestedAdjustmentAmount >
                result.calculation.treatmentValue * 0.05
              }
            />
          </div>

          {/* Leitura do cenário */}
          <div className="mt-6">
            <ToolSectionBlock
              title={narrative.scenarioReading.title}
              body={narrative.scenarioReading.body}
              tone={narrative.scenarioReading.tone}
            />
          </div>

          {/* Ação prática */}
          <div className="mt-4">
            <ToolSectionBlock
              title={narrative.practicalAction.title}
              body={narrative.practicalAction.body}
              tone={narrative.practicalAction.tone}
            />
          </div>

          {/* Alertas principais */}
          {narrative.keyAlerts.length > 0 && (
            <div className="mt-4 space-y-3">
              {narrative.keyAlerts.map((alert) => (
                <ToolSectionBlock
                  key={alert.title}
                  title={alert.title}
                  body={alert.body}
                  tone={alert.tone}
                />
              ))}
            </div>
          )}

          {/* Oportunidades */}
          {narrative.opportunities.length > 0 && (
            <div className="mt-4 space-y-3">
              {narrative.opportunities.map((opp) => (
                <ToolSectionBlock
                  key={opp.title}
                  title={opp.title}
                  body={opp.body}
                  tone={opp.tone}
                />
              ))}
            </div>
          )}

          {/* Nota de encerramento */}
          <p className="mt-6 border-l-2 border-white/[0.08] pl-4 text-xs leading-relaxed text-slate-500">
            {narrative.closingNote}
          </p>

          {/* Disclaimer institucional */}
          <div className="mt-8">
            <ToolDisclaimer />
          </div>

          {/* Bloco Kardovik — após resultado, nunca antes */}
          <div className="mt-8 border-t border-white/[0.05] pt-8">
            <KardovikInstitutional />
          </div>
        </div>
      )}
    </div>
  )
}
