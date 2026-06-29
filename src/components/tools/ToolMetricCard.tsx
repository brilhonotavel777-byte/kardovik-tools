interface ToolMetricCardProps {
  label: string
  /** Pre-formatted value string (e.g. from formatCurrency). */
  value: string
  description?: string
  accent?: boolean
  warning?: boolean
}

export function ToolMetricCard({
  label,
  value,
  description,
  accent,
  warning,
}: ToolMetricCardProps) {
  const containerClass = accent
    ? 'border-cyan-500/25 bg-cyan-500/[0.06]'
    : warning
      ? 'border-amber-500/20 bg-amber-500/[0.04]'
      : 'border-white/[0.08] bg-white/[0.03]'

  const valueClass = accent
    ? 'text-cyan-300'
    : warning
      ? 'text-amber-300'
      : 'text-slate-100'

  return (
    <div className={`rounded-xl border p-4 ${containerClass}`}>
      <p className="mb-1 text-xs text-slate-500">{label}</p>
      <p className={`text-base font-bold tracking-tight sm:text-lg ${valueClass}`}>
        {value}
      </p>
      {description && (
        <p className="mt-1 text-xs text-slate-600">{description}</p>
      )}
    </div>
  )
}
