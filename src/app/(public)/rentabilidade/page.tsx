import type { Metadata } from 'next'
import { TOOL_RENTABILIDADE } from '@/lib/constants'
import { ToolPageShell } from '@/components/tools/ToolPageShell'
import { IconPieChart } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Calculadora de Rentabilidade por Procedimento — Kardovik Tools',
  description:
    'Calcule se um procedimento odontológico realmente gera lucro após custos, taxas, tempo clínico e materiais. Gratuito e sem cadastro.',
}

export default function RentabilidadePage() {
  return (
    <ToolPageShell
      title={TOOL_RENTABILIDADE.title}
      question={TOOL_RENTABILIDADE.question}
      description={TOOL_RENTABILIDADE.description}
      icon={IconPieChart}
      iconColor="text-emerald-400"
      iconBg="bg-emerald-500/10"
      bulletBg="bg-emerald-400"
      accentText="text-emerald-400"
      accentBorder="border-emerald-500/20"
      accentBadgeBg="bg-emerald-500/[0.07]"
      glowRgba="rgba(52,211,153,0.07)"
      answers={TOOL_RENTABILIDADE.answers}
      interpretation={TOOL_RENTABILIDADE.interpretation}
      action={TOOL_RENTABILIDADE.action}
    />
  )
}
