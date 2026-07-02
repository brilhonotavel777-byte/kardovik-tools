import type { Metadata } from 'next'
import { TOOL_PONTO_DE_EQUILIBRIO } from '@/lib/constants'
import { ToolPageShell } from '@/components/tools/ToolPageShell'
import { IconScale } from '@/components/icons'
import { PontoEquilibrioSimulator } from '@/features/ponto-de-equilibrio/PontoEquilibrioSimulator'

const TITLE = 'Calculadora de Ponto de Equilíbrio da Clínica — Kisten Tools'
const DESCRIPTION =
  'Descubra quanto sua clínica odontológica precisa faturar por mês para não operar no prejuízo. Gratuito e sem cadastro.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/ponto-de-equilibrio',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/ponto-de-equilibrio',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function PontoDeEquilibrioPage() {
  return (
    <ToolPageShell
      title={TOOL_PONTO_DE_EQUILIBRIO.title}
      question={TOOL_PONTO_DE_EQUILIBRIO.question}
      description={TOOL_PONTO_DE_EQUILIBRIO.description}
      icon={IconScale}
      iconColor="text-amber-400"
      iconBg="bg-amber-500/10"
      bulletBg="bg-amber-400"
      accentText="text-amber-400"
      accentBorder="border-amber-500/20"
      accentBadgeBg="bg-amber-500/[0.07]"
      glowRgba="rgba(245,158,11,0.07)"
      answers={TOOL_PONTO_DE_EQUILIBRIO.answers}
      interpretation={TOOL_PONTO_DE_EQUILIBRIO.interpretation}
      action={TOOL_PONTO_DE_EQUILIBRIO.action}
      calculatorSlot={<PontoEquilibrioSimulator />}
    />
  )
}
