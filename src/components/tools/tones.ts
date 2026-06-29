export type ToolTone = 'positive' | 'neutral' | 'attention' | 'critical'

export interface ToolToneStyle {
  border: string
  bg: string
  dot: string
  badgeBorder: string
  badgeBg: string
  textColor: string
}

export const TOOL_TONE_STYLE: Record<ToolTone, ToolToneStyle> = {
  positive: {
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/[0.05]',
    dot: 'bg-emerald-400',
    badgeBorder: 'border-emerald-500/20',
    badgeBg: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
  },
  neutral: {
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/[0.05]',
    dot: 'bg-cyan-400',
    badgeBorder: 'border-cyan-500/20',
    badgeBg: 'bg-cyan-500/10',
    textColor: 'text-cyan-400',
  },
  attention: {
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/[0.05]',
    dot: 'bg-amber-400',
    badgeBorder: 'border-amber-500/20',
    badgeBg: 'bg-amber-500/10',
    textColor: 'text-amber-400',
  },
  critical: {
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/[0.05]',
    dot: 'bg-rose-400',
    badgeBorder: 'border-rose-500/20',
    badgeBg: 'bg-rose-500/10',
    textColor: 'text-rose-400',
  },
}

export const TOOL_TONE_LABEL: Record<ToolTone, string> = {
  positive: 'Ponto positivo',
  neutral: 'Informação',
  attention: 'Atenção',
  critical: 'Alerta',
}
