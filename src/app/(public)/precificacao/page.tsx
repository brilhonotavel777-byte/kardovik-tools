import type { Metadata } from 'next'
import { TOOL_PRECIFICACAO } from '@/lib/constants'
import { ToolPageShell } from '@/components/tools/ToolPageShell'
import { IconTag } from '@/components/icons'
import { PrecificacaoSimulator } from '@/features/precificacao/PrecificacaoSimulator'

const TITLE = 'Calculadora de Precificação Odontológica — Kisten Tools'
const DESCRIPTION =
  'Defina o preço justo para cada procedimento odontológico com base em custos reais, tempo clínico e margem desejada. Gratuito e sem cadastro.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/precificacao',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/precificacao',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function PrecificacaoPage() {
  return (
    <ToolPageShell
      title={TOOL_PRECIFICACAO.title}
      question={TOOL_PRECIFICACAO.question}
      description={TOOL_PRECIFICACAO.description}
      icon={IconTag}
      iconColor="text-blue-400"
      iconBg="bg-blue-500/10"
      bulletBg="bg-blue-400"
      accentText="text-blue-400"
      accentBorder="border-blue-500/20"
      accentBadgeBg="bg-blue-500/[0.07]"
      glowRgba="rgba(59,130,246,0.07)"
      answers={TOOL_PRECIFICACAO.answers}
      interpretation={TOOL_PRECIFICACAO.interpretation}
      action={TOOL_PRECIFICACAO.action}
      calculatorSlot={<PrecificacaoSimulator />}
      contentClassName="py-20 md:pt-16 lg:pt-14"
    />
  )
}
