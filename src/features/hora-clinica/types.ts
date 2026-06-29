// ── Motor financeiro — Calculadora de Hora Clínica ────────────────────

export interface HoraClinicaInput {
  workingDaysPerMonth: number
  hoursPerDay: number
  occupancyRatePercent: number
  monthlyFixedCosts: number
  monthlyVariableCosts: number
  desiredMonthlyProfit?: number
}

export interface HoraClinicaCalculationResult {
  // Inputs espelhados
  workingDaysPerMonth: number
  hoursPerDay: number
  occupancyRatePercent: number
  monthlyFixedCosts: number
  monthlyVariableCosts: number
  desiredMonthlyProfit: number

  // Capacidade (horas)
  totalAvailableHours: number
  productiveHours: number
  idleHours: number

  // Custos
  totalMonthlyCost: number
  clinicalHourCost: number
  idleHoursCost: number

  // Receitas
  minimumHourlyRevenue: number
  recommendedHourlyRevenue: number
  minimumMonthlyRevenue: number
  recommendedMonthlyRevenue: number

  // Gap entre receita recomendada e mínima
  revenueGapAmount: number
  revenueGapPercent: number
}

// ── Motor de diagnóstico ───────────────────────────────────────────────

export type HoraClinicaDiagnosticSeverity = 'success' | 'info' | 'warning' | 'danger'

export type HoraClinicaDiagnosticStatus = 'excellent' | 'healthy' | 'attention' | 'critical'

export interface HoraClinicaDiagnosticItem {
  id: string
  severity: HoraClinicaDiagnosticSeverity
  title: string
  message: string
}

export interface HoraClinicaDiagnosticResult {
  status: HoraClinicaDiagnosticStatus
  score: number
  summary: string
  positives: HoraClinicaDiagnosticItem[]
  warnings: HoraClinicaDiagnosticItem[]
}

// ── Motor de playbooks ─────────────────────────────────────────────────

export type HoraClinicaPlaybookPriority = 'low' | 'medium' | 'high' | 'critical'

export type HoraClinicaPlaybookCategory =
  | 'occupancy'
  | 'costs'
  | 'idle_time'
  | 'capacity'
  | 'pricing'
  | 'profit'
  | 'schedule'
  | 'team'
  | 'efficiency'
  | 'opportunity'
  | 'risk'
  | 'standardization'

export type HoraClinicaPlaybookUrgency = 'low' | 'medium' | 'high' | 'critical'

export type HoraClinicaPlaybookImplementationEffort = 'low' | 'medium' | 'high'

export type HoraClinicaPlaybookFinancialImpactLevel = 'low' | 'medium' | 'high'

export interface HoraClinicaPlaybook {
  id: string
  title: string
  subtitle?: string
  category: HoraClinicaPlaybookCategory
  priority: HoraClinicaPlaybookPriority
  urgency: HoraClinicaPlaybookUrgency
  implementationEffort: HoraClinicaPlaybookImplementationEffort
  financialImpactLevel: HoraClinicaPlaybookFinancialImpactLevel
  trigger: string
  objective: string
  whyItMatters: string
  recommendedAction: string
  expectedImpact: string
  checklist: string[]
}

export interface HoraClinicaPlaybookResult {
  playbooks: HoraClinicaPlaybook[]
}

// ── Motor de orquestração ──────────────────────────────────────────────

export interface HoraClinicaRecommendedAction {
  title: string
  message: string
  playbookId?: string
}

// ── Motor de narrativa ─────────────────────────────────────────────────

export interface HoraClinicaNarrative {
  headline: string
  summary: string
  scenarioReading: string
  practicalAction: string
  keyAlerts: string[]
  opportunities: string[]
  closingNote: string
}

export interface HoraClinicaOrchestratorResult {
  calculation: HoraClinicaCalculationResult
  diagnostic: HoraClinicaDiagnosticResult
  /** Todos os playbooks aplicáveis, ordenados por score interno. */
  allPlaybooks: HoraClinicaPlaybook[]
  /** Subconjunto priorizado — no máximo 5, com diversidade de categoria. */
  prioritizedPlaybooks: HoraClinicaPlaybook[]
  /** Playbooks com priority ou urgency "critical". */
  criticalAlerts: HoraClinicaPlaybook[]
  /** Playbooks com category "opportunity" ou "standardization". */
  opportunities: HoraClinicaPlaybook[]
  recommendedAction: HoraClinicaRecommendedAction
  executiveSummary: string
}
