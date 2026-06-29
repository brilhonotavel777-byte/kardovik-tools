// ── Motor financeiro — Calculadora do Ponto de Equilíbrio ─────────────

export interface PontoEquilibrioInput {
  monthlyFixedCosts: number
  averageVariableCostPercent: number
  averageTicket: number
  currentMonthlyRevenue?: number
  desiredMonthlyProfit?: number
  workingDaysPerMonth?: number
}

export interface PontoEquilibrioCalculationResult {
  // Inputs espelhados
  monthlyFixedCosts: number
  averageVariableCostPercent: number
  averageTicket: number
  desiredMonthlyProfit: number
  workingDaysPerMonth: number

  // Margem de contribuição
  contributionMarginPercent: number
  contributionMarginRate: number

  // Ponto de equilíbrio
  breakEvenRevenue: number
  breakEvenProcedures: number

  // Receita alvo (com lucro)
  targetRevenue: number
  targetProcedures: number

  // Metas diárias
  dailyBreakEvenRevenue: number
  dailyTargetRevenue: number

  // Campos condicionais — presentes somente quando currentMonthlyRevenue informado
  currentMonthlyRevenue?: number
  revenueGapAmount?: number
  revenueGapPercent?: number
  safetyMarginPercent?: number
}

// ── Motor de diagnóstico ───────────────────────────────────────────────

export type PontoEquilibrioDiagnosticSeverity = 'success' | 'info' | 'warning' | 'danger'

export type PontoEquilibrioDiagnosticStatus = 'excellent' | 'healthy' | 'attention' | 'critical'

export interface PontoEquilibrioDiagnosticItem {
  id: string
  severity: PontoEquilibrioDiagnosticSeverity
  title: string
  message: string
}

export interface PontoEquilibrioDiagnosticResult {
  status: PontoEquilibrioDiagnosticStatus
  score: number
  summary: string
  positives: PontoEquilibrioDiagnosticItem[]
  warnings: PontoEquilibrioDiagnosticItem[]
}

// ── Motor de playbooks ─────────────────────────────────────────────────

export type PontoEquilibrioPlaybookPriority = 'low' | 'medium' | 'high' | 'critical'

export type PontoEquilibrioPlaybookCategory =
  | 'costs'
  | 'pricing'
  | 'revenue'
  | 'volume'
  | 'margin'
  | 'risk'
  | 'opportunity'
  | 'standardization'
  | 'operations'
  | 'strategy'

export type PontoEquilibrioPlaybookUrgency = 'low' | 'medium' | 'high' | 'critical'

export type PontoEquilibrioPlaybookImplementationEffort = 'low' | 'medium' | 'high'

export type PontoEquilibrioPlaybookFinancialImpactLevel = 'low' | 'medium' | 'high'

export interface PontoEquilibrioPlaybook {
  id: string
  title: string
  subtitle?: string
  category: PontoEquilibrioPlaybookCategory
  priority: PontoEquilibrioPlaybookPriority
  urgency: PontoEquilibrioPlaybookUrgency
  implementationEffort: PontoEquilibrioPlaybookImplementationEffort
  financialImpactLevel: PontoEquilibrioPlaybookFinancialImpactLevel
  trigger: string
  objective: string
  whyItMatters: string
  recommendedAction: string
  expectedImpact: string
  checklist: string[]
}

export interface PontoEquilibrioPlaybookResult {
  playbooks: PontoEquilibrioPlaybook[]
}

// ── Motor de orquestração ──────────────────────────────────────────────

export interface PontoEquilibrioRecommendedAction {
  title: string
  message: string
  playbookId?: string
}

export interface PontoEquilibrioOrchestratorResult {
  calculation: PontoEquilibrioCalculationResult
  diagnostic: PontoEquilibrioDiagnosticResult
  /** Todos os playbooks aplicáveis, ordenados por score interno. */
  allPlaybooks: PontoEquilibrioPlaybook[]
  /** Subconjunto priorizado — no máximo 5, com diversidade de categoria. */
  prioritizedPlaybooks: PontoEquilibrioPlaybook[]
  /** Playbooks com priority ou urgency "critical". */
  criticalAlerts: PontoEquilibrioPlaybook[]
  /** Playbooks com category "opportunity" ou "standardization". */
  opportunities: PontoEquilibrioPlaybook[]
  recommendedAction: PontoEquilibrioRecommendedAction
  executiveSummary: string
}

// ── Motor de narrativa ─────────────────────────────────────────────────

export interface PontoEquilibrioNarrative {
  headline: string
  summary: string
  scenarioReading: string
  practicalAction: string
  keyAlerts: string[]
  opportunities: string[]
  closingNote: string
}
